import { useEffect, useState } from "react";
import { BadgeCheck, BookOpen, ShieldAlert, Sparkles } from "lucide-react";
import { getBorrowerRights } from "../services/finreliefApi";

const fallbackRights = [
  "Right to receive fair treatment from lenders.",
  "Right to receive loan statements.",
  "Right to transparent loan terms.",
  "Right to negotiate settlement.",
  "Right to privacy of personal financial information.",
];

function KnowYourRights() {
  const [rights, setRights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRights() {
      try {
        const response = await getBorrowerRights();

        if (!isMounted) {
          return;
        }

        setRights(response.data.rights ?? fallbackRights);
      } catch {
        if (!isMounted) {
          return;
        }

        setError("The backend rights API is unavailable right now, so a local rights list is being shown.");
        setRights(fallbackRights);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRights();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="feature-page">
      <header className="feature-hero">
        <div className="feature-kicker">Borrower Education</div>
        <h1 className="feature-title">Know Your Rights</h1>
        <p className="feature-description">
          Review the borrower protections currently surfaced by the backend API. When the service is offline,
          the page falls back to a local rights list so the experience remains stable.
        </p>
      </header>

      {error ? <div className="feature-error">{error}</div> : null}

      <div className="feature-grid feature-grid--2">
        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <BadgeCheck size={16} />
              Borrower protections
            </div>
          </div>

          <div className="feature-panel__body">
            {loading ? (
              <div className="feature-list">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="feature-list__item" style={{ minHeight: 72, opacity: 0.7 }} />
                ))}
              </div>
            ) : (
              <div className="feature-list">
                {rights.map((right, index) => (
                  <article className="feature-list__item" key={right}>
                    <div className="feature-list__icon">{index + 1}</div>
                    <div>
                      <div className="feature-list__title">Right {index + 1}</div>
                      <p className="feature-list__text">{right}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <BookOpen size={16} />
              Practical guidance
            </div>
          </div>

          <div className="feature-panel__body">
            <div className="feature-card" style={{ marginBottom: 16 }}>
              <div className="feature-list__title">Keep everything in writing</div>
              <p className="feature-list__text">
                Save statements, payment confirmations, and settlement discussions so you can verify any agreement later.
              </p>
            </div>

            <div className="feature-card" style={{ marginBottom: 16 }}>
              <div className="feature-list__title">Ask for a clear breakdown</div>
              <p className="feature-list__text">
                Request principal, interest, penalties, and closure figures before accepting any settlement offer.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-chip" style={{ marginBottom: 12 }}>
                <Sparkles size={16} />
                Best next step
              </div>
              <p className="feature-list__text">
                Use the settlement predictor to estimate what you can reasonably offer before starting a negotiation.
              </p>
            </div>

            <div className="feature-error" style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>These notes are informational only and do not replace legal advice.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default KnowYourRights;