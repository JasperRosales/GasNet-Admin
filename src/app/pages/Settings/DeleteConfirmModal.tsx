import type { DeleteTarget } from "./types";

interface DeleteConfirmModalProps {
  target: DeleteTarget;
  isBusy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  target,
  isBusy,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1B211A]/50 p-4">
      <div
        className="w-full max-w-md rounded-3xl bg-[#FFFDF1] p-6"
        style={{
          boxShadow:
            "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
        }}
      >
        <div className="mb-6 space-y-2">
          <h3 className="text-[#1B211A]">Confirm deletion</h3>
          <p className="text-sm text-[#628141]">
            {target.type === "branch"
              ? `Delete branch "${target.name}"? This cannot be undone.`
              : `Delete staff "${target.name}"? This cannot be undone.`}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
            style={{
              boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
            style={{
              boxShadow:
                "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            {isBusy
              ? "Deleting..."
              : target.type === "branch"
                ? "Delete Branch"
                : "Delete Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}
