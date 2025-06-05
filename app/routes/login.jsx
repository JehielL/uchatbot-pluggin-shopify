import { Page, Card, Button, TextField, Banner } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopDomain, setShopDomain] = useState(""); // <-- Nuevo
  const navigate = useNavigate();

  // Detectar dominio SOLO en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Adapta esto a tu método real de obtener el shop
      setShopDomain(window.Shopify?.shop || "robota.store");
    }
  }, []);

  // Si ya hay JWT global guardado para este shop, redirige a /wizard
  useEffect(() => {
    if (!shopDomain) return;
    (async () => {
      try {
        const res = await fetch(
          `https://desarrollosfutura.com:5001/chat/obtener_token_global?shop=${shopDomain}`
        );
        const data = await res.json();
        if (res.ok && data.token) {
          navigate("/wizard");
        }
      } catch (e) {
        // Si no hay token global, se queda en login
      }
    })();
  }, [navigate, shopDomain]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Login contra backend Flask
      const response = await fetch("https://desarrollosfutura.com:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok && result.token) {
        // 2. Guardar JWT en backend Flask para este shop
        const saveTokenResponse = await fetch(
          "https://desarrollosfutura.com:5001/chat/guardar_token_global",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shop: shopDomain,
              token: result.token,
              user_id: result.user_id,
              email,
            }),
          }
        );

        if (!saveTokenResponse.ok) {
          setError("No se pudo guardar el token global. Intenta de nuevo.");
          setLoading(false);
          return;
        }

        // 3. Redirige al wizard
        navigate("/wizard");
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
          disabled={!shopDomain}
        >
          Iniciar sesión
        </Button>
      </Card>
    </Page>
  );
}
