// components/quiz/QuizSetup.jsx
// quiz configuration form
// topic, difficulty, number of questions, question type

import { useState } from "react";

const TOPICS = {
  JEE: {
    Physics: ["Mechanics", "Thermodynamics", "Waves", "Optics",
      "Electrostatics", "Magnetism", "Modern Physics", "Rotational Motion"],
    Chemistry: ["Organic Chemistry", "Inorganic Chemistry", "Chemical Bonding",
      "Thermochemistry", "Electrochemistry", "Coordination Compounds"],
    Maths: ["Calculus", "Algebra", "Trigonometry", "Coordinate Geometry",
      "Vectors", "Matrices", "Probability", "Complex Numbers"]
  },
  NEET: {
    Physics: ["Mechanics", "Thermodynamics", "Optics", "Electrostatics", "Modern Physics"],
    Chemistry: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
    Biology: ["Cell Biology", "Genetics", "Human Physiology", "Plant Physiology",
      "Ecology", "Evolution", "Biotechnology"]
  }
};

function QuizSetup({ onGenerate, loading, error, examTarget }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  // Add PYQ state
  const [isPYQMode, setIsPYQMode] = useState(false);
  const [pyqExamType, setPyqExamType] = useState("JEE Mains");

  const subjects = TOPICS[examTarget] || TOPICS.JEE;

  function handleSubmit() {
    const finalTopic = customTopic.trim() || topic;
    if (!finalTopic) {
      alert("Please select or enter a topic.");
      return;
    }
    onGenerate({ topic: finalTopic, difficulty, numQuestions, questionType,isPYQMode, pyqExamType });
  }

  return (
    <div>
      {/* header */}
      <div className="mb-4">
        <h3 className="fw-bold">📝 Quiz Generator</h3>
        <p className="text-secondary">
          Generate a custom quiz from your {examTarget} study materials.
        </p>
      </div>

      <div className="card shadow p-4">
        <div className="row g-4">

          {/* subject selection */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Subject</label>
            <select
              className="form-select"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setTopic(""); }}
            >
              <option value="">Select subject</option>
              {Object.keys(subjects).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* topic selection */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Topic</label>
            <select
              className="form-select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={!subject}
            >
              <option value="">Select topic</option>
              {subject && subjects[subject]?.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* PYQ Mode Toggle */}
          <div className="col-12">
            <div
              className="p-3 rounded"
              style={{
                background: isPYQMode ? "#fff3e0" : "#f8f9fa",
                border: isPYQMode ? "2px solid #ff9800" : "2px solid #e9ecef",
                transition: "all 0.3s"
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-bold d-flex align-items-center gap-2">
                    📝 PYQ Engine
                  </div>
                  <small className="text-secondary">
                    Generate questions exclusively from Previous Year Question papers
                  </small>
                </div>
                <div
                  className="form-check form-switch mb-0"
                  style={{ transform: "scale(1.3)" }}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isPYQMode}
                    onChange={e => setIsPYQMode(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>

              {isPYQMode && (
                <div className="mt-3">
                  <label className="form-label small fw-semibold">Select Exam Paper:</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {["JEE Mains", "JEE Advanced", "NEET"].map(exam => (
                      <button
                        key={exam}
                        className={`btn btn-sm ${pyqExamType === exam ? "btn-warning" : "btn-outline-secondary"}`}
                        style={{ borderRadius: "20px" }}
                        onClick={() => setPyqExamType(exam)}
                      >
                        {exam}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* custom topic */}
          <div className="col-12">
            <label className="form-label fw-semibold">
              Or type a custom topic
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Newton's Laws, Acid-Base Reactions..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          </div>

          {/* difficulty */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Difficulty</label>
            <div className="d-flex gap-2">
              {["easy", "medium", "hard"].map(d => (
                <button
                  key={d}
                  className={`btn btn-sm flex-fill ${difficulty === d ? "btn-dark" : "btn-outline-secondary"
                    }`}
                  onClick={() => setDifficulty(d)}
                >
                  {d === "easy" ? "😊 Easy" : d === "medium" ? "🎯 Medium" : "🔥 Hard"}
                </button>
              ))}
            </div>
          </div>

          {/* number of questions */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Questions: <strong>{numQuestions}</strong>
            </label>
            <input
              type="range"
              className="form-range"
              min={3} max={15} step={1}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
            <div className="d-flex justify-content-between small text-secondary">
              <span>3</span><span>15</span>
            </div>
          </div>

          {/* question type */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Question Type</label>
            <select
              className="form-select"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
            >
              <option value="mcq">MCQ (Single correct)</option>
              <option value="numerical">Numerical</option>
              <option value="multi">Multiple correct</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* error */}
          {error && (
            <div className="col-12">
              <div className="alert alert-danger py-2">{error}</div>
            </div>
          )}

          {/* generate button */}
          <div className="col-12">
            <button
              className="btn btn-dark w-100 py-3 fw-bold fs-5"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Generating Quiz from your study materials...
                </>
              ) : (
                "⚡ Generate Quiz"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizSetup;
