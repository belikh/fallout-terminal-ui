// Minimal MCP-over-HTTP (Streamable HTTP + SSE) client for the ha-mcp server.
// Usage: node test/hamcp.mjs <method> '<paramsJSON>'
//   node test/hamcp.mjs tools/list
//   node test/hamcp.mjs resources/read '{"uri":"skill://.../SKILL.md"}'
//   node test/hamcp.mjs tools/call '{"name":"...","arguments":{...}}'
// Reads the endpoint from $HA_MCP_URL.
const URL = process.env.HA_MCP_URL;
if (!URL) { console.error("set HA_MCP_URL"); process.exit(2); }

const HEADERS = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
let sessionId = null;

function parseSse(text) {
  // Collect every `data:` payload, JSON.parse each, return them.
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^data:\s?(.*)$/);
    if (m && m[1]) { try { out.push(JSON.parse(m[1])); } catch {} }
  }
  return out;
}

async function rpc(method, params, isNotification = false) {
  const body = { jsonrpc: "2.0", method, ...(params !== undefined ? { params } : {}) };
  if (!isNotification) body.id = Math.floor(Math.random() * 1e6);
  const headers = { ...HEADERS };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await fetch(URL, { method: "POST", headers, body: JSON.stringify(body) });
  const sid = res.headers.get("mcp-session-id");
  if (sid) sessionId = sid;
  if (isNotification) return null;
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  const msgs = ct.includes("event-stream") ? parseSse(text) : (text ? [JSON.parse(text)] : []);
  const reply = msgs.find((m) => m.id === body.id) || msgs[msgs.length - 1];
  if (!reply) throw new Error(`no reply (HTTP ${res.status}): ${text.slice(0, 300)}`);
  if (reply.error) throw new Error(`RPC error: ${JSON.stringify(reply.error)}`);
  return reply.result;
}

const [, , method, paramsRaw] = process.argv;
const params = paramsRaw ? JSON.parse(paramsRaw) : undefined;

await rpc("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "claude-code", version: "1.0" },
});
await rpc("notifications/initialized", undefined, true);

const result = await rpc(method, params);
process.stdout.write(JSON.stringify(result, null, 2));
