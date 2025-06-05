import React, { useState, useEffect, useRef } from "react";

// Inicialización desde el window (Shopify embedded)
// Puedes pasar estas props desde el parent si prefieres, pero así es plug & play
const config = window.shopifyChatbotConfig || {};
const apiKey = config.api_key;
const tenantToken = config.auth_token;
const nombreChatBot = config.name || "uChatBot";
const iconUrl = config.icon || "";
const colors = config.colors || {};
const privacyPolicyUrl = config.privacyPolicyUrl || "#";
const tags = config.tags || { es: {}, en: {} };

const translations = {
  es: {
    placeholder: 'Escribe tu mensaje...',
    privacyPolicy: 'Al chatear aceptas nuestra',
    privacyPolicyText: 'Política de Privacidad',
    welcomeMessage: `¡Hola! Soy ${nombreChatBot} 🤖, ¿en qué puedo ayudarte hoy?`,
    messages: [
      `¡Hola! Soy ${nombreChatBot} 🤖, estoy para ayudarte`,
      "¿Necesitas ayuda? Escríbeme 👀",
      "Pregunta lo que quieras, estoy aquí para ayudarte 😉"
    ],
    cart: '🛒 Mi Carrito'
  },
  en: {
    placeholder: 'Type your message...',
    privacyPolicy: 'By chatting, you accept our',
    privacyPolicyText: 'Privacy Policy',
    welcomeMessage: `Hello! I'm ${nombreChatBot} 🤖, how can I assist you today?`,
    messages: [
      `Hello! I'm ${nombreChatBot} 🤖, here to help`,
      "Need help? Write to me 👀",
      "Ask me anything, I'm here to assist you 😉"
    ],
    cart: '🛒 My Cart'
  }
};

// ===============================
//   HELPERS
// ===============================

function applyTextFormatting(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  const enumerationPattern = /(\d+\.\s.*?)(?=(\d+\.\s|$))/g;
  let matches = text.match(enumerationPattern);

  if (matches && matches.length > 0) {
    let listItems = matches.map(item => `<li>${item.trim()}</li>`).join('<br>');
    text = text.replace(enumerationPattern, '');
    text = text.replace(/(incluyen:|tenemos en Futura VIVE:)\s*$/, '$1<br><ul>' + listItems + '</ul><br>');
  }
  return text;
}

function generateUUID() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// ===============================
//   COMPONENT
// ===============================

