import { supabase } from "./supabase";
import type { IProductService } from "./interfaces";
import type { CatalogPrice, ProductDTO, ProductInput } from "./types";
import { fail, num, rows, text } from "./adapters";

type Row = Record<string, unknown>;

export class ProductService implements IProductService {
  async listActive(): Promise<ProductDTO[]> {
    const { data, error } = await supabase
      .from("products")
      .select("product_id, product_name, weight_kg, active")
      .eq("active", true)
      .order("weight_kg");
    if (error) fail("Unable to load products", error);
    return rows(data).map((r) => ({
      id: num(r.product_id),
      name: text(r.product_name),
      weightKg: num(r.weight_kg),
      active: true,
    }));
  }

  async listAll(): Promise<ProductDTO[]> {
    const { data, error } = await supabase
      .from("products")
      .select("product_id, product_name, weight_kg, active")
      .order("product_name");
    if (error) fail("Unable to load products", error);
    return rows(data).map((r) => ({
      id: num(r.product_id),
      name: text(r.product_name),
      weightKg: num(r.weight_kg),
      active: r.active !== false,
    }));
  }

  async create(input: ProductInput): Promise<ProductDTO> {
    const { data, error } = await supabase
      .from("products")
      .insert({ product_name: input.name.trim(), weight_kg: input.weightKg, active: true })
      .select("product_id, product_name, weight_kg, active")
      .single();
    if (error) fail("Unable to create product", error);
    return {
      id: num(data.product_id),
      name: data.product_name,
      weightKg: num(data.weight_kg),
      active: true,
    };
  }

  async update(id: number, input: ProductInput): Promise<ProductDTO> {
    const { data, error } = await supabase
      .from("products")
      .update({ product_name: input.name.trim(), weight_kg: input.weightKg, active: true })
      .eq("product_id", id)
      .select("product_id, product_name, weight_kg, active")
      .single();
    if (error) fail("Unable to update product", error);
    return {
      id: num(data.product_id),
      name: text(data.product_name),
      weightKg: num(data.weight_kg),
      active: true,
    };
  }

  async remove(id: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ active: false })
      .eq("product_id", id);
    if (error) fail("Unable to archive product", error);
  }

  async listCatalogPrices(): Promise<CatalogPrice[]> {
    const { data, error } = await supabase
      .from("branch_product_prices")
      .select("branch_id, product_id, price, branches(branch_name), products(product_name)")
      .order("branch_id")
      .order("product_id");
    if (error) fail("Unable to load product catalog", error);
    return rows(data).map((r) => ({
      branchId: num(r.branch_id),
      branchName: text((r.branches as Row | null)?.branch_name),
      productId: num(r.product_id),
      productName: text((r.products as Row | null)?.product_name),
      price: num(r.price),
    }));
  }

  async updateCatalogPrice(branchId: number, productId: number, price: number): Promise<void> {
    if (!Number.isInteger(price) || price < 0)
      throw new Error("Price must be a non-negative whole number.");
    const { error } = await supabase
      .from("branch_product_prices")
      .upsert(
        { branch_id: branchId, product_id: productId, price },
        { onConflict: "branch_id,product_id" }
      );
    if (error) fail("Unable to update product price", error);
  }
}
