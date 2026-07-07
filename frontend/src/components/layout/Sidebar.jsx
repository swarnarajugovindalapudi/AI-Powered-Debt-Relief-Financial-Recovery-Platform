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
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">F</div>
        <div>
          <h2 className="app-sidebar__title">FinRelief AI</h2>
          <p className="app-sidebar__subtitle">Debt recovery cockpit</p>
        </div>
      </div>

      <nav className="app-sidebar__nav" aria-label="Primary navigation">
        <NavLink to="/dashboard" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaHome /> Dashboard
        </NavLink>

        <NavLink to="/financial-health" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaChartLine /> Financial Health
        </NavLink>

        <NavLink to="/settlement-predictor" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaBalanceScale /> Settlement Predictor
        </NavLink>

        <NavLink to="/negotiation-letter" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaRobot /> AI Negotiation
        </NavLink>

        <NavLink to="/know-your-rights" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaBook /> Know Your Rights
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaHistory /> History
        </NavLink>

        <NavLink to="/about" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <FaInfoCircle /> About
        </NavLink>
      </nav>

      <div className="app-sidebar__footer">
        <p>Live API linked</p>
        <span>FastAPI + React</span>
      </div>
    </aside>
  );
}

export default Sidebar;