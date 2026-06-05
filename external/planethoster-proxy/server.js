/**
 * Hostiq Proxy — PlanetHoster + Render
 * Routes:
 *   GET  /              health
 *   GET  /health        health
 *   ALL  /api/ph/*      → https://api.planethoster.net/*
 *   ALL  /api/render/*  → https://api.render.com/v1/*
 *   GET  /api/render/health  validates RENDER_API_KEY
 *
 * Auth (required for /api/ph/* and /api/render/*):
 *   header `X-Proxy-Secret: $PROXY_SHARED_SECRET`
 *
 * Env:
 *   PROXY_SHARED_SECRET, PLANETHOSTER_API_USER, PLANETHOSTER_API_KEY,
 *   RENDER_API_KEY, PORT
 */

require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json({ limit: "2mb" }));

console.log("[proxy] Node version:", process.versions.node);

const PH_BASE = "https://api.planethoster.net";
const RENDER_BASE = "https://api.render.com/v1";

const SHARED_SECRET = process.env.PROXY_SHARED_SECRET || "";
const API_USER = process.env.PLANETHOSTER_API_USER || "";
const API_KEY = process.env.PLANETHOSTER_API_KEY || "";
const RENDER_KEY = process.env.RENDER_API_KEY || "";

if (!SHARED_SECRET) console.error("[proxy] Missing PROXY_SHARED_SECRET");
if (!API_USER || !API_KEY) console.error("[proxy] Missing PlanetHoster creds");
if (!RENDER_KEY) console.error("[proxy] Missing RENDER_API_KEY");

function authOk(req) {
  const provided = req.header("X-Proxy-Secret") || "";
  return !!SHARED_SECRET && provided === SHARED_SECRET;
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "Hostiq Proxy",
    node: process.versions.node,
    ts: Date.now(),
    providers: { planethoster: !!API_KEY, render: !!RENDER_KEY },
  });
});

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ============================================================
// PlanetHoster proxy
// ============================================================
app.all("/api/ph/*", async (req, res) => {
  if (!authOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const subPath = req.path.replace(/^\/api\/ph/, "");
    const search = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const target = `${PH_BASE}${subPath}${search}`;
    console.log(`[ph] ${req.method} ${target}`);

    const headers = {
      "X-API-USER": API_USER,
      "X-API-KEY": API_KEY,
      Accept: "application/json",
    };
    if (req.method !== "GET" && req.method !== "HEAD")
      headers["Content-Type"] = "application/json";

    const response = await axios({
      url: target,
      method: req.method,
      headers,
      data:
        req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length
          ? req.body
          : undefined,
      validateStatus: () => true,
      timeout: 30000,
    });

    res.status(response.status);
    if (response.headers["content-type"])
      res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    console.error("[ph] error:", err.message);
    res.status(502).json({ error: "Upstream PlanetHoster failed", detail: err.message });
  }
});

// ============================================================
// Render proxy
// ============================================================
app.get("/api/render/health", async (req, res) => {
  if (!authOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    const r = await axios({
      url: `${RENDER_BASE}/owners?limit=1`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${RENDER_KEY}`,
        Accept: "application/json",
      },
      validateStatus: () => true,
      timeout: 15000,
    });
    res.json({ ok: r.status >= 200 && r.status < 300, status: r.status, ts: Date.now() });
  } catch (err) {
    res.status(502).json({ ok: false, detail: err.message });
  }
});

async function renderCall(req, res, attempt = 0) {
  const subPath = req.path.replace(/^\/api\/render/, "");
  const search = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = `${RENDER_BASE}${subPath}${search}`;
  console.log(`[render] ${req.method} ${target}`);

  const headers = {
    Authorization: `Bearer ${RENDER_KEY}`,
    Accept: "application/json",
  };
  if (req.method !== "GET" && req.method !== "HEAD")
    headers["Content-Type"] = "application/json";

  const response = await axios({
    url: target,
    method: req.method,
    headers,
    data:
      req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length
        ? req.body
        : undefined,
    validateStatus: () => true,
    timeout: 45000,
  });

  // Backoff on 429
  if (response.status === 429 && attempt < 3) {
    const wait = (parseInt(response.headers["retry-after"], 10) || 1) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    return renderCall(req, res, attempt + 1);
  }

  res.status(response.status);
  if (response.headers["content-type"])
    res.setHeader("Content-Type", response.headers["content-type"]);
  // Normalize Render errors slightly
  if (response.status >= 400 && response.data && typeof response.data === "object") {
    return res.send({
      error: response.data.message || response.data.error || "Render API error",
      code: response.data.code,
      status: response.status,
      raw: response.data,
    });
  }
  res.send(response.data);
}

app.all("/api/render/*", async (req, res) => {
  if (!authOk(req)) return res.status(401).json({ error: "Unauthorized" });
  try {
    await renderCall(req, res);
  } catch (err) {
    console.error("[render] error:", err.message);
    res.status(502).json({ error: "Upstream Render failed", detail: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`[proxy] listening on :${port}`));
