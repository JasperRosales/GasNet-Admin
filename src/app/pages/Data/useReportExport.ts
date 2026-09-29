import { useEffect, useMemo, useState } from "react";
import type { ReportType, TransactionRecord } from "./types";
import { formatAmount, getMonthLabel, REPORT_MONTHS, toLocalDate } from "./dataUtils";

export function useReportExport(transactions: TransactionRecord[]) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReportType>("weekly");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(REPORT_MONTHS[new Date().getMonth()] ?? "Jan");
  const [week, setWeek] = useState("1");
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          transactions
            .map((txn) => toLocalDate(txn.transactionDate))
            .filter((date) => !Number.isNaN(date.getTime()))
            .map(String)
        )
      ).sort(),
    [transactions]
  );
  useEffect(() => {
    if (years.length && !years.includes(year)) setYear(years[0]);
  }, [years, year]);

  const preview = useMemo(() => {
    const valid = transactions.filter((txn) => {
      const date = toLocalDate(txn.transactionDate);
      return !Number.isNaN(date.getTime());
    });
    if (type === "weekly") {
      const value = Number(week),
        startDay = (value - 1) * 7 + 1,
        endDay = value === 5 ? 31 : value * 7;
      const rows = valid.filter((txn) => {
        const date = toLocalDate(txn.transactionDate);
        const day = date.getDate();
        return (
          getMonthLabel(date) === month &&
          String(date.getFullYear()) === year &&
          day >= startDay &&
          day <= endDay
        );
      });
      if (!rows.length)
        return `WEEKLY REPORT\nPeriod: ${month} ${startDay}-${endDay}, ${year}\n\nNo transactions found for the selected week.`;
      const total = rows.reduce((sum, txn) => sum + txn.total, 0);
      const byBranch = rows.reduce(
        (acc, txn) => {
          acc[txn.branchName] = (acc[txn.branchName] ?? 0) + txn.total;
          return acc;
        },
        {} as Record<string, number>
      );
      return `WEEKLY REPORT\nPeriod: ${month} ${startDay}-${endDay}, ${year}\nTransactions: ${rows.length}\nTotal Sales: ${formatAmount(total)}\n\nBranch Breakdown:\n${Object.entries(
        byBranch
      )
        .map(([branch, value]) => `- ${branch}: ${formatAmount(value)}`)
        .join("\n")}`;
    }
    if (type === "monthly") {
      const rows = valid.filter(
        (txn) =>
          getMonthLabel(toLocalDate(txn.transactionDate)) === month &&
          String(toLocalDate(txn.transactionDate).getFullYear()) === year
      );
      if (!rows.length)
        return `MONTHLY REPORT\nPeriod: ${month} ${year}\n\nNo transactions found for the selected month.`;
      const daily = rows.reduce(
        (acc, txn) => {
          const info = (acc[txn.transactionDate] ??= { sales: 0, transactions: 0 });
          info.sales += txn.total;
          info.transactions++;
          return acc;
        },
        {} as Record<string, { sales: number; transactions: number }>
      );
      const entries = Object.entries(daily).sort(
        ([a], [b]) => toLocalDate(a).getDate() - toLocalDate(b).getDate()
      );
      const peak = entries.reduce((best, current) =>
        current[1].sales > best[1].sales ? current : best
      );
      return `MONTHLY REPORT\nPeriod: ${month} ${year}\n\nDaily Sales Summary:\n${entries.map(([day, info]) => `- ${day}: ${formatAmount(info.sales)} (${info.transactions} transactions)`).join("\n")}\n\nBrief Explanation:\n- Sales peaked on ${peak[0]} at ${formatAmount(peak[1].sales)}.\n- This month highlights daily movement to support operational planning.`;
    }
    const rows = valid.filter(
      (txn) => String(toLocalDate(txn.transactionDate).getFullYear()) === year
    );
    if (!rows.length)
      return `ANNUAL REPORT\nYear: ${year}\n\nNo transactions found for the selected year.`;
    const monthly = rows.reduce(
      (acc, txn) => {
        const key = getMonthLabel(toLocalDate(txn.transactionDate));
        const info = (acc[key] ??= { sales: 0, transactions: 0 });
        info.sales += txn.total;
        info.transactions++;
        return acc;
      },
      {} as Record<string, { sales: number; transactions: number }>
    );
    const total = Object.values(monthly).reduce((sum, item) => sum + item.sales, 0);
    return `ANNUAL REPORT\nYear: ${year}\n\nMonthly Combined Summary:\n${REPORT_MONTHS.filter(
      (key) => monthly[key]
    )
      .map(
        (key) =>
          `- ${key}: ${formatAmount(monthly[key].sales)} (${monthly[key].transactions} transactions)`
      )
      .join("\n")}\n\nAnnual Total Sales: ${formatAmount(total)}`;
  }, [transactions, type, week, month, year]);

  const exportReport = () => {
    const url = URL.createObjectURL(new Blob([preview], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report-${year}-${month}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };
  return {
    open,
    setOpen,
    type,
    setType,
    year,
    setYear,
    month,
    setMonth,
    week,
    setWeek,
    years,
    preview,
    exportReport,
  };
}
