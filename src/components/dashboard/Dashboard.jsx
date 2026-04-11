import { useUserContext } from "../../contexts/UserContext";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";        // ← add this

function Dashboard() {
  const { currentUser } = useUserContext();

  const cards = [
    {
      icon: "💬", title: "Ask Prism",
      desc: "Get answers from NCERT, formulas, PYQs.",
      link: "chat", badge: "AI Powered"
    },
    {
      icon: "📝", title: "Quiz",
      desc: "Test yourself with generated MCQs and numericals.",
      link: "quiz", badge: "Practice"
    },
    {
      icon: "📅", title: "Study Planner",
      desc: "Get a personalized day-by-day revision schedule.",
      link: "planner", badge: "Smart"
    },
    {
      icon: "🧠", title: "Personalization",
      desc: "See what Prism knows about your learning style.",
      link: "personalization", badge: "Insights"
    }
  ];

  return (
    <div className="container mt-5">
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back, {currentUser?.firstName} 👋</h2>
        <p className="text-secondary">
          Preparing for <strong>{currentUser?.examTarget}</strong> — let's get started.
        </p>
      </div>

      <div className="row g-4">
        {cards.map((card) => (
          <div key={card.link} className="col-md-6">
            <div className="card shadow h-100 p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span style={{ fontSize: "2rem" }}>{card.icon}</span>
                <span className="badge bg-dark">{card.badge}</span>
              </div>
              <h5 className="fw-bold">{card.title}</h5>
              <p className="text-secondary flex-grow-1">{card.desc}</p>
              <Link 
                to={`/dashboard/${currentUser?.email}/${card.link}`}
                className="btn btn-dark mt-2"
              >
                Open →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Outlet />                          {/* ← chat renders here */}
      </div>
    </div>
  );
}
export default Dashboard;