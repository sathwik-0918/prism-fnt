import { Link, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/react";
import { useUserContext } from "../../contexts/UserContext";

function Header() {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const { setCurrentUser } = useUserContext();
  const navigate = useNavigate();

  async function handleSignout() {
    await signOut();
    setCurrentUser(null);
    navigate("/");
  }

  return (
    <nav className="navbar navbar-dark bg-dark px-4 d-flex justify-content-between">
      <Link to="/" className="navbar-brand fw-bold fs-4">
        🔷 Prism
      </Link>
      <div>
        {!isSignedIn ? (
          <div className="d-flex gap-3">
            <Link to="signin" className="btn btn-outline-light btn-sm">Sign In</Link>
            <Link to="signup" className="btn btn-light btn-sm">Sign Up</Link>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-3">
            <img src={user.imageUrl} width="35px" className="rounded-circle" alt="" />
            <span className="text-white fw-semibold">{user.firstName}</span>
            <button className="btn btn-danger btn-sm" onClick={handleSignout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
export default Header;