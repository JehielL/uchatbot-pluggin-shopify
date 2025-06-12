import { Outlet, useLoaderData, useRouteError, Link } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { AppProvider as BridgeAppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import JwtDebug from "./JwtDebug"; 
// Traducción mínima para Polaris
const i18n = {
  Polaris: {
    ResourceList: {
      sortingLabel: 'Ordenar por',
      defaultItemSingular: 'elemento',
      defaultItemPlural: 'elementos',
      showing: 'Mostrando',
      of: 'de',
      items: 'elementos',
      previous: 'Anterior',
      next: 'Siguiente',
    },
    Common: {
      cancel: 'Cancelar',
      close: 'Cerrar',
      submit: 'Enviar',
      save: 'Guardar',
      edit: 'Editar',
    }
  }
};

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <PolarisAppProvider i18n={i18n}>
      <BridgeAppProvider isEmbeddedApp apiKey={apiKey}>
        <NavMenu>
          <Link to="/app" rel="home">Home</Link>
          <Link to="/config">Configuración del Chatbot</Link>
          <Link to="/wizard">Asistente de Configuración</Link>
          <Link to="/dashboards">Dashboard</Link>
          <Link to="/leads">Mis Leads</Link>
          <Link to="/contextosmanager">Configurar Contextos</Link>
          <Link to="/ToggleChatbot">Activar Chatbot</Link>
          <Link to="/history">My ChatBot history</Link>
        </NavMenu>
        <JwtDebug />
        <Outlet />
      </BridgeAppProvider>
    </PolarisAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
