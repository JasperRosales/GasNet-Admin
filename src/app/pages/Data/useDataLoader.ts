import { useCallback, useEffect, useState } from "react";
import {
  appService,
  type BranchDTO,
  type CatalogPrice,
  type ProductDTO,
  type TransactionDTO,
} from "../../services/appService";
import type {
  BranchOption,
  InventoryItem,
  ProductColumn,
  ProductOption,
  TransactionRecord,
} from "./types";

export function useDataLoader(refreshTick: number) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryColumns, setInventoryColumns] = useState<ProductColumn[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [catalogPrices, setCatalogPrices] = useState<CatalogPrice[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductDTO[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [purchasedRecords, setPurchasedRecords] = useState<
    Array<{
      branchId: number;
      branchName: string;
      productId: number;
      productName: string;
      quantity: number;
      unitPriceAtSale: number;
    }>
  >([]);
  const [deliveryRecords, setDeliveryRecords] = useState<
    Array<{
      branchId: number;
      branchName: string;
      productId: number;
      productName: string;
      quantity: number;
      unitPriceAtSale: number;
    }>
  >([]);
  const [returnedRecords, setReturnedRecords] = useState<
    Array<{
      branchId: number;
      branchName: string;
      productId: number;
      productName: string;
      quantity: number;
      trackingNo: string | null;
    }>
  >([]);

  const loadInventory = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError("");
    try {
      const mapped = (await appService.inventory.list()).map((row) => ({
        stockId: row.stockId,
        branchId: row.branchId,
        branchName: row.branchName || "Unknown",
        productId: row.productId,
        productName: row.productName || "Unknown",
        weightKg: row.weightKg,
        quantity: row.quantity,
        reorderLevel: row.reorderLevel,
      }));
      const columns = Array.from(
        new Map(
          mapped.map((item) => [
            item.productId,
            {
              id: item.productId,
              label: item.weightKg !== null ? `${item.weightKg} kg` : item.productName,
              weight: item.weightKg,
            },
          ])
        ).values()
      ).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0) || a.label.localeCompare(b.label));
      setInventoryItems(mapped);
      setInventoryColumns(columns);
    } catch (error) {
      setInventoryError(error instanceof Error ? error.message : "Unable to load inventory.");
      setInventoryItems([]);
      setInventoryColumns([]);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const loadInventoryMetadata = useCallback(async () => {
    try {
      const [branches, products] = await Promise.all([
        appService.branches.list(),
        appService.products.listActive(),
      ]);
      setBranchOptions(branches.map((branch: BranchDTO) => ({ id: branch.id, name: branch.name })));
      setProductOptions(
        products.map((product: ProductDTO) => ({
          id: product.id,
          label: product.name,
          weight: product.weightKg,
        }))
      );
    } catch (error) {
      setInventoryError(
        error instanceof Error ? error.message : "Unable to load inventory options."
      );
    }
  }, []);

  useEffect(() => {
    void loadInventory();
    void loadInventoryMetadata();
  }, [refreshTick, loadInventory, loadInventoryMetadata]);
  useEffect(() => {
    void Promise.all([appService.catalog.listPrices(), appService.products.listAll()])
      .then(([prices, products]) => {
        setCatalogPrices(prices);
        setCatalogProducts(products);
      })
      .catch(() => {
        setCatalogPrices([]);
        setCatalogProducts([]);
      });
  }, [refreshTick]);
  useEffect(() => {
    setTransactionsLoading(true);
    setTransactionsError("");
    void Promise.all([
      appService.transactions.list(),
      appService.purchased.list(),
      appService.delivery.list(),
      appService.returned.list(),
    ])
      .then(([rows, purchased, delivery, returned]) => {
        setTransactions(
          rows.map((row: TransactionDTO) => ({
            salesId: row.salesId,
            trackingNo: row.trackingNo,
            guestName: row.guestName,
            branchId: row.branchId ?? 0,
            branchName: row.branchName || "Unknown",
            subtotal: row.subtotal,
            total: row.total,
            transactionDate: row.transactionDate,
            transactionType: row.transactionType,
            items: row.items ?? [],
          }))
        );
        setPurchasedRecords(purchased);
        setDeliveryRecords(delivery);
        setReturnedRecords(returned);
      })
      .catch((error) => {
        setTransactionsError(
          error instanceof Error ? error.message : "Unable to load transactions."
        );
        setTransactions([]);
        setPurchasedRecords([]);
        setDeliveryRecords([]);
        setReturnedRecords([]);
      })
      .finally(() => setTransactionsLoading(false));
  }, [refreshTick]);

  return {
    inventoryItems,
    setInventoryItems,
    inventoryColumns,
    inventoryLoading,
    inventoryError,
    branchOptions,
    productOptions,
    setProductOptions,
    catalogPrices,
    setCatalogPrices,
    catalogProducts,
    setCatalogProducts,
    transactions,
    transactionsLoading,
    transactionsError,
    purchasedRecords,
    deliveryRecords,
    returnedRecords,
    loadInventory,
    loadInventoryMetadata,
  };
}
