import { useEffect, useState } from "react";
import { Clock3, FileText, Landmark, Sparkles } from "lucide-react";
import { getUserHistory } from "../../services/finreliefApi";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      try {
        const response = await getUserHistory();
        if (isMounted) {
          setHistory(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load history data.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="feature-page">
      <header className="feature-hero">
        <div className="feature-kicker">Activity Archive</div>
        <h1 className="feature-title">History</h1>
        <p className="feature-description">
          Review your complete debt recovery timeline, including financial analyses, generated negotiation letters, and settlement predictions.
        </p>
      </header>

      <div className="feature-panel">
        <div className="feature-panel__header">
          <div className="feature-chip">
            <Clock3 size={16} />
            Your Activity Timeline
          </div>
        </div>

        <div className="feature-panel__body">
          {loading ? (
            <div className="feature-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="feature-skeleton-card" style={{minHeight: "80px"}}>
                  <div className="feature-skeleton feature-skeleton--line" style={{width: "40%", marginBottom: "8px"}} />
                  <div className="feature-skeleton feature-skeleton--line" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="status-message status-message--error">
              <p>{error}</p>
            </div>
          ) : history.length > 0 ? (
            <div className="feature-list">
              {history.map((item) => {
                const Icon = item.type === "negotiation" ? FileText : item.type === "settlement" ? Landmark : Sparkles;
                const dateString = item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown date";
                return (
                  <article className="feature-list__item" key={item.id}>
                    <div className="feature-list__icon">
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="feature-list__title" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{item.title}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 'normal' }}>{dateString}</span>
                      </div>
                      <p className="feature-list__text">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="feature-empty">
              <div className="feature-empty__title">Your portfolio is currently empty</div>
              <p className="feature-empty__text">
                Perform a financial health check, estimate a settlement, or generate a negotiation letter to begin tracking your financial recovery here.
              </p>
              <div className="feature-actions">
                <div className="feature-chip">Dashboard snapshots</div>
                <div className="feature-chip">Settlement estimates</div>
                <div className="feature-chip">Negotiation letters</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;