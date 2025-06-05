import { Page, Card, Button } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getConfig } from "./api";

export default function Dashboard() {
  const [config, setConfig] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Solo accede a localStorage en el cliente
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const email = localStorage.getItem("user_email");
      setUserEmail(email);

      if (token) {
        getConfig(token)
          .then((data) => {
            setConfig(data);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  if (loading) {
    return (
      <Page title="Dashboard uChatBot">
        <Card sectioned>
          <p>Cargando configuración...</p>
        </Card>
      </Page>
    );
  }

  if (!userEmail) {
    return (
      <Page title="Dashboard uChatBot">
        <Card sectioned>
          <p>No logueado. Por favor inicia sesión.</p>
          <Button onClick={() => navigate("/login")}>Ir al Login</Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Dashboard uChatBot">
      <Card sectioned>
        <h2>Bienvenido, {userEmail}</h2>
        {config ? (
          <div>
            <b>Nombre:</b> {config.botName} <br />
            <b>Idioma:</b> {config.language} <br />
            <b>Productos:</b> {config.products || "No definido"} <br />
            <b>Contexto:</b> {config.context || "No definido"} <br />
          </div>
        ) : (
          <p>No hay configuración cargada.</p>
        )}
        <Button onClick={() => navigate("/wizard")}>Reconfigurar Asistente</Button>
        <Button onClick={() => navigate("/config")}>Editar Configuración</Button>
      </Card>
    </Page>
  );
}
