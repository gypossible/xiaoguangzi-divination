const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const REFRESH_INTERVAL_MS = 60_000;
const CACHE_TTL_MS = 55_000;
const FEED_TIMEOUT_MS = 10_000;
const TRANSLATE_TIMEOUT_MS = 8_000;
const MAX_ITEMS_PER_FEED = 4;
const MAX_ITEMS_TOTAL = 24;
const MIN_ITEMS_PER_SOURCE = 2;
const LEADERBOARD_SIZE = 10;
const TRANSLATION_CACHE_LIMIT = 800;
const TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";

const SOURCE_LABELS = {
  CNBC: "CNBC财经",
  "Financial Times": "金融时报",
  "Seeking Alpha": "Seeking Alpha投资",
  "Yahoo Finance": "雅虎财经",
  "Federal Reserve": "美联储",
  SEC: "美国证监会",
  CoinDesk: "CoinDesk加密日报",
  Cointelegraph: "Cointelegraph区块链报",
};

const CATEGORY_BONUS = {
  policy: 12,
  markets: 9,
  crypto: 7,
};

const IMPACT_KEYWORDS = [
  { pattern: /\b(fed|federal reserve|interest rate|rate cut|rate hike|powell|treasury yield|inflation|cpi|pce|gdp|payrolls|jobs report|recession)\b/i, weight: 22 },
  { pattern: /\b(sec|cftc|regulation|enforcement|lawsuit|memorandum|approval|compliance|investor protection)\b/i, weight: 19 },
  { pattern: /\b(oil|crude|opec|strait of hormuz|war|attack|missile|sanction|tariff|stockpile|energy)\b/i, weight: 18 },
  { pattern: /\b(bitcoin|crypto|stablecoin|tokenized|blockchain|etf|exchange|defi)\b/i, weight: 14 },
  { pattern: /\b(earnings|buyback|ipo|merger|acquisition|guidance|bankruptcy|downgrade|upgrade)\b/i, weight: 12 },
  { pattern: /\b(historic|record|largest|biggest|surge|plunge|selloff|rally|shock)\b/i, weight: 9 },
];

