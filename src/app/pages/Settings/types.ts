import type { LucideIcon } from "lucide-react";

export type StaffRole = "Admin" | "Staff" | "Manager";

export interface BranchSetting {
  id: number;
  name: string;
  location: string;
  contactNo: string;
}

export interface StaffSetting {
  id: string;
  username: string;
  role: StaffRole;
  branchId: number;
  branchName: string;
}

export interface BranchForm {
  name: string;
  location: string;
  contactNo: string;
}

export interface StaffForm {
  username: string;
  email: string;
  password: string;
  role: StaffRole;
  branchId: string;
}

export interface SettingsToggle {
  label: string;
  state: boolean;
  setter: (value: boolean) => void;
}

export interface SettingsField {
  label: string;
  value: string;
  type: string;
  readonly?: boolean;
}

export interface SettingSection {
  icon: LucideIcon;
  title: string;
  description: string;
  toggles?: SettingsToggle[];
  fields?: SettingsField[];
}

export type DeleteTarget =
  | { type: "branch"; id: number; name: string }
  | { type: "staff"; id: string; name: string };
