import { X } from "lucide-react";
import type { ReportType } from "./types";

interface ExportReportModalProps {
  open: boolean;
  reportType: ReportType;
  reportYear: string;
  reportMonth: string;
  reportWeek: string;
  availableYears: string[];
  months: string[];
  reportPreview: string;
  onClose: () => void;
  onExport: () => void;
  onReportTypeChange: (type: ReportType) => void;
  onReportYearChange: (value: string) => void;
  onReportMonthChange: (value: string) => void;
  onReportWeekChange: (value: string) => void;
}

export function ExportReportModal({
  open,
  reportType,
  reportYear,
  reportMonth,
  reportWeek,
  availableYears,
  months,
  reportPreview,
  onClose,
  onExport,
  onReportTypeChange,
  onReportYearChange,
  onReportMonthChange,
  onReportWeekChange,
}: ExportReportModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
      <div
        className="w-full max-w-3xl rounded-3xl bg-[#FFFDF1] p-6"
        style={{
          boxShadow:
            "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[#1B211A]">Export Distribution Report</h3>
            <p className="text-sm text-[#628141]">
              Configure weekly, monthly, or annual report export.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#628141] hover:bg-[#EBD5AB]/30"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            onClick={() => onReportTypeChange("weekly")}
            className={`rounded-xl px-4 py-2 text-sm ${
              reportType === "weekly"
                ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                : "bg-[#8BAE66]/20 text-[#628141]"
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => onReportTypeChange("monthly")}
            className={`rounded-xl px-4 py-2 text-sm ${
              reportType === "monthly"
                ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                : "bg-[#8BAE66]/20 text-[#628141]"
            }`}
          >
            Monthly Report
          </button>
          <button
            onClick={() => onReportTypeChange("annual")}
            className={`rounded-xl px-4 py-2 text-sm ${
              reportType === "annual"
                ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                : "bg-[#8BAE66]/20 text-[#628141]"
            }`}
          >
            Annual Report
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            value={reportYear}
            onChange={(event) => onReportYearChange(event.target.value)}
            className="rounded-xl bg-[#EBD5AB]/20 px-3 py-2 text-[#1B211A] outline-none"
          >
            {(availableYears.length ? availableYears : ["2026"]).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {(reportType === "weekly" || reportType === "monthly") && (
            <select
              value={reportMonth}
              onChange={(event) => onReportMonthChange(event.target.value)}
              className="rounded-xl bg-[#EBD5AB]/20 px-3 py-2 text-[#1B211A] outline-none"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          )}

          {reportType === "weekly" && (
            <select
              value={reportWeek}
              onChange={(event) => onReportWeekChange(event.target.value)}
              className="rounded-xl bg-[#EBD5AB]/20 px-3 py-2 text-[#1B211A] outline-none"
            >
              {[1, 2, 3, 4, 5].map((week) => (
                <option key={week} value={String(week)}>
                  Week {week}
                </option>
              ))}
            </select>
          )}
        </div>

        <div
          className="mb-4 rounded-2xl bg-[#EBD5AB]/15 p-4"
          style={{
            boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
          }}
        >
          <p className="mb-2 text-sm text-[#628141]">Report Preview</p>
          <pre className="whitespace-pre-wrap text-sm text-[#1B211A]">
            {reportPreview}
          </pre>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
          >
            Cancel
          </button>
          <button
            onClick={onExport}
            className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
