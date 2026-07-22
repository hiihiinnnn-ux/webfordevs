/* localai.dev — SPA frontend. Vanilla JS, no build step. */

// ---------- API client ----------
const api = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),

  async request(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const res = await fetch(`/api${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.details = data.details;
      throw err;
    }
    return data;
  },

  setSession(token, user) {
    this.token = token; this.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    renderNavAuth();
  },
  clearSession() {
    this.token = null; this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    renderNavAuth();
  },
};

// ---------- Helpers ----------
const $app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.hidden = true), 2600);
}

function navigate(path) {
  history.pushState(null, "", path);
  route();
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link], [data-nav]");
  if (!a) return;
  e.preventDefault();
  navigate(a.getAttribute("href") || a.dataset.nav);
});
window.addEventListener("popstate", route);

// Minimal markdown renderer (headings, code, tables, lists, links, bold, inline code)
function renderMarkdown(md) {
  const lines = md.split("\n");
  let html = "", inCode = false, inList = false, inTable = false;

  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) =>
        u.startsWith("/") ? `<a href="${u}" data-link>${t}</a>` : `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);

  const closeBlocks = () => {
    if (inList) { html += "</ul>"; inList = false; }
    if (inTable) { html += "</tbody></table>"; inTable = false; }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) { html += "</code></pre>"; inCode = false; }
      else { closeBlocks(); html += "<pre><code>"; inCode = true; }
      continue;
    }
    if (inCode) { html += esc(line) + "\n"; continue; }

    if (/^\|/.test(line)) {
      const cells = line.slice(1, -1).split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue; // separator row
      if (!inTable) {
        closeBlocks();
        html += `<table><thead><tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>`;
        inTable = true;
      } else {
        html += `<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`;
      }
      continue;
    }
    if (inTable) { html += "</tbody></table>"; inTable = false; }

    if (/^### /.test(line)) { closeBlocks(); html += `<h3>${inline(line.slice(4))}</h3>`; }
    else if (/^## /.test(line)) { closeBlocks(); html += `<h2>${inline(line.slice(3))}</h2>`; }
    else if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^([-*]|\d+\.) /, ""))}</li>`;
    }
    else if (/^> /.test(line)) { closeBlocks(); html += `<blockquote>${inline(line.slice(2))}</blockquote>`; }
    else if (line.trim() === "") { closeBlocks(); }
    else { closeBlocks(); html += `<p>${inline(line)}</p>`; }
  }
  if (inCode) html += "</code></pre>";
  if (inList) html += "</ul>";
  if (inTable) html += "</tbody></table>";
  return html;
}

// ---------- Favorites ----------
let favoriteKeys = new Set();

async function loadFavorites() {
  favoriteKeys = new Set();
  if (!api.token) return;
  try {
    const { items } = await api.request("/favorites");
    for (const f of items) favoriteKeys.add(`${f.item_type}:${f.item.id}`);
  } catch { /* token may be stale */ }
}

async function toggleFavorite(type, id, btn) {
  if (!api.token) { toast("Sign in to save favorites"); navigate("/login"); return; }
  const key = `${type}:${id}`;
  try {
    if (favoriteKeys.has(key)) {
      await api.request(`/favorites/${type}/${id}`, { method: "DELETE" });
      favoriteKeys.delete(key);
      btn.classList.remove("on");
      btn.textContent = "☆";
    } else {
      await api.request("/favorites", { method: "POST", body: { item_type: type, item_id: id } });
      favoriteKeys.add(key);
      btn.classList.add("on");
      btn.textContent = "★";
      toast("Added to your favorites");
    }
  } catch (e) { toast(e.message); }
}

function favBtn(type, id) {
  const on = favoriteKeys.has(`${type}:${id}`);
  return `<button class="fav-btn ${on ? "on" : ""}" data-fav="${type}:${id}" title="Favorite">${on ? "★" : "☆"}</button>`;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-fav]");
  if (!btn) return;
  e.preventDefault(); e.stopPropagation();
  const [type, id] = btn.dataset.fav.split(":");
  toggleFavorite(type, Number(id), btn);
});

// ---------- Nav auth state ----------
function renderNavAuth() {
  const el = document.getElementById("nav-auth");
  if (api.user) {
    el.innerHTML = `
      <span class="nav-user">hey, <b>${esc(api.user.username)}</b></span>
      <a class="btn btn-sm" href="/dashboard" data-link>Dashboard</a>
      <button class="btn btn-sm btn-ghost" id="logout-btn">Log out</button>`;
    el.querySelector("#logout-btn").onclick = () => { api.clearSession(); favoriteKeys.clear(); toast("Logged out"); navigate("/"); };
  } else {
    el.innerHTML = `
      <a class="btn btn-sm btn-ghost" href="/login" data-link>Log in</a>
      <a class="btn btn-sm btn-primary" href="/register" data-link>Sign up</a>`;
  }
}

function setActiveNav(path) {
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href !== "/" && path.startsWith(href));
  });
}

// ---------- Card renderers ----------
function modelCard(m) {
  return `
  <div class="card" data-nav="/models/${esc(m.slug)}">
    <div class="card-top">
      <h3>${esc(m.name)}</h3>
      ${favBtn("model", m.id)}
    </div>
    <div class="tag-row">
      <span class="badge">${esc(m.type)}</span>
      <span class="badge gray">${esc(m.license)}</span>
    </div>
    <p class="desc">${esc(m.description)}</p>
    <div class="card-meta">
      ${m.params_b ? `<span>${m.params_b}B params</span>` : ""}
      ${m.context_window ? `<span>${(m.context_window / 1024).toFixed(0)}k ctx</span>` : ""}
      <span>${m.min_vram_gb > 0 ? `${m.min_vram_gb}GB VRAM` : "CPU OK"}</span>
    </div>
  </div>`;
}

function toolCard(t) {
  const diffColor = { beginner: "green", intermediate: "orange", advanced: "" }[t.difficulty] || "";
  return `
  <div class="card" data-nav="/tools/${esc(t.slug)}">
    <div class="card-top">
      <h3>${esc(t.name)}</h3>
      ${favBtn("tool", t.id)}
    </div>
    <div class="tag-row">
      <span class="badge orange">${esc(t.category)}</span>
      <span class="badge ${diffColor}">${esc(t.difficulty)}</span>
    </div>
    <p class="desc">${esc(t.description)}</p>
    <div class="card-meta">
      ${t.language ? `<span>${esc(t.language)}</span>` : ""}
      <span>${(t.platforms || []).join(" · ")}</span>
    </div>
  </div>`;
}

function guideCard(g) {
  return `
  <div class="card" data-nav="/guides/${esc(g.slug)}">
    <div class="card-top">
      <h3>${esc(g.title)}</h3>
      ${favBtn("guide", g.id)}
    </div>
    <div class="tag-row">
      <span class="badge green">${esc(g.level)}</span>
      <span class="badge gray">${g.minutes} min read</span>
    </div>
    <p class="desc">${esc(g.summary)}</p>
  </div>`;
}

// ---------- Pages ----------
async function pageHome() {
  const [models, tools, guides] = await Promise.all([
    api.request("/models?limit=100"),
    api.request("/tools?limit=100"),
    api.request("/guides"),
  ]);
  const starters = models.items.filter((m) => (m.tags || []).includes("starter")).slice(0, 3);
  const starterTools = tools.items.filter((t) => (t.tags || []).includes("starter")).slice(0, 3);

  $app.innerHTML = `
  <section class="hero">
    <h1>Run AI on <span class="grad">your own machine</span>.<br>No API keys required.</h1>
    <p>An introduction to local AI for developers. Learn the concepts, find models that fit your hardware, and pick the right tools — all in one place.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/guides/what-is-local-ai" data-link>Start learning</a>
      <a class="btn" href="/models" data-link>Browse models</a>
      <a class="btn" href="/register" data-link>Create account</a>
    </div>
    <div class="hero-terminal">
      <div class="term-bar">terminal — your laptop, 30 seconds from now</div>
      <pre><span class="term-c"># install a runtime, pull a model, chat. that's it.</span>
