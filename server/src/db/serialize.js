function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function serializeTool(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    homepage: row.homepage,
    repoUrl: row.repo_url,
    license: row.license,
    platforms: splitList(row.platforms),
    tags: splitList(row.tags),
    stars: row.stars,
    createdAt: row.created_at,
  };
}

export function serializeModel(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    family: row.family,
    publisher: row.publisher,
    description: row.description,
    parameters: row.parameters,
    quantizations: splitList(row.quantizations),
    contextLength: row.context_len,
    modality: row.modality,
    license: row.license,
    minRamGb: row.min_ram_gb,
    tags: splitList(row.tags),
    downloads: row.downloads,
    createdAt: row.created_at,
  };
}

export function serializeGuide(row, { includeBody = false } = {}) {
  if (!row) return null;
  const guide = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    level: row.level,
    minutes: row.minutes,
    tags: splitList(row.tags),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
  if (includeBody) guide.body = row.body;
  return guide;
}
