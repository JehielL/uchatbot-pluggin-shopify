// src/VisualConfigContext.js (ESTA ES LA VERSIÓN CORRECTA Y MODIFICADA)
import React, { createContext, useContext, useState } from "react"; // No necesitamos useEffect aquí si getInitialVisualConfigFromDOM es una función de inicialización

// Valores visuales por defecto
const defaultConfig = {
  botName: "uChatBot",
  iconUrl: "https://novau.io/wp-content/uploads/2025/04/U.png",
  language: "es",
  colors: {
    headerBg: "#ea3103",
    headerText: "#ffffff",
    chatBg: "#ffffff",
    chatText: "#000000",
    buttonBg: "#ea3103",
    buttonText: "#ffffff",
    inputBg: "#ffffff",
    inputText: "#000000",
    inputBorder: "#ddd",
    inputWrapperBg: "#f9f9f9",
    privacyBg: "#f9f9f9",
    privacyText: "#666"
  },
  apiKey: "" // Asegúrate de que defaultConfig incluya apiKey
};

const VisualConfigContext = createContext(undefined); // undefined como valor inicial para detectar uso fuera del provider

// Función que lee la configuración desde el DOM.
// Se llamará SOLAMENTE en el cliente cuando el componente se monte.
function getInitialVisualConfigFromDOM() {
  // Esta comprobación es crucial para el SSR
  if (typeof document !== 'undefined') {
    const rootContainer = document.getElementById('uchatbot-root-container');
    if (rootContainer) {
      // Lee los data-attributes. Asegúrate que en app-embed.liquid existen y se llaman igual.
      const botName = rootContainer.dataset.botName || defaultConfig.botName;
      const iconUrl = rootContainer.dataset.iconUrl || defaultConfig.iconUrl;
      const language = rootContainer.dataset.language || defaultConfig.language;
      const privacyPolicyUrl = rootContainer.dataset.privacyPolicyUrl || "#";
      const apiKey = rootContainer.dataset.apiKey || defaultConfig.apiKey;

      const colors = {
        headerBg: rootContainer.dataset.colorsHeaderBg || defaultConfig.colors.headerBg,
        headerText: rootContainer.dataset.colorsHeaderText || defaultConfig.colors.headerText,
        chatBg: rootContainer.dataset.colorsChatBg || defaultConfig.colors.chatBg,
        chatText: rootContainer.dataset.colorsChatText || defaultConfig.colors.chatText,
        buttonBg: rootContainer.dataset.colorsButtonBg || defaultConfig.colors.buttonBg,
        buttonText: rootContainer.dataset.colorsButtonText || defaultConfig.colors.buttonText,
        inputBg: rootContainer.dataset.colorsInputBg || defaultConfig.colors.inputBg,
        inputText: rootContainer.dataset.inputText || defaultConfig.colors.inputText,
        inputBorder: rootContainer.dataset.inputBorder || defaultConfig.colors.inputBorder,
        inputWrapperBg: rootContainer.dataset.inputWrapperBg || defaultConfig.colors.inputWrapperBg,
        privacyBg: rootContainer.dataset.privacyBg || defaultConfig.colors.privacyBg,
        privacyText: rootContainer.dataset.privacyText || defaultConfig.colors.privacyText
      };

      return { botName, iconUrl, language, privacyPolicyUrl, colors, apiKey };
    }
  }
  // Devuelve la configuración por defecto si no estamos en el navegador
  // o si el contenedor HTML no se encuentra.
  return defaultConfig;
}

export function VisualConfigProvider({ children }) {
  // Aquí, `useState` recibe una FUNCIÓN. Esta función solo se ejecuta la primera vez
  // que el componente se renderiza en el cliente (NO en el servidor).
  const [visualConfig, setVisualConfig] = useState(getInitialVisualConfigFromDOM);

  return (
    <VisualConfigContext.Provider value={{ visualConfig, setVisualConfig }}>
      {children}
    </VisualConfigContext.Provider>
  );
}

export function useVisualConfig() {
  const context = useContext(VisualConfigContext);
  if (context === undefined) {
    throw new Error('useVisualConfig debe usarse dentro de un VisualConfigProvider');
  }
  return context;
}