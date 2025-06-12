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
    const startTime = Date.now();
    try {
      const res = await fetch(
        "https://desarrollosfutura.com:5001/scrape",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      if (res.ok) {
        let html = `Website scraped successfully! (${elapsed} seconds)`;
        if (data.contexts && data.contexts.length > 0) {
          html += "\nAvailable Contexts:\n";
          html += data.contexts
            .map((ctx) => `${ctx.nombre} (${ctx.archivo})`)
            .join("\n");
        }
        setScrapeResult({ success: true, message: html });
      } else {
        setScrapeResult({
          success: false,
          message: `Error: ${data.data} (${elapsed} seconds)`,
        });
      }
    } catch (err) {
      setScrapeResult({
        success: false,
        message: "Error occurred while scraping website",
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
            <Button url="/app/historial">Chatbot History</Button>
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
