const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type User = {
  id: number;
  email: string;
  username: string;
  display_name: string | null;
  created_at: string;
};

export type Tool = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  website_url: string | null;
  github_url: string | null;
  tags: string;
  difficulty: string;
};

export type Model = {
  id: number;
  slug: string;
  name: string;
  provider: string;
  parameter_size: string | null;
  context_length: string | null;
  description: string;
  use_cases: string;
  license: string | null;
  tags: string;
  min_vram_gb: number | null;
};

export type Framework = {
  id: number;
  slug: string;
  name: string;
  language: string;
  description: string;
  website_url: string | null;
  github_url: string | null;
  tags: string;
};

export type GuideList = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  level: string;
  reading_time_minutes: number;
  tags: string;
  order_index: number;
};

export type Guide = GuideList & { content: string };

export type SearchResult = {
  type: "tool" | "model" | "framework" | "guide";
  id: number;
  slug: string;
  title: string;
  summary: string;
  tags: string;
  score: number;
  meta: Record<string, string | number | null>;
};

export type Stats = {
  tools: number;
  models: number;
  frameworks: number;
  guides: number;
  users: number;
};

export type Favorite = {
  id: number;
  item_type: string;
  item_id: number;
  created_at: string;
  item: Record<string, string | null>;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),

  register: (data: { email: string; username: string; password: string; display_name?: string }) =>
    request<User>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error("Invalid email or password");
    return res.json() as Promise<{ access_token: string }>;
  },

  me: (token: string) => request<User>("/api/auth/me", { headers: authHeaders(token) }),

  stats: () => request<Stats>("/api/catalog/stats"),

  search: (q: string, type?: string[]) => {
    const params = new URLSearchParams({ q });
    type?.forEach((t) => params.append("type", t));
    return request<{ query: string; total: number; results: SearchResult[] }>(
      `/api/search?${params}`
    );
  },

  tools: (category?: string) => {
    const params = category ? `?category=${category}` : "";
    return request<Tool[]>(`/api/catalog/tools${params}`);
  },

  models: (provider?: string) => {
    const params = provider ? `?provider=${encodeURIComponent(provider)}` : "";
    return request<Model[]>(`/api/catalog/models${params}`);
  },

  frameworks: () => request<Framework[]>("/api/catalog/frameworks"),

  guides: () => request<GuideList[]>("/api/catalog/guides"),

  guide: (slug: string) => request<Guide>(`/api/catalog/guides/${slug}`),

  favorites: (token: string) =>
    request<Favorite[]>("/api/favorites", { headers: authHeaders(token) }),

  addFavorite: (token: string, item_type: string, item_id: number) =>
    request<Favorite>("/api/favorites", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ item_type, item_id }),
    }),

  removeFavorite: (token: string, id: number) =>
    request<void>(`/api/favorites/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};
