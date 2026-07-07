import { BookOpenCheck, Cog, ShieldCheck, Sparkles } from "lucide-react";

const aboutCards = [
  {
    title: "Purpose",
    description: "Help borrowers understand debt pressure, predict settlement outcomes, and prepare negotiation material faster.",
    icon: Sparkles,
  },
  {
    title: "How it works",
    description: "The frontend talks to FastAPI endpoints for settlement, negotiation, and rights data, with graceful fallbacks when needed.",
    icon: Cog,
  },
  {
    title: "Trust posture",
    description: "The app keeps authentication, routing, and the dark layout intact while limiting surface area for recovery workflows.",
    icon: ShieldCheck,
  },
];

function About() {
  return (
    <div className="feature-page">
      <header className="feature-hero">
        <div className="feature-kicker">Platform Overview</div>
        <h1 className="feature-title">About FinRelief AI</h1>
        <p className="feature-description">
          FinRelief AI combines a React frontend with a FastAPI backend to make debt recovery guidance more actionable,
          more consistent, and easier to use under pressure.
        </p>
      </header>

      <div className="feature-grid feature-grid--2">
        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <BookOpenCheck size={16} />
              Product summary
            </div>
          </div>

          <div className="feature-panel__body">
            <div className="feature-empty">
              <div className="feature-empty__title">Built for practical debt recovery workflows</div>
              <p className="feature-empty__text">
                The platform turns repayment data into settlement estimates, negotiation letters, and borrower guidance
                while keeping the UI simple enough to use during stressful financial decisions.
              </p>
            </div>
          </div>
        </section>

        <section className="feature-panel">
          <div className="feature-panel__header">
            <div className="feature-chip">
              <Sparkles size={16} />
              Core capabilities
            </div>
          </div>

          <div className="feature-panel__body">
            <div className="feature-list">
              {aboutCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article className="feature-list__item" key={card.title}>
                    <div className="feature-list__icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="feature-list__title">{card.title}</div>
                      <p className="feature-list__text">{card.description}</p>
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

export default About;