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
import QuizPage from "./components/quiz/QuizPage";
import StudyPlannerPage from "./components/studyplanner/StudyPlannerPage";
import PersonalizationPage from "./components/personalization/PersonalizationPage";
import { ChatProvider } from "./contexts/ChatContext";   // ← add

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
        element: (
          <ChatProvider>             
            <Dashboard />
          </ChatProvider>
        ),
        children: [
          { path: "chat", element: <ChatPage /> },
          { path: "quiz", element: <QuizPage /> },
          { path: "planner", element: <StudyPlannerPage /> },
          { path: "personalization", element: <PersonalizationPage /> },
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