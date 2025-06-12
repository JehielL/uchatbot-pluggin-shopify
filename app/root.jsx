// app/root.jsx (ACTUALIZADO)
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import esTranslations from "@shopify/polaris/locales/es.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
// Importa tus providers y componentes desde las rutas correctas
import { VisualConfigProvider } from "../src/VisualConfigContext"; // Asegúrate de la ruta correcta
import chatbotStyles from "../src/chatbot.css?url"; // Asegúrate de esta ruta
import { JwtProvider } from "./routes/JwtProvider";
import FloatingChatbot from "./routes/FloatingChatbot";

export function links() {
  return [
    { rel: "stylesheet", href: polarisStyles },
    { rel: "stylesheet", href: chatbotStyles },
  ];
}

export default function App() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <JwtProvider>
          {/* Ya no pasamos initialConfig aquí, el Provider lo lee internamente */}
          <VisualConfigProvider>
            <AppProvider i18n={esTranslations}>
              <Outlet />
              <FloatingChatbot />
            </AppProvider>
          </VisualConfigProvider>
        </JwtProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}