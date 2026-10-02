import { useEffect, useMemo, useState } from "react";
import type { ReportType, TransactionRecord } from "./types";
import { formatAmount, REPORT_MONTHS, toLocalDate } from "./dataUtils";

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
            .map((date) => String(date.getFullYear()))
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
    const monthIndex = REPORT_MONTHS.indexOf(month);
    const isWeekly = type === "weekly";
    const startDay = (Number(week) - 1) * 7 + 1;
    const endDay = Number(week) === 5 ? 31 : Number(week) * 7;
    const rows = valid.filter((txn) => {
      const date = toLocalDate(txn.transactionDate);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === Number(year) &&
        date.getMonth() === monthIndex &&
        (!isWeekly || (date.getDate() >= startDay && date.getDate() <= endDay))
      );
    });
    if (!rows.length) {
      return isWeekly
        ? `WEEKLY REPORT\nPeriod: ${month} ${startDay}-${endDay}, ${year}\n\nNo transactions found for the selected week.`
        : `MONTHLY REPORT\nPeriod: ${month} ${year}\n\nNo transactions found for the selected month.`;
    }
    const total = rows.reduce((sum, txn) => sum + txn.total, 0);
    const byDay = new Map<string, { transactions: number; sales: number }>();
    for (const txn of rows) {
      const entry = byDay.get(txn.transactionDate) ?? { transactions: 0, sales: 0 };
      entry.transactions += 1;
      entry.sales += txn.total;
      byDay.set(txn.transactionDate, entry);
    }
    const byBranch = new Map<string, number>();
    for (const txn of rows) byBranch.set(txn.branchName, (byBranch.get(txn.branchName) ?? 0) + txn.total);
    return `${isWeekly ? "WEEKLY" : "MONTHLY"} REPORT\nPeriod: ${isWeekly ? `${month} ${startDay}-${endDay}, ${year}` : `${month} ${year}`}\nTransactions: ${rows.length}\nTotal Sales: ${formatAmount(total)}\n\nDaily Breakdown:\n${[...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, info]) => `- ${day}: ${formatAmount(info.sales)} (${info.transactions} transactions)`)
      .join("\n")}\n\nBranch Breakdown:\n${[...byBranch.entries()]
      .map(([branch, value]) => `- ${branch}: ${formatAmount(value)}`)
      .join("\n")}`;
  }, [transactions, type, week, month, year]);

  const exportReport = () => {
    const isWeekly = type === "weekly";
    const startDay = (Number(week) - 1) * 7 + 1;
    const endDay = Number(week) === 5 ? 31 : Number(week) * 7;
    const title = `${isWeekly ? "WEEKLY" : "MONTHLY"} REPORT — ${month} ${isWeekly ? `${startDay}-${endDay}, ` : ""}${year}`;
    const rows = transactions.filter((txn) => {
      const dateObj = toLocalDate(txn.transactionDate);
      if (Number.isNaN(dateObj.getTime())) return false;
      return (
        dateObj.getFullYear() === Number(year) &&
        dateObj.getMonth() === REPORT_MONTHS.indexOf(month) &&
        (!isWeekly || (dateObj.getDate() >= startDay && dateObj.getDate() <= endDay))
      );
    });
    const total = rows.reduce((sum, txn) => sum + txn.total, 0);
    const tableRows = rows
      .map(
        (txn) =>
          `<tr><td>${txn.salesId}</td><td>${txn.transactionDate}</td><td>${txn.guestName}</td><td>${txn.branchName}</td><td>${txn.transactionType}</td><td style="text-align:right;">${formatAmount(txn.total)}</td></tr>`
      )
      .join("");
    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1B211A; }
  h1 { color: #628141; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th, td { border: 1px solid #EBD5AB; padding: 8px 10px; text-align: left; }
  th { background: linear-gradient(135deg, #628141 0%, #8BAE66 100%); color: #FFFDF1; }
  td:last-child { text-align: right; }
  tfoot td { font-weight: bold; background: #FBEED3; }
</style>
</head>
<body>
  <h1>${title}</h1>
  <p>Total transactions: ${rows.length} &nbsp;·&nbsp; Total sales: ${formatAmount(total)}</p>
  <table>
    <thead><tr><th>ID</th><th>Date</th><th>Customer</th><th>Branch</th><th>Type</th><th>Total</th></tr></thead>
    <tbody>${tableRows}</tbody>
    <tfoot><tr><td colspan="5">Total</td><td>${formatAmount(total)}</td></tr></tfoot>
  </table>
  <script>window.onload = () => { window.print(); };</scr` + `ipt>
</body>
</html>`;
    const popup = window.open("", "_blank");
    if (popup) {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      popup.focus();
    } else {
      // Popup blocked — fall back to downloading an HTML file the user can print.
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-report-${year}-${month}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
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
