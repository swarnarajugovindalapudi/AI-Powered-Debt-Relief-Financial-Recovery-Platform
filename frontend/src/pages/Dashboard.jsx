import { useEffect, useState } from "react";
import apiClient from "../services/finreliefApi";
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
  fullName: "",
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
  settlementPredictionsCount: 0,
  negotiationHistoryCount: 0,
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
        const response = await apiClient.get("/api/dashboard");

        if (!isMounted) {
          return;
        }

        const payload = response.data;

        setDashboard({
          fullName: payload.full_name ?? "",
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
          settlementPredictionsCount: payload.settlement_predictions_count ?? 0,
          negotiationHistoryCount: payload.negotiation_history_count ?? 0,
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
      toneClass: "feature-tone--rose",
    },
    {
      title: "Monthly Income",
      value: currencyFormatter.format(dashboard.monthlyIncome),
      icon: TrendingUp,
      toneClass: "feature-tone--green",
    },
    {
      title: "Monthly Expenses",
      value: currencyFormatter.format(dashboard.monthlyExpenses),
      icon: PiggyBank,
      toneClass: "feature-tone--blue",
    },
    {
      title: "Active Loans",
      value: dashboard.activeLoanCount.toString(),
      icon: Landmark,
      toneClass: "feature-tone--violet",
    },
    {
      title: "Settlement Predictions",
      value: dashboard.settlementPredictionsCount.toString(),
      icon: Activity,
      toneClass: "feature-tone--amber",
    },
    {
      title: "Negotiation History",
      value: dashboard.negotiationHistoryCount.toString(),
      icon: ShieldCheck,
      toneClass: "feature-tone--teal",
    },
  ];

  const chartRows = [
    {
      label: "Monthly income",
      value: dashboard.monthlyIncome,
      barClass: "dashboard-chart__fill--income",
    },
    {
      label: "Monthly expenses",
      value: dashboard.monthlyExpenses,
      barClass: "dashboard-chart__fill--expenses",
    },
    {
      label: "Monthly EMI",
      value: dashboard.monthlyEmi ?? dashboard.monthlyExpenses,
      barClass: "dashboard-chart__fill--emi",
    },
    {
      label: "Monthly surplus",
      value: dashboard.monthlySurplus,
      barClass: "dashboard-chart__fill--surplus",
    },
  ];

  const chartMax = Math.max(...chartRows.map((item) => item.value), 1);

  const activeLoans = dashboard.activeLoans;
  const settlementProgress = dashboard.financialHealthScore
    ? Math.min(Math.max(dashboard.financialHealthScore, 0), 100)
    : 0;

  const healthColor = settlementProgress > 70 ? "feature-progress--healthy" : settlementProgress > 40 ? "feature-progress--warning" : "feature-progress--critical";
  const dtiColor = dashboard.debtToIncomeRatio < 36 ? "feature-progress--healthy" : dashboard.debtToIncomeRatio <= 50 ? "feature-progress--warning" : "feature-progress--critical";

  return (
    <div className="feature-page">
      <header className="feature-hero feature-hero--split">
        <div>
          <div className="feature-kicker">Portfolio Snapshot</div>
          <h1 className="feature-title">Hello, {dashboard.fullName || "Borrower"}</h1>
          <p className="feature-description">
            Overview of your current debt position, stress level, and settlement readiness.
          </p>
        </div>

        <div className="feature-chip feature-chip--status">
          {dashboard.recommendedAction ? (
            <span>
              Recommended action: <strong>{dashboard.recommendedAction}</strong>
            </span>
          ) : (
            <span>Refreshing dashboard metrics</span>
          )}
        </div>
      </header>

      {loading ? (
        <div className="feature-grid feature-grid--3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="feature-card feature-skeleton-card">
              <div className="feature-skeleton feature-skeleton--line feature-skeleton--short" />
              <div className="feature-skeleton feature-skeleton--line" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="status-message status-message--error">
          <div className="status-message__content">
            <div className="status-message__title status-message__title--error">Dashboard unavailable</div>
            <p className="status-message__text">{error}</p>
          </div>
          <div className="status-message__actions">
            <button type="button" onClick={() => window.location.reload()} className="feature-button feature-button--secondary">
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="feature-grid feature-grid--3">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="feature-card feature-card--stat">
                  <div className="feature-card__header">
                    <div>
                      <p className="feature-card__label">{item.title}</p>
                      <div className="feature-card__value">{item.value}</div>
                    </div>
                    <div className={`feature-card__icon feature-tone ${item.toneClass}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="feature-grid feature-grid--2 dashboard-grid">
            <section className="feature-panel">
              <div className="feature-panel__header">
                <div className="feature-chip">
                  <Activity size={16} />
                  Financial overview
                </div>
              </div>

              <div className="feature-panel__body feature-summary">
                <div className="feature-summary__row">
                  <span>Financial Health Score</span>
                  <strong>{settlementProgress}%</strong>
                </div>
                <div className={`feature-progress ${healthColor}`}>
                  <div className="feature-progress__bar" style={{ width: `${settlementProgress}%` }} />
                </div>

                <div className="feature-summary__row">
                  <span>Debt-to-Income Ratio</span>
                  <strong>{numberFormatter.format(dashboard.debtToIncomeRatio)}%</strong>
                </div>
                <div className={`feature-progress ${dtiColor}`}>
                  <div className="feature-progress__bar" style={{ width: `${Math.min(dashboard.debtToIncomeRatio, 100)}%` }} />
                </div>

                <div className="feature-card feature-card--inner">
                  <p className="feature-card__label">Monthly Surplus</p>
                  <div className="feature-card__value">{currencyFormatter.format(dashboard.monthlySurplus)}</div>
                  <p className="feature-help">Surplus after monthly expenses and EMI obligations.</p>
                </div>
              </div>
            </section>

            <section className="feature-panel">
              <div className="feature-panel__header">
                <div className="feature-chip">
                  <Activity size={16} />
                  Cash flow chart
                </div>
              </div>

              <div className="feature-panel__body dashboard-chart">
                {chartRows.map((row) => {
                  const width = Math.round((row.value / chartMax) * 100);

                  return (
                    <div className="dashboard-chart__row" key={row.label}>
                      <div className="dashboard-chart__meta">
                        <span className="dashboard-chart__label">{row.label}</span>
                        <strong>{currencyFormatter.format(row.value)}</strong>
                      </div>
                      <div className="dashboard-chart__track">
                        <div className={`dashboard-chart__fill ${row.barClass}`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}

                <div className="dashboard-summary">
                  <div className="dashboard-summary__item">
                    <span className="dashboard-summary__label">Financial health score</span>
                    <span className="dashboard-summary__value">{settlementProgress}%</span>
                  </div>
                  <div className="dashboard-summary__item">
                    <span className="dashboard-summary__label">Debt-to-income ratio</span>
                    <span className="dashboard-summary__value">{numberFormatter.format(dashboard.debtToIncomeRatio)}%</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="feature-panel">
              <div className="feature-panel__header">
                <div className="feature-chip">
                  <CheckCircle size={16} />
                  AI recommendations
                </div>
              </div>

              <div className="feature-panel__body">
                {dashboard.aiRecommendations.length > 0 ? (
                  <div className="feature-list">
                    {dashboard.aiRecommendations.map((recommendation) => (
                      <article key={recommendation} className="feature-list__item feature-list__item--compact">
                        <div className="feature-list__icon">
                          <CheckCircle size={18} />
                        </div>
                        <p className="feature-list__text">{recommendation}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="feature-empty feature-empty--compact">
                    <div className="feature-empty__title">No recommendations available yet</div>
                    <p className="feature-empty__text">Complete a financial health check to generate personalized AI-driven strategies.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="feature-panel">
            <div className="feature-panel__header feature-panel__header--split">
              <div>
                <div className="feature-chip">
                  <Wallet size={16} />
                  Active loans summary
                </div>
                <p className="feature-description feature-description--compact">
                  {dashboard.activeLoanCount} loans tracked in the current repayment profile.
                </p>
              </div>

              <div className="feature-chip feature-chip--status">
                Total Debt: <strong>{currencyFormatter.format(dashboard.totalDebt)}</strong>
              </div>
            </div>

            <div className="feature-table-wrap">
              {activeLoans.length > 0 ? (
                <table className="feature-table">
                  <thead>
                    <tr>
                      <th>Lender</th>
                      <th>Outstanding</th>
                      <th>Monthly EMI</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLoans.map((loan) => (
                      <tr key={loan.lender}>
                        <td>{loan.lender}</td>
                        <td>{currencyFormatter.format(loan.amount)}</td>
                        <td>{currencyFormatter.format(loan.emi)}</td>
                        <td>
                          <span className={`feature-pill ${loan.status === "Negotiation" ? "feature-pill--warning" : "feature-pill--success"}`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="dashboard-table-empty">
                  <div className="dashboard-table-empty__title">Your portfolio is currently empty</div>
                  <p className="dashboard-table-empty__text">Add your first loan to begin tracking balances and optimizing repayment strategies.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;