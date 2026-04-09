import { useState } from "react";
import { generateQuiz } from "../../services/api";

function QuizPanel() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const res = await generateQuiz({
        topic,
        examTarget: "JEE",
        difficulty: "medium",
        numQuestions: 5,
      });

      setQuiz(res.data.payload || []);
    } catch (err) {
      console.error("Quiz error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 border-top">
      <h6>🧠 Generate Quiz</h6>

      <input
        className="form-control mb-2"
        placeholder="Enter topic (e.g. Thermodynamics)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button
        className="btn btn-dark mb-3"
        onClick={handleGenerate}
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {/* quiz display */}
      {quiz.map((q, i) => (
        <div key={i} className="mb-3 p-2 border rounded bg-light">
          <p><b>Q{i + 1}:</b> {q.question}</p>
          {Object.entries(q.options).map(([key, val]) => (
            <p key={key}>{key}) {val}</p>
          ))}
          <p className="text-success">Answer: {q.answer}</p>
          <p className="text-muted small">{q.explanation}</p>
        </div>
      ))}
    </div>
  );
}

export default QuizPanel;