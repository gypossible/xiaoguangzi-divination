import "./style.css";
import { LunarUtil, Solar } from "lunar-javascript";

const ELEMENTS = ["木", "火", "土", "金", "水"];
const OPENING_LINE = "善哉，缘主请坐。乾坤旋转，皆有定数。";
const FOLLOW_UP_PROMPTS = [
  "事业还能怎么走",
  "财运这两年如何",
  "姻缘何时成熟",
  "学业考试顺吗",
  "今年该注意什么",
];

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

const DEMO_PROFILE = {
  name: "云舟",
  gender: "male",
  city: "杭州",
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
              输入性别、出生城市与生辰时刻，起一局四柱，观五行气象，听小光子缓缓道来。
            </p>
          </div>
          <div class="hero-note">
            <p>问命三要：性别、出生城市、生辰时刻。</p>
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
            ${renderEmptyState(
              "山门已开，只待生辰。填好信息后，小光子自会为你排出四柱，细看五行消长。"
            )}
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
    birthDate: (formData.get("birthDate") || "").toString(),
    birthTime: (formData.get("birthTime") || "").toString(),
  };

  if (!input.gender || input.city.length < 2) {
    renderPanel(
      renderEmptyState(
        "性别与出生城市尚未说清。差之毫厘，谬以千里，还请先补全这两项，再来论命。"
      ),
    );
    return;
  }

  if (!input.birthDate || !input.birthTime) {
    renderPanel(
      renderEmptyState(
        "年、月、日、时须四者齐备。若时辰未定，先寻家中长辈问明，再来起盘不迟。"
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
    renderPanel(
      renderEmptyState(
        "这一局未能顺利落盘。请检查日期与时刻是否真实有效，再试一次。",
      ),
    );
    console.error(error);
  }
}

function handleChatSubmit(event) {
  event.preventDefault();
  const form = event.target;

  const questionInput = form.elements.question;
  const question = questionInput.value.trim();

  if (!question) {
    return;
  }

  submitFollowUp(question);
  questionInput.value = "";
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
  form.elements.birthDate.value = DEMO_PROFILE.birthDate;
  form.elements.birthTime.value = DEMO_PROFILE.birthTime;
}

function renderResult() {
  if (!state.currentReading) {
    renderPanel(
      renderEmptyState(
        "山门已开，只待生辰。填好信息后，小光子自会为你排出四柱，细看五行消长。"
      ),
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

  const displayName = input.name || "缘主";
  const lunarText = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const overall = buildOverallText(
    displayName,
    input.city,
    solar,
    lunarText,
    dayElement,
    strength,
    elementProfile,
    tenGodProfile,
  );
  const career = buildCareerText(tenGodProfile, favorable, strength);
  const relationship = buildRelationshipText(
    input.gender,
    tenGodProfile,
    favorable,
    pillars[2],
    strength,
  );
  const annual = buildAnnualText(currentLuck);
  const remedy = buildRemedyText(favorable, elementProfile);

  return {
    displayName,
    gender: input.gender,
    genderLabel,
    city: input.city,
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
      quoteKey: `${eightChar.getYear()}${eightChar.getMonth()}${eightChar.getDay()}`,
    },
    prose: {
      overall,
      career,
      relationship,
      annual,
      remedy,
    },
  };
}

function buildPillar(label, ganzhi, wuxing, nayin, stemTenGod, branchTenGods) {
  return {
    label,
    ganzhi,
    stem: ganzhi.charAt(0),
    branch: ganzhi.charAt(1),
    stemElement: STEM_ELEMENTS[ganzhi.charAt(0)],
    branchElement: BRANCH_ELEMENTS[ganzhi.charAt(1)],
    wuxing,
    nayin,
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
    let branchWeight = 1.0;

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

  const dominant = [...ELEMENTS].sort((left, right) => weighted[right] - weighted[left]);
  const missing = ELEMENTS.filter((element) => raw[element] === 0);

  return {
    raw,
    weighted,
    dominant,
    missing,
  };
}

function judgeDayMasterStrength(dayElement, seasonElement, weighted) {
  const support =
    weighted[dayElement] * 1.05 + weighted[GENERATED_BY[dayElement]] * 0.95;
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
  const today = new Date();
  const todaySolar = Solar.fromDate(today);
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
    daYunTenGod: daYunGanZhi
      ? LunarUtil.SHI_SHEN[dayStem + daYunGanZhi.charAt(0)]
      : "本命余气",
    combinedScore,
  };
}

function buildOverallText(
  displayName,
  city,
  solar,
  lunarText,
  dayElement,
  strength,
  elementProfile,
  tenGodProfile,
) {
  const trait = DAY_MASTER_TRAITS[dayElement];
  const strongElement = elementProfile.dominant[0];
  const softElement =
    elementProfile.dominant[elementProfile.dominant.length - 1];
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

  const avoidText = `忌神偏在${favorable.avoid.join("、")}，心态上少贪快、少逞强、少反复，很多波折便会自行退去。`;

  return `${missingText}${favorable.method}。${usefulText} ${avoidText}`;
}

function buildInitialDialogue(reading) {
  return [
    { role: "assistant", text: OPENING_LINE },
    {
      role: "user",
      text: `${reading.displayName}，${reading.genderLabel}，出生于${reading.city}，${reading.solarText}。请先生起盘一观。`,
    },
    { role: "assistant", text: reading.prose.overall },
    { role: "assistant", text: `事业可观：${reading.prose.career}` },
    {
      role: "assistant",
      text: `姻缘与流年同参：${reading.prose.relationship}${reading.prose.annual}`,
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
    const flow = describeFlowStatus(
      reading.currentLuck.yearScore + reading.currentLuck.daYunScore,
    );
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
    const weakest =
      reading.elementProfile.dominant[reading.elementProfile.dominant.length - 1];
    return `命理看养生，只讲趋避，不作惊人之语。你局中${strongest}气偏盛，${weakest}气略浅，平日宜顺着喜用去调息。${reading.prose.remedy} 若近来身心发紧，先调睡眠与饮食，少熬夜、少动无名火，行路处事也尽量避开水火之险。`;
  }

  if (intent === "annual") {
    const trend = describeFlowStatus(reading.currentLuck.combinedScore);
    return `时运之事，要看大运、流年、流月一同说话。眼下你在${reading.currentLuck.daYunGanZhi || "本命余气"}之中，今年为${reading.currentLuck.currentYearGanZhi}，当月为${reading.currentLuck.currentMonthGanZhi}，合起来是${trend}之象。${reading.prose.annual}`;
  }

  if (intent === "personality") {
    return `${reading.prose.overall} 若自觉有时拧、有时累，那不是命坏，只是气机偏向某一端。知其偏，便能调其偏。`;
  }

  return `你这一问，关乎全局。总看此命，日主${reading.dayStem}${reading.dayElement}，${reading.strength.label}，喜用在${reading.favorable.useful.join("、")}。眼下最要紧的，不是四处乱求，而是守住节奏、调匀心气。若愿意，可再细问事业、财运、姻缘、学业或健康。`;
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

  if (/流年|运势|今年|明年|近年|最近|何时|什么时候/.test(question)) {
    return "annual";
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
  const weakest =
    reading.elementProfile.dominant[reading.elementProfile.dominant.length - 1];
  const barMax = Math.max(...Object.values(reading.elementProfile.raw), 1);

  return `
    <div class="result-header">
      <div>
        <p class="result-kicker">命盘已起</p>
        <h2>${escapeHtml(reading.displayName)} · ${escapeHtml(reading.city)}</h2>
        <p class="result-meta">
          ${escapeHtml(reading.genderLabel)} ｜ 阳历 ${escapeHtml(reading.solarText)} ｜ 农历 ${escapeHtml(reading.lunarText)} ｜ 属相 ${escapeHtml(reading.zodiac)}
        </p>
      </div>
      <div class="result-tools">
        <div class="chip-group">
          <span class="chip">日主 ${escapeHtml(reading.dayStem)}${escapeHtml(reading.dayElement)}</span>
          <span class="chip">${escapeHtml(reading.strength.label)}</span>
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
        <p class="dialogue-tip">可追问：事业、财运、姻缘、学业、健康、流年。</p>
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
          placeholder="继续请教，例如：财运这两年如何？"
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
        阳历 ${escapeHtml(reading.solarText)} ｜ 农历 ${escapeHtml(reading.lunarText)}
      </p>

      <div class="share-chip-row">
        <span>日主 ${escapeHtml(reading.dayStem)}${escapeHtml(reading.dayElement)}</span>
        <span>${escapeHtml(reading.strength.label)}</span>
        <span>喜用 ${escapeHtml(reading.favorable.useful.join("、"))}</span>
        <span>当前大运 ${escapeHtml(reading.currentLuck.daYunGanZhi || "本命余气")}</span>
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
  const elements = [STEM_ELEMENTS[stem], BRANCH_ELEMENTS[branch]];

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

function calculateAge(birthSolar, todaySolar) {
  const hasPassedBirthday =
    todaySolar.getMonth() > birthSolar.getMonth() ||
    (todaySolar.getMonth() === birthSolar.getMonth() &&
      todaySolar.getDay() >= birthSolar.getDay());

  return todaySolar.getYear() - birthSolar.getYear() - (hasPassedBirthday ? 0 : 1);
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

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function sanitizeFileName(value) {
  return String(value || "缘主").replace(/[\\/:*?"<>|]/g, "-");
}

function pad(value) {
  return value.toString().padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
