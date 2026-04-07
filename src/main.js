import "./style.css";

const app = document.querySelector("#app");

const REFRESH_INTERVAL_MS = 60_000;
const TICKER_PAGE_SIZE = 5;
const TICKER_ROTATE_MS = 5_200;
const CATEGORY_ORDER = ["markets", "policy", "crypto"];
const FORTUNE_MODEL_NAME = "deepseek-r1:8b";
const FORTUNE_PROMPTS = [
  "请先告诉我需要哪些信息",
  "我想看事业与财运",
  "姻缘什么时候容易成熟",
  "今天适合做什么",
];
const INITIAL_FORTUNE_MESSAGES = [
  {
    role: "assistant",
    content:
      "善哉，缘主请坐。乾坤旋转，皆有定数。若要细论命盘，请先告知性别、出生城市、生辰时刻与星座；若眼下只想随问，我也可先听其一端，再慢慢追问。",
  },
];

const state = {
  data: null,
  error: "",
  loading: true,
  refreshing: false,
  filter: "all",
  tickerPage: 0,
  nextRefreshAt: Date.now() + REFRESH_INTERVAL_MS,
  fortuneLoading: false,
  fortuneError: "",
  fortuneModel: FORTUNE_MODEL_NAME,
  fortuneMessages: [...INITIAL_FORTUNE_MESSAGES],
  fortuneProfile: {
    gender: "",
    city: "",
    birthDate: "",
    birthTime: "",
    starSign: "",
  },
};

let refreshTimerId = 0;
let countdownTimerId = 0;
let tickerTimerId = 0;
let activeRequestId = 0;

