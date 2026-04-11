// components/personalization/PersonalizationPage.jsx
// Personalization dashboard page — placeholder for future features

import { useUserContext } from "../../contexts/UserContext";

function PersonalizationPage() {
  const { currentUser } = useUserContext();

  return (
    <div style={{ padding: 32 }}>
      <h2>Personalization</h2>
      <p>Welcome{currentUser ? `, ${currentUser.name}` : ""}! This page will soon let you customize your learning experience.</p>
      <p>Stay tuned for personalized recommendations, progress tracking, and more.</p>
    </div>
  );
}

export default PersonalizationPage;
