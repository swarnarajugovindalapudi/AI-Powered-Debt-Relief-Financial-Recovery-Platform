import { useEffect, useState } from "react";
import { Copy, FileText, LoaderCircle, MailWarning, Sparkles } from "lucide-react";
import { generateNegotiationLetter } from "../services/finreliefApi";

const defaultForm = {
  borrower_name: "Aarav Sharma",
  lender_name: "HDFC Bank",
  loan_amount: "220000",
  hardship_reason: "temporary income disruption due to medical and family expenses",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function validateForm(form) {
  const nextErrors = {};

  if (!form.borrower_name.trim()) {
    nextErrors.borrower_name = "Borrower name is required.";
  }

  if (!form.lender_name.trim()) {
    nextErrors.lender_name = "Lender name is required.";
  }

  const amount = Number.parseFloat(form.loan_amount);
  if (!form.loan_amount || Number.isNaN(amount) || amount <= 0) {
    nextErrors.loan_amount = "Loan amount must be greater than zero.";
  }

  if (!form.hardship_reason.trim()) {
    nextErrors.hardship_reason = "Please describe the hardship reason.";
  }

  return nextErrors;
}

function buildFallbackLetter(form) {
  return `Dear ${form.lender_name},

I hope you are doing well.

I am writing regarding my outstanding loan of ${currencyFormatter.format(Number.parseFloat(form.loan_amount) || 0)}.

Due to ${form.hardship_reason}, I am currently facing financial hardship.

I sincerely request you to consider a mutually beneficial settlement plan that allows me to repay my debt while managing my financial obligations.

I appreciate your understanding and look forward to your positive response.

Sincerely,

${form.borrower_name}`;
}

function NegotiationLetter() {
  const [form, setForm] = useState(defaultForm);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [copied, setCopied] = useState(false);

  async function generateLetter(values) {
    setLoading(true);
    setError("");

    const payload = {
      borrower_name: values.borrower_name.trim(),
      lender_name: values.lender_name.trim(),
      loan_amount: Number.parseFloat(values.loan_amount),
      hardship_reason: values.hardship_reason.trim(),
    };

    try {
      const response = await generateNegotiationLetter(payload);
      setLetter(response.data.negotiation_letter);
    } catch {
      setError("The backend letter generator is unavailable, so a local draft is being shown.");
      setLetter(buildFallbackLetter(values));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void generateLetter(defaultForm);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await generateLetter(form);
  }

  async function handleCopy() {
    if (!letter) {
      return;
    }

    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Unable to copy the letter right now.");
    }
  }

  return (
    <div className="feature-page">
      <header className="feature-hero">
        <div className="feature-kicker">AI-Assisted Outreach</div>
        <h1 className="feature-title">AI Negotiation Letter</h1>
        <p className="feature-description">
          Generate a professional settlement request letter from the live FastAPI service.
          If the service is unavailable, the page falls back to a local template so the workflow stays usable.
        </p>
      </header>

      {error ? <div className="feature-error">{error}</div> : null}

      <div className="feature-grid feature-grid--2">
        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <Sparkles size={16} />
              Letter inputs
            </div>
          </div>

          <div className="feature-panel__body">
            <form className="feature-form" onSubmit={handleSubmit} noValidate>
              <div className="feature-form__grid">
                <label className="feature-field">
                  <span className="feature-label">Borrower Name</span>
                  <input className="feature-input" name="borrower_name" value={form.borrower_name} onChange={handleChange} />
                  {fieldErrors.borrower_name ? <span className="feature-help">{fieldErrors.borrower_name}</span> : null}
                </label>

                <label className="feature-field">
                  <span className="feature-label">Lender Name</span>
                  <input className="feature-input" name="lender_name" value={form.lender_name} onChange={handleChange} />
                  {fieldErrors.lender_name ? <span className="feature-help">{fieldErrors.lender_name}</span> : null}
                </label>

                <label className="feature-field">
                  <span className="feature-label">Loan Amount</span>
                  <input
                    className="feature-input"
                    name="loan_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.loan_amount}
                    onChange={handleChange}
                  />
                  {fieldErrors.loan_amount ? <span className="feature-help">{fieldErrors.loan_amount}</span> : null}
                </label>

                <label className="feature-field">
                  <span className="feature-label">Hardship Reason</span>
                  <textarea className="feature-textarea" name="hardship_reason" value={form.hardship_reason} onChange={handleChange} />
                  {fieldErrors.hardship_reason ? <span className="feature-help">{fieldErrors.hardship_reason}</span> : null}
                </label>
              </div>

              <div className="feature-actions">
                <button className="feature-button" type="submit" disabled={loading}>
                  {loading ? <LoaderCircle size={16} className="animate-spin" /> : <FileText size={16} />}
                  {loading ? "Generating..." : "Generate Letter"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <MailWarning size={16} />
              Draft preview
            </div>
          </div>

          <div className="feature-panel__body">
            <div className="feature-actions" style={{ marginBottom: 14 }}>
              <button className="feature-button feature-button--secondary" type="button" onClick={handleCopy} disabled={!letter}>
                <Copy size={16} />
                {copied ? "Copied" : "Copy Letter"}
              </button>
            </div>

            {loading && !letter ? (
              <div className="feature-empty">
                <div className="feature-empty__title">Generating draft...</div>
                <p className="feature-empty__text">The letter preview will appear here once the backend or fallback draft is ready.</p>
              </div>
            ) : letter ? (
              <div className="feature-card">
                <pre className="feature-pre">{letter}</pre>
              </div>
            ) : (
              <div className="feature-empty">
                <div className="feature-empty__title">No letter generated yet</div>
                <p className="feature-empty__text">Submit the form to create a negotiation draft tailored to the lender and hardship context.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default NegotiationLetter;