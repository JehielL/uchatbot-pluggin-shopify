import React, { createContext, useContext, useState } from "react";

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
  }
};

const VisualConfigContext = createContext();

export function VisualConfigProvider({ children }) {
  const [visualConfig, setVisualConfig] = useState(defaultConfig);

  // Permite actualizar visualConfig desde cualquier componente
  return (
    <VisualConfigContext.Provider value={{ visualConfig, setVisualConfig }}>
      {children}
    </VisualConfigContext.Provider>
  );
}

export function useVisualConfig() {
  return useContext(VisualConfigContext);
}
