// components/user/ProfilePage.jsx
// User profile — like LeetCode/GitHub profile
// Shows personal info, exam target, quiz stats,
// streak, topics mastered, achievements

import { useState, useEffect } from "react";
import { useUserContext } from "../../contexts/UserContext";
import { useUser } from "@clerk/react";
import axios from "axios";

const BASE = "http://localhost:8000/api";

const ACHIEVEMENTS = [
  { id: "first_chat", icon: "💬", title: "First Question", desc: "Asked your first question" },
  { id: "quiz_10", icon: "📝", title: "Quiz Warrior", desc: "Completed 10 quizzes" },
  { id: "perfect_score", icon: "🏆", title: "Perfect Score", desc: "Got 100% in a quiz" },
  { id: "topics_10", icon: "📚", title: "Explorer", desc: "Studied 10 different topics" },
  { id: "planner", icon: "📅", title: "Planner", desc: "Generated a study plan" },
];

function ProfilePage() {
  const { currentUser } = useUserContext();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    try {
      const [personRes, quizRes] = await Promise.all([
        axios.get(`${BASE}/personalization/${currentUser.userId}`),
        axios.get(`${BASE}/quiz/overall-analysis/${currentUser.userId}`)
      ]);
      setProfile(personRes.data.payload);
      setQuizStats(quizRes.data.payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // unlock achievements
  function getUnlocked() {
    const unlocked = new Set();
    if ((profile?.totalQueries || 0) >= 1) unlocked.add("first_chat");
    if ((quizStats?.totalQuizzes || 0) >= 10) unlocked.add("quiz_10");
    if ((quizStats?.averageScore || 0) >= 100) unlocked.add("perfect_score");
    if ((profile?.topicsDiscussed?.length || 0) >= 10) unlocked.add("topics_10");
    return unlocked;
  }

  const unlocked = getUnlocked();

  if (loading) {
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-dark" />
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>

      {/* profile header */}
      <div className="card shadow mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <img
              src={user?.imageUrl || currentUser?.profileImageUrl}
              alt="avatar"
              className="rounded-circle"
              style={{ width: "100px", height: "100px", objectFit: "cover",
                border: "3px solid #212529" }}
            />
            <div className="flex-grow-1">
              <h3 className="fw-bold mb-1">
                {currentUser?.firstName} {currentUser?.lastName}
              </h3>
              <p className="text-secondary mb-1">{currentUser?.email}</p>
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge bg-dark fs-6">
                  {currentUser?.examTarget} Aspirant
                </span>
                <span className="badge bg-secondary">
                  {profile?.difficultyLevel || "Intermediate"} Level
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* stats grid — LeetCode style */}
      <div className="row g-3 mb-4">
        {[
          { label: "Questions Asked", value: profile?.totalQueries || 0, icon: "💬" },
          { label: "Quizzes Done", value: quizStats?.totalQuizzes || 0, icon: "📝" },
          { label: "Avg Quiz Score", value: `${quizStats?.averageScore || 0}%`, icon: "🎯" },
          { label: "Topics Explored", value: profile?.topicsDiscussed?.length || 0, icon: "📚" },
          { label: "Questions Attempted", value: quizStats?.totalQuestionsAttempted || 0, icon: "✏️" },
          { label: "Correct Answers", value: quizStats?.totalCorrect || 0, icon: "✅" },
        ].map((stat, i) => (
          <div key={i} className="col-md-4 col-6">
            <div className="card shadow text-center p-3 h-100">
              <div style={{ fontSize: "1.8rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{stat.value}</div>
              <small className="text-secondary">{stat.label}</small>
            </div>
          </div>
        ))}
      </div>

      {/* exam info */}
      <div className="card shadow mb-4 p-4">
        <h6 className="fw-bold mb-3">🎓 Exam Information</h6>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="p-3 rounded" style={{ background: "#f8f9fa" }}>
              <small className="text-secondary d-block">Target Exam</small>
              <strong>{currentUser?.examTarget}</strong>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded" style={{ background: "#f8f9fa" }}>
              <small className="text-secondary d-block">Preparation Level</small>
              <strong style={{ textTransform: "capitalize" }}>
                {profile?.difficultyLevel || "Intermediate"}
              </strong>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded" style={{ background: "#f8f9fa" }}>
              <small className="text-secondary d-block">Member Since</small>
              <strong>
                {currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString()
                  : "Recently joined"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* weak + strong areas */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow h-100 p-4">
            <h6 className="fw-bold mb-3">⚠️ Focus Areas</h6>
            {(profile?.weakTopics?.length || 0) > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {profile.weakTopics.map((t, i) => (
                  <span key={i} className="badge bg-danger bg-opacity-75 p-2">{t}</span>
                ))}
              </div>
            ) : (
              <p className="text-secondary small">Start quizzes to identify weak areas.</p>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow h-100 p-4">
            <h6 className="fw-bold mb-3">💪 Strong Areas</h6>
            {(profile?.strongTopics?.length || 0) > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {profile.strongTopics.map((t, i) => (
                  <span key={i} className="badge bg-success bg-opacity-75 p-2">{t}</span>
                ))}
              </div>
            ) : (
              <p className="text-secondary small">Strong areas appear as you study more.</p>
            )}
          </div>
        </div>
      </div>

      {/* achievements — GitHub style */}
      <div className="card shadow p-4">
        <h6 className="fw-bold mb-3">🏅 Achievements</h6>
        <div className="row g-3">
          {ACHIEVEMENTS.map(a => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <div key={a.id} className="col-md-4 col-6">
                <div
                  className={`p-3 rounded text-center ${isUnlocked ? "border border-dark" : ""}`}
                  style={{
                    background: isUnlocked ? "#f8f9fa" : "#f0f0f0",
                    opacity: isUnlocked ? 1 : 0.5
                  }}
                >
                  <div style={{ fontSize: "2rem", filter: isUnlocked ? "none" : "grayscale(1)" }}>
                    {a.icon}
                  </div>
                  <div className="fw-semibold small">{a.title}</div>
                  <div className="text-secondary" style={{ fontSize: "0.7rem" }}>{a.desc}</div>
                  {isUnlocked && (
                    <span className="badge bg-success mt-1" style={{ fontSize: "0.65rem" }}>
                      Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;