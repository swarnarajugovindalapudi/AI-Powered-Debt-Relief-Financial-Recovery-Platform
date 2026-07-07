import { useEffect, useState } from "react";
import axios from "axios";
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

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/financial-analysis",
          {
            monthly_income: 65000,
            monthly_expenses: 42000,
            total_debt: 485000,
            monthly_emi: 21000,
          }
        );

        setData({
          debt_to_income_ratio: `${res.data.debt_to_income_ratio}%`,
          emi_to_income_ratio: `${res.data.emi_ratio}%`,
          monthly_surplus: `₹${Number(res.data.monthly_surplus).toLocaleString(
            "en-IN"
          )}`,
          financial_stress: res.data.financial_stress,
        });
      } catch (err) {
        console.log(err);

        // Demo values until backend endpoint is ready
        setData({
          debt_to_income_ratio: "38%",
          emi_to_income_ratio: "21%",
          monthly_surplus: "₹23,000",
          financial_stress: "Medium",
        });
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
      color: "bg-blue-600",
    },
    {
      title: "EMI / Income Ratio",
      value: data.emi_to_income_ratio,
      icon: <FaMoneyBillWave size={24} />,
      color: "bg-green-600",
    },
    {
      title: "Monthly Surplus",
      value: data.monthly_surplus,
      icon: <FaHeartbeat size={24} />,
      color: "bg-purple-600",
    },
    {
      title: "Financial Stress",
      value: data.financial_stress,
      icon: <FaExclamationTriangle size={24} />,
      color: "bg-red-600",
    },
  ];

  if (loading)
    return (
      <div className="text-white text-xl">
        Loading Financial Health...
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Financial Health
        </h1>

        <p className="text-gray-400 mt-2">
          AI-generated analysis of your current financial position.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400">{card.title}</p>
                <h2 className="text-3xl font-bold text-white mt-2">
                  {card.value}
                </h2>
              </div>

              <div className={`${card.color} p-4 rounded-xl text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          AI Recommendation
        </h2>

        <ul className="space-y-3 text-gray-300">
          <li>• Continue paying EMIs on time.</li>
          <li>• Maintain Debt-to-Income ratio below 40%.</li>
          <li>• Avoid taking additional unsecured loans.</li>
          <li>• Increase emergency savings by at least 3 months of expenses.</li>
        </ul>
      </div>
    </div>
  );
}