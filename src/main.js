import "./style.css";
import { LunarUtil, Solar } from "lunar-javascript";

const ELEMENTS = ["木", "火", "土", "金", "水"];
const OPENING_LINE = "善哉，缘主请坐。乾坤旋转，皆有定数。";
const FOLLOW_UP_PROMPTS = [
  "事业还能怎么走",
  "财运这两年如何",
  "姻缘何时成熟",
  "学业考试顺吗",
  "星座分析怎么看",
  "今年该注意什么",
];

const STAR_SIGN_OPTIONS = [
  "白羊座",
  "金牛座",
  "双子座",
  "巨蟹座",
  "狮子座",
  "处女座",
  "天秤座",
  "天蝎座",
  "射手座",
  "摩羯座",
  "水瓶座",
  "双鱼座",
];

const STAR_SIGN_META = {
  白羊座: {
    element: "火象",
    mode: "本位",
    temperament: "来得快，燃得旺，做事先动后想，胜在不怕开局。",
    lesson: "学会让勇气带着方向，而不是只带着冲劲。",
    channel: "身体直觉、第一念头、突如其来的行动冲动",
    gift: "开路破局、点燃氛围、在停滞处先迈出第一步",
    shadow: "情绪上头时易抢答命运，快刀虽利，也会误切细缘。",
    practice: "适合短时静坐、快走冥想、把灵感立刻记成三句短箴。",
  },
  金牛座: {
    element: "土象",
    mode: "固定",
    temperament: "慢热稳实，重感官与安全感，心定时自有持久之力。",
    lesson: "学会在安稳之中保留流动，不把坚持误当执拗。",
    channel: "嗅觉、味觉、身体放松时的细微感应",
    gift: "守财定盘、沉淀审美、把抽象愿景落成真实生活",
    shadow: "太怕失去时，灵感会被惯性压住，连好运都显得迟钝。",
    practice: "适合香气冥想、触摸天然物件、在晨光里慢写感受。",
  },
  双子座: {
    element: "风象",
    mode: "变动",
    temperament: "脑筋快，信息感强，善联想、善表达，也善于看见两面。",
    lesson: "学会从纷杂讯息里捞出真心，而不是只停在热闹表层。",
    channel: "对话里的灵光、重复出现的词句、梦中短讯",
    gift: "拆解复杂、穿针引线、把灵讯翻译成人人能懂的话",
    shadow: "念头太多时，真正有重量的讯息反而被碎片淹没。",
    practice: "适合晨间书写、抽关键词卡、把反复出现的话记下来。",
  },
  巨蟹座: {
    element: "水象",
    mode: "本位",
    temperament: "情感深，护持心重，直觉多半先从心口和胃里升起。",
    lesson: "学会先照见自己的情绪潮汐，再去承接他人的波浪。",
    channel: "梦境、家宅氛围、旧物触发的感应回流",
    gift: "安抚人心、凝聚关系、在温柔之处接住真正的讯号",
    shadow: "太替别人感受时，容易把他人的情绪误当成宇宙传音。",
    practice: "适合记梦、睡前净心、整理房间时听身体的细微反应。",
  },
  狮子座: {
    element: "火象",
    mode: "固定",
    temperament: "自带舞台感，心火一亮，旁人自然会跟着看向你。",
    lesson: "学会让光芒照见众人，而不是只照见自我形象。",
    channel: "心轮热感、创作灵感、上台或发声前的直觉鼓动",
    gift: "凝聚注意力、赋能他人、把抽象意志化成可见的旗帜",
    shadow: "太想证明自己时，灵讯会被面子和期待盖上一层金箔。",
    practice: "适合烛光冥想、舞动舒压、把想说的话先写成宣言。",
  },
  处女座: {
    element: "土象",
    mode: "变动",
    temperament: "敏锐细致，擅长校准偏差，越安静时越能听见细声。",
    lesson: "学会把辨别力用于修正，不必把每一丝不完美都变成负担。",
    channel: "身体小讯号、重复出现的细节、秩序变化带来的警示感",
    gift: "净化杂音、整理系统、让灵感从混沌中长出清晰轮廓",
    shadow: "过度分析会把感应拆得太碎，最后连心意都被审查掉。",
    practice: "适合呼吸计数、清单冥想、在整洁空间里做感应记录。",
  },
  天秤座: {
    element: "风象",
    mode: "本位",
    temperament: "在关系和美感里最有灵魂触角，擅长读懂气场之间的张力。",
    lesson: "学会先站稳自己的轴线，再去调和众人的重心。",
    channel: "人际场域、审美触发、对失衡之处的瞬间不适",
    gift: "协调冲突、提升品味、把抽象感受化成优雅表达",
    shadow: "太想两边都圆时，最真实的讯息会被礼貌悄悄藏起。",
    practice: "适合镜前静观、整理衣饰色彩、在音乐里感受心绪偏转。",
  },
  天蝎座: {
    element: "水象",
    mode: "固定",
    temperament: "感应深沉，洞察力强，很多事未说出口，你已先察其暗流。",
    lesson: "学会把强烈感应化成明灯，而不是化成自我困缚的密室。",
    channel: "梦中象征、情绪底流、沉默时浮出的强烈画面",
    gift: "看见真相、切穿表象、在危机中找到灵魂转机",
    shadow: "若执念太重，灵讯会和心魔缠在一起，真假难分。",
    practice: "适合深呼吸静坐、黑纸白字记梦、在水边做放念仪式。",
  },
  射手座: {
    element: "火象",
    mode: "变动",
    temperament: "向外开张，灵魂喜欢远方、意义和更大的图景。",
    lesson: "学会让自由落在承诺里，让信念经得起现实风吹。",
    channel: "旅途中灵感、哲思顿悟、看见天际时心里忽然一亮",
    gift: "启发他人、拓宽眼界、把低谷翻译成成长的路标",
    shadow: "太急着奔向答案时，容易把猜想误认成天启。",
    practice: "适合行走冥想、阅读后写感悟、对天空发问再静听回音。",
  },
  摩羯座: {
    element: "土象",
    mode: "本位",
    temperament: "冷静克制，意志深长，灵讯多半不是轰鸣，而是稳稳落下的判断。",
    lesson: "学会容许柔软存在，不把一切感应都关进责任的壳里。",
    channel: "长期观察后的确定感、时间节点、重复出现的现实征兆",
    gift: "扛住压力、看远布局、把灵性愿景砌成可走的阶梯",
    shadow: "若总怕失控，就会只信结果，不信内心最早的提醒。",
    practice: "适合日程冥想、山石静观、把每次预感与结果做对照。",
  },
  水瓶座: {
    element: "风象",
    mode: "固定",
    temperament: "思路跳脱，感应常以灵光和非线性联结的方式降临。",
    lesson: "学会让超前直觉落地，不必为了不同而刻意疏离。",
    channel: "突发灵感、同步巧合、电子讯息与社群场域的回响",
    gift: "看见未来趋势、打破旧框、让群体意识出现新的解法",
    shadow: "若只停在观念高空，灵讯虽亮，却难以温暖现实。",
    practice: "适合灵感速记、观察同步事件、把新想法拆成一步行动。",
  },
  双鱼座: {
    element: "水象",
    mode: "变动",
    temperament: "共感力强，梦与直觉都活跃，边界一松，宇宙像会自己说话。",
    lesson: "学会温柔而清楚地设边界，让慈悲不至于流成混沌。",
    channel: "梦境、音乐、祈祷、偶然飘来的画面与情绪潮声",
    gift: "疗愈抚慰、灵感创作、在无形世界里捕捉柔软讯号",
    shadow: "太累或太感伤时，容易把情绪雾气误当神谕天声。",
    practice: "适合睡前祷念、听水声静心、记下醒来第一瞬间的感受。",
  },
};

const ASTRO_ELEMENT_TO_FIVE = {
  火象: "火",
  土象: "土",
  风象: "木",
  水象: "水",
};

const STEM_ELEMENTS = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

const BRANCH_ELEMENTS = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

const GENERATES = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const GENERATED_BY = {
  木: "水",
  火: "木",
  土: "火",
  金: "土",
  水: "金",
};

const CONTROLS = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

const CONTROLLED_BY = {
  木: "金",
  火: "水",
  土: "木",
  金: "火",
  水: "土",
};

