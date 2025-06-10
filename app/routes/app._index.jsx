import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  List,
  Spinner,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";
import { useJwt } from "./JwtProvider";

// Helper para traer la config visual del bot
async function fetchBotConfig(token) {
  const res = await fetch("https://desarrollosfutura.com:5001/chat/get_config", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

export default function Dashboards() {
  const { token, refresh } = useJwt();

  const [botName, setBotName] = useState("uChatBot");
  const [botStatus, setBotStatus] = useState("-");
  const [tokensRestantes, setTokensRestantes] = useState("-");
  const [email, setEmail] = useState("-");
  const [loading, setLoading] = useState(true);

  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No auth token found. Please login again.");
      setBotStatus("🔴 Deactivated");
      setEmail("-");
      return;
    }
    setLoading(true);
    setError("");
    setScrapeResult(null);

    async function fetchData() {
      // 1. Bot config
      const config = await fetchBotConfig(token);
      setBotName(config?.botName || "uChatBot");

      // 2. Tokens y status
      try {
        const res = await fetch(
          "https://desarrollosfutura.com:5001/auth/tokens_restantes",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok) {
          setTokensRestantes(`🧮 ${data.mensajes_restantes}`);
          setBotStatus(data.activo === "yes" ? "🟢 Activated" : "🔴 Deactivated");
        } else {
          setTokensRestantes("Error loading tokens");
          setError(data.error || "Unknown error fetching tokens.");
          setBotStatus("🔴 Deactivated");
        }
      } catch (err) {
        setTokensRestantes("Error loading tokens");
        setError("Error fetching tokens.");
        setBotStatus("🔴 Deactivated");
      }

      // 3. Obtener Email desde /chat/me
      try {
        const resEmail = await fetch(
          "https://desarrollosfutura.com:5001/chat/me",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const dataEmail = await resEmail.json();
        setEmail(dataEmail.email || "-");
      } catch {
        setEmail("-");
      }

      setLoading(false);
    }
    fetchData();
  }, [token]);

  const handleLogout = () => {
    refresh();
  };

  const handleScrape = async () => {
  setScraping(true);
  setScrapeResult(null);
  setError("");

  if (!token) {
    setError("Not authenticated. Please login again.");
    setScraping(false);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const shopDomain = urlParams.get("shop");
  console.log("🌐 Scraping site:", shopDomain);
  console.log("🔑 Using token:", token);
  try {
    // 1. Scrape del sitio
    const res = await fetch(`https://desarrollosfutura.com:5000/scraper/scrape?url=${shopDomain}`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        
      });

    const scrapeBody = await res.text(); // respuesta puede no ser JSON
    if (!res.ok) throw new Error(`Scraping failed: ${scrapeBody}`);

    console.log("✅ Scrape result:", scrapeBody);

    // 2. Obtener contextos
    const contextsRes = await fetch(
      "https://desarrollosfutura.com:5000/scraper/contextos",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contextsData = await contextsRes.json();
    const contextos = contextsData?.contextos ?? [];

    // 3. Activar primer contexto (si existe)
    let contextActivated = false;
    if (contextos.length > 0 && contextos[0].archivo) {
      const archivo = contextos[0].archivo;

      const activateRes = await fetch(
        "https://desarrollosfutura.com:5000/scraper/activar_contexto",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archivo }),
        }
      );

      const activateBody = await activateRes.text();
      console.log("🔁 Activar contexto:", activateBody);

      contextActivated = activateRes.ok;
    }

    setScrapeResult({
      success: true,
      message: `✅ Website scraped and ${
        contextActivated ? "context activated" : "no context activated"
      } successfully.\n\nContextos:\n${contextos
        .map((c) => `${c.nombre} (${c.archivo})`)
        .join("\n")}`,
    });
  } catch (err) {
    console.error("❌ Scrape error:", err);
    setScrapeResult({
      success: false,
      message: err.message || "Error occurred while scraping website",
    });
  }

  setScraping(false);
};


  return (
    <Page title="uChatBot Dashboard">
      <TitleBar title="uChatBot Dashboard" />

      <BlockStack gap="600">
        <Card>
          <BlockStack align="center" gap="200">
            <img
              src="https://novau.io/wp-content/uploads/2025/04/U.png"
              alt="uChatBot Logo"
              style={{ maxWidth: 140 }}
            />
            <Text variant="heading2xl" as="h1">
              Welcome to uChatBot
            </Text>
            <Text variant="bodyMd" color="subdued">
              Your AI-powered conversational assistant.
            </Text>
            <Button onClick={handleLogout} variant="secondary">
              Refresh Token
            </Button>
          </BlockStack>
        </Card>

        <Layout>
          <Layout.Section>
            <Card title="Bot Stats">
              <BlockStack gap="400" direction="horizontal" align="center">
                {loading ? (
                  <Spinner accessibilityLabel="Loading..." size="large" />
                ) : (
                  <>
                    <BlockStack gap="100">
                      <Text variant="headingLg">{botName}</Text>
                      <Text as="span" color="subdued">
                        Bot Name
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="headingLg">{botStatus}</Text>
                      <Text as="span" color="subdued">
                        Bot Status
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="headingLg">{email || "-"}</Text>
                      <Text as="span" color="subdued">
                        User Email
                      </Text>
                    </BlockStack>
                    <BlockStack gap="100">
                      <Text variant="headingLg">{tokensRestantes}</Text>
                      <Text as="span" color="subdued">
                        Remaining Tokens
                      </Text>
                    </BlockStack>
                  </>
                )}
              </BlockStack>

              <BlockStack gap="200" align="center" style={{ marginTop: 32 }}>
                <Button
                  primary
                  onClick={handleScrape}
                  icon="DataVisualizationMajor"
                  loading={scraping}
                  disabled={scraping}
                >
                  Scrape Website Content
                </Button>
                {scraping && (
                  <Spinner accessibilityLabel="Scraping..." size="small" />
                )}
                {scrapeResult && (
                  <Banner
                    status={scrapeResult.success ? "success" : "critical"}
                  >
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                      {scrapeResult.message}
                    </pre>
                  </Banner>
                )}
                {error && <Banner status="critical">{error}</Banner>}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card title="How to use?">
              <List type="number">
                <List.Item>
                  Activate the chatbot if it’s not already active.
                </List.Item>
                <List.Item>Upload your custom context.</List.Item>
                <List.Item>Activate your custom context.</List.Item>
                <List.Item>
                  Customize the chatbot appearance to match your website.
                </List.Item>
                <List.Item>Define the chatbot’s personality.</List.Item>
                <List.Item>Test the chatbot on your site.</List.Item>
              </List>
            </Card>
          </Layout.Section>
        </Layout>

        <Card title="Quick Links">
          <BlockStack gap="200" direction="horizontal">
            <Button url="/contextosmanager" primary>
              Upload Context
            </Button>
            <Button url="/app/personalizacion">Customization</Button>
            <Button url="/app/seccion">Activate/Deactivate</Button>
            <Button url="/history">Chatbot History</Button>
          </BlockStack>
        </Card>

        <Card title="Need help?">
          <BlockStack gap="200">
            <Text>
              If you need assistance or have questions about uChatBot, feel
              free to contact our support team.
            </Text>
            <Button
              url="https://futuravive.com/contacta-con-nosotros"
              external
            >
              Contact Support
            </Button>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
