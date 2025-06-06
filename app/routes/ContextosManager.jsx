import { useState, useEffect } from "react";
import { Card, Spinner, Banner, Button, List, Modal, Icon } from "@shopify/polaris";
import { useJwt } from "./JwtProvider";

export default function ContextosManager() {
  const { token } = useJwt();
  const [contexto, setContexto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchContext() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://desarrollosfutura.com:5001/chat/get_contexto", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar contexto");
        setContexto(data); // Espera {nombre, contenido}
      } catch (err) {
        setError(err.message);
        setContexto(null);
      }
      setLoading(false);
    }

    fetchContext();
  }, [token]);

  if (loading) return <Spinner size="large" />;
  if (error) return <Banner status="critical">{error}</Banner>;

  return (
    <Card title="Mi contexto">
      {contexto && (
        <List>
          <List.Item>
            <b>Nombre: {contexto.nombre}</b>
            <Button
              icon={<Icon source="View" color="base" />}
              onClick={() => setShowModal(true)}
              plain
              accessibilityLabel="Ver contenido"
              style={{ marginLeft: 8 }}
            >
              Ver
            </Button>
          </List.Item>
        </List>
      )}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={`Contenido de "${contexto?.nombre}"`}
        primaryAction={{ content: "Cerrar", onAction: () => setShowModal(false) }}
      >
        <Modal.Section>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 500, overflow: "auto" }}>
            {contexto?.contenido}
          </pre>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