const ELEMENT_META = {
  木: {
    color: "青绿、松色",
    direction: "东方、东南",
    advice: "多亲园木，常做伸展，思路要向上生发。",
    industry: ["教育培训", "文化出版", "园林设计", "产品策划", "公益服务"],
  },
  火: {
    color: "绛红、暖橙",
    direction: "正南",
    advice: "宜多行动、多表达，让心火照见前路，不必郁积胸中。",
    industry: ["品牌传播", "内容创作", "餐饮文娱", "互联网运营", "培训演讲"],
  },
  土: {
    color: "土黄、茶褐",
    direction: "中宫、东北、西南",
    advice: "贵在稳扎稳打，守信用、重节奏，先立地再开花。",
    industry: ["供应链管理", "咨询统筹", "行政管理", "地产建筑", "农林食品"],
  },
  金: {
    color: "素白、银灰",
    direction: "正西、西北",
    advice: "宜清理纷杂，守规矩、立边界，做事越利落越得势。",
    industry: ["金融风控", "法律合规", "审计运营", "机械制造", "数据治理"],
  },
  水: {
    color: "玄黑、黛蓝",
    direction: "正北",
    advice: "多蓄心力，勤于思考与复盘，让灵动之气徐徐流转。",
    industry: ["咨询研究", "技术开发", "跨境贸易", "航运物流", "心理服务"],
  },
};

const DAY_MASTER_TRAITS = {
  木: {
    headline: "木盛者仁，心多慈念",
    description: "如松生涧，外柔内劲，重情重义，也不喜无端折腾。",
  },
  火: {
    headline: "火旺者礼，神采自明",
    description: "心热眼亮，待人爽利，若得节制，便有照人之力。",
  },
  土: {
    headline: "土厚者信，稳而能载",
    description: "做事讲分寸，处世求踏实，一旦认准，多半不轻易回头。",
  },
  金: {
    headline: "金清者义，刚中有节",
    description: "骨子里有原则，判断明快，锋芒若藏得住，反成大器。",
  },
  水: {
    headline: "水灵者智，善察人情",
    description: "思路敏捷，感受细密，遇事懂得回旋，不肯死扛。",
  },
};

const GROUP_LABELS = {
  比劫: "比劫",
  食伤: "食伤",
  财星: "财星",
  官杀: "官杀",
  印绶: "印绶",
};

const TEN_GOD_GROUPS = {
  比肩: "比劫",
  劫财: "比劫",
  食神: "食伤",
  伤官: "食伤",
  正财: "财星",
  偏财: "财星",
  正官: "官杀",
  七杀: "官杀",
  正印: "印绶",
  偏印: "印绶",
};

const GROUP_INSIGHTS = {
  比劫: "比劫显眼，多半自立自持，凡事愿亲自上手，胆子不小，主见也重。",
  食伤: "食伤有神，脑子活、嘴也活，适合靠表达、创意与输出立身。",
  财星: "财星透出，重现实、懂经营，钱财爱热闹，但心太急时，它也会假装迷路。",
  官杀: "官杀得位，章法分明，责任心不弱，做事有压舱石，只是别把自己逼得太紧。",
  印绶: "印绶得力，学习力与领悟力俱佳，常得贵人扶持，宜走深耕沉淀之路。",
};

const CAREER_GUIDANCE = {
  比劫: "事业上宜选需要主见、开疆拓土、临场决断的路径，越能独当一面，越见锋芒。",
  食伤: "事业上宜以作品、方案、表达和创意取胜，先让人看见你的价值，再谈位置与回报。",
  财星: "事业上宜往经营、商务、资源整合一类方向使力，重兑现、讲结果，财气便容易停留。",
  官杀: "事业上宜走制度明确、层级清晰、责任边界分明的方向，长期主义比一时冲刺更有利。",
  印绶: "事业上宜深耕专业壁垒，越是需要研究、咨询、教学、策略判断的地方，越能见你的长处。",
};

const FLOW_QUOTES = {
  strong: "天行健，君子以自强不息。",
  balanced: "地势坤，君子以厚德载物。",
  weak: "谦谦君子，卑以自牧。",
};

const SCORE_BANDS = [
  { min: 86, key: "peak", label: "鸿运当头", prompt: "可择要事先行" },
  { min: 76, key: "rise", label: "顺势而行", prompt: "利推进与沟通" },
  { min: 66, key: "steady", label: "平中见喜", prompt: "利稳步深耕" },
  { min: 56, key: "guard", label: "藏锋养气", prompt: "宜查漏补缺" },
  { min: 0, key: "low", label: "宜守为先", prompt: "缓行更见转机" },
];

const MODE_WEEKDAY_BONUS = {
  本位: { 0: 1, 1: 2, 4: 1 },
  固定: { 2: 2, 5: 1, 6: 1 },
  变动: { 0: 1, 3: 2, 5: 1 },
};

const DEMO_PROFILE = {
  name: "云舟",
  gender: "male",
  city: "杭州",
  starSign: "狮子座",
  birthDate: "1993-08-17",
  birthTime: "09:28",
};

const state = {
  currentReading: null,
  messages: [],
  exportBusy: false,
};

const app = document.querySelector("#app");

renderShell();
bindEvents();

function renderShell() {
  app.innerHTML = `
    <div class="scene">
      <div class="mist mist-a"></div>
      <div class="mist mist-b"></div>
      <main class="layout">
        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">小光子 · 易学小馆</p>
            <h1>${OPENING_LINE}</h1>
            <p class="lead">
              输入性别、出生城市、生辰时刻与星座，起一局四柱，再合星象灵讯与运势分数，一并细看。
            </p>
          </div>
          <div class="hero-note">
            <p>问命四要：性别、出生城市、生辰时刻、星座。</p>
            <p>差之毫厘，谬以千里；若有一项未明，断语便不敢轻下。</p>
          </div>
        </section>

        <section class="workspace">
          <div class="panel form-panel">
            <div class="panel-head">
              <h2>起盘问命</h2>
              <button id="demo-button" class="ghost-button" type="button">载入示例</button>
            </div>

            <form id="fortune-form" class="fortune-form">
              <label>
                <span>缘主称呼</span>
                <input name="name" type="text" maxlength="16" placeholder="可留空，如：明川" />
              </label>

              <label>
                <span>性别</span>
                <select name="gender" required>
                  <option value="">请先选择</option>
                  <option value="male">乾造</option>
                  <option value="female">坤造</option>
                </select>
              </label>

              <label>
                <span>出生城市</span>
                <input
                  name="city"
                  type="text"
                  maxlength="24"
                  required
                  placeholder="如：苏州、成都、Singapore"
                />
              </label>

              <label>
                <span>星座</span>
                <select name="starSign" required>
                  <option value="">请先选择太阳星座</option>
                  ${STAR_SIGN_OPTIONS.map((sign) => `<option value="${sign}">${sign}</option>`).join("")}
                </select>
              </label>

              <div class="split-grid">
                <label>
                  <span>出生日期</span>
                  <input name="birthDate" type="date" required />
                </label>

                <label>
                  <span>出生时刻</span>
                  <input name="birthTime" type="time" required />
                </label>
              </div>

              <button class="primary-button" type="submit">起盘一观</button>
            </form>

            <p class="form-footnote">
              本页以传统命理文化为灵感，适合作为娱乐与自我观察，不作医疗、法律或投资依据。
            </p>
          </div>

          <section id="result-panel" class="panel result-panel" aria-live="polite">
            ${renderEmptyState("山门已开，只待生辰。填好信息后，小光子自会为你排出四柱，细看五行消长。")}
          </section>
        </section>
      </main>
    </div>
  `;
}

function bindEvents() {
  app.addEventListener("submit", handleSubmit);
  app.addEventListener("click", handleClick);
}

function handleSubmit(event) {
  if (event.target.matches("#fortune-form")) {
    handleFortuneSubmit(event);
    return;
  }

  if (event.target.matches("#chat-form")) {
    handleChatSubmit(event);
  }
}

function handleClick(event) {
  const demoButton = event.target.closest("#demo-button");
  if (demoButton) {
    const form = document.querySelector("#fortune-form");
    fillDemo(form);
    form.requestSubmit();
    return;
  }

  const promptButton = event.target.closest("[data-chat-prompt]");
  if (promptButton) {
    submitFollowUp(promptButton.dataset.chatPrompt);
    return;
  }

  const exportButton = event.target.closest("#export-button");
  if (exportButton) {
    exportCurrentReading();
  }
}

function handleFortuneSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const input = {
    name: (formData.get("name") || "").toString().trim(),
    gender: (formData.get("gender") || "").toString(),
    city: (formData.get("city") || "").toString().trim(),
    starSign: (formData.get("starSign") || "").toString(),
    birthDate: (formData.get("birthDate") || "").toString(),
    birthTime: (formData.get("birthTime") || "").toString(),
  };

  if (!input.gender || input.city.length < 2 || !input.starSign) {
    renderPanel(
      renderEmptyState(
        "性别、出生城市与星座尚未说清。差之毫厘，谬以千里，还请先补全这几项，再来论命。",
      ),
    );
    return;
  }

  if (!input.birthDate || !input.birthTime) {
    renderPanel(
      renderEmptyState(
        "年、月、日、时须四者齐备。若时辰未定，先寻家中长辈问明，再来起盘不迟。",
      ),
    );
    return;
  }

  try {
    const reading = buildReading(input);
    state.currentReading = reading;
    state.messages = buildInitialDialogue(reading);
    renderResult();
  } catch (error) {
    console.error(error);
    renderPanel(
      renderEmptyState("这一局未能顺利落盘。请检查日期与时刻是否真实有效，再试一次。"),
    );
  }
}

function handleChatSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const question = form.elements.question.value.trim();

  if (!question) {
    return;
  }

  submitFollowUp(question);
  form.reset();
}

function submitFollowUp(question) {
  if (!state.currentReading) {
    return;
  }

  const cleanQuestion = question.trim();
  if (!cleanQuestion) {
    return;
  }

  state.messages = [
    ...state.messages,
    { role: "user", text: cleanQuestion },
    { role: "assistant", text: buildFollowUpReply(cleanQuestion, state.currentReading) },
  ];

  renderResult();
}

function fillDemo(form) {
  form.elements.name.value = DEMO_PROFILE.name;
  form.elements.gender.value = DEMO_PROFILE.gender;
  form.elements.city.value = DEMO_PROFILE.city;
  form.elements.starSign.value = DEMO_PROFILE.starSign;
  form.elements.birthDate.value = DEMO_PROFILE.birthDate;
  form.elements.birthTime.value = DEMO_PROFILE.birthTime;
}

function renderResult() {
  if (!state.currentReading) {
    renderPanel(
      renderEmptyState("山门已开，只待生辰。填好信息后，小光子自会为你排出四柱，细看五行消长。"),
    );
    return;
  }

  renderPanel(renderReading(state.currentReading, state.messages, state.exportBusy));

  requestAnimationFrame(() => {
    const chatLog = document.querySelector("#chat-log");
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  });
}

function buildReading(input) {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const dayStem = eightChar.getDayGan();
  const dayElement = STEM_ELEMENTS[dayStem];
  const genderLabel = input.gender === "male" ? "乾造" : "坤造";

  const pillars = [
    buildPillar(
      "年柱",
      eightChar.getYear(),
      eightChar.getYearWuXing(),
      eightChar.getYearNaYin(),
      eightChar.getYearShiShenGan(),
      eightChar.getYearShiShenZhi(),
    ),
    buildPillar(
      "月柱",
      eightChar.getMonth(),
      eightChar.getMonthWuXing(),
      eightChar.getMonthNaYin(),
      eightChar.getMonthShiShenGan(),
      eightChar.getMonthShiShenZhi(),
    ),
    buildPillar(
      "日柱",
      eightChar.getDay(),
      eightChar.getDayWuXing(),
      eightChar.getDayNaYin(),
      eightChar.getDayShiShenGan(),
      eightChar.getDayShiShenZhi(),
    ),
    buildPillar(
      "时柱",
      eightChar.getTime(),
      eightChar.getTimeWuXing(),
      eightChar.getTimeNaYin(),
      eightChar.getTimeShiShenGan(),
      eightChar.getTimeShiShenZhi(),
    ),
  ];

  const elementProfile = analyzeElements(pillars);
  const strength = judgeDayMasterStrength(
    dayElement,
    pillars[1].branchElement,
    elementProfile.weighted,
  );
  const favorable = pickFavorableElements(dayElement, strength.level, elementProfile);
  const tenGodProfile = analyzeTenGodProfile(eightChar);
  const currentLuck = buildCurrentLuck(eightChar, input.gender, solar, favorable, dayStem);
  const starProfile = analyzeStarSign(
    input.starSign,
    input.birthDate,
    favorable,
    strength,
    tenGodProfile,
  );
  const fortuneProfile = buildFortuneProfile(favorable, currentLuck, starProfile, strength);

  const displayName = input.name || "缘主";
  const lunarText = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  return {
    displayName,
    gender: input.gender,
    genderLabel,
    city: input.city,
    starSign: input.starSign,
    starProfile,
    fortuneProfile,
    solarText: solar.toYmdHms().slice(0, 16),
    lunarText,
    zodiac: lunar.getYearShengXiao(),
    dayStem,
    dayElement,
    pillars,
    elementProfile,
    strength,
    favorable,
    tenGodProfile,
    currentLuck,
    extras: {
      mingGong: eightChar.getMingGong(),
      shenGong: eightChar.getShenGong(),
      taiYuan: eightChar.getTaiYuan(),
      yearQuote: FLOW_QUOTES[strength.level],
    },
    prose: {
      overall: buildOverallText(
        displayName,
        input.city,
        solar,
        lunarText,
        dayElement,
        strength,
        elementProfile,
        tenGodProfile,
      ),
      career: buildCareerText(tenGodProfile, favorable, strength),
      relationship: buildRelationshipText(
        input.gender,
        tenGodProfile,
        favorable,
        pillars[2],
        strength,
      ),
      annual: buildAnnualText(currentLuck),
      remedy: buildRemedyText(favorable, elementProfile),
      astro: buildAstroText(displayName, starProfile, tenGodProfile, favorable, strength),
    },
  };
}

function buildPillar(label, ganzhi, wuxing, nayin, stemTenGod, branchTenGods) {
  return {
    label,
    ganzhi,
    wuxing,
    nayin,
    stem: ganzhi.charAt(0),
    branch: ganzhi.charAt(1),
    stemElement: STEM_ELEMENTS[ganzhi.charAt(0)],
    branchElement: BRANCH_ELEMENTS[ganzhi.charAt(1)],
    stemTenGod,
    branchTenGods,
  };
}

function analyzeElements(pillars) {
  const raw = createZeroCounts();
  const weighted = createZeroCounts();

  pillars.forEach((pillar, index) => {
    raw[pillar.stemElement] += 1;
    raw[pillar.branchElement] += 1;

    let stemWeight = 1.15;
    let branchWeight = 1;

    if (index === 1) {
      stemWeight += 0.35;
      branchWeight += 0.65;
    }

    if (index === 2) {
      stemWeight += 0.45;
    }

    weighted[pillar.stemElement] += stemWeight;
    weighted[pillar.branchElement] += branchWeight;
  });

  return {
    raw,
    weighted,
    dominant: [...ELEMENTS].sort((left, right) => weighted[right] - weighted[left]),
    missing: ELEMENTS.filter((element) => raw[element] === 0),
  };
}

function judgeDayMasterStrength(dayElement, seasonElement, weighted) {
  const support = weighted[dayElement] * 1.05 + weighted[GENERATED_BY[dayElement]] * 0.95;
  const drain =
    weighted[GENERATES[dayElement]] * 0.72 +
    weighted[CONTROLS[dayElement]] * 0.78 +
    weighted[CONTROLLED_BY[dayElement]] * 0.68;

  let seasonBias = 0;
  if (seasonElement === dayElement) {
    seasonBias = 1.15;
  } else if (seasonElement === GENERATED_BY[dayElement]) {
    seasonBias = 0.9;
  } else if (seasonElement === GENERATES[dayElement]) {
    seasonBias = -0.6;
  } else if (seasonElement === CONTROLLED_BY[dayElement]) {
    seasonBias = -0.8;
  } else if (seasonElement === CONTROLS[dayElement]) {
    seasonBias = -0.45;
  }

  const score = support + seasonBias - drain;

  if (score >= 1.45) {
    return { level: "strong", label: "日主偏旺", score };
  }

  if (score <= -1.05) {
    return { level: "weak", label: "日主偏弱", score };
  }

  return { level: "balanced", label: "日主中和", score };
}

