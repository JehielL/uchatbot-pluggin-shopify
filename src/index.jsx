// extensions/chatbot-embed/src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client'; // Volvemos a esto
import Chatbot from './chatbot';
import { JwtProvider } from './JwtProvider';
import { VisualConfigProvider } from './VisualConfigContext';

// Función para montar tu aplicación de React
function renderChatbotApp() {
  // Crea el elemento raíz donde React montará tu chatbot
  let rootElement = document.getElementById('uchatbot-app-embed-root');

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'uchatbot-app-embed-root';
    document.body.appendChild(rootElement); // Se añade al body
  }

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <JwtProvider>
        <VisualConfigProvider>
          <Chatbot />
        </VisualConfigProvider>
      </JwtProvider>
    </React.StrictMode>
  );
}

// Llama a la función para renderizar cuando el DOM esté listo
if (document.readyState === 'loading') {
  // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', renderChatbotApp);
} else {
  // `DOMContentLoaded` has already fired
  renderChatbotApp();
}