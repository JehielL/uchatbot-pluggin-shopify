import "./styles/chatbot.css";
import React from "react";
import { VisualConfigProvider } from "../src/VisualConfigContext";
import { createRoot } from "react-dom/client";
import Chatbot from "./routes/FloatingChatbot"; // o tu componente raíz real

const container = document.getElementById("uchatbot-root-container");

if (container) {
  createRoot(container).render(
    <VisualConfigProvider>
      <Chatbot />
    </VisualConfigProvider>
  );
}