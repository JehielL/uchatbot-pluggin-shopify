import { useEffect, useRef, useState } from "react";
import { getConfig } from "./api";

export default function Chatbot() {
  const [config, setConfig] = useState({});
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    getConfig(token).then(setConfig);
  }, []);

  const handleSend = async () => {
    // Aquí llamas a tu backend para enviar el mensaje
    // y actualizas el historial
  };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, width: 320, padding: 16 }}>
      <div>
        <img src={config.iconUrl} alt="bot" width={40} />
        <strong>{config.botName || "uChatBot"}</strong>
      </div>
      <div style={{ minHeight: 120, margin: "16px 0" }}>
        {history.map((m, idx) => (
          <div key={idx}>{m.role === "assistant" ? config.botName : "Tú"}: {m.content}</div>
        ))}
      </div>
      <input value={message} onChange={e => setMessage(e.target.value)} style={{ width: "80%" }} />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
}
