// components/quiz/QuizPage.jsx
// full quiz experience — setup → attempt → analysis
// three stages: SETUP → QUIZ → RESULTS

import QuizHistorySidebar from "./QuizHistorySidebar";
import { useState } from "react";
import { useUserContext } from "../../contexts/UserContext";
import { generateQuiz } from "../../services/api";
import QuizSetup from "./QuizSetup";
import QuizAttempt from "./QuizAttempt";
import QuizResults from "./QuizResults";

function QuizPage() {
  const { currentUser } = useUserContext();
  const [stage, setStage] = useState("setup");   // setup | quiz | results
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleGenerateQuiz(config) {
    setLoading(true);
    setError("");
    try {
      const res = await generateQuiz({
        topic: config.topic,
        examTarget: currentUser.examTarget,
        difficulty: config.difficulty,
        numQuestions: config.numQuestions,
        questionType: config.questionType
      });

      if (res.data.payload?.length > 0) {
        setQuestions(res.data.payload);
        setAnswers({});
        setStage("quiz");
      } else {
        setError("Could not generate questions for this topic. Try a different topic.");
      }
    } catch (err) {
      console.error("[QuizPage] Quiz generation error:", err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Quiz generation timed out — Ollama is taking too long. Try fewer questions or a simpler topic.");
      } else {
        setError("Failed to generate quiz. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(userAnswers) {
    setAnswers(userAnswers);
    setStage("results");
  }

  function handleRetry() {
    setStage("setup");
    setQuestions([]);
    setAnswers({});
  }

  function handleHistorySelect(quiz) {
    // show that quiz's results directly
    if (quiz.questions?.length > 0) {
      setQuestions(quiz.questions);
      setAnswers(quiz.userAnswers || {});
      setSelectedHistoryQuiz(quiz);
      setStage("results");
      setSidebarOpen(false);
    }
  }

  return (
    <div>
      <QuizHistorySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectQuiz={handleHistorySelect}
      />
      <QuizHistorySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectQuiz={() => setSidebarOpen(false)}
      />

      <div className="container-fluid py-4" style={{ maxWidth: "900px" }}>
        {/* header with history button */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-sm btn-outline-dark"
            onClick={() => setSidebarOpen(true)}
            title="Quiz history"
          >
            ☰
          </button>
          <h3 className="fw-bold mb-0">📝 Quiz</h3>
        </div>

        {stage === "setup" && (
          <QuizSetup
            onGenerate={handleGenerateQuiz}
            loading={loading}
            error={error}
            examTarget={currentUser?.examTarget}
          />
        )}
        {stage === "quiz" && (
          <QuizAttempt
            questions={questions}
            onSubmit={handleSubmit}
            onCancel={handleRetry}
          />
        )}
        {stage === "results" && (
          <QuizResults
            questions={questions}
            userAnswers={answers}
            onRetry={handleRetry}
            userId={currentUser?.userId}
            examTarget={currentUser?.examTarget}
          />
        )}
      </div>
    </div>
  );
}


export default QuizPage;