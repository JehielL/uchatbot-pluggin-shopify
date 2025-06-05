import { useState, useEffect } from "react";
import { Page, Card, TextField, Button, Banner, FormLayout, Select } from "@shopify/polaris";
import { getConfig, saveConfig } from "./api";

export default function ConfigPanel() {
  const [formData, setFormData] = useState({
    botName: "",
    iconUrl: "",
    language: "es",
    context: "",
    products: "",
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    getConfig(token).then(data => setFormData(data));
  }, []);

  const handleChange = (field) => (value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      await saveConfig(formData, token);
      setMessage({ type: "success", content: "Configuración guardada correctamente" });
    } catch (e) {
      setMessage({ type: "critical", content: "Error al guardar configuración" });
    }
  };

  return (
    <Page title="Configuración del Chatbot">
      <Card sectioned>
        {message.content && <Banner status={message.type}>{message.content}</Banner>}
        <FormLayout>
          <TextField label="Nombre del Bot" value={formData.botName} onChange={handleChange("botName")} />
          <TextField label="Icono (URL)" value={formData.iconUrl} onChange={handleChange("iconUrl")} />
          <Select label="Idioma" options={[
            { label: "Español", value: "es" },
            { label: "Inglés", value: "en" }
          ]} value={formData.language} onChange={handleChange("language")} />
          <TextField label="Contexto" value={formData.context} onChange={handleChange("context")} multiline={2} />
          <TextField label="Productos/Servicios" value={formData.products} onChange={handleChange("products")} multiline={2} />
          <Button primary onClick={handleSubmit}>Guardar Configuración</Button>
        </FormLayout>
      </Card>
    </Page>
  );
}
