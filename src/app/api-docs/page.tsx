import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API",
  description: "HTTP API reference for Ember's local AI catalog and auth.",
};

const endpoints = [
  {
    method: "POST",
    path: "/api/auth/register",
    detail: "Create an account. Body: { name, email, password }. Sets session cookie.",
  },
  {
    method: "POST",
    path: "/api/auth/login",
    detail: "Log in. Body: { email, password }. Sets HTTP-only JWT cookie.",
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    detail: "Clear the session cookie.",
  },
  {
    method: "GET",
    path: "/api/auth/me",
    detail: "Return the current user or 401.",
  },
  {
    method: "PATCH",
    path: "/api/auth/profile",
    detail: "Update name/bio for the signed-in user.",
  },
  {
    method: "GET",
    path: "/api/tools",
    detail: "List/search tools. Query: q, category, difficulty, featured, limit, offset.",
  },
  {
    method: "GET",
    path: "/api/tools/:slug",
    detail: "Fetch one tool by slug.",
  },
  {
    method: "GET",
    path: "/api/models",
    detail: "List/search models. Query: q, family, maxRam, featured, limit, offset.",
  },
  {
    method: "GET",
    path: "/api/models/:slug",
    detail: "Fetch one model by slug.",
  },
  {
    method: "GET",
    path: "/api/search",
    detail: "Unified search across tools, models, and guides. Query: q, type, limit.",
  },
  {
    method: "GET",
    path: "/api/guides",
    detail: "List learning guides.",
  },
  {
    method: "GET",
    path: "/api/guides/:slug",
    detail: "Fetch guide content by slug.",
  },
  {
    method: "GET|POST|DELETE",
    path: "/api/bookmarks",
    detail: "Manage per-user bookmarks. Auth required. POST body: { toolId } or { modelId }.",
  },
  {
    method: "GET",
    path: "/api/stats",
    detail: "Catalog counts plus category/family facets.",
  },
];

export default function ApiDocsPage() {
  return (
    <div className="shell api-docs">
      <div className="page-head">
        <h1>HTTP API</h1>
        <p>
          Ember&apos;s backend is a set of JSON route handlers. Use these from
          the UI, curl, or your own scripts while you explore local AI.
        </p>
      </div>

      <pre>
        <code>{`curl -s 'http://localhost:3000/api/search?q=ollama' | jq
curl -s -X POST http://localhost:3000/api/auth/login \\
  -H 'content-type: application/json' \\
  -d '{"email":"dev@ember.local","password":"password123"}' -c cookies.txt
curl -s http://localhost:3000/api/bookmarks -b cookies.txt | jq`}</code>
      </pre>

      <table className="api-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((endpoint) => (
            <tr key={endpoint.path + endpoint.method}>
              <td>
                <code>{endpoint.method}</code>
              </td>
              <td>
                <code>{endpoint.path}</code>
              </td>
              <td className="muted">{endpoint.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cta-row">
        <Link href="/explore" className="btn primary">
          Try search in the UI
        </Link>
        <Link href="/register" className="btn ghost">
          Create an account
        </Link>
      </div>
    </div>
  );
}
