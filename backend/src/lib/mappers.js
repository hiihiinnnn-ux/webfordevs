export function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapTool(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    longDescription: row.long_description,
    websiteUrl: row.website_url,
    githubUrl: row.github_url,
    installHint: row.install_hint,
    tags: parseJsonArray(row.tags),
    platforms: parseJsonArray(row.platforms),
    difficulty: row.difficulty,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
  };
}

export function mapModel(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    family: row.family,
    description: row.description,
    longDescription: row.long_description,
    parameterSize: row.parameter_size,
    quantization: row.quantization,
    contextLength: row.context_length,
    license: row.license,
    useCases: parseJsonArray(row.use_cases),
    formats: parseJsonArray(row.formats),
    minVramGb: row.min_vram_gb,
    ollamaPull: row.ollama_pull,
    huggingfaceUrl: row.huggingface_url,
    tags: parseJsonArray(row.tags),
    featured: Boolean(row.featured),
    createdAt: row.created_at,
  };
}

export function mapGuide(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    level: row.level,
    readingMinutes: row.reading_minutes,
    tags: parseJsonArray(row.tags),
    published: Boolean(row.published),
    createdAt: row.created_at,
  };
}

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio || '',
    createdAt: row.created_at,
  };
}

export function likePattern(query) {
  return `%${String(query).trim().toLowerCase().replace(/[%_]/g, '')}%`;
}
