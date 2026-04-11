// src/services/api.js
// all API calls in one place
// like a service layer — no axios calls scattered in components

import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 200000,              // 200s — must exceed backend's 180s pipeline timeout
});

// ── USER ──────────────────────────────────────
export const createUser = (userData) =>
  api.post("/user", userData);

// ── CHAT ──────────────────────────────────────
export const sendMessage = (data, signal) =>
  api.post("/chat", data, { signal });          // signal for abort

// ── SESSIONS ──────────────────────────────────
export const createSession = (data) =>
  api.post("/sessions", data);

export const getUserSessions = (userId) =>
  api.get(`/sessions/${userId}`);

export const getSession = (userId, sessionId) =>
  api.get(`/sessions/${userId}/${sessionId}`);

export const deleteSession = (userId, sessionId) =>
  api.delete(`/sessions/${userId}/${sessionId}`);

export const updateSessionTitle = (userId, sessionId, title) =>
  api.put(`/sessions/${userId}/${sessionId}/title`, { title });

// ── QUIZ ──────────────────────────────────────
export const generateQuiz = (data) =>
  api.post("/quiz", data, { timeout: 180000 });   // 3 min — Ollama needs time for quiz generation

// ── PERSONALIZATION ───────────────────────────
export const getPersonalization = (userId) =>
  api.get(`/personalization/${userId}`);

// ── STUDY PLANNER ─────────────────────────────
export const generateStudyPlan = (data) =>
  api.post("/study-planner/generate", data);

export const getStudyPlan = (userId) =>
  api.get(`/study-planner/${userId}`);

export const updateTask = (userId, taskId, completed) =>
  api.post(`/study-planner/${userId}/task/${taskId}`, { completed });