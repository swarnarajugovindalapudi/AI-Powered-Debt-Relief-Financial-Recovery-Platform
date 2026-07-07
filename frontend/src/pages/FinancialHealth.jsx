import { useEffect, useState } from "react";
import apiClient from "../services/finreliefApi";
import StatusMessage from "../components/common/StatusMessage";
import {
  FaHeartbeat,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function FinancialHealth() {
  const [data, setData] = useState({
    debt_to_income_ratio: "--",
    emi_to_income_ratio: "--",
    monthly_surplus: "--",
    financial_stress: "--",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("loading");

  useEffect(() => {
    async function loadHealth() {
      setLoading(true);
      setError("");

      try {
        const res = await apiClient.post("/api/financial-analysis", {
          monthly_income: 65000,
          monthly_expenses: 42000,
          total_debt: 485000,
          monthly_emi: 21000,
        });

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

    loadHealth();
  }, []);

  const cards = [
    {
      title: "Debt / Income Ratio",
      value: data.debt_to_income_ratio,
      icon: <FaChartLine size={24} />,
      toneClass: "feature-tone--blue",
    },
    {
      title: "EMI / Income Ratio",
      value: data.emi_to_income_ratio,
      icon: <FaMoneyBillWave size={24} />,
      toneClass: "feature-tone--green",
    },
    {
      title: "Monthly Surplus",
      value: data.monthly_surplus,
      icon: <FaHeartbeat size={24} />,
      toneClass: "feature-tone--violet",
    },
    {
      title: "Financial Stress",
      value: data.financial_stress,
      icon: <FaExclamationTriangle size={24} />,
      toneClass: "feature-tone--rose",
    },
  ];

  if (loading)
    return (
      <div className="feature-page">
        <div className="feature-hero">
          <div className="feature-kicker">Financial diagnostics</div>
          <h1 className="feature-title">Financial Health</h1>
          <p className="feature-description">Loading your financial analysis from FastAPI.</p>
        </div>

        <div className="feature-grid feature-grid--4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="feature-card feature-skeleton-card">
              <div className="feature-skeleton feature-skeleton--line feature-skeleton--short" />
              <div className="feature-skeleton feature-skeleton--line" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="feature-page">
      <header className="feature-hero feature-hero--split">
        <div>
          <div className="feature-kicker">Financial diagnostics</div>
          <h1 className="feature-title">Financial Health</h1>
          <p className="feature-description">
            AI-generated analysis of your current financial position.
          </p>
        </div>

        <div className="feature-chip feature-chip--status">
          {source === "live" ? "Live API analysis" : source === "fallback" ? "Fallback analysis" : "Preparing analysis"}
        </div>
      </header>

      {error ? (
        <StatusMessage
          variant="error"
          title="Using fallback metrics"
          message={error}
        />
      ) : (
        <StatusMessage
          variant="success"
          title="Live metrics loaded"
          message="Pulled directly from the FastAPI financial analysis endpoint."
        />
      )}

      <div className="feature-grid feature-grid--4">
        {cards.map((card) => (
          <article key={card.title} className="feature-card feature-card--stat">
            <div className="feature-card__header">
              <div>
                <p className="feature-card__label">{card.title}</p>
                <div className="feature-card__value">{card.value}</div>
              </div>

              <div className={`feature-card__icon feature-tone ${card.toneClass}`}>{card.icon}</div>
            </div>
          </article>
        ))}
      </div>

      <section className="feature-panel">
        <div className="feature-panel__header">
          <div className="feature-chip">
            <FaHeartbeat />
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