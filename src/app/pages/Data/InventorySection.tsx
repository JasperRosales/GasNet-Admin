import { Pencil } from "lucide-react";
import type { InventoryRow, InventoryStatusTab, ProductColumn, StatusTone } from "./types";

interface InventorySectionProps {
  inventoryColumns: ProductColumn[];
  inventoryRows: InventoryRow[];
  inventoryLoading: boolean;
  inventoryError: string;
  activeStatus: InventoryStatusTab;
  onStatusChange: (status: InventoryStatusTab) => void;
  onAddInventoryData?: () => void;
  onCreateProduct?: () => void;
  onEditInventoryRow: (branchId: number) => void;
  getInventoryStatusMeta: (
    total: number,
    activeStatus: InventoryStatusTab,
    outgoingTotal: number,
    returnedTotal: number
  ) => { label: string; tone: StatusTone };
  getStatusBadgeClass: (tone: StatusTone) => string;
}

export function InventorySection({
  inventoryColumns,
  inventoryRows,
  inventoryLoading,
  inventoryError,
  activeStatus,
  onStatusChange,
  onAddInventoryData,
  onCreateProduct,
  onEditInventoryRow,
  getInventoryStatusMeta,
  getStatusBadgeClass,
}: InventorySectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex p-2 rounded-3xl bg-[#FFFDF1]"
          style={{
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
          }}
        >
          {(["Stock", "Delivered", "Returned"] as const).map((statusTab) => (
            <button
              key={statusTab}
              onClick={() => onStatusChange(statusTab)}
              className={`px-6 py-2 rounded-2xl transition-all ${
                activeStatus === statusTab
                  ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                  : "text-[#628141]"
              }`}
              style={
                activeStatus === statusTab
                  ? {
                      boxShadow:
                        "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                    }
                  : {}
              }
            >
              {statusTab}
            </button>
          ))}
        </div>

        <div />
      </div>
      <div
        className="rounded-3xl bg-[#FFFDF1] overflow-hidden"
        style={{
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#628141] to-[#8BAE66]">
              <tr>
                <th className="px-6 py-4 text-left text-[#FFFDF1]">ID</th>
                <th className="px-6 py-4 text-left text-[#FFFDF1]">Branch</th>
                {inventoryColumns.map((column) => (
                  <th key={column.id} className="px-6 py-4 text-left text-[#FFFDF1]">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-[#FFFDF1]">Total</th>
                <th className="px-6 py-4 text-left text-[#FFFDF1]">Status</th>
                <th className="px-6 py-4 text-left text-[#FFFDF1]">Last Update</th>
                <th className="px-6 py-4 text-left text-[#FFFDF1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLoading ? (
                <tr>
                  <td
                    colSpan={inventoryColumns.length + 6}
                    className="px-6 py-6 text-center text-sm text-[#628141]"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : inventoryError ? (
                <tr>
                  <td
                    colSpan={inventoryColumns.length + 6}
                    className="px-6 py-6 text-center text-sm text-red-600"
                  >
                    {inventoryError}
                  </td>
                </tr>
              ) : inventoryRows.length ? (
                inventoryRows.map((row, index) => {
                  const total = inventoryColumns.reduce(
                    (sum, column) => sum + (row.quantities[column.id] ?? 0),
                    0
                  );

                  const statusMeta = getInventoryStatusMeta(
                    total,
                    activeStatus,
                    row.outgoingTotal,
                    row.returnedTotal
                  );

                  return (
                    <tr
                      key={row.branchName}
                      className={`border-b border-[#8BAE66]/20 ${
                        index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"
                      }`}
                    >
                      <td className="px-6 py-4 text-[#1B211A]">{row.branchId}</td>
                      <td className="px-6 py-4 text-[#628141]">{row.branchName}</td>
                      {inventoryColumns.map((column) => (
                        <td key={column.id} className="px-6 py-4">
                          {row.quantities[column.id] ?? 0}
                        </td>
                      ))}
                      <td className="px-6 py-4">{total}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
                            statusMeta.tone
                          )}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#628141] text-sm">—</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => onEditInventoryRow(row.branchId)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#EBD5AB]/35 px-4 py-2.5 text-sm font-semibold text-[#628141] transition hover:bg-[#EBD5AB]/55"
                          style={{
                            boxShadow:
                              "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
                          }}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={inventoryColumns.length + 6}
                    className="px-6 py-6 text-center text-sm text-[#628141]"
                  >
                    No inventory data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
