import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Card, Button, Banner } from "@shopify/polaris";
import { useState } from "react";

// Loader para obtener la sesión de Shopify con log de depuración
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  // DEBUG: Muestra la sesión en el log del servidor Remix
  console.log("=== SESSION LOADER ===", session);

  if (!session || !session.shop || !session.accessToken) {
    throw new Response("No se pudo cargar la sesión", { status: 401 });
  }

  return json({
    shop: session.shop,
    // No envíes accessToken al frontend en producción.
  });
};

export default function ToggleChatbot() {
  const { shop } = useLoaderData(); // accessToken removido
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // DEBUG: Sólo muestra el shop
  console.log("[CLIENT] Shop:", shop);

  const toggleScript = async (toEnable) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: toEnable ? "create" : "delete",
        }),
      });
      if (!resp.ok) {
        // Intenta obtener el mensaje de error de la respuesta
        let errorMessage = "Error en la API";
        try {
          const errorData = await resp.json();
          if (errorData && errorData.error) errorMessage = errorData.error;
        } catch (_) {}
        throw new Error(errorMessage);
      }
      setEnabled(toEnable);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <Card title="Chatbot en tienda">
      {error && <Banner status="critical">{error}</Banner>}
      <Button
        primary={!enabled}
        destructive={enabled}
        loading={loading}
        onClick={() => toggleScript(!enabled)}
      >
        {enabled ? "Desactivar Chatbot" : "Activar Chatbot"}
      </Button>
      <div style={{ marginTop: 16, color: "#888" }}>
        <b>Debug info:</b>
        <br />
        Shop: <code>{shop}</code>
      </div>
    </Card>
  );
}
