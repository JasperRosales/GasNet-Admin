import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

interface AdminReturnPanelProps {
  searchItems?: (trackingNo: string) => Promise<Array<{
    branchId: number;
    branchName: string;
    productId: number;
    productName: string;
    quantity: number;
    trackingNo: string | null;
    transactionDate?: string;
  }>>;
  onRecordReturn: (input: { trackingNo: string; quantity: number; reason?: string }) => Promise<string | null>;
}

export function AdminReturnPanel({ searchItems, onRecordReturn }: AdminReturnPanelProps) {
  const [trackingNo, setTrackingNo] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [matches, setMatches] = useState<Array<{
    branchId: number;
    branchName: string;
    productId: number;
    productName: string;
    quantity: number;
    trackingNo: string | null;
    transactionDate?: string;
  }>>([]);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (!searchItems || selected) return;
    const query = trackingNo.trim();
    if (!query) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(() => {
      searchItems(query).then(setMatches).catch(() => setMatches([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [trackingNo, selected, searchItems]);

  const submit = async () => {
    if (pending) return;

    if (!trackingNo.trim()) {
      setMessage({ kind: "err", text: "Enter the tracking number from the sale." });
      return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setMessage({ kind: "err", text: "Enter a valid quantity." });
      return;
    }

    setPending(true);
    const err = await onRecordReturn({
      trackingNo: trackingNo.trim(),
      quantity: qty,
      reason: reason.trim() || undefined,
    });
    setPending(false);

    if (err) {
      setMessage({ kind: "err", text: err });
      return;
    }

    setMessage({ kind: "ok", text: "Return recorded and stock restored." });
    setTrackingNo("");
    setQuantity("1");
    setReason("");
  };

  return (
    <div
      className="rounded-3xl bg-[#FFFDF1] p-6"
      style={{
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <h3 className="text-lg font-bold text-[#1B211A] mb-1">Record a Return</h3>
      <p className="text-sm text-[#628141] mb-4">
        Look up the original sale by tracking number, then restore the product to branch stock.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={trackingNo}
          onChange={(event) => {
            setTrackingNo(event.target.value);
            setSelected(false);
          }}
          placeholder="Tracking number"
          className="px-4 py-2 rounded-2xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
        />
        {!selected && matches.length > 0 && (
          <div className="rounded-2xl border border-[#628141]/20 bg-white divide-y divide-[#628141]/10 max-h-48 overflow-y-auto">
            {matches.map((match) => (
              <button
                type="button"
                key={String(match.trackingNo)}
                onClick={() => {
                  setTrackingNo(match.trackingNo ?? "");
                  setSelected(true);
                  setMatches([]);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#EBD5AB]/30 transition"
              >
                <div className="font-semibold text-[#1B211A]">
                  {match.productName} · x{match.quantity}
                </div>
                <div className="text-xs text-[#628141]">
                  {match.trackingNo} · {match.branchName} · {match.transactionDate ?? ""}
                </div>
              </button>
            ))}
          </div>
        )}
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder="Quantity"
          className="px-4 py-2 rounded-2xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
        />
        <input
          type="text"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason (optional)"
          className="px-4 py-2 rounded-2xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
        />
      </div>
      {message && (
        <div
          className={`mt-3 text-sm ${message.kind === "ok" ? "text-[#628141]" : "text-red-600"}`}
          role="alert"
        >
          {message.text}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] font-semibold disabled:opacity-60"
        >
          <RotateCcw className="h-4 w-4" />
          {pending ? "Recording..." : "Record Return"}
        </button>
      </div>
    </div>
  );
}