function pickFavorableElements(dayElement, strengthLevel, elementProfile) {
  if (strengthLevel === "weak") {
    return {
      useful: unique([GENERATED_BY[dayElement], dayElement]),
      avoid: unique([GENERATES[dayElement], CONTROLS[dayElement]]),
      method: "宜扶宜助",
    };
  }

  if (strengthLevel === "strong") {
    return {
      useful: unique([GENERATES[dayElement], CONTROLS[dayElement]]),
      avoid: unique([dayElement, GENERATED_BY[dayElement]]),
      method: "宜泄宜耗",
    };
  }

  const weakest = [...ELEMENTS].sort(
    (left, right) => elementProfile.weighted[left] - elementProfile.weighted[right],
  );

  return {
    useful: unique([weakest[0], weakest[1]]),
    avoid: unique([elementProfile.dominant[0], elementProfile.dominant[1]]),
    method: "宜求平衡",
  };
}

function analyzeTenGodProfile(eightChar) {
  const scores = {
    比劫: 0,
    食伤: 0,
    财星: 0,
    官杀: 0,
    印绶: 0,
  };

  const items = [
    { god: eightChar.getYearShiShenGan(), weight: 1.0 },
    { god: eightChar.getMonthShiShenGan(), weight: 1.4 },
    { god: eightChar.getDayShiShenGan(), weight: 1.2 },
    { god: eightChar.getTimeShiShenGan(), weight: 1.0 },
  ];

  [
    eightChar.getYearShiShenZhi(),
    eightChar.getMonthShiShenZhi(),
    eightChar.getDayShiShenZhi(),
    eightChar.getTimeShiShenZhi(),
  ].forEach((gods, pillarIndex) => {
    gods.forEach((god, index) => {
      let weight = index === 0 ? 0.85 : 0.5;
      if (pillarIndex === 1) {
        weight += 0.15;
      }
      items.push({ god, weight });
    });
  });

  items.forEach(({ god, weight }) => {
    const group = TEN_GOD_GROUPS[god];
    if (group) {
      scores[group] += weight;
    }
  });

  const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);

  return {
    scores,
    ranked,
    dominant: ranked[0][0],
    secondary: ranked[1][0],
  };
}

function buildCurrentLuck(eightChar, gender, birthSolar, favorable, dayStem) {
  const genderCode = gender === "male" ? 1 : 0;
  const yun = eightChar.getYun(genderCode, 2);
  const daYunList = yun.getDaYun(10);
  const todaySolar = Solar.fromDate(new Date());
  const todayLunar = todaySolar.getLunar();
  const currentYear = todaySolar.getYear();

  const activeDaYun =
    daYunList.find(
      (item) => currentYear >= item.getStartYear() && currentYear <= item.getEndYear(),
    ) || daYunList[0];

  const currentYearGanZhi = todayLunar.getYearInGanZhiExact();
  const currentMonthGanZhi = todayLunar.getMonthInGanZhiExact();
  const daYunGanZhi = activeDaYun.getGanZhi();
  const combinedScore =
    scoreFlow(currentYearGanZhi, favorable) +
    scoreFlow(currentMonthGanZhi, favorable) +
    (daYunGanZhi ? scoreFlow(daYunGanZhi, favorable) : 0);

  return {
    todayLabel: `${todaySolar.getYear()}年${pad(todaySolar.getMonth())}月${pad(todaySolar.getDay())}日`,
    currentYearGanZhi,
    currentMonthGanZhi,
    yearScore: scoreFlow(currentYearGanZhi, favorable),
    monthScore: scoreFlow(currentMonthGanZhi, favorable),
    activeDaYun,
    daYunGanZhi,
    daYunScore: daYunGanZhi ? scoreFlow(daYunGanZhi, favorable) : 0,
    startSolarText: yun.getStartSolar().toYmdHms().slice(0, 16),
    age: calculateAge(birthSolar, todaySolar),
    yearTenGod: LunarUtil.SHI_SHEN[dayStem + currentYearGanZhi.charAt(0)],
    daYunTenGod: daYunGanZhi ? LunarUtil.SHI_SHEN[dayStem + daYunGanZhi.charAt(0)] : "本命余气",
    combinedScore,
  };
}

function buildOverallText(displayName, city, solar, lunarText, dayElement, strength, elementProfile, tenGodProfile) {
  const trait = DAY_MASTER_TRAITS[dayElement];
  const strongElement = elementProfile.dominant[0];
  const softElement = elementProfile.dominant[elementProfile.dominant.length - 1];
  const strengthText =
    strength.level === "strong"
      ? "骨力不弱，遇事多半自有章程，不轻随人起舞。"
      : strength.level === "weak"
        ? "心思细密，善于借势而行，得助则快，孤战则劳。"
        : "气机中和，进退有度，能硬能软，颇懂分寸。";

  return [
    `${trait.headline}。${displayName}生于${city}，阳历${solar.toYmdHms().slice(0, 16)}，农历${lunarText}。`,
    `日主属${dayElement}，${trait.description}${strengthText}`,
    `命局里${strongElement}气稍盛，${softElement}气略浅，故人多见其表，少知其里。`,
    `${GROUP_INSIGHTS[tenGodProfile.dominant]} ${FLOW_QUOTES[strength.level]}`,
  ].join("");
}

function buildCareerText(tenGodProfile, favorable, strength) {
  const industries = unique(
    favorable.useful.flatMap((element) => ELEMENT_META[element].industry),
  ).slice(0, 4);

  const paceText =
    strength.level === "strong"
      ? "宜立规矩、带节奏，把锋芒落在执行与落地上。"
      : strength.level === "weak"
        ? "宜借平台、借团队、借资源，忌单枪匹马硬扛全局。"
        : "宜稳步深耕，先做口碑，再求位置，越沉越稳。";

  return [
    `${CAREER_GUIDANCE[tenGodProfile.dominant]}`,
    `若把功夫放在${industries.join("、")}一类方向，往往更容易顺水推舟。`,
    `${paceText} 财名双修，贵在久久为功，不在一时起伏。`,
  ].join("");
}

function buildRelationshipText(gender, tenGodProfile, favorable, dayPillar, strength) {
  const spouseGroup = gender === "male" ? "财星" : "官杀";
  const spouseScore = tenGodProfile.scores[spouseGroup];
  const spouseElement = dayPillar.branchElement;
  const palaceAligned = favorable.useful.includes(spouseElement);

  let tone = "姻缘平稳，重在相处之道。";
  if (spouseScore >= 2.8 && palaceAligned) {
    tone = "情缘不薄，若遇真心之人，多能由浅入深，渐成久伴。";
  } else if (spouseScore <= 1.5) {
    tone = "缘分来得不算太早，宜慢看、慢选、慢定，切莫为寂寞仓促入局。";
  }

  const strengthHint =
    strength.level === "strong"
      ? "你若肯放软三分，反而更能守住情分。"
      : strength.level === "weak"
        ? "先稳住自己的边界，再谈依靠与依恋，姻缘才不至于失衡。"
        : "情与理若能并行，家运便易和暖。";

  return [
    `${tone}`,
    `夫妻宫落${dayPillar.branch}，其气属${spouseElement}，与喜用之气${palaceAligned ? "相应" : "稍有偏离"}。`,
    `${strengthHint} 有话直说七分，留三分回旋，往往比句句较真更见福气。`,
  ].join("");
}

function buildAnnualText(currentLuck) {
  const yearStatus = describeFlowStatus(currentLuck.yearScore + currentLuck.daYunScore);
  const monthStatus = describeFlowStatus(currentLuck.monthScore);
  const daYunPart = currentLuck.daYunGanZhi
    ? `眼下行至${currentLuck.daYunGanZhi}大运，约在${currentLuck.activeDaYun.getStartYear()}至${currentLuck.activeDaYun.getEndYear()}之间，主调偏向${currentLuck.daYunTenGod}。`
    : "目前仍在本命余气之中，行运之门方开未久。";

  const yearStemElement = STEM_ELEMENTS[currentLuck.currentYearGanZhi.charAt(0)];
  const yearBranchElement = BRANCH_ELEMENTS[currentLuck.currentYearGanZhi.charAt(1)];
  const caution =
    currentLuck.yearScore + currentLuck.daYunScore < 0
      ? "此时宜稳中求进，少与人争口舌，遇急事先缓一缓，远离水火之地。"
      : "此时可顺势推进，但仍须留后手，勿因一时顺风而轻忽细节。";

  return [
    `以${currentLuck.todayLabel}所观，流年为${currentLuck.currentYearGanZhi}，流月为${currentLuck.currentMonthGanZhi}。`,
    `${daYunPart}`,
    `今年天干之象偏${currentLuck.yearTenGod}，${yearStemElement}${yearBranchElement}之气合看，整体是${yearStatus}之象；当月则偏${monthStatus}。`,
    `${caution}`,
  ].join("");
}

