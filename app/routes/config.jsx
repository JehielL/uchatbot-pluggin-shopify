import { useEffect, useState } from "react";
import { useJwt } from "./JwtProvider";
import { useVisualConfig } from "./VisualConfigContext";
import JwtDebug from "./JwtDebug";

// ENDPOINTS (ajusta tu backend si es necesario)
const API_BASE = "https://desarrollosfutura.com:5001/chat";

async function getConfig(token) {
  // Aquí asumo tu backend responde 404 si no existe aún la config
  const res = await fetch(`${API_BASE}/get_config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    // Si es 404 (sin config previa), simplemente devolvemos null para usar el default
    if (res.status === 404) return null;
    throw new Error("No se pudo cargar la configuración");
  }
  return await res.json();
}

export async function saveConfig(config, token) {
  const res = await fetch(`${API_BASE}/guardar_config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("No se pudo guardar la configuración");
  return res.json();
}

// --- Valores por defecto (reusables) ---
const DEFAULT_CONFIG = {
  botName: "uChatBot",
  iconUrl: "https://novau.io/wp-content/uploads/2025/04/U.png",
  language: "en",
  context: "",
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

export default function ConfigPanel() {
  const { token } = useJwt();
  const { visualConfig, setVisualConfig } = useVisualConfig();
  const [formData, setFormData] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isFirstConfig, setIsFirstConfig] = useState(false); // UX flag para mostrar mensaje especial

  // Cargar config real al montar (si hay token)
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getConfig(token)
      .then((data) => {
        if (!data || Object.keys(data).length === 0 || data.error) {
          // Primera vez: backend responde null/{} o error
          setFormData(DEFAULT_CONFIG);
          setVisualConfig(DEFAULT_CONFIG);
          setIsFirstConfig(true);
        } else {
          setFormData(data);
          setVisualConfig(data);
          setIsFirstConfig(false);
        }
        setLoading(false);
      })
      .catch((e) => {
        // Error de red u otro, asumimos que es primera vez (muestra defaults)
        setFormData(DEFAULT_CONFIG);
        setVisualConfig(DEFAULT_CONFIG);
        setIsFirstConfig(true);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("color_")) {
      const colorKey = name.replace("color_", "");
      setFormData((prev) => ({
        ...prev,
        colors: { ...prev.colors, [colorKey]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("No tienes token, inicia sesión de nuevo");
      return;
    }
    try {
      await saveConfig(formData, token);
      setVisualConfig(formData); // Refleja el cambio en el chat
      setIsFirstConfig(false);
      alert("Configuración guardada y actualizada en el chatbot.");
    } catch (error) {
      alert("Error al guardar la configuración");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Configuración del Chatbot</h1>
        <p>Cargando configuración…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Configuración del Chatbot</h1>
      {isFirstConfig && (
        <div className="mb-4 p-3 rounded bg-yellow-100 border border-yellow-400 text-yellow-900">
          Es la primera vez que configuras tu chatbot. Personaliza a tu gusto y guarda para comenzar 🚀
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          name="botName"
          value={formData.botName}
          onChange={handleChange}
          placeholder="Nombre del Bot"
        />
        <input
          className="w-full p-2 border rounded"
          name="iconUrl"
          value={formData.iconUrl}
          onChange={handleChange}
          placeholder="URL del Icono"
        />
        <select
          name="language"
          value={formData.language}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="en">Inglés</option>
          <option value="es">Español</option>
        </select>
        <textarea
          name="context"
          className="w-full p-2 border rounded"
          rows="3"
          placeholder="Contexto del chatbot"
          value={formData.context}
          onChange={handleChange}
        ></textarea>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(formData.colors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="capitalize w-1/2">{key}</label>
              <input
                type="color"
                name={`color_${key}`}
                value={val}
                onChange={handleChange}
                className="w-1/2 h-8"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-500"
        >
          Guardar configuración
        </button>
      </form>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Debug JWT</h1>
        <JwtDebug />
      </div>
    </div>
  );
}
