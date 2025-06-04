import { useState } from "react";
import { useEffect } from "react";

export default function ConfigPanel() {
  const [formData, setFormData] = useState({
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
  });

/*   useEffect(() => {
  const fetchConfig = async () => {
    try {
      const res = await fetch("https://desarrollosfutura.com/chat");
      if (!res.ok) throw new Error("Error al cargar configuración");
      const data = await res.json();
      setFormData(data);
    } catch (error) {
      console.error("No se pudo cargar la configuración:", error.message);
    }
  };

  fetchConfig();
}, []);
 */

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
    try {
      const res = await fetch("https://TU_BACKEND.com/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) alert("Configuración guardada exitosamente");
      else throw new Error("Error al guardar");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Configuración del Chatbot</h1>
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
    </div>
  );
}
