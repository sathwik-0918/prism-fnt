import { createContext, useContext, useState } from "react";

export const UserContext = createContext();

export function useUserContext() {
  return useContext(UserContext);
}

function UserContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;