const PENALTY_KEYWORDS = [
  { pattern: /\b(here'?s what happened|what happened in .* today|key deals this week|top and bottom quant-rated|strong buys)\b/i, weight: 24 },
  { pattern: /\b(meeting|committee|public meeting)\b/i, weight: 16 },
  { pattern: /\b(opinion|might be wrong)\b/i, weight: 10 },
];

const FEEDS = [
  {
    name: "CNBC",
    category: "markets",
    categoryLabel: "市场",
    priority: 100,
    official: false,
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  },
  {
    name: "Financial Times",
    category: "markets",
    categoryLabel: "市场",
    priority: 96,
    official: false,
    url: "https://www.ft.com/rss/home",
  },
  {
    name: "Seeking Alpha",
    category: "markets",
    categoryLabel: "市场",
    priority: 88,
    official: false,
    url: "https://seekingalpha.com/market_currents.xml",
  },
  {
    name: "Yahoo Finance",
    category: "markets",
    categoryLabel: "市场",
    priority: 82,
    official: false,
    url: "https://finance.yahoo.com/rss/topstories",
  },
  {
    name: "Federal Reserve",
    category: "policy",
    categoryLabel: "政策",
    priority: 98,
    official: true,
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
  },
  {
    name: "SEC",
    category: "policy",
    categoryLabel: "政策",
    priority: 94,
    official: true,
    url: "https://www.sec.gov/news/pressreleases.rss",
  },
  {
    name: "CoinDesk",
    category: "crypto",
    categoryLabel: "加密",
    priority: 86,
    official: false,
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
  },
  {
    name: "Cointelegraph",
    category: "crypto",
    categoryLabel: "加密",
    priority: 80,
    official: false,
    url: "https://cointelegraph.com/rss",
  },
];

const translationCache = new Map();

let inflightDigest = null;
let digestCache = {
  expiresAt: 0,
  payload: null,
};

export async function getWorldMonitorFinanceDigest() {
  const now = Date.now();

  if (digestCache.payload && now < digestCache.expiresAt) {
    return digestCache.payload;
  }

  if (inflightDigest) {
    return inflightDigest;
  }

  inflightDigest = buildDigest()
    .then((payload) => {
      digestCache = {
        payload,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      return payload;
    })
    .catch((error) => {
      if (digestCache.payload) {
        return {
          ...digestCache.payload,
          stale: true,
          warning: `本次刷新失败，已回退到最近一次成功抓取的数据。${error.message}`,
        };
      }

      throw error;
    })
    .finally(() => {
      inflightDigest = null;
    });

  return inflightDigest;
}

async function buildDigest() {
  const settled = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));
  const sources = [];
  const items = [];

  settled.forEach((result, index) => {
    const feed = FEEDS[index];

    if (result.status === "fulfilled") {
      sources.push({
        name: feed.name,
        label: SOURCE_LABELS[feed.name] || feed.name,
        category: feed.category,
        categoryLabel: feed.categoryLabel,
        official: feed.official,
        status: result.value.items.length > 0 ? "live" : "empty",
        itemCount: result.value.items.length,
      });
      items.push(...result.value.items);
      return;
    }

    sources.push({
      name: feed.name,
      label: SOURCE_LABELS[feed.name] || feed.name,
      category: feed.category,
      categoryLabel: feed.categoryLabel,
      official: feed.official,
      status: "error",
      itemCount: 0,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    });
  });

  const sortedItems = dedupeItems(items).sort((left, right) => {
    if (right.publishedAt !== left.publishedAt) {
      return right.publishedAt - left.publishedAt;
    }

    return right.priority - left.priority;
  });

  const selectedItems = buildBalancedSelection(sortedItems);
  if (selectedItems.length === 0) {
    throw new Error("暂时未抓取到可展示的新闻条目。");
  }

  const localizedItems = await localizeAndScoreItems(selectedItems);
  const publicItems = localizedItems.map(
    ({ rawScore, originalTitle, originalSummary, ...item }) => item,
  );
  const rankedItems = rankItems(publicItems);
  const leaderboard = rankedItems
    .slice(0, LEADERBOARD_SIZE)
    .map((item, index) => ({
      rank: index + 1,
      id: item.id,
      title: item.title,
      url: item.url,
      score: item.score,
      sourceLabel: item.sourceLabel,
      categoryLabel: item.categoryLabel,
      publishedAt: item.publishedAt,
      publishedAtLabel: item.publishedAtLabel,
    }));

  const generatedAt = new Date().toISOString();

  return {
    generatedAt,
    refreshIntervalMs: REFRESH_INTERVAL_MS,
    stale: false,
    feedReference:
      "资讯源参考 World Monitor 公开财经源配置，并筛选为可稳定直达原文的市场、政策与加密来源。",
    tickerTitles: rankedItems.slice(0, 18).map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
    })),
    items: publicItems,
    leaderboard,
    categories: buildCategorySummary(publicItems),
    sourceSummary: {
      total: sources.length,
      live: sources.filter((source) => source.status === "live").length,
      official: sources.filter((source) => source.official).length,
      itemCount: publicItems.length,
    },
    sources,
  };
}