<span class="term-p">$</span> curl -fsSL https://ollama.com/install.sh | sh
<span class="term-p">$</span> ollama run llama3.1
<span class="term-o">>>> Why would a dev want to run models locally?
Privacy, zero marginal cost, offline use, and full
control over versions. Also: it's just fun.</span></pre>
    </div>
    <div class="stats-row">
      <div class="stat"><div class="num">${models.pagination.total}</div><div class="lbl">models catalogued</div></div>
      <div class="stat"><div class="num">${tools.pagination.total}</div><div class="lbl">tools reviewed</div></div>
      <div class="stat"><div class="num">${guides.pagination.total}</div><div class="lbl">hands-on guides</div></div>
      <div class="stat"><div class="num">0</div><div class="lbl">API keys needed</div></div>
    </div>
  </section>

  <h2 class="section-title">Why local? <small>the developer case</small></h2>
  <div class="feature-grid">
    <div class="feature"><div class="icon">🔒</div><h3>Private by default</h3><p>Your prompts, code and documents never leave your machine. Work on things you could never paste into a cloud chat.</p></div>
    <div class="feature"><div class="icon">💸</div><h3>Zero marginal cost</h3><p>Iterate on prompts and agents all day. No usage meter, no rate limits, no surprise bill at the end of the month.</p></div>
    <div class="feature"><div class="icon">✈️</div><h3>Works offline</h3><p>No network round-trips. Your coding copilot works on a plane, on a train, and in the middle of an outage.</p></div>
    <div class="feature"><div class="icon">🎛️</div><h3>Total control</h3><p>Pin exact model versions forever. No deprecations, no silent behavior changes, no terms-of-service updates.</p></div>
  </div>

  <h2 class="section-title">Good first models <small>runs on modest hardware</small></h2>
  <div class="grid">${starters.map(modelCard).join("")}</div>

  <h2 class="section-title">Good first tools <small>beginner friendly</small></h2>
  <div class="grid">${starterTools.map(toolCard).join("")}</div>

  <h2 class="section-title">The learning path <small>in order</small></h2>
  <div class="grid">${guides.items.slice(0, 6).map(guideCard).join("")}</div>`;
}

async function pageModels(query = {}) {
  const facets = await api.request("/models/facets");
  const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v));
  const data = await api.request(`/models?${params}`);

  const opt = (list, sel) =>
    list.map((f) => `<option value="${esc(f.value)}" ${f.value === sel ? "selected" : ""}>${esc(f.value)} (${f.count})</option>`).join("");

  $app.innerHTML = `
  <div class="page-head">
    <h1>Model catalog</h1>
    <p>Open-weights models you can run yourself. Filter by task, license, or what your hardware can handle.</p>
  </div>
  <div class="filter-bar">
    <div class="grow-2"><label>Search</label><input id="f-q" placeholder="e.g. coding, reasoning, apache" value="${esc(query.q || "")}" /></div>
    <div><label>Type</label><select id="f-type"><option value="">All types</option>${opt(facets.types, query.type)}</select></div>
    <div><label>Family</label><select id="f-family"><option value="">All families</option>${opt(facets.families, query.family)}</select></div>
    <div><label>Max VRAM (GB)</label><input id="f-vram" type="number" min="0" placeholder="e.g. 8" value="${esc(query.max_vram_gb || "")}" /></div>
    <div><label>Sort</label><select id="f-sort">
      <option value="name">Name</option>
      <option value="params_asc" ${query.sort === "params_asc" ? "selected" : ""}>Smallest first</option>
      <option value="params_desc" ${query.sort === "params_desc" ? "selected" : ""}>Largest first</option>
    </select></div>
    <div style="flex:0"><button class="btn btn-primary" id="f-apply">Apply</button></div>
  </div>
  ${data.items.length
    ? `<div class="grid">${data.items.map(modelCard).join("")}</div>`
    : `<div class="empty">No models match those filters. Try relaxing the VRAM limit or clearing the search.</div>`}
  ${renderPagination(data.pagination, (page) => pageModels({ ...query, page }))}`;

  const apply = () => pageModels({
    q: document.getElementById("f-q").value.trim(),
    type: document.getElementById("f-type").value,
    family: document.getElementById("f-family").value,
    max_vram_gb: document.getElementById("f-vram").value,
    sort: document.getElementById("f-sort").value,
  });
  document.getElementById("f-apply").onclick = apply;
  document.getElementById("f-q").onkeydown = (e) => e.key === "Enter" && apply();
}

async function pageModelDetail(slug) {
  const m = await api.request(`/models/${slug}`);
  $app.innerHTML = `
  <a class="back-link" href="/models" data-link>← All models</a>
  <div class="detail-head">
    <div>
      <h1>${esc(m.name)}</h1>
      <div class="tag-row" style="margin-top:8px">
        <span class="badge">${esc(m.type)}</span>
        <span class="badge gray">${esc(m.family)} family</span>
        <span class="badge orange">${esc(m.license)}</span>
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      ${favBtn("model", m.id)}
      <span class="badge gray">★ ${m.favorites_count} favorites</span>
    </div>
  </div>
  <p style="max-width:720px;color:var(--text-dim);font-size:15.5px">${esc(m.description)}</p>
  <div class="spec-grid">
    ${m.params_b ? `<div class="spec"><div class="k">Parameters</div><div class="v">${m.params_b}B</div></div>` : ""}
    ${m.context_window ? `<div class="spec"><div class="k">Context window</div><div class="v">${m.context_window.toLocaleString()}</div></div>` : ""}
    <div class="spec"><div class="k">Min RAM</div><div class="v">${m.min_ram_gb} GB</div></div>
    <div class="spec"><div class="k">Min VRAM</div><div class="v">${m.min_vram_gb > 0 ? `${m.min_vram_gb} GB` : "None (CPU)"}</div></div>
    <div class="spec"><div class="k">Quantizations</div><div class="v" style="font-size:13px">${(m.quantizations || []).join(", ")}</div></div>
  </div>
  <div class="tag-row">${(m.tags || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}</div>
  ${m.homepage ? `<p style="margin-top:20px"><a href="${esc(m.homepage)}" target="_blank" rel="noopener">Official homepage ↗</a></p>` : ""}`;
}

async function pageTools(query = {}) {
  const facets = await api.request("/tools/facets");
  const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v));
  const data = await api.request(`/tools?${params}`);

  const opt = (list, sel) =>
    list.map((f) => `<option value="${esc(f.value)}" ${f.value === sel ? "selected" : ""}>${esc(f.value)} (${f.count})</option>`).join("");

  $app.innerHTML = `
  <div class="page-head">
    <h1>Tool directory</h1>
    <p>Runtimes, servers, UIs, IDE extensions and frameworks for running AI locally — rated by how beginner-friendly they are.</p>
  </div>
  <div class="filter-bar">
    <div class="grow-2"><label>Search</label><input id="f-q" placeholder="e.g. openai api, rag, vscode" value="${esc(query.q || "")}" /></div>
    <div><label>Category</label><select id="f-cat"><option value="">All categories</option>${opt(facets.categories, query.category)}</select></div>
    <div><label>Difficulty</label><select id="f-diff"><option value="">Any difficulty</option>${opt(facets.difficulties, query.difficulty)}</select></div>
    <div style="flex:0"><button class="btn btn-primary" id="f-apply">Apply</button></div>
  </div>
  ${data.items.length
    ? `<div class="grid">${data.items.map(toolCard).join("")}</div>`
    : `<div class="empty">No tools match those filters.</div>`}`;

  const apply = () => pageTools({
    q: document.getElementById("f-q").value.trim(),
    category: document.getElementById("f-cat").value,
    difficulty: document.getElementById("f-diff").value,
  });
  document.getElementById("f-apply").onclick = apply;
  document.getElementById("f-q").onkeydown = (e) => e.key === "Enter" && apply();
}

async function pageToolDetail(slug) {
  const t = await api.request(`/tools/${slug}`);
  $app.innerHTML = `
  <a class="back-link" href="/tools" data-link>← All tools</a>
  <div class="detail-head">
    <div>
      <h1>${esc(t.name)}</h1>
      <div class="tag-row" style="margin-top:8px">
        <span class="badge orange">${esc(t.category)}</span>
        <span class="badge green">${esc(t.difficulty)}</span>
        ${t.language ? `<span class="badge gray">${esc(t.language)}</span>` : ""}
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center">
      ${favBtn("tool", t.id)}
      <span class="badge gray">★ ${t.favorites_count} favorites</span>
    </div>
  </div>
  <p style="max-width:720px;color:var(--text-dim);font-size:15.5px">${esc(t.description)}</p>
  <div class="spec-grid">
    <div class="spec"><div class="k">Platforms</div><div class="v" style="font-size:13px">${(t.platforms || []).join(", ")}</div></div>
    <div class="spec"><div class="k">GPU support</div><div class="v" style="font-size:13px">${(t.gpu_support || []).join(", ")}</div></div>
  </div>
  <div class="tag-row">${(t.tags || []).map((x) => `<span class="tag">#${esc(x)}</span>`).join("")}</div>
  ${t.repo_url ? `<p style="margin-top:20px"><a href="${esc(t.repo_url)}" target="_blank" rel="noopener">Repository / website ↗</a></p>` : ""}`;
}

async function pageGuides(level = "") {
  const data = await api.request(`/guides${level ? `?level=${level}` : ""}`);
  const levels = ["", "beginner", "intermediate", "advanced"];
  $app.innerHTML = `
  <div class="page-head">
    <h1>Guides</h1>
    <p>A hands-on curriculum for going from "what is local AI?" to serving models in production. Read them in order or jump to what you need.</p>
  </div>
  <div class="pill-row">
    ${levels.map((l) => `<button class="pill ${l === level ? "on" : ""}" data-level="${l}">${l || "all"}</button>`).join("")}
  </div>
  <div class="grid">${data.items.map(guideCard).join("")}</div>`;
  document.querySelectorAll("[data-level]").forEach((b) => (b.onclick = () => pageGuides(b.dataset.level)));
}

async function pageGuideDetail(slug) {
  const g = await api.request(`/guides/${slug}`);
  $app.innerHTML = `
  <a class="back-link" href="/guides" data-link>← All guides</a>
  <div class="detail-head">
    <div>
      <h1 style="max-width:760px">${esc(g.title)}</h1>
      <div class="tag-row" style="margin-top:8px">
        <span class="badge green">${esc(g.level)}</span>
        <span class="badge gray">${g.minutes} min read</span>
        ${(g.tags || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}
      </div>
    </div>
    ${favBtn("guide", g.id)}
  </div>
  <article class="md">${renderMarkdown(g.body)}</article>`;
  window.scrollTo(0, 0);
}

async function pageSearch(q = "") {
  $app.innerHTML = `
  <div class="page-head">
    <h1>Search everything</h1>
    <p>Full-text search across models, tools and guides, ranked by relevance (SQLite FTS5 + BM25 under the hood).</p>
  </div>
  <div class="search-box">
    <input id="s-q" placeholder="Try: coding copilot, quantization, rag, apache license…" value="${esc(q)}" autofocus />
    <button class="btn btn-primary" id="s-go">Search</button>
  </div>
  <div id="s-results"></div>`;

  const input = document.getElementById("s-q");
  const results = document.getElementById("s-results");

  async function run() {
    const query = input.value.trim();
    if (!query) { results.innerHTML = ""; return; }
    history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`);
    results.innerHTML = `<div class="empty">Searching…</div>`;
    try {
      const data = await api.request(`/search?q=${encodeURIComponent(query)}`);
      if (!data.results.length) {
        results.innerHTML = `<div class="empty">Nothing found for “${esc(query)}”. Try fewer or different words.</div>`;
        return;
      }
      results.innerHTML = data.results.map((r) => {
        const url = r.kind === "model" ? `/models/${r.item.slug}` : r.kind === "tool" ? `/tools/${r.item.slug}` : `/guides/${r.item.slug}`;
        const title = r.item.name || r.item.title;
        return `
        <div class="result-row" data-nav="${url}">
          <span class="kind kind-${r.kind}">${r.kind}</span>
          <div>
            <div style="font-weight:600">${esc(title)}</div>
            <div class="snippet">${r.snippet}</div>
          </div>
        </div>`;
      }).join("");
    } catch (e) { results.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  }

  document.getElementById("s-go").onclick = run;
  input.onkeydown = (e) => e.key === "Enter" && run();
  if (q) run();
}

