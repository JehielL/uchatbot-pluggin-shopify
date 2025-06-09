import React, { useState } from "react";
import Chatbot from "./chatbot"; // O ajusta la ruta si está en otro sitio
import { useJwt } from "./JwtProvider"; // O ajusta la ruta si es necesario

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const { token } = useJwt(); // Acceso global al JWT

  // Personaliza tu icono y demás props aquí o desde context/config
  const chatIcon = "https://i.ibb.co/1rjPsRQ/futurito.png";

  return (
    <>
      {/* Botón flotante */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 9999,
          cursor: "pointer",
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          width: 70,
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title="Abrir chat"
      >
        <img src={chatIcon} alt="Bot" style={{ width: 56, height: 56, borderRadius: "50%" }} />
      </div>

      {/* Chatbot panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 32,
            bottom: 110,
            width: 380,
            maxWidth: "95vw",
            zIndex: 10000,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
            overflow: "hidden"
          }}
        >
          <Chatbot jwtToken={token} onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