async function fetchFeed(feed) {
  const response = await fetchWithTimeout(feed.url, FEED_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = await response.text();
  return { items: parseFeedXml(xml, feed) };
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseFeedXml(xml, feed) {
  const blocks = collectBlocks(xml, "item");
  const isAtom = blocks.length === 0;
  const entryBlocks = isAtom ? collectBlocks(xml, "entry") : blocks;
  const parsed = [];

  for (const block of entryBlocks.slice(0, MAX_ITEMS_PER_FEED)) {
    const rawTitle = cleanText(extractTag(block, "title"));
    if (!rawTitle) continue;

    const url = sanitizeUrl(isAtom ? extractAtomLink(block) : extractTag(block, "link"));
    if (!url) continue;

    const publishedAtText = isAtom
      ? extractFirstTag(block, ["published", "updated", "atom:updated"])
      : extractFirstTag(block, ["pubDate", "published", "updated"]);
    const publishedAt = parseDate(publishedAtText);

    const rawDescription = extractFirstTag(block, [
      "description",
      "summary",
      "content:encoded",
      "content",
    ]);
    const summaryMeta = buildEnglishSummary(rawTitle, rawDescription, feed);

    parsed.push({
      id: `${feed.name}-${hashCode(`${url}-${publishedAt}`)}`,
      rawTitle,
      rawSummary: summaryMeta.text,
      usedFallbackSummary: summaryMeta.usedFallback,
      url,
      source: feed.name,
      sourceLabel: SOURCE_LABELS[feed.name] || feed.name,
      category: feed.category,
      categoryLabel: feed.categoryLabel,
      official: feed.official,
      publishedAt,
      publishedAtLabel: new Date(publishedAt).toISOString(),
      priority: feed.priority,
    });
  }

  return parsed;
}

function buildEnglishSummary(title, description, feed) {
  const cleanedDescription = cleanText(stripHtml(description));
  if (cleanedDescription && normalizeText(cleanedDescription) !== normalizeText(title)) {
    return {
      text: truncate(cleanedDescription, 220),
      usedFallback: false,
    };
  }

  const fallback = `Latest update from ${feed.name}: ${title}. Open the original article for the full context, data details, and market impact.`;
  return {
    text: truncate(fallback, 220),
    usedFallback: true,
  };
}

async function localizeAndScoreItems(items) {
  const localized = await mapWithConcurrency(items, 6, async (item) => {
    const [translatedTitle, translatedSummary] = await Promise.all([
      translateToChinese(item.rawTitle),
      translateToChinese(item.rawSummary),
    ]);

    const title = cleanText(translatedTitle || item.rawTitle);
    const summary = item.usedFallbackSummary
      ? truncate(
          `${item.sourceLabel}最新更新：${title}。打开原文查看完整背景、数据口径与潜在市场影响。`,
          130,
        )
      : truncate(cleanText(translatedSummary || item.rawSummary), 130);

    return {
      id: item.id,
      title,
      summary,
      originalTitle: item.rawTitle,
      originalSummary: item.rawSummary,
      url: item.url,
      source: item.source,
      sourceLabel: item.sourceLabel,
      category: item.category,
      categoryLabel: item.categoryLabel,
      official: item.official,
      publishedAt: item.publishedAt,
      publishedAtLabel: item.publishedAtLabel,
      rawScore: computeRawImportance(item),
    };
  });

  return normalizeScores(localized).sort((left, right) => right.publishedAt - left.publishedAt);
}

function computeRawImportance(item) {
  const text = `${item.rawTitle} ${item.rawSummary}`;
  const hoursAgo = (Date.now() - item.publishedAt) / 3_600_000;
  let score = item.priority * 0.34;
  score += CATEGORY_BONUS[item.category] ?? 6;

  if (item.official) {
    score += 16;
  }

  score += computeRecencyBonus(item.publishedAt);
  score += computeKeywordBonus(text);
  score -= computePenalty(text);
  score *= computeRecencyFactor(hoursAgo);

  return score;
}

function computeRecencyBonus(timestamp) {
  const hoursAgo = (Date.now() - timestamp) / 3_600_000;
  if (hoursAgo <= 1) return 26;
  if (hoursAgo <= 3) return 22;
  if (hoursAgo <= 6) return 18;
  if (hoursAgo <= 12) return 14;
  if (hoursAgo <= 24) return 10;
  if (hoursAgo <= 48) return 6;
  return 2;
}

function computeRecencyFactor(hoursAgo) {
  if (hoursAgo <= 6) return 1.18;
  if (hoursAgo <= 12) return 1.08;
  if (hoursAgo <= 24) return 1;
  if (hoursAgo <= 48) return 0.86;
  if (hoursAgo <= 72) return 0.72;
  if (hoursAgo <= 120) return 0.5;
  return 0.28;
}

function computeKeywordBonus(text) {
  return IMPACT_KEYWORDS.reduce((total, keyword) => {
    if (keyword.pattern.test(text)) {
      return total + keyword.weight;
    }

    return total;
  }, 0);
}

function computePenalty(text) {
  return PENALTY_KEYWORDS.reduce((total, keyword) => {
    if (keyword.pattern.test(text)) {
      return total + keyword.weight;
    }

    return total;
  }, 0);
}

function normalizeScores(items) {
  const ranked = [...items].sort((left, right) => {
    if (right.rawScore !== left.rawScore) {
      return right.rawScore - left.rawScore;
    }

    return right.publishedAt - left.publishedAt;
  });

  if (ranked.length === 0) return items;

  const maxScore = ranked[0].rawScore;
  const minScore = ranked[ranked.length - 1].rawScore;
  const scoreMap = new Map();

  ranked.forEach((item, index) => {
    let score;

    if (index === 0) {
      score = 100;
    } else if (maxScore === minScore) {
      score = Math.max(60, 98 - index * 2);
    } else {
      score = Math.round(60 + ((item.rawScore - minScore) / (maxScore - minScore)) * 39);
    }

    scoreMap.set(item.id, Math.min(100, Math.max(60, score)));
  });

  return items.map((item) => ({
    ...item,
    score: scoreMap.get(item.id) ?? 60,
  }));
}

function rankItems(items) {
  return [...items].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return right.publishedAt - left.publishedAt;
  });
}

