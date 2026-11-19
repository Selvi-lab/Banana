export function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}