function pageLogin() {
  $app.innerHTML = `
  <div class="auth-card">
    <h1>Welcome back</h1>
    <p class="sub">Log in to access your favorites and hardware profile.</p>
    <div class="form-row"><label>Username or email</label><input id="l-id" autocomplete="username" /></div>
    <div class="form-row"><label>Password</label><input id="l-pw" type="password" autocomplete="current-password" /></div>
    <button class="btn btn-primary" id="l-go" style="width:100%">Log in</button>
    <div class="form-error" id="l-err"></div>
    <div class="auth-switch">No account yet? <a href="/register" data-link>Sign up free</a></div>
  </div>`;

  const go = async () => {
    const err = document.getElementById("l-err");
    err.textContent = "";
    try {
      const data = await api.request("/auth/login", {
        method: "POST",
        body: { identifier: document.getElementById("l-id").value.trim(), password: document.getElementById("l-pw").value },
      });
      api.setSession(data.token, data.user);
      await loadFavorites();
      toast(`Welcome back, ${data.user.username}!`);
      navigate("/dashboard");
    } catch (e) { err.textContent = e.message; }
  };
  document.getElementById("l-go").onclick = go;
  document.getElementById("l-pw").onkeydown = (e) => e.key === "Enter" && go();
}

function pageRegister() {
  $app.innerHTML = `
  <div class="auth-card">
    <h1>Create your account</h1>
    <p class="sub">Save favorite models &amp; tools, and get recommendations matched to your hardware.</p>
    <div class="form-row"><label>Username</label><input id="r-user" autocomplete="username" placeholder="3-30 chars, letters/numbers/-/_" /></div>
    <div class="form-row"><label>Email</label><input id="r-email" type="email" autocomplete="email" /></div>
    <div class="form-row"><label>Password</label><input id="r-pw" type="password" autocomplete="new-password" placeholder="at least 8 characters" /></div>
    <button class="btn btn-primary" id="r-go" style="width:100%">Sign up</button>
    <div class="form-error" id="r-err"></div>
    <div class="auth-switch">Already registered? <a href="/login" data-link>Log in</a></div>
  </div>`;

  const go = async () => {
    const err = document.getElementById("r-err");
    err.textContent = "";
    try {
      const data = await api.request("/auth/register", {
        method: "POST",
        body: {
          username: document.getElementById("r-user").value.trim(),
          email: document.getElementById("r-email").value.trim(),
          password: document.getElementById("r-pw").value,
        },
      });
      api.setSession(data.token, data.user);
      toast(`Welcome to localai.dev, ${data.user.username}!`);
      navigate("/dashboard");
    } catch (e) {
      err.textContent = e.details ? Object.values(e.details).flat().join(" ") : e.message;
    }
  };
  document.getElementById("r-go").onclick = go;
  document.getElementById("r-pw").onkeydown = (e) => e.key === "Enter" && go();
}

