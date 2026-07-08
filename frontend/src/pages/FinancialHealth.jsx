import { useState } from "react";
import apiClient from "../services/finreliefApi";
import StatusMessage from "../components/common/StatusMessage";
import {
  HeartPulse,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

const defaultForm = {
  monthly_income: "65000",
  monthly_expenses: "42000",
  total_debt: "485000",
  monthly_emi: "21000",
};

export default function FinancialHealth() {
  const [form, setForm] = useState(defaultForm);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");

  async function runAnalysis(values) {
    setLoading(true);
    setError("");

    const payload = {
      monthly_income: parseFloat(values.monthly_income),
      monthly_expenses: parseFloat(values.monthly_expenses),
      total_debt: parseFloat(values.total_debt),
      monthly_emi: parseFloat(values.monthly_emi),
    };

    try {
      const res = await apiClient.post("/api/financial-analysis", payload);

      setData({
        debt_to_income_ratio: `${res.data.debt_to_income_ratio}%`,
        emi_to_income_ratio: `${res.data.emi_ratio}%`,
        monthly_surplus: `₹${Number(res.data.monthly_surplus).toLocaleString(
          "en-IN"
        )}`,
        financial_stress: res.data.financial_stress,
      });
      setSource("live");
    } catch {
      setError("Unable to load live financial analysis right now. Showing a safe fallback instead.");
      setData({
        debt_to_income_ratio: "38%",
        emi_to_income_ratio: "21%",
        monthly_surplus: "₹23,000",
        financial_stress: "Medium",
      });
      setSource("fallback");
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await runAnalysis(form);
  }

  const cards = data
    ? [
        {
          title: "Debt / Income Ratio",
          value: data.debt_to_income_ratio,
          icon: TrendingUp,
          toneClass: "feature-tone--blue",
        },
        {
          title: "EMI / Income Ratio",
          value: data.emi_to_income_ratio,
          icon: Banknote,
          toneClass: "feature-tone--green",
        },
        {
          title: "Monthly Surplus",
          value: data.monthly_surplus,
          icon: HeartPulse,
          toneClass: "feature-tone--violet",
        },
        {
          title: "Financial Stress",
          value: data.financial_stress,
          icon: AlertTriangle,
          toneClass: "feature-tone--rose",
        },
      ]
    : [];

  return (
    <div className="feature-page">
      <header className="feature-hero feature-hero--split">
        <div>
          <div className="feature-kicker">Financial diagnostics</div>
          <h1 className="feature-title">Financial Health</h1>
          <p className="feature-description">
            Enter your income, expenses, debt, and EMI details to receive an
            AI-generated analysis of your current financial position.
          </p>
        </div>

        {source ? (
          <div className="feature-chip feature-chip--status">
            {source === "live" ? "Live API analysis" : source === "fallback" ? "Fallback analysis" : "Preparing analysis"}
          </div>
        ) : null}
      </header>

      {error ? (
        <StatusMessage
          variant="error"
          title="Using fallback metrics"
          message={error}
        />
      ) : source === "live" ? (
        <StatusMessage
          variant="success"
          title="Live metrics loaded"
          message="Pulled directly from the FastAPI financial analysis endpoint."
        />
      ) : null}

      <div className="feature-grid feature-grid--2">
        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <Sparkles size={16} />
              Financial inputs
            </div>
          </div>

          <div className="feature-panel__body">
            <form className="feature-form" onSubmit={handleSubmit} noValidate>
              <div className="feature-form__grid">
                <label className="feature-field">
                  <span className="feature-label">Monthly Income</span>
                  <input
                    className="feature-input"
                    name="monthly_income"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthly_income}
                    onChange={handleChange}
                  />
                </label>

                <label className="feature-field">
                  <span className="feature-label">Monthly Expenses</span>
                  <input
                    className="feature-input"
                    name="monthly_expenses"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthly_expenses}
                    onChange={handleChange}
                  />
                </label>

                <label className="feature-field">
                  <span className="feature-label">Total Debt</span>
                  <input
                    className="feature-input"
                    name="total_debt"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.total_debt}
                    onChange={handleChange}
                  />
                </label>

                <label className="feature-field">
                  <span className="feature-label">Monthly EMI</span>
                  <input
                    className="feature-input"
                    name="monthly_emi"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthly_emi}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="feature-actions">
                <button className="feature-button" type="submit" disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Health"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <HeartPulse size={16} />
              Analysis results
            </div>
          </div>

          <div className="feature-panel__body">
            {loading ? (
              <div className="feature-grid feature-grid--2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="feature-card feature-skeleton-card">
                    <div className="feature-skeleton feature-skeleton--line feature-skeleton--short" />
                    <div className="feature-skeleton feature-skeleton--line" />
                  </div>
                ))}
              </div>
            ) : data ? (
              <div className="feature-grid feature-grid--2">
                {cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article key={card.title} className="feature-card feature-card--stat">
                      <div className="feature-card__header">
                        <div>
                          <p className="feature-card__label">{card.title}</p>
                          <div className="feature-card__value">{card.value}</div>
                        </div>
                        <div className={`feature-card__icon feature-tone ${card.toneClass}`}>
                          <Icon size={20} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="feature-empty">
                <div className="feature-empty__title">No analysis yet</div>
                <p className="feature-empty__text">Enter your financial details and click "Analyze Health" to generate results.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="feature-panel">
        <div className="feature-panel__header">
          <div className="feature-chip">
            <HeartPulse size={16} />
            AI recommendation
          </div>
        </div>

        <div className="feature-panel__body">
          <ul className="feature-bullet-list">
            <li>Continue paying EMIs on time.</li>
            <li>Maintain Debt-to-Income ratio below 40%.</li>
            <li>Avoid taking additional unsecured loans.</li>
            <li>Increase emergency savings by at least 3 months of expenses.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}