async function translateToChinese(text) {
  const cleaned = cleanText(text);
  if (!cleaned) return "";
  if (!/[A-Za-z]/.test(cleaned)) return cleaned;

  const cached = translationCache.get(cleaned);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "auto",
    tl: "zh-CN",
    dt: "t",
    q: cleaned,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);

  try {
    const response = await fetch(`${TRANSLATE_ENDPOINT}?${params.toString()}`, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => part?.[0] || "").join("")
      : cleaned;
    const normalized = cleanText(translated || cleaned);

    translationCache.set(cleaned, normalized);
    cleanupTranslationCache();

    return normalized;
  } catch {
    return cleaned;
  } finally {
    clearTimeout(timeoutId);
  }
}

function cleanupTranslationCache() {
  if (translationCache.size <= TRANSLATION_CACHE_LIMIT) {
    return;
  }

  const overflow = translationCache.size - TRANSLATION_CACHE_LIMIT;
  const keys = translationCache.keys();
  for (let index = 0; index < overflow; index += 1) {
    const current = keys.next();
    if (current.done) break;
    translationCache.delete(current.value);
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function buildCategorySummary(items) {
  return items.reduce((summary, item) => {
    const current = summary[item.category] ?? {
      key: item.category,
      label: item.categoryLabel,
      count: 0,
    };

    current.count += 1;
    summary[item.category] = current;
    return summary;
  }, {});
}

function buildBalancedSelection(items) {
  const selected = [];
  const selectedIds = new Set();
  const perSourceCounts = new Map();

  for (const item of items) {
    const count = perSourceCounts.get(item.source) ?? 0;
    if (count >= MIN_ITEMS_PER_SOURCE) continue;

    selected.push(item);
    selectedIds.add(item.id);
    perSourceCounts.set(item.source, count + 1);
  }

  for (const item of items) {
    if (selected.length >= MAX_ITEMS_TOTAL) break;
    if (selectedIds.has(item.id)) continue;

    selected.push(item);
    selectedIds.add(item.id);
  }

  return selected
    .sort((left, right) => {
      if (right.publishedAt !== left.publishedAt) {
        return right.publishedAt - left.publishedAt;
      }

      return right.priority - left.priority;
    })
    .slice(0, MAX_ITEMS_TOTAL);
}

function dedupeItems(items) {
  const seen = new Set();
  const unique = [];

  for (const item of items) {
    const key = `${normalizeText(item.rawTitle)}::${normalizeText(item.url)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

function collectBlocks(xml, tagName) {
  const escapedTag = escapeRegex(tagName);
  const regex = new RegExp(`<${escapedTag}[\\s>][\\s\\S]*?<\\/${escapedTag}>`, "gi");
  return Array.from(xml.match(regex) ?? []);
}

function extractAtomLink(block) {
  const linkWithHref = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (linkWithHref?.[1]) {
    return decodeXmlEntities(linkWithHref[1]);
  }

  return extractTag(block, "link");
}

function extractFirstTag(block, tags) {
  for (const tag of tags) {
    const value = extractTag(block, tag);
    if (value) return value;
  }

  return "";
}

function extractTag(block, tagName) {
  const escapedTag = escapeRegex(tagName);
  const cdataRegex = new RegExp(
    `<${escapedTag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escapedTag}>`,
    "i",
  );
  const cdataMatch = block.match(cdataRegex);
  if (cdataMatch?.[1]) {
    return cdataMatch[1];
  }

  const regex = new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i");
  const match = block.match(regex);
  if (!match?.[1]) {
    return "";
  }

  return decodeXmlEntities(match[1]);
}

function sanitizeUrl(url) {
  try {
    return new URL(cleanText(url)).href;
  } catch {
    return "";
  }
}

function parseDate(value) {
  const fallback = Date.now();
  if (!value) return fallback;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.getTime();
}

function stripHtml(input) {
  if (!input) return "";

  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function cleanText(value) {
  return decodeXmlEntities(value || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function normalizeText(value) {
  return cleanText(value).toLowerCase();
}

function decodeXmlEntities(input) {
  return (input || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hashCode(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}
