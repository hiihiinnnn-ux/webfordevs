export const metadata = { title: "API" };

const endpoints = [
  {
    method: "GET",
    path: "/api/health",
    auth: false,
    desc: "Service health and catalog counts.",
  },
  {
    method: "POST",
    path: "/api/auth/register",
    auth: false,
    desc: "Create an account. Body: email, username, password, displayName?. Sets JWT cookie.",
  },
  {
    method: "POST",
    path: "/api/auth/login",
    auth: false,
    desc: "Log in with email + password. Sets JWT cookie.",
  },
  {
    method: "POST",
    path: "/api/auth/logout",
    auth: false,
    desc: "Clear the session cookie.",
  },
  {
    method: "GET",
    path: "/api/auth/me",
    auth: false,
    desc: "Return the current user or { user: null }.",
  },
  {
    method: "GET",
    path: "/api/catalog/search?q=&type=all|models|tools",
    auth: false,
    desc: "Full-text search across models and tools with filters and facets.",
  },
  {
    method: "GET",
    path: "/api/catalog/models",
    auth: false,
    desc: "List models. Optional ?vendor=&tag=",
  },
  {
    method: "GET",
    path: "/api/catalog/models/:slug",
    auth: false,
    desc: "Fetch one model by slug.",
  },
  {
    method: "GET",
    path: "/api/catalog/tools",
    auth: false,
    desc: "List tools. Optional ?category=&difficulty=",
  },
  {
    method: "GET",
    path: "/api/catalog/tools/:slug",
    auth: false,
    desc: "Fetch one tool by slug.",
  },
  {
    method: "GET",
    path: "/api/guides",
    auth: false,
    desc: "List introductory local-AI guides.",
  },
  {
    method: "GET",
    path: "/api/guides/:slug",
    auth: false,
    desc: "Fetch guide content.",
  },
  {
    method: "GET",
    path: "/api/favorites",
    auth: true,
    desc: "List the signed-in user's saved models and tools.",
  },
  {
    method: "POST",
    path: "/api/favorites",
    auth: true,
    desc: "Save an item. Body: { itemType: 'model'|'tool', itemId }.",
  },
  {
    method: "DELETE",
    path: "/api/favorites?itemType=&itemId=",
    auth: true,
    desc: "Remove a saved item.",
  },
];

export default function ApiDocsPage() {
  return (
    <div className="shell">
      <div className="page-hero">
        <h1>REST API</h1>
        <p className="section-lead">
          Localbench exposes JSON endpoints for auth, catalog search, guides, and favorites. Auth
          uses an HTTP-only JWT cookie named <code className="inline-code">localbench_token</code>.
        </p>
      </div>

      <pre className="code-block">{`curl -s http://localhost:3000/api/health | jq
curl -s 'http://localhost:3000/api/catalog/search?q=ollama&type=tools' | jq
curl -s -X POST http://localhost:3000/api/auth/login \\
  -H 'content-type: application/json' \\
  -d '{"email":"dev@localbench.dev","password":"demo1234"}' \\
  -c cookies.txt
curl -s http://localhost:3000/api/favorites -b cookies.txt | jq`}</pre>

      <table className="api-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Auth</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((ep) => (
            <tr key={`${ep.method}-${ep.path}`}>
              <td>
                <code>{ep.method}</code>
              </td>
              <td>
                <code>{ep.path}</code>
              </td>
              <td>{ep.auth ? "Required" : "Public"}</td>
              <td>{ep.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
