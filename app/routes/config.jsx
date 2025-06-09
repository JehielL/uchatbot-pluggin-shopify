import { useEffect, useState } from "react";
import { useJwt } from "./JwtProvider";
import { useVisualConfig } from "./VisualConfigContext";
import JwtDebug from "./JwtDebug";
import {
  Page,
  Layout,
  Card,
  Form,
  FormLayout,
  TextField,
  Select,
  Button,

  Thumbnail,
} from "@shopify/polaris";

// ENDPOINTS (ajusta tu backend si es necesario)
const API_BASE = "https://desarrollosfutura.com:5001/chat";

async function getConfig(token) {
  const res = await fetch(`${API_BASE}/get_config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
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
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("No se pudo guardar la configuración");
  return res.json();
}

const DEFAULT_CONFIG = {
  botName: "uChatBot",
  iconUrl: "https://novau.io/wp-content/uploads/2025/04/U.png",
  language: "en",
  context: "",
  iconWidth: "100",
  iconHeight: "100",
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
    privacyText: "#666",
  },
  tags: {
    tag1_text_es: "",
    tag1_text_en: "",
    tag2_text_es: "",
    tag2_text_en: "",
    tag3_text_es: "",
    tag3_text_en: "",
    tag4_text: "",
    tag4_url: "",
    social_url: "",
  },
  privacyPolicyUrl: "",
};

export default function ConfigPanel() {
  const { token } = useJwt();
  const { visualConfig, setVisualConfig } = useVisualConfig();
  const [formData, setFormData] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isFirstConfig, setIsFirstConfig] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getConfig(token)
      .then((data) => {
        if (!data || Object.keys(data).length === 0 || data.error) {
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
      .catch(() => {
        setFormData(DEFAULT_CONFIG);
        setVisualConfig(DEFAULT_CONFIG);
        setIsFirstConfig(true);
        setLoading(false);
      });
  }, [token, setVisualConfig]);

  const handleChange = (field, value) => {
    if (field.startsWith("color_")) {
      const colorKey = field.replace("color_", "");
      setFormData((prev) => ({
        ...prev,
        colors: { ...prev.colors, [colorKey]: value },
      }));
    } else if (field.startsWith("tags.")) {
      const tagKey = field.replace("tags.", "");
      setFormData((prev) => ({
        ...prev,
        tags: { ...prev.tags, [tagKey]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      alert("No tienes token, inicia sesión de nuevo");
      return;
    }
    try {
      await saveConfig(formData, token);
      setVisualConfig(formData);
      setIsFirstConfig(false);
      alert("Configuración guardada y actualizada en el chatbot.");
    } catch (error) {
      alert("Error al guardar la configuración");
    }
  };

  if (loading) {
    return (
      <Page title="Configuración del Chatbot">
        <Layout>
          <Layout.Section>
            <div style={{ padding: "24px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
                Configuración del Chatbot
              </h1>
              <p>Cargando configuración…</p>
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Configuración del Chatbot">
      <Layout>
        <Layout.Section>
          <div style={{ padding: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
              Configuración del Chatbot
            </h1>

            {isFirstConfig && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fcd34d",
                  color: "#78350f",
                }}
              >
                Es la primera vez que configuras tu chatbot. Personaliza a tu gusto y guarda para comenzar 🚀
              </div>
            )}
          </div>
        </Layout.Section>

        <Layout.AnnotatedSection
          title="General"
          description="Información básica del chatbot y selección de idioma"
        >
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  label="Nombre del Bot"
                  value={formData.botName}
                  onChange={(value) => handleChange("botName", value)}
                  autoComplete="off"
                />
                <Select
                  label="Idioma"
                  options={[
                    { label: "Español", value: "es" },
                    { label: "Inglés", value: "en" },
                  ]}
                  onChange={(value) => handleChange("language", value)}
                  value={formData.language}
                />
                <TextField
                  label="Contexto del chatbot"
                  value={formData.context}
                  multiline={3}
                  onChange={(value) => handleChange("context", value)}
                />
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Icono del Chatbot"
          description="Sube o pega una URL para el icono del chatbot"
        >
          <Card sectioned>
           
              <Thumbnail
                source={formData.iconUrl || "https://via.placeholder.com/100"}
                size="large"
                alt="Chatbot Icon"
              />
              <FormLayout>
                <TextField
                  label="Icon URL"
                  value={formData.iconUrl}
                  onChange={(value) => handleChange("iconUrl", value)}
                  autoComplete="off"
                />
                <TextField
                  label="Ancho (px)"
                  type="number"
                  value={formData.iconWidth}
                  onChange={(value) => handleChange("iconWidth", value)}
                  autoComplete="off"
                />
                <TextField
                  label="Alto (px)"
                  type="number"
                  value={formData.iconHeight}
                  onChange={(value) => handleChange("iconHeight", value)}
                  autoComplete="off"
                />
              </FormLayout>
           
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Colores del Chat"
          description="Personaliza los colores de la apariencia del chatbot"
        >
          <Card sectioned>
            <FormLayout>
              {Object.entries(formData.colors).map(([key, val]) => (
                <TextField
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  type="color"
                  name={`color_${key}`}
                  value={val} 
                  onChange={(value) => handleChange(`color_${key}`, value)}
                />
              ))}
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection title="Tags y Enlaces">
          <Card sectioned>
            <FormLayout>
              {["tag1", "tag2", "tag3"].map((tag) => (
                <FormLayout.Group key={tag}>
                  <TextField
                    label={`${tag.toUpperCase()} (ES)`}
                    value={formData.tags?.[`${tag}_text_es`] || ""}
                    onChange={(value) => handleChange(`tags.${tag}_text_es`, value)}
                    autoComplete="off"
                  />
                  <TextField
                    label={`${tag.toUpperCase()} (EN)`}
                    value={formData.tags?.[`${tag}_text_en`] || ""}
                    onChange={(value) => handleChange(`tags.${tag}_text_en`, value)}
                    autoComplete="off"
                  />
                </FormLayout.Group>
              ))}
              <TextField
                label="Nombre Red Social"
                // value={formData.tags.tag4_text || ""}
                // onChange={(value) => handleChange("tags.tag4_text", value)}
                autoComplete="off"
              />
              <TextField
                label="URL Red Social"
                // value={formData.tags.tag4_url || ""}
                // onChange={(value) => handleChange("tags.tag4_url", value)}
                autoComplete="off"
              />
              <TextField
                label="Icono Social"
                // value={formData.tags.social_url || ""}
                // onChange={(value) => handleChange("tags.social_url", value)}
                autoComplete="off"
              />
            </FormLayout>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection title="Política de Privacidad">
          <Card sectioned>
            <TextField
              label="URL Política de Privacidad"
              type="url"
              value={formData.privacyPolicyUrl}
              onChange={(value) => handleChange("privacyPolicyUrl", value)}
              autoComplete="off"
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.Section>
          <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "220px" }}>
              <Button primary fullWidth onClick={handleSubmit}>
                Guardar configuración
              </Button>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <div style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Debug JWT</h2>
            <JwtDebug />
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
