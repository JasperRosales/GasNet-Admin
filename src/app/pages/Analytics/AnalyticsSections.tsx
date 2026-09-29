import { BookAIcon, MapPin, Sparkles } from "lucide-react";
import type { AiAnalyticsDTO } from "../../services/appService";
import {
  BranchChart,
  ChartCard,
  DailySalesChart,
  ProductRankingChart,
  RevenueChart,
  WeeklySalesChart,
} from "./components";
import type {
  BranchPerformancePoint,
  DailySalesPoint,
  MonthlyPerformancePoint,
  ProductRankingPoint,
  WeeklyDeliveryPoint,
} from "./types";

export function AiInsightsSection({
  data,
  loading,
  error,
}: {
  data: AiAnalyticsDTO | null;
  loading: boolean;
  error: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#628141]" />
        <h2 className="text-lg font-semibold text-[#1B211A]">AI Business Insights</h2>
      </div>
      {loading ? (
        <div className="rounded-3xl bg-[#FFFDF1] p-6 text-sm text-[#628141]">
          Generating insights from current business dataâ€¦
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.insights.map((insight, index) => (
            <article
              key={`${insight.title}-${index}`}
              className="rounded-3xl bg-[#FFFDF1] p-5"
              style={{ boxShadow: "0 8px 32px rgba(98, 129, 65, 0.15)" }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8BAE66]">
                {insight.type}
              </span>
              <h3 className="mt-2 font-semibold text-[#1B211A]">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#4B5543]">{insight.detail}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-[#FFFDF1] p-5 text-sm text-[#8A5A44]">{error}</div>
      )}
    </section>
  );
}

export function RevenueSection({ data }: { data: MonthlyPerformancePoint[] }) {
  return (
    <ChartCard
      icon={<MapPin className="w-5 h-5 text-[#FFFDF1]" />}
      title="Yearly Sales Overview"
      description="Monthly revenue and transaction activity"
    >
      <RevenueChart data={data} />
    </ChartCard>
  );
}

export function PerformanceSection({
  weekly,
  branches,
  daily,
  products,
}: {
  weekly: WeeklyDeliveryPoint[];
  branches: BranchPerformancePoint[];
  daily: DailySalesPoint[];
  products: ProductRankingPoint[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        icon={<BookAIcon className="w-5 h-5 text-[#FFFDF1]" />}
        title="Weekly Sales Performance"
        description="In-Store, Commercial, and Delivery transactions"
      >
        <WeeklySalesChart data={weekly} />
      </ChartCard>
      <ChartCard
        icon={<BookAIcon className="w-5 h-5 text-[#FFFDF1]" />}
        title="Daily Sales Analytics"
        description="Actual sales_transactions revenue, day by day"
      >
        <DailySalesChart data={daily} />
      </ChartCard>
      <ChartCard
        icon={<MapPin className="w-5 h-5 text-[#FFFDF1]" />}
        title="Branch Performance"
        description="Sales distribution across branches"
      >
        <BranchChart data={branches} />
      </ChartCard>
      <ChartCard
        icon={<BookAIcon className="w-5 h-5 text-[#FFFDF1]" />}
        title="Top Products"
        description="Total product weight (kg) and sales value (₱)"
      >
        <ProductRankingChart data={products} />
      </ChartCard>
    </div>
  );
}
