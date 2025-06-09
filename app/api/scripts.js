import shopify from "../shopify.server";

export async function enableChatbotScriptTag({ session }) {
  if (!session) throw new Error("Sesión de Shopify inválida");
  const ScriptTag = shopify.api.rest.ScriptTag;
  const scriptUrl = "https://nearby-walks-airport-ross.trycloudflare.com/widget-chatbot.iife.js";

  // Busca ScriptTags existentes
  let existing;
  try {
    existing = await ScriptTag.all({ session });
    console.log("[scripts.js] ScriptTags existentes:", existing);
  } catch (err) {
    console.error("[scripts.js] ERROR al obtener ScriptTags:", err);
    throw err;
  }

  const alreadyExists = existing.data?.some(tag => tag.src === scriptUrl);

  if (!alreadyExists) {
    try {
      const result = await ScriptTag.create({
        session,
        event: "onload",
        src: scriptUrl,
        display_scope: "all"
      });
      console.log("[scripts.js] Resultado ScriptTag.create:", result);
    } catch (err) {
      console.error("[scripts.js] ERROR al crear ScriptTag:", err?.response?.data || err);
      throw err;
    }
  } else {
    console.log("[scripts.js] ScriptTag ya existe.");
  }
  return true;
}
