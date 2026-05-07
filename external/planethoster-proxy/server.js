/**
 * Hostiq → PlanetHoster API proxy
 * Compatible PlanetHoster / Passenger / Node.js mutualisé
 */

require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json({ limit: "1mb" }));

console.log("[proxy] Node version:", process.versions.node);

const PH_BASE = "https://api.planethoster.net";
const SHARED_SECRET = process.env.PROXY_SHARED_SECRET || "";
const API_USER = process.env.PLANETHOSTER_API_USER || "";
const API_KEY = process.env.PLANETHOSTER_API_KEY || "";

if (!SHARED_SECRET || !API_USER || !API_KEY) {
  console.error(
    "[proxy] Missing env vars: PROXY_SHARED_SECRET / PLANETHOSTER_API_USER / PLANETHOSTER_API_KEY"
  );
}

/**
 * Health check
 */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "Hostiq PlanetHoster Proxy",
    node: process.versions.node,
    ts: Date.now(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
  });
});

/**
 * Proxy sécurisé vers PlanetHoster API
 */
app.all("/api/ph/*", async (req, res) => {
  try {
    const provided = req.header("X-Proxy-Secret") || "";

    if (!SHARED_SECRET || provided !== SHARED_SECRET) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const subPath = req.path.replace(/^\/api\/ph/, "");

    const search = req.url.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";

    const target = `${PH_BASE}${subPath}${search}`;

    console.log(`[proxy] ${req.method} ${target}`);

    const headers = {
      "X-API-USER": API_USER,
      "X-API-KEY": API_KEY,
      Accept: "application/json",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      headers["Content-Type"] = "application/json";
    }

    const response = await axios({
      url: target,
      method: req.method,
      headers,
      data:
        req.method !== "GET" &&
        req.method !== "HEAD" &&
        req.body &&
        Object.keys(req.body).length
          ? req.body
          : undefined,
      validateStatus: () => true,
      timeout: 30000,
    });

    res.status(response.status);

    if (response.headers["content-type"]) {
      res.setHeader("Content-Type", response.headers["content-type"]);
    }

    res.send(response.data);
  } catch (err) {
    console.error("[proxy] error:", err);

    res.status(502).json({
      error: "Upstream PlanetHoster request failed",
      detail: err.message || String(err),
    });
  }
});

/**
 * Start server
 */
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[proxy] listening on :${port}`);
});