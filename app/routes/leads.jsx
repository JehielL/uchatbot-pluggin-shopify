import {
  Page,
  Layout,
  Card,
  TextField,
  Spinner,
  Text,
  Banner,
  Pagination,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useJwt } from "./JwtProvider";

export default function Leads() {
  const { token } = useJwt();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const leadsPerPage = 10;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No token found. Please refresh or login.");
      return;
    }

    async function fetchLeads() {
      try {
        const res = await fetch("https://desarrollosfutura.com:5001/chat/mis_leads", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load leads");

        setLeads(data.leads || []);
        setFilteredLeads(data.leads || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchLeads();
  }, [token]);

  useEffect(() => {
    const filtered = leads.filter((lead) => {
      const s = search.toLowerCase();
      return (
        lead.nombre?.toLowerCase().includes(s) ||
        lead.email?.toLowerCase().includes(s) ||
        lead.motivo_visita?.toLowerCase().includes(s)
      );
    });

    setFilteredLeads(filtered);
    setPage(1);
  }, [search, leads]);

  const paginatedLeads = filteredLeads.slice(
    (page - 1) * leadsPerPage,
    page * leadsPerPage
  );

  return (
    <Page title="Leads Capturados">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingLg" as="h1" visuallyHidden={false}>
              Mis Leads
            </Text>

            <TextField
              label="Buscar leads"
              value={search}
              onChange={(value) => setSearch(value)}
              placeholder="Buscar por nombre, email o motivo..."
              autoComplete="off"
            />

            {loading ? (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Spinner accessibilityLabel="Cargando leads" size="large" />
              </div>
            ) : error ? (
              <Banner status="critical" style={{ marginTop: 20 }}>
                {error}
              </Banner>
            ) : (
              <>
                {paginatedLeads.length === 0 ? (
                  <Text variant="bodyMd" style={{ marginTop: 20 }}>
                    No se encontraron leads.
                  </Text>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
                    {paginatedLeads.map((lead, index) => (
                      <li
                        key={index}
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          padding: 15,
                          marginBottom: 12,
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Text variant="headingMd" as="p" style={{ marginBottom: 4 }}>
                          👤 {lead.nombre}
                        </Text>
                        <Text as="p" style={{ marginBottom: 2 }}>
                          ✉ {lead.email}
                        </Text>
                        <Text as="p" style={{ marginBottom: 2 }}>
                          📝 {lead.motivo_visita}
                        </Text>
                        <Text as="p" style={{ marginBottom: 2 }}>
                          🗓 {new Date(lead.fecha).toLocaleString()}
                        </Text>
                        <Text as="p">🔑 Deal ID: {lead.deal_id || "N/A"}</Text>
                      </li>
                    ))}
                  </ul>
                )}

                {filteredLeads.length > leadsPerPage && (
                  <Pagination
                    hasPrevious={page > 1}
                    onPrevious={() => setPage((p) => p - 1)}
                    hasNext={page < Math.ceil(filteredLeads.length / leadsPerPage)}
                    onNext={() => setPage((p) => p + 1)}
                  />
                )}
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
