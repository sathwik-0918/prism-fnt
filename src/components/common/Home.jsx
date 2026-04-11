import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import axios from "axios";
import { useUserContext } from "../../contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { currentUser, setCurrentUser } = useUserContext();
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // populate user from Clerk — same as blog app useEffect
  useEffect(() => {
    if (isLoaded && user) {
      setCurrentUser((prev) => {
        // if we already loaded from DB, don't wipe it out!
        if (prev && prev.userId) return prev;
        
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          profileImageUrl: user.imageUrl,
          clerkId: user.id,
        };
      });
    }
  }, [isLoaded, user, setCurrentUser]);

  // check backend if user already has examTarget saved
  useEffect(() => {
    async function checkExistingUser() {
      if (!isLoaded || !user || checking) return;
      setChecking(true);

      try {
        const payload = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          profileImageUrl: user.imageUrl,
          clerkId: user.id,
          role: "student",
          examTarget: "UNKNOWN",
          isActive: true,
        };

        const res = await axios.post("http://localhost:8000/api/user", payload);
        const { message, payload: userData } = res.data;

        if (userData?.examTarget && userData.examTarget !== "UNKNOWN") {
          // user already has examTarget saved — skip selection
          setCurrentUser({ ...currentUser, ...userData });
          navigate(`/dashboard/${userData.email}`);
        }
      } catch (err) {
        console.error("User check failed:", err);
      } finally {
        setChecking(false);
      }
    }

    if (isSignedIn) {
      checkExistingUser();
    }
  }, [isSignedIn, isLoaded]);

  // navigate after exam selected
  useEffect(() => {
    if (currentUser?.examTarget && currentUser.examTarget !== "UNKNOWN" && !error) {
      navigate(`/dashboard/${currentUser.email}`);
    }
  }, [currentUser?.examTarget]);

  async function onSelectExam(e) {
    setError("");
    
    // Ensure we have user data loaded before proceeding
    if (!currentUser?.email || !currentUser?.clerkId) {
      setError("User data not loaded. Please wait a moment and try again.");
      return;
    }

    const selectedExam = e.target.value;
    const userPayload = { ...currentUser, role: "student", examTarget: selectedExam };

    console.log("[DEBUG] Sending user payload:", userPayload);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/user",
        userPayload
      );
      console.log("[DEBUG] API response:", res.data);
      
      const { message, payload } = res.data;
      if (message === "student") {
        console.log("[DEBUG] Setting current user to:", payload);
        setCurrentUser({ ...currentUser, ...payload });
      } else {
        setError(message);
      }
    } catch (err) {
      console.error("[ERROR] API error:", err.response?.data || err.message);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="container mt-5">
      {!isSignedIn ? (
        <div className="text-center">
          <h1 className="display-4 fw-bold">Welcome to Prism 🔷</h1>
          <p className="lead text-secondary mt-3">
            Your AI-powered guide for JEE & NEET preparation. Powered by RAG —
            every answer comes from verified NCERT textbooks and PYQ papers.
          </p>
          <Link to="/signin" className="btn btn-dark btn-lg mt-3">Get Started</Link>
        </div>
      ) : checking ? (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <div className="spinner-border text-dark" role="status" />
        </div>
      ) : (
        <div className="row justify-content-center mt-4">
          <div className="col-md-6">
            <div className="card shadow p-4 text-center">
              <img
                src={user.imageUrl}
                width="80px"
                className="rounded-circle mx-auto mb-3"
                alt=""
              />
              <h4>Hey {user.firstName} 👋</h4>
              <p className="text-secondary">Which exam are you preparing for?</p>

              {error && <p className="text-danger">{error}</p>}

              <div className="d-flex justify-content-center gap-4 mt-3">
                {["JEE", "NEET"].map((exam) => (
                  <div key={exam} className="form-check">
                    <input
                      type="radio"
                      name="examTarget"
                      value={exam}
                      id={exam}
                      className="form-check-input"
                      onChange={onSelectExam}
                    />
                    <label htmlFor={exam} className="form-check-label fw-semibold fs-5">
                      {exam}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Home;