function buildRemedyText(favorable, elementProfile) {
  const usefulText = favorable.useful
    .map(
      (element) =>
        `${element}为喜：可用${ELEMENT_META[element].color}之色，多向${ELEMENT_META[element].direction}取气；${ELEMENT_META[element].advice}`,
    )
    .join(" ");

  const missingText =
    elementProfile.missing.length > 0
      ? `命局中${elementProfile.missing.join("、")}气偏浅，不必自惊，平日慢慢调匀便是。`
      : "五行俱全，难得在于调匀，不在一味添多。";

  return `${missingText}${favorable.method}。${usefulText} 忌神偏在${favorable.avoid.join("、")}，心态上少贪快、少逞强、少反复，很多波折便会自行退去。`;
}

function inferStarSign(month, day) {
  const value = month * 100 + day;
  if (value >= 321 && value <= 419) return "白羊座";
  if (value >= 420 && value <= 520) return "金牛座";
  if (value >= 521 && value <= 620) return "双子座";
  if (value >= 621 && value <= 722) return "巨蟹座";
  if (value >= 723 && value <= 822) return "狮子座";
  if (value >= 823 && value <= 922) return "处女座";
  if (value >= 923 && value <= 1022) return "天秤座";
  if (value >= 1023 && value <= 1121) return "天蝎座";
  if (value >= 1122 && value <= 1221) return "射手座";
  if (value >= 1222 || value <= 119) return "摩羯座";
  if (value >= 120 && value <= 218) return "水瓶座";
  return "双鱼座";
}

function analyzeStarSign(starSign, birthDate, favorable, strength, tenGodProfile) {
  const [, month, day] = birthDate.split("-").map(Number);
  const inferredSign = inferStarSign(month, day);
  const meta = STAR_SIGN_META[starSign];
  const fiveHint = ASTRO_ELEMENT_TO_FIVE[meta.element];

  let resonance = "星座之气与命局互作参照，一静一动，恰可照见你心里另一面。";
  let resonanceScore = 1;

  if (favorable.useful.includes(fiveHint)) {
    resonance = "你所选星座的象意，和命盘喜用之气颇为投缘，灵感更容易顺流而来。";
    resonanceScore = 5;
  } else if (favorable.avoid.includes(fiveHint)) {
    resonance = "此星座脾性与命盘原有执念偶会相顶，越在情绪起伏时，越要慢下来辨真假。";
    resonanceScore = -4;
  }

  const channelTone =
    strength.level === "strong"
      ? "感应来时多半直接、炽烈，宜先落纸，再作判断，免得把直觉用成冲动。"
      : strength.level === "weak"
        ? "感应来时像潮水或薄雾，宜先安神、稳边界，再分辨哪些真是你的讯息。"
        : "感应来时较有层次，既可听心，也可用理性复核，最忌半信半疑又强行占断。";

  const personalityMirror =
    tenGodProfile.dominant === "食伤"
      ? "你命里本就带表达与外放之门，星座会把这种光亮照得更鲜。"
      : tenGodProfile.dominant === "印绶"
        ? "你命里偏重内观与体悟，星座会让这份细腻更像月光映水。"
        : "命盘主气与星象之气彼此映照，像两盏灯，一盏照现实，一盏照心海。";

  return {
    sign: starSign,
    inferredSign,
    matchesBirthDate: starSign === inferredSign,
    meta,
    fiveHint,
    resonance,
    resonanceScore,
    channelTone,
    personalityMirror,
  };
}

function buildAstroText(displayName, starProfile, tenGodProfile, favorable, strength) {
  const { sign, inferredSign, matchesBirthDate, meta, resonance, channelTone, personalityMirror } = starProfile;
  const usefulColors = favorable.useful.map((element) => ELEMENT_META[element].color).join("、");
  const note = matchesBirthDate
    ? ""
    : `若按常见日期推算，你的生日更接近${inferredSign}；不过此处仍以你亲自认定的${sign}为准。`;
  const leadershipTone =
    strength.level === "strong"
      ? "此象一旺，宜把锋芒化成担当，切莫只求快意。"
      : strength.level === "weak"
        ? "此象一动，宜先稳住心神，再去接讯，方不至于心海翻波。"
        : "此象与命局相和，静中有动，动中有衡。";

  return [
    `${displayName}自述太阳星座为${sign}，属${meta.element}${meta.mode}，${meta.temperament}`,
    `${personalityMirror} 灵魂课题偏在${meta.lesson}`,
    `若从通灵维度轻轻一探，你较容易通过${meta.channel}接收微妙讯号，天赋在于${meta.gift}；需提防的是：${meta.shadow}`,
    `${resonance}${channelTone}${leadershipTone}`,
    `平日可多用${usefulColors}一类色调安神定气，并试试${meta.practice}`,
    note,
  ].join("");
}

function buildFortuneProfile(favorable, currentLuck, starProfile, strength) {
  const baseDate = new Date();
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 12, 0, 0, 0);
  const series = Array.from({ length: 30 }, (_, offset) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset, 12, 0, 0, 0);
    const solar = Solar.fromDate(date);
    const score = calculateFortuneScore(solar, favorable, currentLuck, starProfile, strength, offset);
    const band = getScoreBand(score);
    return {
      index: offset,
      dateLabel: `${solar.getMonth()}/${solar.getDay()}`,
      isoDate: `${solar.getYear()}-${pad(solar.getMonth())}-${pad(solar.getDay())}`,
      score,
      band,
    };
  });

  const averageScore = Math.round(series.reduce((sum, item) => sum + item.score, 0) / series.length);
  const peak = series.reduce((best, item) => (item.score > best.score ? item : best), series[0]);
  const trough = series.reduce((best, item) => (item.score < best.score ? item : best), series[0]);
  const firstWeek = average(series.slice(0, 7).map((item) => item.score));
  const lastWeek = average(series.slice(-7).map((item) => item.score));
  const trend = describeMonthTrend(firstWeek, lastWeek);
  const luckyDays = [...series]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .sort((left, right) => left.index - right.index)
    .map((item) => item.dateLabel)
    .join("、");

  return {
    todayDateLabel: formatDateLabel(start),
    todayScore: series[0].score,
    todayBand: series[0].band,
    todaySummary: buildTodaySummary(series[0].score, currentLuck, starProfile),
    todayAdvice: buildTodayAdvice(series[0].score, favorable),
    averageScore,
    peak,
    trough,
    series,
    monthlySummary: `未来一月${trend}，月均约${averageScore}分，高点多落在${luckyDays}前后。峰处宜进，低处宜守，顺势而为便是。`,
  };
}

function calculateFortuneScore(solar, favorable, currentLuck, starProfile, strength, offset) {
  const lunar = solar.getLunar();
  const dayGanZhi = lunar.getDayInGanZhiExact();
  const monthGanZhi = lunar.getMonthInGanZhiExact();
  const yearGanZhi = lunar.getYearInGanZhiExact();
  const dayScore = scoreFlow(dayGanZhi, favorable);
  const monthScore = scoreFlow(monthGanZhi, favorable);
  const yearScore = scoreFlow(yearGanZhi, favorable);
  const astroElement = ASTRO_ELEMENT_TO_FIVE[starProfile.meta.element];
  const astroBonus = favorable.useful.includes(astroElement)
    ? 4
    : favorable.avoid.includes(astroElement)
      ? -4
      : 1;
  const weekday = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay()).getDay();
  const modeBonus = MODE_WEEKDAY_BONUS[starProfile.meta.mode]?.[weekday] || 0;
  const wave = Math.round(Math.sin((offset + STAR_SIGN_OPTIONS.indexOf(starProfile.sign) * 1.4) / 2.7) * 6);
  const strengthBias =
    strength.level === "balanced"
      ? 2
      : strength.level === "weak"
        ? dayScore > 0
          ? 3
          : -1
        : dayScore < 0
          ? -2
          : 1;

  return clamp(
    Math.round(
      64 +
        dayScore * 7 +
        monthScore * 4 +
        yearScore * 3 +
        currentLuck.daYunScore * 3 +
        astroBonus +
        starProfile.resonanceScore +
        modeBonus +
        wave +
        strengthBias,
    ),
    28,
    98,
  );
}

