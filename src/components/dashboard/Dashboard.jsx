import { useUserContext } from "../../contexts/UserContext";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";        // ← add this

function Dashboard() {
  const { currentUser } = useUserContext();

  return (
    <div className="container mt-5">
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back, {currentUser?.firstName} 👋</h2>
        <p className="text-secondary">
          Preparing for <strong>{currentUser?.examTarget}</strong> — let's get started.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow h-100 p-4">
            <h5 className="fw-bold">💬 Ask Prism</h5>
            <p className="text-secondary">
              Ask any doubt from NCERT, get formula lists, or retrieve PYQ questions.
            </p>
            <Link
              to={`/dashboard/${currentUser?.email}/chat`}
              className="btn btn-dark mt-auto"
            >
              Start Chat →
            </Link>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow h-100 p-4">
            <h5 className="fw-bold">📅 Study Planner</h5>
            <p className="text-secondary">
              Generate a personalized day-by-day revision schedule.
            </p>
            <button className="btn btn-outline-dark mt-auto" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Outlet />                          {/* ← chat renders here */}
      </div>
    </div>
  );
}
export default Dashboard;