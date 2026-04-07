import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "deepseek-r1:8b";
const DEFAULT_OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const __dirname = dirname(fileURLToPath(import.meta.url));
const SOUL_PATH = resolve(__dirname, "..", "prompts", "xiaoguangzi.soul.md");

export async function chatWithFortuneMaster({
  messages = [],
  profile = {},
  readingSummary = "",
  model = DEFAULT_MODEL,
} = {}) {
  const soul = await readFile(SOUL_PATH, "utf8");
  const normalizedMessages = normalizeMessages(messages);
  const contextualMessages = [
    { role: "system", content: soul },
    ...buildProfileMessages(profile),
    ...buildReadingMessages(readingSummary),
    ...normalizedMessages,
  ];

  try {
    const response = await fetch(`${DEFAULT_OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({
        model,
        stream: false,
        messages: contextualMessages,
        options: {
          temperature: 0.75,
          top_p: 0.9,
          num_ctx: 8192,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || `本地模型返回 HTTP ${response.status}`);
    }

    const payload = await response.json();
    const reply = stripReasoningTags(String(payload?.message?.content || "").trim());

    if (!reply) {
      throw new Error("本地模型没有返回可用内容。");
    }

    return {
      reply,
      model: payload?.model || model,
      soulPath: SOUL_PATH,
    };
  } catch (error) {
    throw normalizeOllamaError(error, model);
  }
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(-12)
    .map((message) => ({
      role: message?.role === "assistant" ? "assistant" : "user",
      content: String(message?.content || "").trim(),
    }))
    .filter((message) => message.content.length > 0);
}

function buildProfileMessages(profile) {
  const safeProfile = {
    gender: String(profile?.gender || "").trim(),
    city: String(profile?.city || "").trim(),
    birthDate: String(profile?.birthDate || "").trim(),
    birthTime: String(profile?.birthTime || "").trim(),
    starSign: String(profile?.starSign || "").trim(),
  };

  const parts = [];

  if (safeProfile.gender) {
    parts.push(`性别：${safeProfile.gender}`);
  }

  if (safeProfile.city) {
    parts.push(`出生城市：${safeProfile.city}`);
  }

  if (safeProfile.birthDate) {
    parts.push(`出生日期：${safeProfile.birthDate}`);
  }

  if (safeProfile.birthTime) {
    parts.push(`出生时刻：${safeProfile.birthTime}`);
  }

  if (safeProfile.starSign) {
    parts.push(`星座：${safeProfile.starSign}`);
  }

  if (parts.length === 0) {
    return [];
  }

  return [
    {
      role: "system",
      content: `以下是缘主已提供的基础信息：${parts.join("；")}。若仍缺关键项，请先追问再断。`,
    },
  ];
}

function buildReadingMessages(readingSummary) {
  const summary = String(readingSummary || "").trim();

  if (!summary) {
    return [];
  }

  return [
    {
      role: "system",
      content: `以下是页面已经推算出的命盘摘要，请以此为准继续细答，不必重新编造盘面：\n${summary}`,
    },
  ];
}

function normalizeOllamaError(error, model) {
  const message = error instanceof Error ? error.message : String(error);
  const causeCode =
    error instanceof Error && error.cause && typeof error.cause === "object"
      ? error.cause.code
      : "";

  if (
    causeCode === "ECONNREFUSED" ||
    causeCode === "ENOTFOUND" ||
    causeCode === "ETIMEDOUT" ||
    message.includes("timed out") ||
    message.includes("The operation was aborted") ||
    message.includes("fetch failed") ||
    message.includes("ECONNREFUSED")
  ) {
    return new Error(
      `无法连接本地 Ollama 服务。请先启动 \`ollama serve\`，并确认已准备好模型 \`${model}\`。`,
    );
  }

  return error instanceof Error ? error : new Error(message);
}

function stripReasoningTags(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
