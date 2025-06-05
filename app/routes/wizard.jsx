import { useState } from "react";
import { Page, Card, Form, FormLayout, TextField, Select, Button, Banner, ProgressBar } from "@shopify/polaris";
import { saveConfig } from "./api";
import { useNavigate } from "@remix-run/react";

export default function Wizard() {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    botName: "",
    language: "es",
    description: "",
    products: "",
    iconUrl: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const token = localStorage.getItem("auth_token");
    await saveConfig(formData, token);
    setShowSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1200);
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
        return <TextField label="Descripción" value={formData.description} onChange={handleChange("description")} multiline={4} />;
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
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            {renderStepContent()}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {currentStep > 1 && <Button onClick={prevStep}>Anterior</Button>}
              {currentStep < totalSteps && <Button primary onClick={nextStep}>Siguiente</Button>}
              {currentStep === totalSteps && <Button primary submit>Finalizar</Button>}
            </div>
          </FormLayout>
        </Form>
        {showSuccess && <Banner status="success">Configuración guardada correctamente.</Banner>}
      </Card>
    </Page>
  );
}
