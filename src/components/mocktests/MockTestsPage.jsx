// components/mocktests/MockTestsPage.jsx
// Direct links to official NTA mock tests
// JEE Mains, JEE Advanced, NEET
import { useState } from "react";

const MOCK_TESTS = {
  "JEE Mains": {
    color: "#0d6efd",
    icon: "🔵",
    desc: "Official NTA practice papers for JEE Main",
    tests: [
      {
        title: "JEE Main Official Mock Test",
        url: "https://nta.ac.in/ExamConduct",
        desc: "NTA official practice interface — exactly like real exam"
      },
      {
        title: "NTA Abhyas App (Mock Tests)",
        url: "https://nta.ac.in/NTAabhyas",
        desc: "Free mock tests on official NTA Abhyas platform"
      },
      {
        title: "JEE Main Previous Year Papers",
        url: "https://jeemain.nta.nic.in/",
        desc: "Official NTA JEE Main portal with past papers"
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
        url: "https://jeeadv.ac.in/",
        desc: "Official IIT JEE Advanced website with mock tests"
      },
      {
        title: "JEE Advanced Previous Papers",
        url: "https://jeeadv.ac.in/pastques.html",
        desc: "All previous year JEE Advanced question papers"
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
        url: "https://neet.nta.nic.in/",
        desc: "Official NTA NEET portal with practice tests"
      },
      {
        title: "NTA Abhyas — NEET Practice",
        url: "https://nta.ac.in/NTAabhyas",
        desc: "NTA Abhyas app for NEET practice tests"
      },
      {
        title: "NEET Previous Year Papers",
        url: "https://neet.nta.nic.in/PreviousYearQP",
        desc: "Official NEET previous year question papers"
      }
    ]
  }
};

function MockTestsPage() {
  const [activeExam, setActiveExam] = useState("JEE Mains");

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <div className="mb-4">
        <h3 className="fw-bold">🏛️ Official NTA Mock Tests</h3>
        <p className="text-secondary">
          Certified mock tests directly from NTA — the official exam authority.
          Click any link to open the official test portal.
        </p>
      </div>

      {/* exam tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {Object.keys(MOCK_TESTS).map(exam => (
          <button
            key={exam}
            className={`btn ${activeExam === exam ? "btn-dark" : "btn-outline-secondary"} fw-semibold`}
            onClick={() => setActiveExam(exam)}
          >
            {MOCK_TESTS[exam].icon} {exam}
          </button>
        ))}
      </div>

      {/* test cards */}
      <div className="card shadow mb-4">
        <div
          className="card-header p-3"
          style={{ background: MOCK_TESTS[activeExam].color, color: "white" }}
        >
          <h5 className="mb-0 fw-bold">{MOCK_TESTS[activeExam].icon} {activeExam}</h5>
          <small>{MOCK_TESTS[activeExam].desc}</small>
        </div>
        <div className="card-body p-0">
          {MOCK_TESTS[activeExam].tests.map((test, i) => (
            <div
              key={i}
              className="d-flex align-items-center justify-content-between p-4 border-bottom"
            >
              <div>
                <div className="fw-semibold">{test.title}</div>
                <small className="text-secondary">{test.desc}</small>
              </div>
              
                href={test.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-sm ms-3 flex-shrink-0"
              <a>
                Open →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* info note */}
      <div className="alert alert-info">
        <strong>ℹ️ Note:</strong> These are official NTA links. Tests open in a new tab.
        All content is certified by NTA — India's national testing agency.
      </div>
    </div>
  );
}

export default MockTestsPage;