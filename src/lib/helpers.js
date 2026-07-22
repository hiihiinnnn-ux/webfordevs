/** Parse the JSON-array columns of a DB row into real arrays/objects. */
export function hydrate(row, jsonFields) {
  if (!row) return row;
  const out = { ...row };
  for (const f of jsonFields) {
    if (typeof out[f] === "string") {
      try {
        out[f] = JSON.parse(out[f]);
      } catch {
        out[f] = null;
      }
    }
  }
  return out;
}

export const MODEL_JSON_FIELDS = ["quantizations", "tags"];
export const TOOL_JSON_FIELDS = ["gpu_support", "platforms", "tags"];
export const GUIDE_JSON_FIELDS = ["tags"];

export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  return { limit, page, offset: (page - 1) * limit };
}

/** Wrap async route handlers so rejections reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Escape user input for use inside an FTS5 MATCH expression (quoted-phrase-per-word, prefix match on the last word). */
export function toFtsQuery(raw) {
  const words = raw
    .split(/\s+/)
    .map((w) => w.replace(/"/g, ""))
    .filter(Boolean);
  if (words.length === 0) return null;
  return words.map((w, i) => (i === words.length - 1 ? `"${w}"*` : `"${w}"`)).join(" ");
}
