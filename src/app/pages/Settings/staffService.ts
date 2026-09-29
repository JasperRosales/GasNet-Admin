import { appService } from "../../services/appService";
import type { StaffRole, StaffSetting } from "./types";

interface CreateStaffInput {
  email: string;
  password: string;
  role: StaffRole;
  branchId: number;
}

export async function registerStaff(input: CreateStaffInput): Promise<StaffSetting> {
  const created = await appService.staff.create({
    email: input.email,
    password: input.password,
    role: input.role,
    branchId: input.branchId,
  });

  return {
    id: created.id,
    username: created.username,
    role: created.role,
    branchId: created.branchId,
    branchName: created.branchName || "Unknown",
  };
}
