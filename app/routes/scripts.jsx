import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// Loader: verifica que la ruta funciona
export const loader = () => {
  return new Response("¡Remix SÍ ve esta ruta!", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};

// Utilidad para crear ScriptTag
async function enableChatbotScriptTag({ session }) {
  if (!session || !session.shop || !session.accessToken) {
    throw new Error("Sesión de Shopify inválida.");
  }
  const scriptUrl = "https://dad-patch-begins-tuning.trycloudflare.com/widget-chatbot.iife.js";
  const endpoint = `https://${session.shop}/admin/api/2023-10/script_tags.json`;

  // Verifica si ya existe
  let existingTags = [];
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    existingTags = data.script_tags || [];
    if (existingTags.some(tag => tag.src === scriptUrl)) {
      console.log("[ScriptTag] Ya existe el ScriptTag en la tienda.");
      return true;
    }
  } catch (err) {
    console.error("[ScriptTag] Error buscando ScriptTags existentes:", err);
    throw err;
  }

  // Crea el ScriptTag si no existe
  try {
    const createResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": session.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script_tag: {
          event: "onload",
          src: scriptUrl,
          display_scope: "all",
        },
      }),
    });
    if (!createResponse.ok) {
      const text = await createResponse.text();
      throw new Error("Error creando ScriptTag: " + text);
    }
    console.log("[ScriptTag] ScriptTag creado correctamente.");
    return true;
  } catch (err) {
    console.error("[ScriptTag] Error creando ScriptTag:", err);
    throw err;
  }
}

// Action handler
export const action = async ({ request }) => {
  console.log("=== [scripts] ACTION INIT ===");
  console.log("METHOD:", request.method);
  console.log("HEADERS:", JSON.stringify(Object.fromEntries(request.headers), null, 2));

  // Lee el body
  let body = {};
  try {
    body = await request.json();
    console.log("BODY PARSED (json):", body);
  } catch (e) {
    console.log("ERROR PARSING BODY:", e.message);
    return json({ error: "Body inválido" }, { status: 400 });
  }

  // Shopify Auth
  let session;
  try {
    const authResult = await authenticate.admin(request);
    session = authResult.session;
    console.log("AUTH RESULT:", authResult);
  } catch (e) {
    console.error("Error autenticando:", e);
    return json({ error: "Error de autenticación" }, { status: 401 });
  }

  try {
    if (!session) {
      return json({ error: "No se pudo cargar la sesión" }, { status: 401 });
    }
    const { action } = body;
    if (action === "create") {
      await enableChatbotScriptTag({ session });
      return json({ ok: true });
    }
    if (action === "delete") {
      // Implementa borrado aquí si lo necesitas
      return json({ ok: true });
    }
    return json({ error: "Acción desconocida" }, { status: 400 });
  } catch (e) {
    console.error("Error ejecutando action:", e);
    return json({ error: e.message }, { status: 500 });
  }
};
