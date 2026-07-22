import { parseJsonTags } from "./validators";

export type CatalogModel = {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  description: string;
  sizeParams: string | null;
  license: string | null;
  contextLength: number | null;
  tags: string[];
  hardwareMin: string | null;
  ollamaName: string | null;
  hfUrl: string | null;
  useCases: string[];
  type: "model";
};

export type CatalogTool = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  website: string | null;
  github: string | null;
  platforms: string[];
  tags: string[];
  difficulty: string;
  type: "tool";
};

export function serializeModel(model: {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  description: string;
  sizeParams: string | null;
  license: string | null;
  contextLength: number | null;
  tags: string;
  hardwareMin: string | null;
  ollamaName: string | null;
  hfUrl: string | null;
  useCases: string;
}): CatalogModel {
  return {
    id: model.id,
    slug: model.slug,
    name: model.name,
    vendor: model.vendor,
    description: model.description,
    sizeParams: model.sizeParams,
    license: model.license,
    contextLength: model.contextLength,
    tags: parseJsonTags(model.tags),
    hardwareMin: model.hardwareMin,
    ollamaName: model.ollamaName,
    hfUrl: model.hfUrl,
    useCases: parseJsonTags(model.useCases),
    type: "model",
  };
}

export function serializeTool(tool: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  website: string | null;
  github: string | null;
  platforms: string;
  tags: string;
  difficulty: string;
}): CatalogTool {
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    category: tool.category,
    description: tool.description,
    website: tool.website,
    github: tool.github,
    platforms: parseJsonTags(tool.platforms),
    tags: parseJsonTags(tool.tags),
    difficulty: tool.difficulty,
    type: "tool",
  };
}

export function matchesQuery(haystack: string, q: string) {
  if (!q.trim()) return true;
  return haystack.toLowerCase().includes(q.trim().toLowerCase());
}
