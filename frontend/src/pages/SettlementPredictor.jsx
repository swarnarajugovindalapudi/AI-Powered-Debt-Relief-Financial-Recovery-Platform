import { useEffect, useState } from "react";
import { AlertTriangle, Calculator, BadgePercent, ShieldCheck, Sparkles } from "lucide-react";
import { predictSettlement } from "../services/finreliefApi";
import StatusMessage from "../components/common/StatusMessage";

const defaultForm = {
  monthly_income: "65000",
  monthly_expenses: "42000",
  total_debt: "485000",
  monthly_emi: "21000",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function normalizeNumber(value) {
  return Number.parseFloat(value);
}

function validateForm(form) {
  const nextErrors = {};

  if (!form.monthly_income || normalizeNumber(form.monthly_income) <= 0) {
    nextErrors.monthly_income = "Monthly income must be greater than zero.";
  }

  if (form.monthly_expenses === "" || normalizeNumber(form.monthly_expenses) < 0) {
    nextErrors.monthly_expenses = "Monthly expenses cannot be negative.";
  }

  if (form.total_debt === "" || normalizeNumber(form.total_debt) < 0) {
    nextErrors.total_debt = "Total debt cannot be negative.";
  }

  if (form.monthly_emi === "" || normalizeNumber(form.monthly_emi) < 0) {
    nextErrors.monthly_emi = "Monthly EMI cannot be negative.";
  }

  return nextErrors;
}

function calculateFallback(values) {
  const monthlyIncome = values.monthly_income;
  const monthlyExpenses = values.monthly_expenses;
  const totalDebt = values.total_debt;
  const monthlyEmi = values.monthly_emi;

  const monthlySurplus = monthlyIncome - monthlyExpenses - monthlyEmi;
  const debtToIncome = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;
  const emiRatio = monthlyIncome > 0 ? (monthlyEmi / monthlyIncome) * 100 : 0;

  const riskCategory = emiRatio < 30 ? "Low" : emiRatio < 50 ? "Medium" : "High";
  const recommendedSettlementPercent = riskCategory === "High" ? 55 : riskCategory === "Medium" ? 70 : 90;

  return {
    recommended_settlement_percent: recommendedSettlementPercent,
    estimated_settlement_amount: Number((totalDebt * recommendedSettlementPercent) / 100),
    confidence_score: 88,
    analysis: {
      monthly_surplus: Number(monthlySurplus.toFixed(2)),
      debt_to_income_ratio: Number(debtToIncome.toFixed(2)),
      emi_ratio: Number(emiRatio.toFixed(2)),
      financial_stress: riskCategory,
      risk_category: riskCategory,
    },
  };
}

function SettlementPredictor() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function runPrediction(values) {
    setLoading(true);
    setError("");

    const payload = {
      monthly_income: normalizeNumber(values.monthly_income),
      monthly_expenses: normalizeNumber(values.monthly_expenses),
      total_debt: normalizeNumber(values.total_debt),
      monthly_emi: normalizeNumber(values.monthly_emi),
    };

    try {
      const response = await predictSettlement(payload);
      setResult(response.data);
    } catch {
      setError("The backend settlement API is unavailable right now, so a local estimate is being shown.");
      setResult(calculateFallback(payload));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void runPrediction(defaultForm);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await runPrediction(form);
  }

  const analysis = result?.analysis;
  const summaryCards = result
    ? [
        {
          title: "Recommended Settlement",
          value: `${result.recommended_settlement_percent}%`,
          icon: BadgePercent,
          toneClass: "feature-tone--blue",
        },
        {
          title: "Estimated Amount",
          value: currencyFormatter.format(result.estimated_settlement_amount),
          icon: Calculator,
          toneClass: "feature-tone--green",
        },
        {
          title: "Confidence Score",
          value: `${result.confidence_score}%`,
          icon: ShieldCheck,
          toneClass: "feature-tone--violet",
        },
      ]
    : [];

  return (
    <div className="feature-page">
      <header className="feature-hero">
        <div className="feature-kicker">AI-Powered Settlement Analysis</div>
        <h1 className="feature-title">Settlement Predictor</h1>
        <p className="feature-description">
          Estimate a realistic settlement range from your current income, debt, and EMI profile.
          The predictor uses the live FastAPI service when available and falls back to local logic when needed.
        </p>
      </header>

      {error ? (
        <StatusMessage
          variant="error"
          title="Fallback settlement estimate"
          message={error}
        />
      ) : null}

      <div className="feature-grid feature-grid--2">
        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <Sparkles size={16} />
              Settlement inputs
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
                  {fieldErrors.monthly_income ? <span className="feature-help">{fieldErrors.monthly_income}</span> : null}
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
                  {fieldErrors.monthly_expenses ? <span className="feature-help">{fieldErrors.monthly_expenses}</span> : null}
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
                  {fieldErrors.total_debt ? <span className="feature-help">{fieldErrors.total_debt}</span> : null}
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
                  {fieldErrors.monthly_emi ? <span className="feature-help">{fieldErrors.monthly_emi}</span> : null}
                </label>
              </div>

              <div className="feature-actions">
                <button className="feature-button" type="submit" disabled={loading}>
                  {loading ? "Calculating..." : "Predict Settlement"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <AlertTriangle size={16} />
              Analysis result
            </div>
          </div>

          <div className="feature-panel__body">
            {loading && !result ? (
              <div className="feature-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="feature-card" style={{ minHeight: 132, opacity: 0.7 }} />
                ))}
              </div>
            ) : result ? (
              <div className="feature-grid" style={{ gap: 18 }}>
                <div className="feature-grid feature-grid--3">
                  {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <article className="feature-card" key={card.title}>
                        <div className={`feature-chip feature-tone ${card.toneClass}`}>
                          <Icon size={16} />
                          {card.title}
                        </div>
                        <div className="feature-card__value">{card.value}</div>
                      </article>
                    );
                  })}
                </div>

                {analysis ? (
                  <div className="feature-grid feature-grid--2">
                    <article className="feature-card">
                      <div className="feature-card__label">Debt-to-Income Ratio</div>
                      <div className="feature-card__value">{numberFormatter.format(analysis.debt_to_income_ratio)}%</div>
                      <p className="feature-help">Lower ratios typically improve settlement leverage.</p>
                    </article>

                    <article className="feature-card">
                      <div className="feature-card__label">EMI / Income Ratio</div>
                      <div className="feature-card__value">{numberFormatter.format(analysis.emi_ratio)}%</div>
                      <p className="feature-help">This ratio drives the risk category and target settlement range.</p>
                    </article>

                    <article className="feature-card">
                      <div className="feature-card__label">Monthly Surplus</div>
                      <div className="feature-card__value">{currencyFormatter.format(analysis.monthly_surplus)}</div>
                      <p className="feature-help">Positive surplus is a strong signal for negotiated repayment plans.</p>
                    </article>

                    <article className="feature-card">
                      <div className="feature-card__label">Financial Stress</div>
                      <div className="feature-card__value">{analysis.financial_stress}</div>
                      <p className="feature-help">Risk categories are inferred from the backend analysis rules.</p>
                    </article>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="feature-empty">
                <div className="feature-empty__title">No prediction available</div>
                <p className="feature-empty__text">Enter your financial details and run the predictor to generate a settlement estimate.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettlementPredictor;