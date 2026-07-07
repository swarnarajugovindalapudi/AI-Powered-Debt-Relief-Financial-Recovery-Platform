import { useNavigate } from "react-router-dom";
import { Bell, LogOut, ShieldCheck } from "lucide-react";
import { getAuthEmail, signOut } from "../../services/authService";

function Navbar() {
  const navigate = useNavigate();
  const email = getAuthEmail();
  const profileName = email ? email.split("@")[0] : "Borrower";
  const initials = profileName
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "FR";

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar">
      <div>
        <p className="app-navbar__eyebrow">FinRelief AI</p>
        <h3 className="app-navbar__title">AI Powered Debt Relief Platform</h3>
        {email ? <p className="app-navbar__meta">Signed in as {email}</p> : null}
      </div>

      <div className="app-navbar__actions">
        <div className="app-navbar__profile">
          <div className="app-navbar__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="app-navbar__profile-text">
            <div className="app-navbar__profile-name">{profileName}</div>
            <div className="app-navbar__profile-role">Borrower workspace</div>
          </div>
        </div>

        <div className="app-navbar__pill">
          <ShieldCheck size={16} />
          Protected
        </div>
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="feature-button feature-button--secondary app-navbar__logout" type="button" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;