async function loadDigest() {
  activeRequestId += 1;
  const requestId = activeRequestId;

  if (!state.loading) {
    state.refreshing = true;
  }

  state.error = "";
  render();

  try {
    const response = await fetch(`/api/worldmonitor-finance-digest?ts=${Date.now()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (requestId !== activeRequestId) {
      return;
    }

    state.data = payload;
    state.error = payload.warning || "";
    state.loading = false;
    state.refreshing = false;
    state.filter = state.filter === "all" || payload.categories?.[state.filter] ? state.filter : "all";
    state.tickerPage = 0;
    state.nextRefreshAt = Date.now() + (payload.refreshIntervalMs || REFRESH_INTERVAL_MS);

    scheduleRefresh();
    render();
  } catch (error) {
    if (requestId !== activeRequestId) {
      return;
    }

    state.loading = false;
    state.refreshing = false;
    state.error =
      error instanceof Error
        ? `刷新失败：${error.message}，系统会在下一分钟继续自动重试。`
        : "刷新失败：系统会在下一分钟继续自动重试。";
    state.nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;

    scheduleRefresh();
    render();
  }
}

function scheduleRefresh() {
  window.clearTimeout(refreshTimerId);
  refreshTimerId = window.setTimeout(() => {
    void loadDigest();
  }, Math.max(0, state.nextRefreshAt - Date.now()));
}

function startCountdown() {
  window.clearInterval(countdownTimerId);
  countdownTimerId = window.setInterval(() => {
    updateLiveNodes();
  }, 1_000);
}

function startTickerRotation() {
  window.clearInterval(tickerTimerId);
  tickerTimerId = window.setInterval(() => {
    const groups = getTickerGroups();
    if (groups.length <= 1) {
      return;
    }

    state.tickerPage = (state.tickerPage + 1) % groups.length;
    updateTickerNodes();
  }, TICKER_ROTATE_MS);
}

function updateLiveNodes() {
  const countdownNode = document.querySelector("[data-role='countdown']");
  const statusNode = document.querySelector("[data-role='status']");
  const pulseNode = document.querySelector("[data-role='pulse']");

  if (countdownNode) {
    countdownNode.textContent = formatCountdown(state.nextRefreshAt - Date.now());
  }

  if (statusNode) {
    statusNode.textContent = buildStatusLine();
  }

  if (pulseNode) {
    pulseNode.textContent = state.refreshing ? "抓取中" : "在线";
  }
}

function updateTickerNodes() {
  const groups = getTickerGroups();
  const safePage = groups.length === 0 ? 0 : state.tickerPage % groups.length;
  state.tickerPage = safePage;

  const trackNode = document.querySelector("[data-role='ticker-track']");
  const pageNode = document.querySelector("[data-role='ticker-page']");
  const totalNode = document.querySelector("[data-role='ticker-total']");

  if (trackNode) {
    trackNode.style.transform = `translateX(-${safePage * 100}%)`;
  }

  if (pageNode) {
    pageNode.textContent = groups.length > 0 ? String(safePage + 1) : "0";
  }

  if (totalNode) {
    totalNode.textContent = String(groups.length);
  }

  document.querySelectorAll("[data-ticker-dot]").forEach((node) => {
    const dotPage = Number(node.getAttribute("data-ticker-dot"));
    node.classList.toggle("is-active", dotPage === safePage);
  });
}

function render() {
  const categories = getCategories();
  const items = getFilteredItems();
  const tickerGroups = getTickerGroups();
  const leaderboard = state.data?.leaderboard || [];
  const sources = state.data?.sources || [];

  if (tickerGroups.length === 0) {
    state.tickerPage = 0;
  } else if (state.tickerPage >= tickerGroups.length) {
    state.tickerPage = 0;
  }

  app.innerHTML = `
    <div class="page-shell">
      <div class="ambient ambient-left"></div>
      <div class="ambient ambient-right"></div>

      <main class="dashboard">
        <section class="headline-bar panel">
          <div class="section-head section-head-compact">
            <div>
              <p class="section-kicker">自动滚动资讯条</p>
              <h2>每次滚动展示 5 条标题</h2>
            </div>
            <div class="ticker-summary">
              <span>当前第 <strong data-role="ticker-page">${tickerGroups.length > 0 ? state.tickerPage + 1 : 0}</strong> 组</span>
              <span>共 <strong data-role="ticker-total">${tickerGroups.length}</strong> 组</span>
            </div>
          </div>

          <div class="ticker-window">
            <div class="ticker-track" data-role="ticker-track">
              ${
                tickerGroups.length > 0
                  ? tickerGroups.map(renderTickerPage).join("")
                  : `
                    <div class="ticker-page-view">
                      <div class="ticker-empty">正在连接资讯源，稍后自动显示最新标题。</div>
                    </div>
                  `
              }
            </div>
          </div>

          <div class="ticker-dots" aria-label="资讯滚动分页">
            ${tickerGroups
              .map(
                (_, index) => `
                  <button
                    class="ticker-dot ${index === state.tickerPage ? "is-active" : ""}"
                    data-ticker-dot="${index}"
                    aria-label="切换到第 ${index + 1} 组标题"
                  ></button>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="hero panel">
          <div class="hero-copy">
            <p class="section-kicker">WORLD MONITOR FINANCE BOARD</p>
            <h1>世界监测财经简报</h1>
            <p class="hero-summary">
              参考
              <a href="https://www.worldmonitor.app/" target="_blank" rel="noreferrer">World Monitor</a>
              公开财经源配置，聚合可直达原文的市场、政策与加密资讯。页面每 60 秒自动刷新一次，资讯标题、摘要与排行榜统一以中文展示。
            </p>
            <p class="hero-credit">由刘光远设计开发</p>
          </div>

          <div class="hero-metrics">
            ${renderMetric("在线源", String(state.data?.sourceSummary?.live || 0), "当前可正常拉取")}
            ${renderMetric("官方源", String(state.data?.sourceSummary?.official || 0), "美联储 / 证监会")}
            ${renderMetric("资讯数", String(state.data?.sourceSummary?.itemCount || 0), "已去重并翻译")}
            ${renderMetric(
              "下次刷新",
              formatCountdown(state.nextRefreshAt - Date.now()),
              "自动倒计时",
              "countdown",
            )}
          </div>
        </section>

        <section class="status-bar panel">
          <div>
            <p class="section-kicker">刷新状态</p>
            <h2 data-role="status">${escapeHtml(buildStatusLine())}</h2>
            <p class="status-note">${escapeHtml(state.data?.feedReference || "正在建立财经资讯看板连接...")}</p>
          </div>

          <div class="status-actions">
            <div class="signal-strip">
              <span class="signal-dot"></span>
              <span data-role="pulse">${state.refreshing ? "抓取中" : "在线"}</span>
            </div>
            <button
              class="action-button ${state.refreshing ? "is-busy" : ""}"
              id="refresh-button"
              ${state.refreshing ? "disabled" : ""}
            >
              ${state.refreshing ? "正在刷新..." : "立即刷新"}
            </button>
          </div>
        </section>

        ${
          state.error
            ? `
              <section class="alert-panel panel">
                <p>${escapeHtml(state.error)}</p>
              </section>
            `
            : ""
        }

        <section class="filter-bar panel">
          <div class="section-head section-head-compact">
            <div>
              <p class="section-kicker">资讯分组</p>
              <h2>${escapeHtml(getFilterHeading())}</h2>
            </div>
            <p class="section-note">点击分类筛选资讯主流，标题可直接跳转至原文。</p>
          </div>
          <div class="filter-row">
            ${renderFilterChip("all", "全部资讯")}
            ${categories
              .map((category) =>
                renderFilterChip(category.key, `${category.label} ${category.count}`),
              )
              .join("")}
          </div>
        </section>

        ${renderFortunePanel()}

        <section class="content-grid">
          <aside class="sidebar">
            <section class="leaderboard-panel panel">
              <div class="section-head">
                <div>
                  <p class="section-kicker">资讯排行榜</p>
                  <h2>重要度前 10 条</h2>
                </div>
                <p class="section-note">按时效性、来源级别与影响关键词综合打分，100 为最高。</p>
              </div>

              <div class="leaderboard-list">
                ${
                  leaderboard.length > 0
                    ? leaderboard.map(renderLeaderboardItem).join("")
                    : `<div class="empty-card compact-empty-card">正在等待排行榜数据...</div>`
                }
              </div>
            </section>

            <section class="source-panel panel">
              <div class="section-head">
                <div>
                  <p class="section-kicker">数据源状态</p>
                  <h2>本轮抓取概览</h2>
                </div>
                <p class="section-note">用于快速判断哪些资讯源当前在线。</p>
              </div>

              <div class="source-list">
                ${
                  sources.length > 0
                    ? sources.map(renderSourceCard).join("")
                    : `<div class="empty-card compact-empty-card">正在读取源状态...</div>`
                }
              </div>
            </section>
          </aside>

          <section class="news-panel panel">
            <div class="section-head">
              <div>
                <p class="section-kicker">资讯主流</p>
                <h2>${escapeHtml(getFilterHeading())}</h2>
              </div>
              <p class="section-note">按发布时间倒序排列，展示“标题 + 中文摘要”，点击卡片即可查看原文。</p>
            </div>

            <div class="news-list">
              ${
                items.length > 0
                  ? items.map(renderNewsCard).join("")
                  : `<div class="empty-card">当前筛选条件下暂无资讯，系统将在下一轮刷新后自动补充。</div>`
              }
            </div>
          </section>
        </section>
      </main>
    </div>
  `;

  document.querySelector("#refresh-button")?.addEventListener("click", () => {
    void loadDigest();
  });

  document.querySelectorAll("[data-filter]").forEach((node) => {
    node.addEventListener("click", () => {
      state.filter = node.getAttribute("data-filter") || "all";
      render();
    });
  });

  document.querySelectorAll("[data-ticker-dot]").forEach((node) => {
    node.addEventListener("click", () => {
      state.tickerPage = Number(node.getAttribute("data-ticker-dot")) || 0;
      updateTickerNodes();
    });
  });

  document.querySelector("#fortune-chat-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const question = new FormData(form).get("question");

    if (typeof question === "string") {
      void submitFortuneQuestion(question);
      form.reset();
    }
  });

  document.querySelectorAll("[data-fortune-prompt]").forEach((node) => {
    node.addEventListener("click", () => {
      const prompt = node.getAttribute("data-fortune-prompt") || "";
      void submitFortuneQuestion(prompt);
    });
  });

  document.querySelectorAll("[data-fortune-field]").forEach((node) => {
    const syncField = () => {
      const fieldName = node.getAttribute("data-fortune-field");
      if (!fieldName) {
        return;
      }

      state.fortuneProfile[fieldName] = node.value;
    };

    node.addEventListener("input", syncField);
    node.addEventListener("change", syncField);
  });

  updateLiveNodes();
  updateTickerNodes();
  scrollFortuneChatToBottom();
}

function renderFortunePanel() {
  return `
    <section class="fortune-panel panel">
      <div class="section-head">
        <div>
          <p class="section-kicker">Local DeepSeek</p>
          <h2>小光子命理对话</h2>
        </div>
        <div class="fortune-meta">
          <span class="model-badge">${escapeHtml(state.fortuneModel)}</span>
          <span class="model-badge is-muted">读取 soul 文档</span>
        </div>
      </div>

      <p class="fortune-note">
        这块对话由本机的 DeepSeek R1 8B 驱动，算命先生的人设写在
        <code>prompts/xiaoguangzi.soul.md</code>。
        若本地 Ollama 未启动，页面会直接提示。
      </p>

      <div class="fortune-profile-grid">
        <label>
          <span>性别</span>
          <select data-fortune-field="gender">
            <option value="">请先选择</option>
            <option value="男" ${state.fortuneProfile.gender === "男" ? "selected" : ""}>男</option>
            <option value="女" ${state.fortuneProfile.gender === "女" ? "selected" : ""}>女</option>
          </select>
        </label>
        <label>
          <span>出生城市</span>
          <input
            data-fortune-field="city"
            type="text"
            maxlength="24"
            value="${escapeHtml(state.fortuneProfile.city)}"
            placeholder="如：苏州、成都"
          />
        </label>
        <label>
          <span>出生日期</span>
          <input data-fortune-field="birthDate" type="date" value="${escapeHtml(state.fortuneProfile.birthDate)}" />
        </label>
        <label>
          <span>出生时刻</span>
          <input data-fortune-field="birthTime" type="time" value="${escapeHtml(state.fortuneProfile.birthTime)}" />
        </label>
        <label>
          <span>星座</span>
          <input
            data-fortune-field="starSign"
            type="text"
            maxlength="12"
            value="${escapeHtml(state.fortuneProfile.starSign)}"
            placeholder="如：天蝎座"
          />
        </label>
      </div>

      <div id="fortune-chat-log" class="fortune-chat-log">
        ${state.fortuneMessages.map(renderFortuneMessage).join("")}
      </div>

      <div class="fortune-prompt-row">
        ${FORTUNE_PROMPTS.map(
          (prompt) => `
            <button class="fortune-prompt-chip" type="button" data-fortune-prompt="${escapeHtml(prompt)}">
              ${escapeHtml(prompt)}
            </button>
          `,
        ).join("")}
      </div>

      <form id="fortune-chat-form" class="fortune-chat-form">
        <input
          name="question"
          type="text"
          maxlength="120"
          placeholder="请直接发问，例如：我想问这两年的事业与姻缘。"
          ${state.fortuneLoading ? "disabled" : ""}
        />
        <button class="action-button fortune-submit-button ${state.fortuneLoading ? "is-busy" : ""}" type="submit" ${state.fortuneLoading ? "disabled" : ""}>
          ${state.fortuneLoading ? "小光子起卦中..." : "继续请教"}
        </button>
      </form>

      ${
        state.fortuneError
          ? `<p class="fortune-error">${escapeHtml(state.fortuneError)}</p>`
          : `<p class="fortune-hint">若要正式细断，请尽量补全性别、出生城市、生辰与星座；差之毫厘，谬以千里。</p>`
      }
    </section>
  `;
}

function renderMetric(label, value, note, role = "") {
  const roleAttribute = role ? `data-role="${role}"` : "";

  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong ${roleAttribute}>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function renderFortuneMessage(message) {
  return `
    <article class="fortune-message fortune-message-${message.role}">
      <span class="fortune-speaker">${message.role === "assistant" ? "小光子" : "缘主"}</span>
      <p>${escapeHtml(message.content)}</p>
    </article>
  `;
}

function renderFilterChip(key, label) {
  return `
    <button class="filter-chip ${state.filter === key ? "is-active" : ""}" data-filter="${escapeHtml(key)}">
      ${escapeHtml(label)}
    </button>
  `;
}

function renderTickerPage(group) {
  return `
    <div class="ticker-page-view">
      ${group.map(renderTickerItem).join("")}
    </div>
  `;
}

function renderTickerItem(item, index) {
  return `
    <a class="ticker-item" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <span class="ticker-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="ticker-title">${escapeHtml(item.title)}</span>
    </a>
  `;
}

function renderLeaderboardItem(item) {
  return `
    <a class="leaderboard-item" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <div class="leaderboard-rank">${String(item.rank).padStart(2, "0")}</div>
      <div class="leaderboard-copy">
        <h3>${escapeHtml(item.title)}</h3>
        <div class="leaderboard-meta">
          <span>${escapeHtml(item.categoryLabel)}</span>
          <span>${escapeHtml(item.sourceLabel)}</span>
          <span>${escapeHtml(formatRelativeTime(item.publishedAt))}</span>
        </div>
      </div>
      <div class="leaderboard-score">
        <strong>${escapeHtml(String(item.score))}</strong>
        <span>重要度</span>
      </div>
    </a>
  `;
}

function renderSourceCard(source) {
  return `
    <article class="source-card">
      <div class="source-topline">
        <span class="source-category">${escapeHtml(source.categoryLabel)}</span>
        <span class="source-state source-state-${escapeHtml(source.status)}">${escapeHtml(
          formatSourceState(source.status),
        )}</span>
      </div>
      <strong>${escapeHtml(source.label)}</strong>
      <div class="source-meta">
        <span>${source.official ? "官方源" : "媒体源"}</span>
        <span>${escapeHtml(String(source.itemCount))} 条</span>
      </div>
    </article>
  `;
}

function renderNewsCard(item) {
  return `
    <a class="news-card" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <div class="card-topline">
        <span class="category-tag">${escapeHtml(item.categoryLabel)}</span>
        <span class="source-tag ${item.official ? "is-official" : ""}">${escapeHtml(
          item.sourceLabel,
        )}</span>
      </div>

      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(trimSummary(item.summary, 150))}</p>

      <div class="card-meta">
        <span>${escapeHtml(formatRelativeTime(item.publishedAt))}</span>
        <span>点击查看原文</span>
      </div>
    </a>
  `;
}

function getCategories() {
  const categories = Object.values(state.data?.categories || {});

  return categories.sort((left, right) => {
    const leftIndex = CATEGORY_ORDER.indexOf(left.key);
    const rightIndex = CATEGORY_ORDER.indexOf(right.key);
    return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
  });
}

function getFilteredItems() {
  const items = state.data?.items || [];

  if (state.filter === "all") {
    return items;
  }

  return items.filter((item) => item.category === state.filter);
}

function getTickerGroups() {
  return chunkItems(state.data?.tickerTitles || [], TICKER_PAGE_SIZE);
}

function getFilterHeading() {
  if (state.filter === "all") {
    return "全部资讯";
  }

  const category = getCategories().find((item) => item.key === state.filter);
  return category ? `${category.label}资讯` : "资讯主流";
}

function buildStatusLine() {
  if (state.loading && !state.data) {
    return "正在建立财经资讯看板...";
  }

  if (!state.data?.generatedAt) {
    return "等待下一轮自动刷新";
  }

  const live = state.data?.sourceSummary?.live || 0;
  const total = state.data?.sourceSummary?.total || 0;
  return `${formatDateTime(state.data.generatedAt)} 更新，${live}/${total} 个资讯源在线。`;
}

function trimSummary(text, limit) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit).trimEnd()}...`;
}

function formatSourceState(status) {
  switch (status) {
    case "live":
      return "在线";
    case "empty":
      return "暂无新条目";
    case "error":
      return "抓取失败";
    default:
      return "未知";
  }
}

function formatRelativeTime(timestamp) {
  const target = Number(timestamp);
  if (!Number.isFinite(target)) {
    return "时间未知";
  }

  const minutes = Math.round((Date.now() - target) / 60_000);
  if (minutes <= 1) {
    return "刚刚更新";
  }

  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }

  return formatDateTime(target);
}

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1_000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function chunkItems(items, size) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function submitFortuneQuestion(question) {
  const cleanQuestion = String(question || "").trim();

  if (!cleanQuestion || state.fortuneLoading) {
    return;
  }

  const pendingMessages = [
    ...state.fortuneMessages,
    {
      role: "user",
      content: cleanQuestion,
    },
  ];

  state.fortuneMessages = pendingMessages;
  state.fortuneLoading = true;
  state.fortuneError = "";
  render();

  try {
    const response = await fetch("/api/fortune-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: state.fortuneModel,
        messages: pendingMessages,
        profile: buildFortuneProfilePayload(),
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "当前打开的是静态托管页面，命理对话需在本地运行此项目，并配合 `ollama serve` 后方可真正连到小光子。",
        );
      }

      throw new Error(payload.message || `本地命理对话暂时不可用（HTTP ${response.status}）。`);
    }

    state.fortuneMessages = [
      ...pendingMessages,
      {
        role: "assistant",
        content: String(payload.reply || "").trim() || "山风过耳，此刻尚未得辞。",
      },
    ];
    state.fortuneModel = payload.model || state.fortuneModel;
  } catch (error) {
    state.fortuneError =
      error instanceof Error ? error.message : "本地命理对话暂时不可用，请稍后再试。";
  } finally {
    state.fortuneLoading = false;
    render();
  }
}

function buildFortuneProfilePayload() {
  return {
    gender: state.fortuneProfile.gender.trim(),
    city: state.fortuneProfile.city.trim(),
    birthDate: state.fortuneProfile.birthDate.trim(),
    birthTime: state.fortuneProfile.birthTime.trim(),
    starSign: state.fortuneProfile.starSign.trim(),
  };
}

function scrollFortuneChatToBottom() {
  const chatLog = document.querySelector("#fortune-chat-log");
  if (chatLog) {
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

startCountdown();
startTickerRotation();
void loadDigest();
