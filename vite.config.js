import { defineConfig } from "vite";
import { chatWithFortuneMaster, inspectFortuneService } from "./server/fortune-chat.js";

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function parseModelFromRequest(req) {
  const requestUrl = req.url || "";
  const searchParams = new URL(requestUrl, "http://localhost").searchParams;
  return searchParams.get("model") || undefined;
}

function fortuneChatPlugin() {
  const registerRoute = (server) => {
    server.middlewares.use(async (req, res, next) => {
      const requestUrl = req.url || "";

      if (requestUrl.startsWith("/api/fortune-status")) {
        if (req.method !== "GET") {
          sendJson(res, 405, { message: "Method not allowed" });
          return;
        }

        try {
          const result = await inspectFortuneService({
            model: parseModelFromRequest(req),
          });
          const statusCode = result.reachable && result.modelReady ? 200 : 503;
          sendJson(res, statusCode, result);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to inspect fortune service";
          sendJson(res, 500, { message });
        }
        return;
      }

      if (!requestUrl.startsWith("/api/fortune-chat")) {
        next();
        return;
      }

      if (req.method !== "POST") {
        sendJson(res, 405, { message: "Method not allowed" });
        return;
      }

      try {
        const payload = await readJsonBody(req);
        const result = await chatWithFortuneMaster(payload);
        sendJson(res, 200, result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to chat with fortune master";
        const statusCode = message.includes("无法连接本地 Ollama 服务") ? 503 : 500;
        sendJson(res, statusCode, { message });
      }
    });
  };

  return {
    name: "fortune-chat",
    configureServer: registerRoute,
    configurePreviewServer: registerRoute,
  };
}

export default defineConfig({
  base: "./",
  plugins: [fortuneChatPlugin()],
});
