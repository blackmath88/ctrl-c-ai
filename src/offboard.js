/**
 * ctrl-c-ai
 * Clipboard-mediated handoff primitives.
 * No dependencies. No provider SDK. No hidden transport.
 */

export async function copyText(text) {
  const value = String(text ?? "");

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return { ok: true, method: "clipboard" };
    } catch (_) {
      // Fall through to the visible legacy fallback.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const ok = document.execCommand("copy");
    return { ok, method: "execCommand" };
  } finally {
    textarea.remove();
  }
}

export function toJSON(payload, spacing = 2) {
  return JSON.stringify(payload, null, spacing);
}

export function toMarkdown(payload) {
  if (payload == null) return "";
  if (typeof payload !== "object") return String(payload);

  return Object.entries(payload)
    .map(([key, value]) => {
      const heading = key
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

      if (Array.isArray(value)) {
        return `## ${heading}\n${value.map(item => `- ${formatScalar(item)}`).join("\n")}`;
      }

      if (value && typeof value === "object") {
        return `## ${heading}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
      }

      return `## ${heading}\n${formatScalar(value)}`;
    })
    .join("\n\n");
}

export function composePrompt({ context, task, output }) {
  return [
    "# Context",
    typeof context === "string" ? context : toMarkdown(context),
    "",
    "# Task",
    task || "Review this context and identify what matters.",
    output ? `\n# Return\n${output}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export async function offboard({
  payload,
  transform = value => String(value ?? ""),
  label = "payload"
}) {
  const text = transform(payload);
  const result = await copyText(text);

  return {
    ...result,
    label,
    text,
    characters: text.length
  };
}

export async function copyAndOpen({
  payload,
  transform = value => String(value ?? ""),
  url
}) {
  const result = await offboard({ payload, transform });

  if (result.ok && url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return result;
}

function formatScalar(value) {
  if (value == null || value === "") return "Not specified";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
