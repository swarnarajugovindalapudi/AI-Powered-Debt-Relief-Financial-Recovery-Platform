import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Navbar />

        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;