import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Temporary token for demo purposes
    localStorage.setItem("access_token", "demo-token");

    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          width: 380,
        }}
      >
        <h1>FinRelief AI</h1>

        <p>AI Powered Debt Relief Platform</p>

        <input
          placeholder="Email"
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
            marginBottom: 10,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: 12,
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 14,
            background: "#2563eb",
            color: "#fff",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;