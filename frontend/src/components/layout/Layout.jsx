import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__content">
        <Navbar />

        <main className="app-main">
          <div className="app-main__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;