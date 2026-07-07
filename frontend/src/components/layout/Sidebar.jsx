import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaChartLine,
  FaBalanceScale,
  FaRobot,
  FaHistory,
  FaInfoCircle,
  FaBook,
} from "react-icons/fa";

function Sidebar() {
  return (
    <aside
      style={{
        width: "260px",
        background: "#1E293B",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>FinRelief AI</h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "30px",
        }}
      >
        <NavLink to="/dashboard">
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="/financial-health">
          <FaChartLine /> Financial Health
        </NavLink>

        <NavLink to="/settlement-predictor">
          <FaBalanceScale /> Settlement Predictor
        </NavLink>

        <NavLink to="/negotiation-letter">
          <FaRobot /> AI Negotiation
        </NavLink>

        <NavLink to="/know-your-rights">
          <FaBook /> Know Your Rights
        </NavLink>

        <NavLink to="/history">
          <FaHistory /> History
        </NavLink>

        <NavLink to="/about">
          <FaInfoCircle /> About
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;