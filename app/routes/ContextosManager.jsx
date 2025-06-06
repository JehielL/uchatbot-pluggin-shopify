import { useState, useEffect } from "react";
import * as Polaris from "@shopify/polaris";
import { useJwt } from "./JwtProvider";

export default function ContextosManager() {
  const { token } = useJwt();
  const [contexto, setContexto] = useState(null); // solo 1 contexto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchContexto();
    // eslint-disable-next-line
  }, [token]);

  // ⚡ Obtener EL contexto
  async function fetchContexto() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://desarrollosfutura.com:5001/chat/get_contexto", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar contexto");
      setContexto(data);
    } catch (err) {
      setError(err.message);
      setContexto(null);
    }
    setLoading(false);
  }

  // ⚡ Subir un contexto nuevo (.txt) ENVIANDOLO COMO JSON
  async function handleFileDrop(files) {
    setFileUploading(true);
    setError("");
    const file = files[0];
    if (!file) return;

    // Lee el archivo como texto
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const contenido = e.target.result;
        const res = await fetch("https://desarrollosfutura.com:5001/chat/set_contexto", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre_contexto: file.name.replace(/\.txt$/, ""),
            contexto: contenido
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al subir el contexto");
        await fetchContexto();
      } catch (err) {
        setError(err.message);
      }
      setFileUploading(false);
    };
    reader.readAsText(file);
  }

  // ⚡ Ver contenido del contexto
  function handleVerContenido() {
    setModalTitle(contexto?.nombre || "Contexto");
    setModalContent(contexto?.contenido || "No hay contenido");
    setShowModal(true);
  }

  // ⚡ Borrar contexto (si tu backend lo permite con ese endpoint)
  async function handleDeleteContext() {
    try {
      const res = await fetch(`https://desarrollosfutura.com:5001/chat/delete_contexto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_contexto: contexto?.nombre })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al borrar contexto");
      setShowModal(false);
      await fetchContexto();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Polaris.Spinner size="large" />;
  if (error) return <Polaris.Banner status="critical">{error}</Polaris.Banner>;

  return (
    <Polaris.Card title="Gestión de contexto del chatbot">
      <Polaris.DropZone
        accept=".txt"
        onDrop={handleFileDrop}
        allowMultiple={false}
        disabled={fileUploading}
      >
        <Polaris.DropZone.FileUpload actionTitle={fileUploading ? "Subiendo..." : "Arrastra tu archivo .txt o haz click"} />
      </Polaris.DropZone>

      {contexto ? (
        <div style={{ marginTop: 24 }}>
          <Polaris.Text as="h3" variant="headingMd">{contexto.nombre}</Polaris.Text>
          <Polaris.Button
            onClick={handleVerContenido}
            plain
            accessibilityLabel="Ver contenido"
          >
            Ver contenido
          </Polaris.Button>
          <Polaris.Button
            destructive
            plain
            onClick={handleDeleteContext}
            style={{ marginLeft: 8 }}
          >
            Borrar contexto
          </Polaris.Button>
        </div>
      ) : (
        <Polaris.Text>No tienes contexto guardado.</Polaris.Text>
      )}

      <Polaris.Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={`Contenido de "${modalTitle}"`}
        primaryAction={{ content: "Cerrar", onAction: () => setShowModal(false) }}
      >
        <Polaris.Modal.Section>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 500, overflow: "auto" }}>
            {modalContent}
          </pre>
        </Polaris.Modal.Section>
      </Polaris.Modal>
    </Polaris.Card>
  );
}
