import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Activity,
  CheckCircle,
  Landmark,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const initialDashboard = {
  totalDebt: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlySurplus: 0,
  financialStress: "Loading",
  debtToIncomeRatio: 0,
  financialHealthScore: 0,
  recommendedAction: "",
  aiRecommendations: [],
  activeLoans: [],
  activeLoanCount: 0,
};

function Dashboard() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/dashboard");

        if (!isMounted) {
          return;
        }

        const payload = response.data;

        setDashboard({
          totalDebt: payload.total_debt ?? 0,
          monthlyIncome: payload.monthly_income ?? 0,
          monthlyExpenses: payload.monthly_expenses ?? 0,
          monthlySurplus: payload.monthly_surplus ?? 0,
          financialStress: payload.financial_stress ?? "Unknown",
          debtToIncomeRatio: payload.debt_to_income_ratio ?? 0,
          financialHealthScore: payload.financial_health_score ?? 0,
          recommendedAction: payload.recommended_action ?? "",
          aiRecommendations: payload.ai_recommendations ?? [],
          activeLoans: payload.active_loans ?? [],
          activeLoanCount:
            payload.active_loan_count ?? (payload.active_loans?.length ?? 0),
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setError(
          "Unable to load dashboard data right now. Please verify that the backend is running."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      title: "Total Debt",
      value: currencyFormatter.format(dashboard.totalDebt),
      icon: Wallet,
      color: "bg-red-500/15 text-red-300",
      accent: "from-red-500/20 to-red-500/5",
    },
    {
      title: "Monthly Income",
      value: currencyFormatter.format(dashboard.monthlyIncome),
      icon: TrendingUp,
      color: "bg-emerald-500/15 text-emerald-300",
      accent: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      title: "Monthly Expenses",
      value: currencyFormatter.format(dashboard.monthlyExpenses),
      icon: PiggyBank,
      color: "bg-sky-500/15 text-sky-300",
      accent: "from-sky-500/20 to-sky-500/5",
    },
    {
      title: "Monthly Surplus",
      value: currencyFormatter.format(dashboard.monthlySurplus),
      icon: Landmark,
      color: "bg-violet-500/15 text-violet-300",
      accent: "from-violet-500/20 to-violet-500/5",
    },
    {
      title: "Financial Stress",
      value: dashboard.financialStress,
      icon: AlertTriangle,
      color:
        dashboard.financialStress === "High"
          ? "bg-red-500/15 text-red-300"
          : dashboard.financialStress === "Moderate"
          ? "bg-amber-500/15 text-amber-300"
          : "bg-emerald-500/15 text-emerald-300",
      accent:
        dashboard.financialStress === "High"
          ? "from-red-500/20 to-red-500/5"
          : dashboard.financialStress === "Moderate"
          ? "from-amber-500/20 to-amber-500/5"
          : "from-emerald-500/20 to-emerald-500/5",
    },
    {
      title: "Debt-to-Income Ratio",
      value: `${numberFormatter.format(dashboard.debtToIncomeRatio)}%`,
      icon: ShieldCheck,
      color: "bg-cyan-500/15 text-cyan-300",
      accent: "from-cyan-500/20 to-cyan-500/5",
    },
  ];

  const activeLoans = dashboard.activeLoans;
  const settlementProgress = dashboard.financialHealthScore
    ? Math.min(Math.max(dashboard.financialHealthScore, 0), 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Overview of your current debt position, stress level, and settlement readiness.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-sm text-gray-300 shadow-lg shadow-black/20 backdrop-blur">
          {dashboard.recommendedAction ? (
            <span>
              Recommended action: <span className="text-white">{dashboard.recommendedAction}</span>
            </span>
          ) : (
            <span>Refreshing dashboard metrics</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-gray-800 bg-gray-900/70"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Dashboard unavailable</h2>
              <p className="mt-1 text-sm text-red-100/80">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-50 transition hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-400">{item.title}</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">
                        {item.value}
                      </h2>
                    </div>

                    <div className={`rounded-2xl bg-gradient-to-br ${item.accent} p-3 ${item.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-lg shadow-black/20">
              <div className="flex items-center gap-3">
                <Activity className="text-indigo-400" size={20} />
                <h2 className="text-xl font-semibold text-white">Financial Overview</h2>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                    <span>Financial Health Score</span>
                    <span>{settlementProgress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-800">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{ width: `${settlementProgress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                    <span>Debt-to-Income Ratio</span>
                    <span>{numberFormatter.format(dashboard.debtToIncomeRatio)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-800">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-red-400"
                      style={{ width: `${Math.min(dashboard.debtToIncomeRatio, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-black/20 p-4 text-sm text-gray-300">
                  <p className="text-gray-400">Monthly Surplus</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {currencyFormatter.format(dashboard.monthlySurplus)}
                  </p>
                  <p className="mt-2 text-gray-400">
                    Surplus after monthly expenses and EMI obligations.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-lg shadow-black/20">
              <h2 className="text-xl font-semibold text-white">AI Recommendations</h2>

              <div className="mt-5 space-y-4">
                {dashboard.aiRecommendations.length > 0 ? (
                  dashboard.aiRecommendations.map((recommendation) => (
                    <div key={recommendation} className="flex gap-3 rounded-xl border border-gray-800 bg-black/20 p-4">
                      <CheckCircle className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                      <p className="text-sm leading-6 text-gray-300">{recommendation}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-gray-800 bg-black/20 p-4 text-sm text-gray-400">
                    No AI recommendations are available yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/90 shadow-lg shadow-black/20 overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-gray-800 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Active Loans Summary</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {dashboard.activeLoanCount} loans tracked in the current repayment profile.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-black/20 px-4 py-2 text-sm text-gray-300">
                Total Debt: <span className="text-white">{currencyFormatter.format(dashboard.totalDebt)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Lender</th>
                    <th className="px-6 py-4 font-medium">Outstanding</th>
                    <th className="px-6 py-4 font-medium">Monthly EMI</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {activeLoans.map((loan) => (
                    <tr key={loan.lender} className="transition hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{loan.lender}</td>
                      <td className="px-6 py-4 text-gray-300">{currencyFormatter.format(loan.amount)}</td>
                      <td className="px-6 py-4 text-gray-300">{currencyFormatter.format(loan.emi)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            loan.status === "Negotiation"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;