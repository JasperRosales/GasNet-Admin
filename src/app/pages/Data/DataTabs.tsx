type DataTab = "inventory" | "transactions" | "catalog";

interface DataTabsProps {
  activeTab: DataTab;
  onChange: (tab: DataTab) => void;
}

export function DataTabs({ activeTab, onChange }: DataTabsProps) {
  return (
    <div
      className="inline-flex p-2 rounded-3xl bg-[#FFFDF1]"
      style={{
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <button
        onClick={() => onChange("inventory")}
        className={`px-6 py-3 rounded-2xl transition-all ${
          activeTab === "inventory"
            ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
            : "text-[#628141]"
        }`}
        style={
          activeTab === "inventory"
            ? {
                boxShadow:
                  "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
              }
            : {}
        }
      >
        Inventory Data
      </button>
      <button
        onClick={() => onChange("catalog")}
         className={`px-6 py-3 rounded-2xl transition-all ${activeTab === "catalog" ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]" : "text-[#628141]"}`}
         style={activeTab === "catalog" ? { boxShadow: "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)" } : {}}
       >
         Product Catalog
       </button>
       <button
         onClick={() => onChange("transactions")}
        className={`px-6 py-3 rounded-2xl transition-all ${
          activeTab === "transactions"
            ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
            : "text-[#628141]"
        }`}
        style={
          activeTab === "transactions"
            ? {
                boxShadow:
                  "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
              }
            : {}
        }
      >
        Transaction History
      </button>
    </div>
  );
}
