export default async function handler(req, res) {
  const GAS =
    "https://script.google.com/macros/s/AKfycbwE5M0VVnOl7S1E2S2EghdlboFpGx23GgpzxK08X4JRV7Ykj9pGMsKOfez3wzySXYuKAg/exec";

  // --- CORS (allow your site) ---
  res.setHeader("Access-Control-Allow-Origin", "https://jobboard.quickhireagency.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Forward query string exactly as-is
  const qsIndex = req.url.indexOf("?");
  const qs = qsIndex >= 0 ? req.url.slice(qsIndex) : "";

  const targetUrl = GAS + qs;

  // Build upstream request
  const init = {
    method: req.method,
    headers: {
      "Content-Type": req.headers["content-type"] || "application/json",
    },
  };

  // Forward body for POST/PUT/PATCH
  if (req.method !== "GET" && req.method !== "HEAD") {
    // Vercel parses JSON body for us when content-type is application/json
    init.body =
      req.body && typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const text = await upstream.text();

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Proxy fetch failed", detail: String(e) });
  }
}
