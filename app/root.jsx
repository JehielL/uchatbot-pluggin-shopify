import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import esTranslations from "@shopify/polaris/locales/es.json"; // O en.json
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export function links() {
  return [
    { rel: "stylesheet", href: polarisStyles },
    // Si tienes otros estilos, añádelos aquí
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
        {/* Polaris AppProvider envuelve TODO el contenido */}
        <AppProvider i18n={esTranslations}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

