import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="hero">
        <h1>FinRelief AI</h1>
        <p className="subtitle">
          AI-Powered Debt Relief & Financial Recovery Platform
        </p>

        <p className="description">
          FinRelief AI is a full-stack financial assistance platform developed
          using React, FastAPI, Python, SQLite and Google Gemini AI. It helps
          borrowers analyze their financial health, estimate debt settlements,
          and generate AI-assisted negotiation strategies.
        </p>

        <div className="buttons">
          <a
            href="https://finrelief-ai-backend.onrender.com"
            target="_blank"
            rel="noreferrer"
            className="btn"
          >
            Live Backend API
          </a>

          <a
            href="https://github.com/swarnarajugovindalapudi/AI-Powered-Debt-Relief-Financial-Recovery-Platform"
            target="_blank"
            rel="noreferrer"
            className="btn secondary"
          >
            GitHub Repository
          </a>
        </div>
      </header>

      <section className="card">
        <h2>Key Features</h2>

        <ul>
          <li>Financial Health Analysis</li>
          <li>Settlement Prediction</li>
          <li>AI Negotiation Strategy</li>
          <li>Negotiation Letter Generation</li>
          <li>Borrower Rights Module</li>
          <li>Loan Management</li>
          <li>JWT Authentication Architecture</li>
          <li>FastAPI REST APIs</li>
          <li>SQLite Database</li>
          <li>Google Gemini AI Integration</li>
        </ul>
      </section>

      <section className="card">
        <h2>Technology Stack</h2>

        <div className="grid">
          <div>React + Vite</div>
          <div>FastAPI</div>
          <div>Python</div>
          <div>SQLite</div>
          <div>Google Gemini AI</div>
          <div>JWT Authentication</div>
          <div>REST APIs</div>
          <div>GitHub</div>
        </div>
      </section>

      <footer>
        <p>
          Developed as an AI-powered financial recovery platform for the
          SkillWallet Internship Project.
        </p>
      </footer>
    </div>
  );
}

export default App;