import sanitizeHtml from "sanitize-html";

/**
 * Sanitización estricta contra XSS: elimina TODO el HTML (etiquetas, atributos, scripts)
 * y caracteres de control. Se aplica a cualquier texto libre que ingresa el usuario.
 */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (typeof input !== "string") return "";
  const stripped = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
    nonTextTags: ["script", "style", "textarea", "noscript", "iframe", "object"],
  });
  return stripped
    .replace(/&lt;|&gt;|[<>]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLength);
}

/** Escapa texto para insertarlo en HTML (correos). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
