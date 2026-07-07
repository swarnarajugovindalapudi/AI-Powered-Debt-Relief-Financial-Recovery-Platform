import { Clock3, FileText, Landmark, Sparkles } from "lucide-react";

const historyItems = [
  {
    title: "Settlement predictor",
    description: "Saved settlement estimates will appear here once persistence is connected.",
    icon: Landmark,
  },
  {
    title: "Negotiation letters",
    description: "Generated lender letters will be stored here when history storage is added.",
    icon: FileText,
  },
  {
    title: "Financial health checks",
    description: "Periodic analysis snapshots can be surfaced in this timeline once the backend is extended.",
    icon: Sparkles,
  },
];

function History() {
  return (
    <div className="feature-page">
      <header className="feature-hero">
        <div className="feature-kicker">Activity Archive</div>
        <h1 className="feature-title">History</h1>
        <p className="feature-description">
          This page is ready for persisted activity, but the current backend does not expose a history API yet.
          The UI stays informative and stable while the data layer is expanded later.
        </p>
      </header>

      <div className="feature-grid feature-grid--2">
        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <Clock3 size={16} />
              Current status
            </div>
          </div>

          <div className="feature-panel__body">
            <div className="feature-empty">
              <div className="feature-empty__title">No stored history yet</div>
              <p className="feature-empty__text">
                Once analysis and negotiation events are persisted, this section will show your full debt recovery timeline.
              </p>
              <div className="feature-actions">
                <div className="feature-chip">Dashboard snapshots</div>
                <div className="feature-chip">Settlement estimates</div>
                <div className="feature-chip">Negotiation letters</div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <Sparkles size={16} />
              What will be tracked
            </div>
          </div>

          <div className="feature-panel__body">
            <div className="feature-list">
              {historyItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="feature-list__item" key={item.title}>
                    <div className="feature-list__icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="feature-list__title">{item.title}</div>
                      <p className="feature-list__text">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default History;