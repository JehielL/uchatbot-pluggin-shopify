import { useState } from "react";
import { Page, Card, Form, FormLayout, TextField, Select, Button, Banner, ProgressBar } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useJwt } from "./JwtProvider";
import { useVisualConfig } from "./VisualConfigContext";
import { saveConfig as saveConfigBackend } from "./config";

const DEFAULT_COLORS = {
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
};

// Helper LOCAL para guardar el contexto conversacional
async function saveContexto(nombre_contexto, contexto, token) {
  const res = await fetch("https://desarrollosfutura.com:5001/chat/set_contexto", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre_contexto,
      contexto
    }),
  });
  if (!res.ok) throw new Error("No se pudo guardar el contexto");
  return await res.json();
}

export default function Wizard() {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    botName: "",
    language: "es",
    description: "",
    products: "",
    iconUrl: "",
    colors: { ...DEFAULT_COLORS },
    context: "", // No se usa, pero así tienes los campos homogéneos
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");
  const navigate = useNavigate();

  const { token } = useJwt();
  const { setVisualConfig } = useVisualConfig();

  const handleChange = (field) => (value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!token) {
      setShowError("No tienes sesión iniciada. Por favor, inicia sesión.");
      return;
    }

    const configToSave = {
      botName: formData.botName || "uChatBot",
      iconUrl: formData.iconUrl || "https://novau.io/wp-content/uploads/2025/04/U.png",
      language: formData.language || "es",
      context: formData.description || "",  // lo usas también en el config
      products: formData.products || "",
      colors: formData.colors || DEFAULT_COLORS
    };

    try {
      // 1️⃣ Guarda la config visual (helper de config.jsx)
      await saveConfigBackend(configToSave, token);

      // 2️⃣ Guarda el contexto conversacional aparte
      await saveContexto("principal", configToSave.context, token);

      // 3️⃣ Actualiza el visualConfig global para el chat
      setVisualConfig(configToSave);

      // 4️⃣ UX feedback
      setShowSuccess(true);
      setShowError("");
      setTimeout(() => navigate("/dashboards"), 1200);
    } catch (error) {
      setShowError("Error al guardar la configuración o el contexto. Inténtalo de nuevo.");
      setShowSuccess(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <TextField label="Nombre del Bot" value={formData.botName} onChange={handleChange("botName")} autoComplete="off" />;
      case 2:
        return <Select label="Idioma" options={[
          { label: "Español", value: "es" },
          { label: "Inglés", value: "en" }
        ]} value={formData.language} onChange={handleChange("language")} />;
      case 3:
        return <TextField label="Descripción del chatbot (Contexto conversacional)" value={formData.description} onChange={handleChange("description")} multiline={4} />;
      case 4:
        return <TextField label="Productos/Servicios" value={formData.products} onChange={handleChange("products")} multiline={2} />;
      case 5:
        return <TextField label="URL del Logo" value={formData.iconUrl} onChange={handleChange("iconUrl")} />;
      default:
        return null;
    }
  };

  return (
    <Page title="Asistente de Configuración">
      <Card sectioned>
        <ProgressBar progress={(currentStep / totalSteps) * 100} />
        {/* OJO: Form debe recibir una función normal, no async directamente */}
        <Form
          onSubmit={e => {
            e.preventDefault();
            if (currentStep === totalSteps) {
              handleSubmit();
            }
          }}
        >
          <FormLayout>
            {renderStepContent()}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {currentStep > 1 && (
                <Button onClick={prevStep} type="button">Anterior</Button>
              )}
              {currentStep < totalSteps && (
                <Button primary onClick={nextStep} type="button">Siguiente</Button>
              )}
              {currentStep === totalSteps && (
                <Button primary submit>Finalizar</Button>
              )}
            </div>
          </FormLayout>
        </Form>


        {showSuccess && <Banner status="success">Configuración guardada correctamente.</Banner>}
        {showError && <Banner status="critical">{showError}</Banner>}
      </Card>
    </Page>
  );
}
