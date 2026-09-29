import { useEffect, useState, type ComponentType } from "react";
import { BarChart3, Boxes, Route, Sparkles, Truck, type LucideProps } from "lucide-react";
import type { SalesDecisionInsight } from "./useSalesDecisionInsights";

const cardDetails: Record<
  SalesDecisionInsight["id"],
  {
    Icon: ComponentType<LucideProps>;
    iconClass: string;
    accentClass?: string;
  }
> = {
  trend: { Icon: BarChart3, iconClass: "from-[#628141] to-[#86A85D]", accentClass: "bg-[#628141]" },
  products: { Icon: Boxes, iconClass: "from-[#73974B] to-[#A3C77A]", accentClass: "bg-[#8BAE66]" },
  channels: {
    Icon: Sparkles,
    iconClass: "from-[#4F7133] to-[#86A85D]",
    accentClass: "bg-[#5F843F]",
  },
  delivery: { Icon: Truck, iconClass: "from-[#638342] to-[#9DBD71]", accentClass: "bg-[#73974B]" },
};

export function SalesDecisionInsights({ insights }: { insights: SalesDecisionInsight[] }) {
  const [recommendations, setRecommendations] = useState(insights);
  const [generation, setGeneration] = useState<"loading" | "gemini" | "fallback">("loading");

  useEffect(() => {
    if (!insights.length) return;
    let active = true;
    import("./geminiSalesRecommendations")
      .then(({ generateRecommendations }) => generateRecommendations(insights))
      .then((generated) => {
        if (active) {
          setRecommendations(generated);
          setGeneration("gemini");
        }
      })
      .catch(() => {
        if (active) {
          setRecommendations(insights);
          setGeneration("fallback");
        }
      });
    return () => {
      active = false;
    };
  }, [insights]);

  return (
    <section aria-labelledby="sales-decision-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="sales-decision-heading" className="text-xl tracking-[-0.02em] text-[#1B211A]">
            Sales Decision Insights
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-[#628141]">
            Latest day vs. prior 6-day average · latest 28 days for sales mix
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8BAE66]/30 bg-[#EAF2E2] px-3 py-1.5 text-[11px] font-semibold text-[#557337] shadow-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${generation === "fallback" ? "bg-[#B98945]" : "bg-[#628141]"}`}
          />
          {generation === "gemini"
            ? "Gemini recommendations"
            : generation === "loading"
              ? "Preparing Gemini…"
              : "Standard recommendations"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {recommendations.slice(0, 4).map((insight) => {
          const { Icon, iconClass } = cardDetails[insight.id];
          return (
            <article
              key={insight.id}
              className="group relative flex min-h-52 flex-col overflow-hidden rounded-3xl border border-[#8BAE66]/25 bg-gradient-to-br from-white via-[#FFFDF1] to-[#EAF2E2] p-3 transition duration-200 hover:-translate-y-1 hover:border-[#8BAE66]/45"
              style={{
                boxShadow:
                  "0 10px 28px rgba(44, 65, 29, 0.13), inset 0 1px 0 rgba(255,255,255,.95), inset 0 -2px 8px rgba(98,129,65,.05)",
              }}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${iconClass} text-[#FFFDF1] transition group-hover:scale-105`}
                  style={{
                    boxShadow:
                      "0 5px 14px rgba(98,129,65,.28), inset 0 1px 1px rgba(255,255,255,.3), inset 0 -2px 4px rgba(27,33,26,.12)",
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
                </div>
                <span className="rounded-full border border-[#8BAE66]/25 bg-white/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#628141]">
                  {insight.category}
                </span>
              </div>
              <h3 className="text-sm font-bold leading-5 tracking-[-0.01em] text-[#1B211A]">
                {insight.title}
              </h3>
              <p className="mt-2 text-sm font-bold leading-6 tracking-[-0.02em] text-[#48672D]">
                {insight.value}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#5B6654]">{insight.context}</p>
              <div className="mt-auto pt-4">
                <p className="border-t border-[#8BAE66]/20 pt-3 text-[11px] leading-5 text-[#466332]">
                  <strong className="mr-1 font-bold uppercase tracking-[0.08em] text-[#628141]">
                    Do next
                  </strong>
                  {insight.recommendation}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
