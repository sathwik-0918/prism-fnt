import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function useUserContext() {
  return useContext(UserContext);
}

function UserContextProvider({ children }) {
  // load from localStorage on startup — survives refresh
  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      const saved = localStorage.getItem("prism_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function setCurrentUser(userOrFn) {
    setCurrentUserState((prev) => {
      const nextUser = typeof userOrFn === 'function' ? userOrFn(prev) : userOrFn;
      if (nextUser) {
        localStorage.setItem("prism_user", JSON.stringify(nextUser));
      } else {
        localStorage.removeItem("prism_user");
        localStorage.removeItem("prism_active_session");
      }
      return nextUser;
    });
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;