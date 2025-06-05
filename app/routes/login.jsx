import { Page, Card, Button, TextField, Banner } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Si ya hay sesión, redirige automáticamente
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("auth_token")) {
        navigate("/config"); // O "/dashboards"
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://desarrollosfutura.com:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("user_email", email);
        navigate("/wizard"); // O "/dashboards"
      } else {
        setError(result.error || "Error en el login. Intenta de nuevo.");
      }
    } catch (err) {
      setError("Error en la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Login uChatBot">
      <Card sectioned>
        {error && <Banner status="critical">{error}</Banner>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="username"
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <Button
          primary
          onClick={handleLogin}
          loading={loading}
          fullWidth
          style={{ marginTop: 20 }}
        >
          Iniciar sesión
        </Button>
      </Card>
    </Page>
  );
}