export default function Chatbot() {
  // ---- State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(localStorage.getItem("session_id") || generateUUID());
  const [activeContext, setActiveContext] = useState(localStorage.getItem("active_context") || "example-context");
  const [language, setLanguage] = useState(localStorage.getItem("user_language") || "es");
  const [speechBubble, setSpeechBubble] = useState("");
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // ---- Effects

  // Load historial and context on mount
  useEffect(() => {
    localStorage.setItem("session_id", sessionId);
    localStorage.setItem("active_context", activeContext);
    updateActiveContext();
    // eslint-disable-next-line
  }, []);

  // Bubble suggestions timer
  useEffect(() => {
    const timer = setInterval(() => {
      const msgs = translations[language].messages;
      setSpeechBubble(msgs[Math.floor(Math.random() * msgs.length)]);
      setShowSpeechBubble(true);
      setTimeout(() => setShowSpeechBubble(false), 3000);
    }, 10000);
    return () => clearInterval(timer);
  }, [language]);

  // Autoscroll on messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Apply style/colors dynamically (Shopify/Polaris theme safe)
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "chatbot-custom-style";
    style.textContent = `
      .chatbot-card-container { background: ${colors.chatBg} !important; color: ${colors.chatText} !important; }
      .chatbot-header { background: ${colors.headerBg} !important; color: ${colors.headerText} !important; }
      .chatbot-send-btn, .chatbot-quick-replies button { background: ${colors.buttonBg} !important; color: ${colors.buttonText} !important; }
      .chatbot-input-wrapper { background: ${colors.inputWrapperBg} !important; }
      .chatbot-input { background: ${colors.inputBg} !important; border: 1px solid ${colors.inputBorder} !important; color: ${colors.inputText} !important; }
      .privacy-policy { background: ${colors.privacyBg} !important; color: ${colors.privacyText} !important; }
      .privacy-policy a { color: ${colors.privacyText} !important; }
    `;
    document.head.appendChild(style);
    return () => { if (document.getElementById("chatbot-custom-style")) document.getElementById("chatbot-custom-style").remove(); };
  }, [colors]);

  // ---- LOGIC

  async function updateActiveContext() {
    try {
      const ctx = await fetchActiveContext();
      setActiveContext(ctx);
      localStorage.setItem("active_context", ctx);
      await loadContextFromServer(ctx);
      await loadHistory();
    } catch (e) {
      setActiveContext("example-context");
      localStorage.setItem("active_context", "example-context");
    }
  }

  async function fetchActiveContext() {
    try {
      const response = await fetch('https://desarrollosfutura.com:5001/chat/get_contexto', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tenantToken}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.contexto || 'example-context';
    } catch {
      return "example-context";
    }
  }

  async function loadContextFromServer(contextName) {
    if (!contextName) return;
    try {
      await fetch(`https://desarrollosfutura.com:5001/chat/get_contexto/${contextName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "Authorization": `Bearer ${tenantToken}`
        }
      });
      // No hace falta parsear, solo para mantener lógica
    } catch { }
  }

  async function loadHistory() {
    let storedHistory = localStorage.getItem("chat_history");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (parsedHistory.length > 0) {
          setMessages(parsedHistory);
          return;
        }
      } catch (error) { /* nada */ }
    }
    try {
      const response = await fetch('https://desarrollosfutura.com:5001/chat/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-session-id': sessionId,
          'Authorization': `Bearer ${tenantToken}`
        },
        credentials: 'include'
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.history && data.history.length > 0) {
        setMessages(data.history);
        localStorage.setItem('chat_history', JSON.stringify(data.history));
      } else {
        showWelcomeMessage();
      }
    } catch (e) {
      showWelcomeMessage();
    }
  }

  function showWelcomeMessage() {
    const welcomeMessage = {
      role: "assistant",
      content: translations[language].welcomeMessage
    };
    setMessages([welcomeMessage]);
  }

  async function sendMessage(e) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;

    const userMessage = { role: "user", content: msg };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    scrollToBottom();
    setLoading(true);

    try {
      if (!tenantToken) {
        alert("Debes iniciar sesión para usar el chatbot.");
        setLoading(false);
        return;
      }
      const response = await fetch('https://desarrollosfutura.com:5001/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Authorization': `Bearer ${tenantToken}`,
        },
        body: JSON.stringify({ message: msg }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      const data = await response.json();

      const botMessage = {
        role: "assistant",
        content: data.response,
        url: data.url || null
      };
      const allMessages = [...updatedMessages, botMessage];
      setMessages(allMessages);
      localStorage.setItem('chat_history', JSON.stringify(allMessages));
    } catch (error) {
      const errorMsg = {
        role: "assistant",
        content: "❌ Ocurrió un error al enviar el mensaje. Intenta nuevamente."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  async function resetChat() {
    try {
      await fetch('https://desarrollosfutura.com:5001/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        credentials: 'include'
      });
    } catch { /* nada */ }
    setMessages([]);
    localStorage.removeItem('session_id');
    localStorage.removeItem('chat_history');
    showWelcomeMessage();
  }

  // Añadir al carrito (Shopify!)
  async function addToCartFromBot(productId, category = "gadgets", quantity = 1) {
    try {
      let addToCartURL = `/cart/add?id=${productId}&quantity=${quantity}`;
      let response = await fetch(addToCartURL, {
        method: "POST",
        credentials: "include"
      });
      if (response.ok) alert("Producto agregado al carrito con éxito.");
      else alert("Hubo un problema al agregar el producto.");
    } catch (error) {
      alert("❌ Error en la solicitud:", error.message);
    }
  }

  // Quick reply handler
  function sendQuickReply(text) {
    setInput(text);
  }

  function scrollToBottom() {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }

  // Change language
  function changeLanguage(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('user_language', newLang);
    resetChat();
  }

  // ===============================
  //   JSX
  // ===============================
  return (
    <div className="chatbot-card-container" style={{ borderRadius: 16, maxWidth: 420, margin: "auto" }}>
      {/* Header */}
      <div className="chatbot-header flex items-center gap-2 p-2">
        {iconUrl && <img src={iconUrl} alt="bot icon" style={{ width: 36, borderRadius: 24 }} />}
        <b>{nombreChatBot}</b>
        <select className="ml-auto" value={language} onChange={changeLanguage}>
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </div>

      {/* Speech bubble */}
      {showSpeechBubble && (
        <div id="speech-bubble" className="chatbot-speech-bubble">
          {speechBubble}
        </div>
      )}

      {/* Mensajes */}
      <div
        id="chat-container"
        ref={chatContainerRef}
        style={{ minHeight: 300, maxHeight: 380, overflowY: "auto", background: "#fff", padding: 12, marginBottom: 8 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-box ${msg.role === "assistant" ? "bot-message" : "user-message"}`}
            style={{
              textAlign: msg.role === "assistant" ? "left" : "right",
              marginBottom: 8
            }}
          >
            <strong>{msg.role === "assistant" ? nombreChatBot : "Yo"}:</strong>{" "}
            <span
              className="message-content"
              dangerouslySetInnerHTML={{ __html: applyTextFormatting(msg.content) }}
            />
            {msg.url && (
              <div>
                <a href={msg.url} className="button-confirm" target="_blank" rel="noopener noreferrer">Ok</a>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message-box bot-message">
            <span>{nombreChatBot}: <i className="fa fa-spinner fa-spin" style={{ fontSize: 24 }} /></span>
          </div>
        )}
      </div>

      {/* Quick replies */}
      <div className="chatbot-quick-replies flex gap-2 mb-2">
        {translations[language].messages.map((text, idx) => (
          <button key={idx} type="button" onClick={() => sendQuickReply(text)}>{text}</button>
        ))}
      </div>

      {/* Input + acciones */}
      <form className="flex gap-2 chatbot-input-wrapper" onSubmit={sendMessage} style={{ padding: 8 }}>
        <input
          id="message-input"
          className="chatbot-input flex-1"
          placeholder={translations[language].placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          autoComplete="off"
          disabled={loading}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
          }}
        />
        <button type="submit" className="chatbot-send-btn" disabled={loading || !input.trim()}>Enviar</button>
        <button type="button" className="chatbot-send-btn" onClick={resetChat}>Reset</button>
      </form>

      {/* Política de privacidad */}
      <div className="privacy-policy text-xs mt-2 p-2 rounded">
        <p>
          {translations[language].privacyPolicy}{" "}
          <a target="_blank" rel="noopener noreferrer" href={privacyPolicyUrl}>
            {translations[language].privacyPolicyText}
          </a>
        </p>
      </div>
    </div>
  );
}