async function pageDashboard() {
  if (!api.token) { navigate("/login"); return; }
  let me;
  try { me = (await api.request("/auth/me")).user; }
  catch { api.clearSession(); navigate("/login"); return; }

  const favs = await api.request("/favorites");
  favoriteKeys = new Set(favs.items.map((f) => `${f.item_type}:${f.item.id}`));
  const hw = me.hardware || {};

  $app.innerHTML = `
  <div class="page-head">
    <h1>Your dashboard</h1>
    <p>Signed up ${esc(me.created_at)} UTC · ${esc(me.email)}</p>
  </div>

  <h2 class="section-title" style="margin-top:10px">Hardware profile <small>used for recommendations</small></h2>
  <div class="filter-bar">
    <div><label>System RAM (GB)</label><input id="hw-ram" type="number" min="0" value="${hw.ram_gb ?? ""}" placeholder="e.g. 16" /></div>
    <div><label>GPU VRAM (GB)</label><input id="hw-vram" type="number" min="0" value="${hw.vram_gb ?? ""}" placeholder="0 if no GPU" /></div>
    <div class="grow-2"><label>GPU model (optional)</label><input id="hw-gpu" value="${esc(hw.gpu ?? "")}" placeholder="e.g. RTX 3060 12GB / M2 Pro" /></div>
    <div style="flex:0"><button class="btn btn-primary" id="hw-save">Save</button></div>
  </div>

  <div id="reco"></div>

  <h2 class="section-title">Your favorites <small>${favs.items.length} saved</small></h2>
  ${favs.items.length
    ? `<div class="grid">${favs.items.map((f) =>
        f.item_type === "model" ? modelCard(f.item) : f.item_type === "tool" ? toolCard(f.item) : guideCard(f.item)
      ).join("")}</div>`
    : `<div class="empty">Nothing saved yet. Hit the ☆ on any model, tool or guide to keep it here.</div>`}`;

  document.getElementById("hw-save").onclick = async () => {
    try {
      const body = {
        hardware: {
          ram_gb: Number(document.getElementById("hw-ram").value) || null,
          vram_gb: document.getElementById("hw-vram").value === "" ? null : Number(document.getElementById("hw-vram").value),
          gpu: document.getElementById("hw-gpu").value.trim() || null,
        },
      };
      const data = await api.request("/auth/me", { method: "PATCH", body });
      api.setSession(api.token, data.user);
      toast("Hardware profile saved");
      loadRecommendations();
    } catch (e) { toast(e.message); }
  };

  async function loadRecommendations() {
    const el = document.getElementById("reco");
    try {
      const r = await api.request("/recommend");
      el.innerHTML = `
      <h2 class="section-title">Recommended for your machine <small>${esc(r.hardware.tier)}</small></h2>
      <div class="grid">${r.models.slice(0, 6).map(modelCard).join("")}</div>`;
    } catch {
      el.innerHTML = `
      <h2 class="section-title">Recommended for your machine</h2>
      <div class="empty">Save your hardware profile above to get model recommendations that actually fit your RAM/VRAM.</div>`;
    }
  }
  loadRecommendations();
}

