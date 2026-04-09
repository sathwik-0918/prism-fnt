import Header from "./common/Header";
import Footer from "./common/Footer";
import { Outlet } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import UserContextProvider from "../contexts/UserContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing Clerk Publishable Key");

function RootLayout() {
  return (
    <UserContextProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <div className="app-wrapper">
          <Header />
          <div style={{ minHeight: "90vh" }}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </ClerkProvider>
    </UserContextProvider>
  );
}

export default RootLayout;