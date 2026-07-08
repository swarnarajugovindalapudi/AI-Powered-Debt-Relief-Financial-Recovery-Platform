import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import FinancialHealth from "../pages/FinancialHealth";
import SettlementPredictor from "../pages/SettlementPredictor";
import NegotiationLetter from "../pages/NegotiationLetter";
import KnowYourRights from "../pages/KnowYourRights";
import History from "../pages/History";
import About from "../pages/About";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/financial-health"
            element={<FinancialHealth />}
          />

          <Route
            path="/settlement-predictor"
            element={<SettlementPredictor />}
          />

          <Route
            path="/negotiation-letter"
            element={<NegotiationLetter />}
          />

          <Route
            path="/know-your-rights"
            element={<KnowYourRights />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;