function buildTodaySummary(score, currentLuck, starProfile) {
  const band = getScoreBand(score);
  const flow = describeFlowStatus(currentLuck.combinedScore);

  if (score >= 86) {
    return `今日${score}分，属${band.label}之象。天时地气相应，可把重要之事择其一先行，容易见回音。`;
  }

  if (score >= 76) {
    return `今日${score}分，气机上扬。你这颗${starProfile.sign}的心火或心潮，和眼下${flow}之势颇能同拍。`;
  }

  if (score >= 66) {
    return `今日${score}分，平中见喜。宜稳步推进、细水长流，越讲节奏，越不容易失手。`;
  }

  if (score >= 56) {
    return `今日${score}分，外势不算喧哗。适合收束杂念、整理旧账，把气力放在打底与修枝。`;
  }

  return `今日${score}分，宜守为先。凡事先缓一拍，少争高下，避开水火躁场，反而容易保住元气。`;
}

function buildTodayAdvice(score, favorable) {
  const colors = favorable.useful.map((element) => ELEMENT_META[element].color).join("、");

  if (score >= 76) {
    return `今日利会面、定案、递话头。可多用${colors}一类色调助气，先做最关键的一步。`;
  }

  if (score >= 66) {
    return `今日宜把进度做扎实。先处理已开之局，再谈新增，稳稳落子最得分。`;
  }

  if (score >= 56) {
    return `今日适合复盘、归档、清理人情与事务边界。把节奏收回来，比硬冲更吉。`;
  }

  return `今日宜静心养气，不必逞快。远离无谓争执与水火之险，多睡半刻，也是一种化解。`;
}

function describeMonthTrend(firstWeek, lastWeek) {
  const delta = Math.round(lastWeek - firstWeek);

  if (delta >= 6) {
    return "月势渐开";
  }

  if (delta <= -6) {
    return "前高后敛";
  }

  return "起伏尚稳";
}

function buildInitialDialogue(reading) {
  return [
    { role: "assistant", text: OPENING_LINE },
    {
      role: "user",
      text: `${reading.displayName}，${reading.genderLabel}，出生于${reading.city}，${reading.solarText}，星座为${reading.starSign}。请先生起盘一观。`,
    },
    { role: "assistant", text: reading.prose.overall },
    { role: "assistant", text: `事业可观：${reading.prose.career}` },
    { role: "assistant", text: `姻缘与流年同参：${reading.prose.relationship}${reading.prose.annual}` },
    { role: "assistant", text: `再合星座之象与灵讯一观：${reading.prose.astro}` },
    {
      role: "assistant",
      text: `若问今日气数，眼下评分约${reading.fortuneProfile.todayScore}分。${reading.fortuneProfile.todaySummary}${reading.fortuneProfile.todayAdvice}`,
    },
    { role: "assistant", text: `化解之道在此：${reading.prose.remedy}` },
  ];
}

function buildFollowUpReply(question, reading) {
  const intent = detectIntent(question);

  if (intent === "career") {
    const industries = unique(
      reading.favorable.useful.flatMap((element) => ELEMENT_META[element].industry),
    ).slice(0, 3);
    return `你这一问，正切命门。命里以${reading.tenGodProfile.dominant}为主，${CAREER_GUIDANCE[reading.tenGodProfile.dominant]} 近处宜从${industries.join("、")}一类方向先落子，先积口碑，再扩版图，切莫贪多求快。`;
  }

  if (intent === "wealth") {
    const wealthScore = reading.tenGodProfile.scores.财星;
    const flow = describeFlowStatus(reading.currentLuck.yearScore + reading.currentLuck.daYunScore);
    const wealthTone =
      wealthScore >= 2.6
        ? "财星不弱，得财多靠经营、谈判、资源调度，而非空等好运。"
        : "财星不算太闹，财路宜求稳，不宜拿心气去赌运气。";
    return `${wealthTone} 眼下大运在${reading.currentLuck.daYunGanZhi || "本命余气"}，流势属${flow}。求财之法，当先守现金流与节奏，再谈放大；若见机会，也宜层层试水，不可一把梭哈。`;
  }

  if (intent === "relationship") {
    const spouseGroup = reading.gender === "male" ? "财星" : "官杀";
    return `缘分之事，贵在时机与心性同到。你命中${spouseGroup}之气分量为${reading.tenGodProfile.scores[spouseGroup].toFixed(1)}，${reading.prose.relationship} 若遇合眼之人，不妨多看其人品、节律与担当，胜过只看一时心动。`;
  }

  if (intent === "study") {
    const studyLead =
      reading.tenGodProfile.scores.印绶 >= reading.tenGodProfile.scores.食伤
        ? "印绶得力，读书、考证、深造这一脉并不差，重在静心与持续。"
        : "食伤偏强，理解力与表达力不错，越是题海之外讲方法的学习，越能见长。";
    return `${studyLead} 若问考试，宜先整顿作息，再定节奏，把零散知识收成体系。喜用在${reading.favorable.useful.join("、")}，临考时多用${reading.favorable.useful.map((element) => ELEMENT_META[element].color).join("、")}一类色调，能帮你稳神定气。`;
  }

  if (intent === "health") {
    const strongest = reading.elementProfile.dominant[0];
    const weakest = reading.elementProfile.dominant[reading.elementProfile.dominant.length - 1];
    return `命理看养生，只讲趋避，不作惊人之语。你局中${strongest}气偏盛，${weakest}气略浅，平日宜顺着喜用去调息。${reading.prose.remedy} 若近来身心发紧，先调睡眠与饮食，少熬夜、少动无名火，行路处事也尽量避开水火之险。`;
  }

  if (intent === "daily") {
    return `${reading.fortuneProfile.todaySummary}${reading.fortuneProfile.todayAdvice} 若把今日拆开看，能做的不是把事全做完，而是先做最要紧的一步。`;
  }

  if (intent === "monthly") {
    return `${reading.fortuneProfile.monthlySummary} 眼下高点约在${reading.fortuneProfile.peak.dateLabel}前后，分数可达${reading.fortuneProfile.peak.score}；低点在${reading.fortuneProfile.trough.dateLabel}附近，约${reading.fortuneProfile.trough.score}分。高时不忘留余地，低时不忘守心气。`;
  }

  if (intent === "annual") {
    const trend = describeFlowStatus(reading.currentLuck.combinedScore);
    return `时运之事，要看大运、流年、流月一同说话。眼下你在${reading.currentLuck.daYunGanZhi || "本命余气"}之中，今年为${reading.currentLuck.currentYearGanZhi}，当月为${reading.currentLuck.currentMonthGanZhi}，合起来是${trend}之象。${reading.prose.annual}`;
  }

  if (intent === "astro") {
    return `${reading.prose.astro} 若要把这份星座分析用得稳当，记住一句：先感受，后命名，再验证，不必逢念头便当神谕。`;
  }

  if (intent === "personality") {
    return `${reading.prose.overall} 若自觉有时拧、有时累，那不是命坏，只是气机偏向某一端。知其偏，便能调其偏。`;
  }

  return `你这一问，关乎全局。总看此命，日主${reading.dayStem}${reading.dayElement}，${reading.strength.label}，喜用在${reading.favorable.useful.join("、")}。眼下最要紧的，不是四处乱求，而是守住节奏、调匀心气。若愿意，可再细问事业、财运、姻缘、学业、今日运势或月运走势。`;
}

function detectIntent(question) {
  if (/财|赚钱|收入|副业|生意|投资|存款/.test(question)) {
    return "wealth";
  }

  if (/事业|工作|职业|升职|创业|跳槽|发展/.test(question)) {
    return "career";
  }

  if (/姻缘|感情|婚姻|对象|桃花|恋爱|另一半/.test(question)) {
    return "relationship";
  }

  if (/学业|考试|读书|升学|深造|证书|考研|留学/.test(question)) {
    return "study";
  }

  if (/健康|身体|睡眠|情绪|压力|作息|养生/.test(question)) {
    return "health";
  }

  if (/今日|今天|每日|打分|评分/.test(question)) {
    return "daily";
  }

  if (/本月|一个月|月运|曲线|折线图|走势/.test(question)) {
    return "monthly";
  }

  if (/流年|今年|明年|近年|最近|何时|什么时候/.test(question)) {
    return "annual";
  }

  if (/星座|灵性|通灵|灵讯|宇宙|能量|占星|第六感/.test(question)) {
    return "astro";
  }

  if (/性格|自己|优点|缺点|脾气|个性/.test(question)) {
    return "personality";
  }

  return "general";
}

