import type { Metric } from "./types";

interface MetricsGridProps {
  metrics: Metric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="p-6 rounded-3xl bg-[#FFFDF1]"
          style={{
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
          }}
        >
          <div
            className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66] w-fit mb-4"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <metric.icon className="w-6 h-6 text-[#FFFDF1]" />
          </div>
          <h3 className="text-[#1B211A] mb-1">{metric.value}</h3>
          <p className="text-[#628141] text-sm mb-2">{metric.label}</p>
          <span className="text-[#8BAE66] text-sm">{metric.change} from last month</span>
        </div>
      ))}
    </div>
  );
}