function pageNotFound() {
  $app.innerHTML = `<div class="empty" style="padding:100px 0">
    <h1 style="font-size:60px">404</h1>
    <p>That page doesn't exist. <a href="/" data-link>Back home</a></p>
  </div>`;
}

// ---------- Router ----------
async function route() {
  const path = location.pathname;
  const search = new URLSearchParams(location.search);
  setActiveNav(path);
  $app.innerHTML = `<div class="empty">Loading…</div>`;

  try {
    if (path === "/") await pageHome();
    else if (path === "/models") await pageModels(Object.fromEntries(search));
    else if (path.startsWith("/models/")) await pageModelDetail(path.split("/")[2]);
    else if (path === "/tools") await pageTools(Object.fromEntries(search));
    else if (path.startsWith("/tools/")) await pageToolDetail(path.split("/")[2]);
    else if (path === "/guides") await pageGuides();
    else if (path.startsWith("/guides/")) await pageGuideDetail(path.split("/")[2]);
    else if (path === "/search") await pageSearch(search.get("q") || "");
    else if (path === "/login") pageLogin();
    else if (path === "/register") pageRegister();
    else if (path === "/dashboard") await pageDashboard();
    else pageNotFound();
  } catch (e) {
    if (e.status === 404) pageNotFound();
    else $app.innerHTML = `<div class="empty">Something went wrong: ${esc(e.message)}</div>`;
  }
}

// ---------- Boot ----------
renderNavAuth();
loadFavorites().then(route);