async function exportCurrentReading() {
  if (!state.currentReading || state.exportBusy) {
    return;
  }

  state.exportBusy = true;
  renderResult();

  try {
    const shareSheet = document.querySelector("#share-sheet");
    if (!shareSheet) {
      throw new Error("share sheet missing");
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await nextFrame();
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(shareSheet, {
      backgroundColor: "#efe4cf",
      scale: Math.min(window.devicePixelRatio || 2, 3),
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `${sanitizeFileName(state.currentReading.displayName)}-小光子命书.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error(error);
    window.alert("命书绘制时起了些风，请稍后再试。");
  } finally {
    state.exportBusy = false;
    renderResult();
  }
}

function renderReading(reading, messages, exportBusy) {
  const strongest = reading.elementProfile.dominant[0];
  const weakest = reading.elementProfile.dominant[reading.elementProfile.dominant.length - 1];
  const barMax = Math.max(...Object.values(reading.elementProfile.raw), 1);

  return `
    <div class="result-header">
      <div>
        <p class="result-kicker">命盘已起</p>
        <h2>${escapeHtml(reading.displayName)} · ${escapeHtml(reading.city)}</h2>
        <p class="result-meta">
          ${escapeHtml(reading.genderLabel)} ｜ 阳历 ${escapeHtml(reading.solarText)} ｜ 农历 ${escapeHtml(reading.lunarText)} ｜ 属相 ${escapeHtml(reading.zodiac)} ｜ 星座 ${escapeHtml(reading.starSign)}
        </p>
      </div>
      <div class="result-tools">
        <div class="chip-group">
          <span class="chip">日主 ${escapeHtml(reading.dayStem)}${escapeHtml(reading.dayElement)}</span>
          <span class="chip">${escapeHtml(reading.strength.label)}</span>
          <span class="chip">${escapeHtml(reading.starProfile.meta.element)} · ${escapeHtml(reading.starSign)}</span>
          <span class="chip">今日 ${reading.fortuneProfile.todayScore} 分</span>
          <span class="chip">喜用 ${escapeHtml(reading.favorable.useful.join("、"))}</span>
        </div>
        <button id="export-button" class="ghost-button export-button" type="button" ${exportBusy ? "disabled" : ""}>
          ${exportBusy ? "正在绘制命书..." : "保存命书长图"}
        </button>
      </div>
    </div>

    <div class="summary-grid">
      <article class="info-card">
        <h3>四柱命盘</h3>
        <div class="table-wrap">
          <table class="pillar-table">
            <thead>
              <tr>
                <th>柱位</th>
                <th>干支</th>
                <th>五行</th>
                <th>纳音</th>
                <th>十神</th>
              </tr>
            </thead>
            <tbody>
              ${reading.pillars
                .map(
                  (pillar) => `
                    <tr>
                      <td>${escapeHtml(pillar.label)}</td>
                      <td><strong>${escapeHtml(pillar.ganzhi)}</strong></td>
                      <td>${escapeHtml(pillar.wuxing)}</td>
                      <td>${escapeHtml(pillar.nayin)}</td>
                      <td>${escapeHtml(pillar.stemTenGod)} / ${escapeHtml(pillar.branchTenGods.join("、"))}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </article>

      <article class="info-card">
        <h3>气象提要</h3>
        <div class="chip-group">
          <span class="chip">命宫 ${escapeHtml(reading.extras.mingGong)}</span>
          <span class="chip">身宫 ${escapeHtml(reading.extras.shenGong)}</span>
          <span class="chip">胎元 ${escapeHtml(reading.extras.taiYuan)}</span>
          <span class="chip">大运起于 ${escapeHtml(reading.currentLuck.startSolarText)}</span>
        </div>
        <div class="metrics">
          <div class="metric">
            <span>旺气</span>
            <strong>${escapeHtml(strongest)}</strong>
          </div>
          <div class="metric">
            <span>弱气</span>
            <strong>${escapeHtml(weakest)}</strong>
          </div>
          <div class="metric">
            <span>主导十神</span>
            <strong>${escapeHtml(GROUP_LABELS[reading.tenGodProfile.dominant])}</strong>
          </div>
          <div class="metric">
            <span>当前大运</span>
            <strong>${escapeHtml(reading.currentLuck.daYunGanZhi || "本命余气")}</strong>
          </div>
        </div>
      </article>
    </div>

    <div class="insight-grid">
      <article class="info-card score-card">
        <div class="score-head">
          <div>
            <p class="result-kicker">每日运势</p>
            <h3>今日综合评分</h3>
          </div>
          <span class="score-date">${escapeHtml(reading.fortuneProfile.todayDateLabel)}</span>
        </div>
        <div class="score-main">
          <div class="score-value">${reading.fortuneProfile.todayScore}<small>/100</small></div>
          <span class="score-badge score-${reading.fortuneProfile.todayBand.key}">${escapeHtml(reading.fortuneProfile.todayBand.label)}</span>
        </div>
        <p class="score-note">${escapeHtml(reading.fortuneProfile.todaySummary)}</p>
        <p class="score-advice">${escapeHtml(reading.fortuneProfile.todayAdvice)}</p>
        <div class="trend-metrics">
          ${renderTrendMetric("月均", `${reading.fortuneProfile.averageScore}分`)}
          ${renderTrendMetric("高点", `${reading.fortuneProfile.peak.dateLabel} · ${reading.fortuneProfile.peak.score}`)}
          ${renderTrendMetric("低点", `${reading.fortuneProfile.trough.dateLabel} · ${reading.fortuneProfile.trough.score}`)}
        </div>
      </article>

      <article class="info-card star-card">
        <div class="star-head">
          <div>
            <p class="result-kicker">星象参看</p>
            <h3>星座分析</h3>
          </div>
          <div class="star-meta">
            <span class="chip">${escapeHtml(reading.starProfile.meta.element)}</span>
            <span class="chip">${escapeHtml(reading.starProfile.meta.mode)}</span>
          </div>
        </div>
        <p class="star-copy">${escapeHtml(reading.prose.astro)}</p>
      </article>
    </div>

    <article class="info-card">
      <h3>五行消长</h3>
      <div class="element-bars">
        ${ELEMENTS.map((element) => {
          const count = reading.elementProfile.raw[element];
          const width = Math.max(12, (count / barMax) * 100);
          return `
            <div class="element-row">
              <span class="element-name">${element}</span>
              <div class="element-track">
                <div class="element-fill element-${element}" style="width:${width}%"></div>
              </div>
              <strong>${count}</strong>
            </div>
          `;
        }).join("")}
      </div>
      <p class="element-note">
        喜用偏向 ${escapeHtml(reading.favorable.useful.join("、"))}，忌神偏在 ${escapeHtml(reading.favorable.avoid.join("、"))}。
      </p>
    </article>

    <article class="info-card chart-card">
      <div class="chart-head">
        <div>
          <p class="result-kicker">走势推衍</p>
          <h3>一月运势折线图</h3>
        </div>
        <p class="chart-limit">100 分为满分</p>
      </div>
      <div class="chart-shell">
        ${renderLuckChart(reading.fortuneProfile.series)}
      </div>
      <div class="chart-legend">
        <span>峰值 ${reading.fortuneProfile.peak.score} 分 · ${reading.fortuneProfile.peak.dateLabel}</span>
        <span>谷值 ${reading.fortuneProfile.trough.score} 分 · ${reading.fortuneProfile.trough.dateLabel}</span>
        <span>月均 ${reading.fortuneProfile.averageScore} 分</span>
      </div>
      <p class="chart-caption">${escapeHtml(reading.fortuneProfile.monthlySummary)}</p>
    </article>

    <div class="oracle-grid">
      ${renderProseCard("盘面初看", reading.prose.overall)}
      ${renderProseCard("事业", reading.prose.career)}
      ${renderProseCard("姻缘", reading.prose.relationship)}
      ${renderProseCard("流年", reading.prose.annual)}
      ${renderProseCard("化解之道", reading.prose.remedy)}
    </div>

    <section class="info-card dialogue-card">
      <div class="dialogue-head">
        <div>
          <p class="result-kicker">对话问命</p>
          <h3>小光子在此，可继续追问细节</h3>
        </div>
        <p class="dialogue-tip">可追问：事业、财运、姻缘、学业、健康、今日运势、月运走势、星座分析。</p>
      </div>
      <div id="chat-log" class="chat-log">
        ${messages.map(renderMessage).join("")}
      </div>
      <div class="prompt-row">
        ${FOLLOW_UP_PROMPTS.map(
          (prompt) => `
            <button class="prompt-chip" type="button" data-chat-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>
          `,
        ).join("")}
      </div>
      <form id="chat-form" class="chat-form">
        <input
          name="question"
          type="text"
          maxlength="80"
          placeholder="继续请教，例如：这个月哪几天适合推进？"
        />
        <button class="primary-button" type="submit">继续请教</button>
      </form>
    </section>

    <blockquote class="closing-quote">${escapeHtml(reading.extras.yearQuote)}</blockquote>

    <div class="share-sheet-wrap" aria-hidden="true">
      ${renderShareSheet(reading)}
    </div>
  `;
}

function renderTrendMetric(label, value) {
  return `
    <div class="trend-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderMessage(message) {
  const speaker = message.role === "assistant" ? "小光子" : "缘主";
  return `
    <article class="chat-message chat-${message.role}">
      <span class="chat-speaker">${speaker}</span>
      <p>${escapeHtml(message.text)}</p>
    </article>
  `;
}

function renderShareSheet(reading) {
  const barMax = Math.max(...Object.values(reading.elementProfile.raw), 1);

  return `
    <section id="share-sheet" class="share-sheet">
      <p class="share-topline">小光子命书</p>
      <h2>${OPENING_LINE}</h2>
      <p class="share-meta">
        ${escapeHtml(reading.displayName)} · ${escapeHtml(reading.genderLabel)} · ${escapeHtml(reading.city)}<br />
        阳历 ${escapeHtml(reading.solarText)} ｜ 农历 ${escapeHtml(reading.lunarText)} ｜ 星座 ${escapeHtml(reading.starSign)}
      </p>

      <div class="share-chip-row">
        <span>日主 ${escapeHtml(reading.dayStem)}${escapeHtml(reading.dayElement)}</span>
        <span>${escapeHtml(reading.strength.label)}</span>
        <span>${escapeHtml(reading.starProfile.meta.element)} · ${escapeHtml(reading.starSign)}</span>
        <span>今日 ${reading.fortuneProfile.todayScore} 分</span>
        <span>喜用 ${escapeHtml(reading.favorable.useful.join("、"))}</span>
      </div>

      <div class="share-score-block">
        <div>
          <p>今日综合评分</p>
          <strong>${reading.fortuneProfile.todayScore}</strong>
          <span>${escapeHtml(reading.fortuneProfile.todayBand.label)}</span>
        </div>
        <p>${escapeHtml(reading.fortuneProfile.todaySummary)}${escapeHtml(reading.fortuneProfile.todayAdvice)}</p>
      </div>

      <div class="share-pillars">
        ${reading.pillars
          .map(
            (pillar) => `
              <div class="share-pillar-card">
                <p>${escapeHtml(pillar.label)}</p>
                <strong>${escapeHtml(pillar.ganzhi)}</strong>
                <span>${escapeHtml(pillar.wuxing)}</span>
                <small>${escapeHtml(pillar.nayin)}</small>
              </div>
            `,
          )
          .join("")}
      </div>

      <div class="share-elements">
        ${ELEMENTS.map((element) => {
          const count = reading.elementProfile.raw[element];
          const width = Math.max(10, (count / barMax) * 100);
          return `
            <div class="share-element-row">
              <b>${element}</b>
              <div class="share-element-track">
                <div class="share-element-fill element-${element}" style="width:${width}%"></div>
              </div>
              <span>${count}</span>
            </div>
          `;
        }).join("")}
      </div>

      <div class="share-chart-shell">
        ${renderLuckChart(reading.fortuneProfile.series, { compact: true })}
      </div>

      <div class="share-block">
        <h3>盘面初看</h3>
        <p>${escapeHtml(reading.prose.overall)}</p>
      </div>
      <div class="share-block">
        <h3>事业</h3>
        <p>${escapeHtml(reading.prose.career)}</p>
      </div>
      <div class="share-block">
        <h3>姻缘</h3>
        <p>${escapeHtml(reading.prose.relationship)}</p>
      </div>
      <div class="share-block">
        <h3>流年</h3>
        <p>${escapeHtml(reading.prose.annual)}</p>
      </div>
      <div class="share-block">
        <h3>星座分析</h3>
        <p>${escapeHtml(reading.prose.astro)}</p>
      </div>
      <div class="share-block">
        <h3>化解之道</h3>
        <p>${escapeHtml(reading.prose.remedy)}</p>
      </div>

      <div class="share-footer">
        <span>${escapeHtml(reading.extras.yearQuote)}</span>
        <span>内容仅作传统文化体验参考</span>
      </div>
    </section>
  `;
}

function renderLuckChart(series, { compact = false } = {}) {
  const width = compact ? 620 : 900;
  const height = compact ? 220 : 280;
  const padX = compact ? 28 : 34;
  const padY = compact ? 18 : 22;
  const chartWidth = width - padX * 2;
  const chartHeight = height - padY * 2;

  const points = series.map((item, index) => {
    const x = padX + (chartWidth * index) / (series.length - 1);
    const y = padY + ((100 - item.score) / 100) * chartHeight;
    return { x, y, item };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = [
    `M ${points[0].x} ${height - padY}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${height - padY}`,
    "Z",
  ].join(" ");

  const markerIndexes = unique([0, Math.floor((series.length - 1) / 2), series.length - 1]);
  const peakIndex = series.findIndex((item) => item === series.reduce((best, cur) => (cur.score > best.score ? cur : best), series[0]));
  const troughIndex = series.findIndex((item) => item === series.reduce((best, cur) => (cur.score < best.score ? cur : best), series[0]));

  return `
    <svg class="forecast-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="未来一个月运势折线图">
      <defs>
        <linearGradient id="chart-area-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(50,84,65,0.32)"></stop>
          <stop offset="100%" stop-color="rgba(50,84,65,0.02)"></stop>
        </linearGradient>
      </defs>
      ${[40, 60, 80, 100]
        .map((value) => {
          const y = padY + ((100 - value) / 100) * chartHeight;
          return `
            <line class="chart-grid-line" x1="${padX}" y1="${y}" x2="${width - padX}" y2="${y}"></line>
            <text class="chart-grid-label" x="${padX - 8}" y="${y + 4}">${value}</text>
          `;
        })
        .join("")}
      <path class="chart-area" d="${areaPath}"></path>
      <polyline class="chart-line" points="${polyline}"></polyline>
      ${points
        .filter((_, index) => index === peakIndex || index === troughIndex)
        .map(
          (point) => `
            <circle class="chart-focus" cx="${point.x}" cy="${point.y}" r="4.5"></circle>
            <text class="chart-focus-label" x="${point.x}" y="${point.y - 10}">${point.item.score}</text>
          `,
        )
        .join("")}
      ${markerIndexes
        .map((index) => {
          const point = points[index];
          return `<text class="chart-axis-label" x="${point.x}" y="${height - 4}" text-anchor="middle">${series[index].dateLabel}</text>`;
        })
        .join("")}
    </svg>
  `;
}

function renderProseCard(title, body) {
  return `
    <article class="oracle-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function renderEmptyState(message) {
  return `
    <div class="empty-state">
      <p class="result-kicker">静候缘主</p>
      <h2>小光子在松风之间，暂且煮茶听雨。</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderPanel(html) {
  const panel = document.querySelector("#result-panel");
  panel.innerHTML = html;
}

function scoreFlow(ganzhi, favorable) {
  const stem = ganzhi.charAt(0);
  const branch = ganzhi.charAt(1);
  const elements = [STEM_ELEMENTS[stem], BRANCH_ELEMENTS[branch]].filter(Boolean);

  return elements.reduce((score, element) => {
    if (favorable.useful.includes(element)) {
      return score + 1;
    }
    if (favorable.avoid.includes(element)) {
      return score - 1;
    }
    return score;
  }, 0);
}

function describeFlowStatus(score) {
  if (score >= 2) {
    return "顺风扬帆";
  }

  if (score <= -2) {
    return "宜守不宜攻";
  }

  return "稳中有变";
}

function getScoreBand(score) {
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

function calculateAge(birthSolar, todaySolar) {
  const hasPassedBirthday =
    todaySolar.getMonth() > birthSolar.getMonth() ||
    (todaySolar.getMonth() === birthSolar.getMonth() && todaySolar.getDay() >= birthSolar.getDay());

  return todaySolar.getYear() - birthSolar.getYear() - (hasPassedBirthday ? 0 : 1);
}

function formatDateLabel(date) {
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`;
}

function createZeroCounts() {
  return {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
}

function unique(list) {
  return [...new Set(list)];
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function sanitizeFileName(value) {
  return String(value || "缘主").replace(/[\\/:*?"<>|]/g, "-");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
