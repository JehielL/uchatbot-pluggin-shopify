import {
  Page,
  Layout,
  Card,
  TextField,
  Spinner,
  Text,
  Banner,
  Button,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useJwt } from "./JwtProvider";

export default function History() {
  const { token } = useJwt();

  
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  
  async function fetchHistory(limit, page) {
    if (!token) {
      setError("No token found. Please refresh or login.");
      setHistory([]);
      setFilteredHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const offset = (page - 1) * limit;
      const res = await fetch(
        `https://desarrollosfutura.com:5001/chat/all_history?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load history");

      const total = data.total || data.history.length || 0;
      setTotalPages(Math.ceil(total / limit));

      setHistory(data.history || []);
      setFilteredHistory(data.history || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setHistory([]);
      setFilteredHistory([]);
      setLoading(false);
    }
  }

  // Cargar la primera página inicialmente
  useEffect(() => {
    fetchHistory(limit, currentPage);
  }, []);

  // Al hacer click en "Load"
  function handleLoad() {
    setCurrentPage(1);
    fetchHistory(limit, 1);
    setSearch("");
  }

  // Cambios en paginación
  function handlePrev() {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchHistory(limit, newPage);
      setSearch("");
    }
  }

  function handleNext() {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchHistory(limit, newPage);
      setSearch("");
    }
  }

  // Filtrar localmente sobre la página cargada
  useEffect(() => {
    if (!search.trim()) {
      setFilteredHistory(history);
      return;
    }

    const filtered = history.filter((item) =>
      (item.content || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );

    setFilteredHistory(filtered);
  }, [search, history]);

  return (
    <Page title="Historial del Chatbot">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{ marginBottom: 15, display: "flex", gap: 10, alignItems: "center" }}>
              <label htmlFor="message-limit" style={{ flexShrink: 0 }}>
                Mensajes a mostrar:
              </label>
              <input
                id="message-limit"
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(Math.min(500, Math.max(1, Number(e.target.value))))}
                style={{ width: 80, padding: 6 }}
              />
              <Button onClick={handleLoad}>Cargar</Button>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label htmlFor="search-input">
                Buscar mensajes en esta página:
              </label>
              <TextField
                id="search-input"
                placeholder="Ejemplo: hola"
                value={search}
                onChange={(value) => setSearch(value)}
                autoComplete="off"
              />
            </div>

            {loading ? (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Spinner accessibilityLabel="Cargando historial" size="large" />
              </div>
            ) : error ? (
              <Banner status="critical" style={{ marginTop: 20 }}>
                {error}
              </Banner>
            ) : filteredHistory.length === 0 ? (
              <Text style={{ marginTop: 20 }}>No hay mensajes que mostrar.</Text>
            ) : (
              <div
                style={{
                  background: "#f9f9f9",
                  border: "1px solid #ddd",
                  padding: 15,
                  borderRadius: 6,
                  maxHeight: 500,
                  overflowY: "auto",
                  marginTop: 10,
                }}
              >
                {filteredHistory.map((item, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <p>
                      <strong>
                        {item.role === "user"
                          ? "Usuario"
                          : item.role === "assistant"
                          ? "Chatbot"
                          : "Desconocido"}
                        :
                      </strong>{" "}
                      {item.content || "Sin mensaje"}
                    </p>
                    <hr />
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <Button onClick={handlePrev} disabled={currentPage <= 1}>
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button onClick={handleNext} disabled={currentPage >= totalPages}>
                Siguiente
              </Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
