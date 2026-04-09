import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";

import RootLayout from "./components/RootLayout";
import Home from "./components/common/Home";
import Signin from "./components/common/Signin";
import Signup from "./components/common/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import ChatPage from "./components/chat/ChatPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "signin", element: <Signin /> },
      { path: "signup", element: <Signup /> },
      {
        path: "dashboard/:email",
        element: <Dashboard />,
        children: [
          { path: "chat", element: <ChatPage /> },
          { path: "", element: <Navigate to="chat" /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);