// components/mocktests/MockTestsPage.jsx
import { useState } from "react";

const MOCK_TESTS = {
  "JEE Mains": {
    color: "#0d6efd",
    icon: "🔵",
    desc: "Official NTA practice papers for JEE Main",
    tests: [
      {
        title: "JEE Main Official Mock Test",
        url: "https://nta.ac.in/Quiz",
        desc: "NTA official practice interface — exactly like the real exam"
      },
      {
        title: "NTA Abhyas App (Mock Tests)",
        url: "https://www.nta.ac.in/abhyas",
        desc: "Free mock tests on the official NTA Abhyas platform"
      },
      {
        title: "JEE Main Previous Year Papers",
        url: "https://www.mathongo.com/iit-jee/jee-main-previous-year-question-paper",
        desc: "Chapter-wise and year-wise JEE Main PYQs"
      }
    ]
  },
  "JEE Advanced": {
    color: "#dc3545",
    icon: "🔴",
    desc: "IIT JEE Advanced mock tests and previous papers",
    tests: [
      {
        title: "JEE Advanced Mock Test Portal",
        url: "https://jeeadv.ac.in/resources.html",
        desc: "Official IIT JEE Advanced resources and mock tests"
      },
      {
        title: "JEE Advanced Previous Papers",
        url: "https://jeeadv.ac.in/archive.html",
        desc: "All previous year JEE Advanced question papers from IIT"
      }
    ]
  },
  "NEET": {
    color: "#28a745",
    icon: "🟢",
    desc: "Official NTA NEET mock tests and sample papers",
    tests: [
      {
        title: "NEET Official Mock Test",
        url: "https://nta.ac.in/Quiz",
        desc: "Official NTA NEET mock test portal"
      },
      {
        title: "NTA Abhyas — NEET Practice",
        url: "https://www.nta.ac.in/abhyas",
        desc: "NTA Abhyas app for NEET practice tests — completely free"
      },
      {
        title: "NEET Previous Year Papers",
        url: "https://disha.live/blogs/neet/neet-previous-year-question-papers",
        desc: "NEET previous year question papers with solutions"
      }
    ]
  }
};

function MockTestsPage() {
  const [activeExam, setActiveExam] = useState("JEE Mains");
  const current = MOCK_TESTS[activeExam];

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <div className="mb-4">
        <h3 className="fw-bold">🏛️ Official NTA Mock Tests</h3>
        <p className="text-secondary">
          Certified mock tests directly from NTA — the official exam authority.
          All links open the official portals in a new tab.
        </p>
      </div>

      {/* exam tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {Object.keys(MOCK_TESTS).map(exam => (
          <button
            key={exam}
            className={`btn fw-semibold ${activeExam === exam ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => setActiveExam(exam)}
          >
            {MOCK_TESTS[exam].icon} {exam}
          </button>
        ))}
      </div>

      {/* test cards */}
      <div className="card shadow mb-4 overflow-hidden">
        <div
          className="p-3"
          style={{ background: current.color, color: "white" }}
        >
          <h5 className="mb-0 fw-bold">{current.icon} {activeExam}</h5>
          <small className="opacity-75">{current.desc}</small>
        </div>

        {current.tests.map((test, i) => (
          <div
            key={i}
            className="d-flex align-items-center justify-content-between p-4 border-bottom"
          >
            <div className="me-3">
              <div className="fw-semibold">{test.title}</div>
              <small className="text-secondary">{test.desc}</small>
            </div>
            <a
              href={test.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark btn-sm flex-shrink-0"
              style={{ minWidth: "80px" }}
            >
              Open →
            </a>
          </div>
        ))}
      </div>

      <div className="alert alert-info mb-0">
        <strong>ℹ️ Note:</strong> All links are official NTA portals.
        Tests open in a new tab. Content is certified by NTA — India's national testing agency.
      </div>
    </div>
  );
}

export default MockTestsPage;