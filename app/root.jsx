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
import { VisualConfigProvider } from "./routes/VisualConfigContext";

import { JwtProvider } from "./routes/JwtProvider";
import FloatingChatbot from "./routes/FloatingChatbot"; // <-- importa el nuevo componente

export function links() {
  return [
    { rel: "stylesheet", href: polarisStyles },
    // Otros estilos si los tienes
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
        {/* JwtProvider envuelve TODO tu contenido */}
        <JwtProvider>
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
