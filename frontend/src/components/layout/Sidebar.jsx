import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  HeartPulse,
  Scale,
  Bot,
  BookOpen,
  Clock,
  Info,
} from "lucide-react";

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
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/financial-health" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <HeartPulse size={18} /> Financial Health
        </NavLink>

        <NavLink to="/settlement-predictor" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <Scale size={18} /> Settlement Predictor
        </NavLink>

        <NavLink to="/negotiation-letter" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <Bot size={18} /> AI Negotiation
        </NavLink>

        <NavLink to="/know-your-rights" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <BookOpen size={18} /> Know Your Rights
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <Clock size={18} /> History
        </NavLink>

        <NavLink to="/about" className={({ isActive }) => `app-navlink ${isActive ? "app-navlink--active" : ""}`}>
          <Info size={18} /> About
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