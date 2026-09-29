# Settings Page

Settings management at `src/app/pages/SettingsPage.tsx`.

---

## Overview

The Settings page provides CRUD management for three entity types: branches, staff members, and monthly sales targets. It composes multiple sub-components and hooks.

---

## Page Structure

```
SettingsPage
  ├── SettingsHeader
  ├── BranchManagement
  │     └── BranchModal
  ├── StaffManagement
  │     └── StaffModal
  ├── TargetModal
  └── DeleteConfirmModal
```

---

## Branch Management

### `BranchManagement`

Card grid displaying all branches with:
- Branch name, location, contact info
- Current-month target amount
- "Manage Branch" button (edit)
- "Set Target" button (add/edit target)

### `BranchModal`

Modal form for adding/editing branches:
- Branch name input
- Location input
- Contact number input
- Delete button (when editing existing branch)

---

## Staff Management

### `StaffManagement`

Card grid displaying all staff members with:
- Username
- Role badge (Admin/Staff/Manager)
- Branch name
- "Manage Staff" button
- Create button (conditionally shown based on Admin role)

### `StaffModal`

Modal form for creating/editing staff:
- Email input
- Password input (optional when editing)
- Role selector (Admin/Staff/Manager)
- Branch selector
- Delete button (when editing existing staff)

---

## Sales Target Management

### `TargetModal`

Modal form for setting/editing monthly sales targets:
- Branch selector (disabled when editing)
- Month picker (YYYY-MM format)
- Target amount input
- Delete button (when editing existing target)

---

## Delete Confirmation

### `DeleteConfirmModal`

Reusable confirmation modal for branch or staff deletion. Shows the name of the entity being deleted and requires explicit confirmation.

---

## Custom Hooks

### `useBranchSettings()`

Manages branch CRUD operations:
- Loads branches with current-month sales targets merged in
- Provides `openModal`, `closeModal`, `save`, `remove` functions
- Handles both create and update via a single `save` function

### `useStaffSettings(branches)`

Manages staff CRUD operations:
- Loads staff list
- Handles create (via `registerStaff`) and update
- Provides modal form state management
- Requires the branch list for the branch selector dropdown

### `useTargetSettings(setBranches)`

Manages monthly sales target CRUD:
- Opens the target modal pre-filled with existing target data
- Provides `save` and `remove` functions
- Updates the branch list state after changes

---

## Supporting Modules

### `settingsUtils.ts`

| Function | Description |
|----------|-------------|
| `monthEnd(month)` | Calculates the last day of a `YYYY-MM` string |

### `staffService.ts`

| Function | Description |
|----------|-------------|
| `registerStaff(input)` | Thin wrapper around `appService.staff.create` that maps the result to a `StaffSetting` |

---

## Types

Defined in `src/app/pages/Settings/types.ts`:

| Type | Description |
|------|-------------|
| `StaffRole` | `"Admin" \| "Staff" \| "Manager"` |
| `BranchSetting` | Branch with form state |
| `StaffSetting` | Staff with form state |
| `BranchForm` | Branch form data |
| `StaffForm` | Staff form data |
| `SettingsToggle` | Toggle configuration |
| `SettingsField` | Field configuration |
| `SettingSection` | Section configuration |
| `DeleteTarget` | Entity pending deletion |
