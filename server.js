// Servidor do site Carla Marques CNH
// Serve os arquivos de /public e responde o assistente de IA em POST /api/chat.
// Sem dependências: roda com Node 18+ (usa fetch nativo).

const http = require("http");
const fs = require("fs");
const path = require("path");
const { knowledge, fallbackAnswer } = require("./assistant/knowledge");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

// Limite simples por IP para proteger a chave da API: 20 mensagens a cada 10 minutos.
const hits = new Map();
function allowed(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (list.length >= 20) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}
setInterval(() => hits.clear(), 60 * 60 * 1000).unref();

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...headers,
  });
  res.end(body);
}

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > limit) {
        reject(new Error("too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function askClaude(messages) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 450,
      system: knowledge,
      messages,
    }),
  });
  if (!r.ok) throw new Error("API " + r.status + " " + (await r.text()).slice(0, 200));
  const j = await r.json();
  return (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

async function handleChat(req, res) {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (!allowed(ip)) {
    return send(res, 429, JSON.stringify({ reply: "Você mandou muitas mensagens seguidas. Para continuar agora, fale direto com a Carla no WhatsApp.", source: "limit" }), { "Content-Type": "application/json" });
  }
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, JSON.stringify({ error: "Mensagem inválida" }), { "Content-Type": "application/json" });
  }
  const messages = (Array.isArray(payload.messages) ? payload.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length) return send(res, 400, JSON.stringify({ error: "Mensagem vazia" }), { "Content-Type": "application/json" });

  const last = messages[messages.length - 1].content;
  let reply = "";
  let source = "fallback";
  if (API_KEY) {
    try {
      reply = await askClaude(messages);
      source = "ai";
    } catch (e) {
      console.error("[chat]", e.message);
    }
  }
  if (!reply) reply = fallbackAnswer(last);
  send(res, 200, JSON.stringify({ reply, source }), { "Content-Type": "application/json", "Cache-Control": "no-store" });
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  // /renovacao/ -> /renovacao (endereço único para SEO e anúncios)
  if (urlPath.length > 1 && urlPath.endsWith("/")) {
    const q = new URL(req.url, "http://x").search;
    res.writeHead(301, { Location: urlPath.replace(/\/+$/, "") + q });
    return res.end();
  }
  if (urlPath === "/") urlPath = "/index.html";
  // /renovacao -> public/renovacao.html
  else if (!path.extname(urlPath)) urlPath += ".html";
  const file = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, "Proibido");
  fs.readFile(file, (err, buf) => {
    if (err) {
      return fs.readFile(path.join(PUBLIC_DIR, "404.html"), (e2, b2) =>
        send(res, 404, e2 ? "Página não encontrada" : b2, { "Content-Type": "text/html; charset=utf-8" })
      );
    }
    const ext = path.extname(file).toLowerCase();
    let body = buf;
    // Troca o domínio de exemplo pelo domínio real (variável SITE_URL no Render).
    if (SITE_URL && [".html", ".xml", ".txt", ".webmanifest"].includes(ext)) {
      body = buf.toString("utf8").split("https://www.carlamarquescnh.com.br").join(SITE_URL);
    }
    // HTML: navegador 5 min; borda do Cloudflare 1 h e cópia antiga servida enquanto o Render acorda.
    const cache = ext === ".html"
      ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400"
      : "public, max-age=604800";
    send(res, 200, body, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": cache });
  });
}

http
  .createServer((req, res) => {
    // Redireciona http -> https e sem-www -> www quando atrás do Render.
    const proto = req.headers["x-forwarded-proto"];
    if (proto === "http" && SITE_URL) {
      return send(res, 301, "", { Location: SITE_URL + req.url });
    }
    if (req.method === "POST" && req.url === "/api/chat") return handleChat(req, res);
    if (req.method === "GET" && req.url === "/healthz") return send(res, 200, "ok");
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
    send(res, 405, "Método não permitido");
  })
  .listen(PORT, () => console.log(`Carla Marques CNH no ar na porta ${PORT} | IA: ${API_KEY ? MODEL : "modo respostas prontas"}`));
