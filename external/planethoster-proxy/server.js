/**
 * Hostiq → PlanetHoster API proxy.
 *
 * Déployez ce dossier sur votre sous-domaine PlanetHoster (Node >=18).
 * Variables d'environnement requises :
 *   - PLANETHOSTER_API_USER
 *   - PLANETHOSTER_API_KEY
 *   - PROXY_SHARED_SECRET   (la même valeur sera stockée côté Hostiq dans PLANETHOSTER_PROXY_SECRET)
 *   - PORT                  (fourni automatiquement par PlanetHoster)
 */
require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json({ limit: "1mb" }));

const PH_BASE = "https://api.planethoster.net";
const SHARED_SECRET = process.env.PROXY_SHARED_SECRET || "";
const API_USER = process.env.PLANETHOSTER_API_USER || "";
const API_KEY = process.env.PLANETHOSTER_API_KEY || "";

if (!SHARED_SECRET || !API_USER || !API_KEY) {
  console.error("[proxy] Missing env vars: PROXY_SHARED_SECRET / PLANETHOSTER_API_USER / PLANETHOSTER_API_KEY");
}

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.all("/api/ph/*", async (req, res) => {
  const provided = req.header("X-Proxy-Secret") || "";
  if (!SHARED_SECRET || provided !== SHARED_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const subPath = req.path.replace(/^\/api\/ph/, "");
  const search = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = `${PH_BASE}${subPath}${search}`;

  const init = {
    method: req.method,
    headers: {
      "X-API-USER": API_USER,
      "X-API-KEY": API_KEY,
      Accept: "application/json",
    },
  };
  if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(req.body);
  }

  try {
    const r = await fetch(target, init);
    const text = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (err) {
    console.error("[proxy] error", err);
    res.status(502).json({ error: "Upstream PlanetHoster request failed", detail: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`[proxy] listening on :${port}`));
