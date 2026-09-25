import { useEffect, useState } from "react";
import type { TransactionRecord } from "./types";

interface TransactionsTableProps {
  transactions: TransactionRecord[];
  loading: boolean;
  error: string;
  formatAmount: (amount: number) => string;
  formatDisplayDate: (value: string) => string;
}

export function TransactionsTable({
  transactions,
  loading,
  error,
  formatAmount,
  formatDisplayDate,
}: TransactionsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const visibleTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div
      className="rounded-3xl bg-[#FFFDF1] overflow-hidden page-fade-in"
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
              <th className="px-6 py-4 text-left text-[#FFFDF1]">
                Tracking No
              </th>
              <th className="px-6 py-4 text-left text-[#FFFDF1]">Customer</th>
              <th className="px-6 py-4 text-left text-[#FFFDF1]">Branch</th>
              <th className="px-6 py-4 text-left text-[#FFFDF1]">Total</th>
              <th className="px-6 py-4 text-left text-[#FFFDF1]">Date</th>
              <th className="px-6 py-4 text-left text-[#FFFDF1]">Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-6 text-center text-sm text-[#628141]"
                >
                  Loading transactions...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-6 text-center text-sm text-red-600"
                >
                  {error}
                </td>
              </tr>
            ) : (
              visibleTransactions.map((txn, index) => (
                <tr
                  key={txn.salesId}
                  className={`border-b border-[#8BAE66]/20 ${
                    index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"
                  }`}
                >
                  <td className="px-6 py-4 text-[#1B211A]">
                    {txn.salesId}
                  </td>
                  <td className="px-6 py-4 text-[#628141]">
                    {txn.trackingNo ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-[#628141]">
                    {txn.guestName}
                  </td>
                  <td className="px-6 py-4 text-[#628141]">
                    {txn.branchName}
                  </td>
                  <td className="px-6 py-4 text-[#1B211A]">
                    {formatAmount(txn.total)}
                  </td>
                  <td className="px-6 py-4 text-[#628141] text-sm">
                    {formatDisplayDate(txn.transactionDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-[#8BAE66]/20 text-[#628141]">
                      {txn.transactionType}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && !error && transactions.length > 0 && <div className="flex items-center justify-between border-t border-[#EBD5AB]/40 px-6 py-4"><span className="text-xs text-[#628141]">{page} / {totalPages}</span><div className="flex gap-2"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-lg border border-[#628141]/30 px-3 py-1.5 text-xs text-[#628141] disabled:opacity-40">Previous</button><button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="rounded-lg border border-[#628141]/30 px-3 py-1.5 text-xs text-[#628141] disabled:opacity-40">Next</button></div></div>}
    </div>
  );
}
