(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function a(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=a(i);fetch(i.href,o)}})();const R=document.querySelector("#app"),p=6e4,I=5,D=5200,v=["markets","policy","crypto"],x="deepseek-r1:8b",O=["请先告诉我需要哪些信息","我想看事业与财运","姻缘什么时候容易成熟","今天适合做什么"],q=[{role:"assistant",content:"善哉，缘主请坐。乾坤旋转，皆有定数。若要细论命盘，请先告知性别、出生城市、生辰时刻与星座；若眼下只想随问，我也可先听其一端，再慢慢追问。"}],t={data:null,error:"",loading:!0,refreshing:!1,filter:"all",tickerPage:0,nextRefreshAt:Date.now()+p,fortuneLoading:!1,fortuneError:"",fortuneModel:x,fortuneMessages:[...q],fortuneProfile:{gender:"",city:"",birthDate:"",birthTime:"",starSign:""}};let b=0,$=0,y=0,u=0;async function m(){u+=1;const e=u;t.loading||(t.refreshing=!0),t.error="",l();try{const r=await fetch(`/api/worldmonitor-finance-digest?ts=${Date.now()}`,{headers:{Accept:"application/json"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);const a=await r.json();if(e!==u)return;t.data=a,t.error=a.warning||"",t.loading=!1,t.refreshing=!1,t.filter=t.filter==="all"||a.categories?.[t.filter]?t.filter:"all",t.tickerPage=0,t.nextRefreshAt=Date.now()+(a.refreshIntervalMs||p),k(),l()}catch(r){if(e!==u)return;t.loading=!1,t.refreshing=!1,t.error=r instanceof Error?`刷新失败：${r.message}，系统会在下一分钟继续自动重试。`:"刷新失败：系统会在下一分钟继续自动重试。",t.nextRefreshAt=Date.now()+p,k(),l()}}function k(){window.clearTimeout(b),b=window.setTimeout(()=>{m()},Math.max(0,t.nextRefreshAt-Date.now()))}function _(){window.clearInterval($),$=window.setInterval(()=>{P()},1e3)}function C(){window.clearInterval(y),y=window.setInterval(()=>{const e=h();e.length<=1||(t.tickerPage=(t.tickerPage+1)%e.length,g())},D)}function P(){const e=document.querySelector("[data-role='countdown']"),r=document.querySelector("[data-role='status']"),a=document.querySelector("[data-role='pulse']");e&&(e.textContent=N(t.nextRefreshAt-Date.now())),r&&(r.textContent=A()),a&&(a.textContent=t.refreshing?"抓取中":"在线")}function g(){const e=h(),r=e.length===0?0:t.tickerPage%e.length;t.tickerPage=r;const a=document.querySelector("[data-role='ticker-track']"),s=document.querySelector("[data-role='ticker-page']"),i=document.querySelector("[data-role='ticker-total']");a&&(a.style.transform=`translateX(-${r*100}%)`),s&&(s.textContent=e.length>0?String(r+1):"0"),i&&(i.textContent=String(e.length)),document.querySelectorAll("[data-ticker-dot]").forEach(o=>{const c=Number(o.getAttribute("data-ticker-dot"));o.classList.toggle("is-active",c===r)})}function l(){const e=T(),r=z(),a=h(),s=t.data?.leaderboard||[],i=t.data?.sources||[];(a.length===0||t.tickerPage>=a.length)&&(t.tickerPage=0),R.innerHTML=`
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
              <span>当前第 <strong data-role="ticker-page">${a.length>0?t.tickerPage+1:0}</strong> 组</span>
              <span>共 <strong data-role="ticker-total">${a.length}</strong> 组</span>
            </div>
          </div>

          <div class="ticker-window">
            <div class="ticker-track" data-role="ticker-track">
              ${a.length>0?a.map(H).join(""):`
                    <div class="ticker-page-view">
                      <div class="ticker-empty">正在连接资讯源，稍后自动显示最新标题。</div>
                    </div>
                  `}
            </div>
          </div>

          <div class="ticker-dots" aria-label="资讯滚动分页">
            ${a.map((o,c)=>`
                  <button
                    class="ticker-dot ${c===t.tickerPage?"is-active":""}"
                    data-ticker-dot="${c}"
                    aria-label="切换到第 ${c+1} 组标题"
                  ></button>
                `).join("")}
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
            ${f("在线源",String(t.data?.sourceSummary?.live||0),"当前可正常拉取")}
            ${f("官方源",String(t.data?.sourceSummary?.official||0),"美联储 / 证监会")}
            ${f("资讯数",String(t.data?.sourceSummary?.itemCount||0),"已去重并翻译")}
            ${f("下次刷新",N(t.nextRefreshAt-Date.now()),"自动倒计时","countdown")}
          </div>
        </section>

        <section class="status-bar panel">
          <div>
            <p class="section-kicker">刷新状态</p>
            <h2 data-role="status">${n(A())}</h2>
            <p class="status-note">${n(t.data?.feedReference||"正在建立财经资讯看板连接...")}</p>
          </div>

          <div class="status-actions">
            <div class="signal-strip">
              <span class="signal-dot"></span>
              <span data-role="pulse">${t.refreshing?"抓取中":"在线"}</span>
            </div>
            <button
              class="action-button ${t.refreshing?"is-busy":""}"
              id="refresh-button"
              ${t.refreshing?"disabled":""}
            >
              ${t.refreshing?"正在刷新...":"立即刷新"}
            </button>
          </div>
        </section>

        ${t.error?`
              <section class="alert-panel panel">
                <p>${n(t.error)}</p>
              </section>
            `:""}

        <section class="filter-bar panel">
          <div class="section-head section-head-compact">
            <div>
              <p class="section-kicker">资讯分组</p>
              <h2>${n(w())}</h2>
            </div>
            <p class="section-note">点击分类筛选资讯主流，标题可直接跳转至原文。</p>
          </div>
          <div class="filter-row">
            ${S("all","全部资讯")}
            ${e.map(o=>S(o.key,`${o.label} ${o.count}`)).join("")}
          </div>
        </section>

        ${F()}

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
                ${s.length>0?s.map(B).join(""):'<div class="empty-card compact-empty-card">正在等待排行榜数据...</div>'}
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
                ${i.length>0?i.map(K).join(""):'<div class="empty-card compact-empty-card">正在读取源状态...</div>'}
              </div>
            </section>
          </aside>

          <section class="news-panel panel">
            <div class="section-head">
              <div>
                <p class="section-kicker">资讯主流</p>
                <h2>${n(w())}</h2>
              </div>
              <p class="section-note">按发布时间倒序排列，展示“标题 + 中文摘要”，点击卡片即可查看原文。</p>
            </div>

            <div class="news-list">
              ${r.length>0?r.map(U).join(""):'<div class="empty-card">当前筛选条件下暂无资讯，系统将在下一轮刷新后自动补充。</div>'}
            </div>
          </section>
        </section>
      </main>
    </div>
  `,document.querySelector("#refresh-button")?.addEventListener("click",()=>{m()}),document.querySelectorAll("[data-filter]").forEach(o=>{o.addEventListener("click",()=>{t.filter=o.getAttribute("data-filter")||"all",l()})}),document.querySelectorAll("[data-ticker-dot]").forEach(o=>{o.addEventListener("click",()=>{t.tickerPage=Number(o.getAttribute("data-ticker-dot"))||0,g()})}),document.querySelector("#fortune-chat-form")?.addEventListener("submit",o=>{o.preventDefault();const c=o.currentTarget,d=new FormData(c).get("question");typeof d=="string"&&(E(d),c.reset())}),document.querySelectorAll("[data-fortune-prompt]").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-fortune-prompt")||"";E(c)})}),document.querySelectorAll("[data-fortune-field]").forEach(o=>{const c=()=>{const d=o.getAttribute("data-fortune-field");d&&(t.fortuneProfile[d]=o.value)};o.addEventListener("input",c),o.addEventListener("change",c)}),P(),g(),X()}function F(){return`
    <section class="fortune-panel panel">
      <div class="section-head">
        <div>
          <p class="section-kicker">Local DeepSeek</p>
          <h2>小光子命理对话</h2>
        </div>
        <div class="fortune-meta">
          <span class="model-badge">${n(t.fortuneModel)}</span>
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
            <option value="男" ${t.fortuneProfile.gender==="男"?"selected":""}>男</option>
            <option value="女" ${t.fortuneProfile.gender==="女"?"selected":""}>女</option>
          </select>
        </label>
        <label>
          <span>出生城市</span>
          <input
            data-fortune-field="city"
            type="text"
            maxlength="24"
            value="${n(t.fortuneProfile.city)}"
            placeholder="如：苏州、成都"
          />
        </label>
        <label>
          <span>出生日期</span>
          <input data-fortune-field="birthDate" type="date" value="${n(t.fortuneProfile.birthDate)}" />
        </label>
        <label>
          <span>出生时刻</span>
          <input data-fortune-field="birthTime" type="time" value="${n(t.fortuneProfile.birthTime)}" />
        </label>
        <label>
          <span>星座</span>
          <input
            data-fortune-field="starSign"
            type="text"
            maxlength="12"
            value="${n(t.fortuneProfile.starSign)}"
            placeholder="如：天蝎座"
          />
        </label>
      </div>

      <div id="fortune-chat-log" class="fortune-chat-log">
        ${t.fortuneMessages.map(j).join("")}
      </div>

      <div class="fortune-prompt-row">
        ${O.map(e=>`
            <button class="fortune-prompt-chip" type="button" data-fortune-prompt="${n(e)}">
              ${n(e)}
            </button>
          `).join("")}
      </div>

      <form id="fortune-chat-form" class="fortune-chat-form">
        <input
          name="question"
          type="text"
          maxlength="120"
          placeholder="请直接发问，例如：我想问这两年的事业与姻缘。"
          ${t.fortuneLoading?"disabled":""}
        />
        <button class="action-button fortune-submit-button ${t.fortuneLoading?"is-busy":""}" type="submit" ${t.fortuneLoading?"disabled":""}>
          ${t.fortuneLoading?"小光子起卦中...":"继续请教"}
        </button>
      </form>

      ${t.fortuneError?`<p class="fortune-error">${n(t.fortuneError)}</p>`:'<p class="fortune-hint">若要正式细断，请尽量补全性别、出生城市、生辰与星座；差之毫厘，谬以千里。</p>'}
    </section>
  `}function f(e,r,a,s=""){const i=s?`data-role="${s}"`:"";return`
    <article class="metric-card">
      <span>${n(e)}</span>
      <strong ${i}>${n(r)}</strong>
      <p>${n(a)}</p>
    </article>
  `}function j(e){return`
    <article class="fortune-message fortune-message-${e.role}">
      <span class="fortune-speaker">${e.role==="assistant"?"小光子":"缘主"}</span>
      <p>${n(e.content)}</p>
    </article>
  `}function S(e,r){return`
    <button class="filter-chip ${t.filter===e?"is-active":""}" data-filter="${n(e)}">
      ${n(r)}
    </button>
  `}function H(e){return`
    <div class="ticker-page-view">
      ${e.map(G).join("")}
    </div>
  `}function G(e,r){return`
    <a class="ticker-item" href="${n(e.url)}" target="_blank" rel="noreferrer">
      <span class="ticker-index">${String(r+1).padStart(2,"0")}</span>
      <span class="ticker-title">${n(e.title)}</span>
    </a>
  `}function B(e){return`
    <a class="leaderboard-item" href="${n(e.url)}" target="_blank" rel="noreferrer">
      <div class="leaderboard-rank">${String(e.rank).padStart(2,"0")}</div>
      <div class="leaderboard-copy">
        <h3>${n(e.title)}</h3>
        <div class="leaderboard-meta">
          <span>${n(e.categoryLabel)}</span>
          <span>${n(e.sourceLabel)}</span>
          <span>${n(L(e.publishedAt))}</span>
        </div>
      </div>
      <div class="leaderboard-score">
        <strong>${n(String(e.score))}</strong>
        <span>重要度</span>
      </div>
    </a>
  `}function K(e){return`
    <article class="source-card">
      <div class="source-topline">
        <span class="source-category">${n(e.categoryLabel)}</span>
        <span class="source-state source-state-${n(e.status)}">${n(W(e.status))}</span>
      </div>
      <strong>${n(e.label)}</strong>
      <div class="source-meta">
        <span>${e.official?"官方源":"媒体源"}</span>
        <span>${n(String(e.itemCount))} 条</span>
      </div>
    </article>
  `}function U(e){return`
    <a class="news-card" href="${n(e.url)}" target="_blank" rel="noreferrer">
      <div class="card-topline">
        <span class="category-tag">${n(e.categoryLabel)}</span>
        <span class="source-tag ${e.official?"is-official":""}">${n(e.sourceLabel)}</span>
      </div>

      <h3>${n(e.title)}</h3>
      <p>${n(Q(e.summary,150))}</p>

      <div class="card-meta">
        <span>${n(L(e.publishedAt))}</span>
        <span>点击查看原文</span>
      </div>
    </a>
  `}function T(){return Object.values(t.data?.categories||{}).sort((r,a)=>{const s=v.indexOf(r.key),i=v.indexOf(a.key);return(s===-1?99:s)-(i===-1?99:i)})}function z(){const e=t.data?.items||[];return t.filter==="all"?e:e.filter(r=>r.category===t.filter)}function h(){return J(t.data?.tickerTitles||[],I)}function w(){if(t.filter==="all")return"全部资讯";const e=T().find(r=>r.key===t.filter);return e?`${e.label}资讯`:"资讯主流"}function A(){if(t.loading&&!t.data)return"正在建立财经资讯看板...";if(!t.data?.generatedAt)return"等待下一轮自动刷新";const e=t.data?.sourceSummary?.live||0,r=t.data?.sourceSummary?.total||0;return`${M(t.data.generatedAt)} 更新，${e}/${r} 个资讯源在线。`}function Q(e,r){const a=String(e||"").replace(/\s+/g," ").trim();return a.length<=r?a:`${a.slice(0,r).trimEnd()}...`}function W(e){switch(e){case"live":return"在线";case"empty":return"暂无新条目";case"error":return"抓取失败";default:return"未知"}}function L(e){const r=Number(e);if(!Number.isFinite(r))return"时间未知";const a=Math.round((Date.now()-r)/6e4);if(a<=1)return"刚刚更新";if(a<60)return`${a} 分钟前`;const s=Math.round(a/60);return s<24?`${s} 小时前`:M(r)}function M(e){try{return new Intl.DateTimeFormat("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(new Date(e))}catch{return String(e)}}function N(e){const r=Math.max(0,Math.ceil(e/1e3)),a=String(Math.floor(r/60)).padStart(2,"0"),s=String(r%60).padStart(2,"0");return`${a}:${s}`}function J(e,r){if(!Array.isArray(e)||e.length===0)return[];const a=[];for(let s=0;s<e.length;s+=r)a.push(e.slice(s,s+r));return a}async function E(e){const r=String(e||"").trim();if(!r||t.fortuneLoading)return;const a=[...t.fortuneMessages,{role:"user",content:r}];t.fortuneMessages=a,t.fortuneLoading=!0,t.fortuneError="",l();try{const s=await fetch("/api/fortune-chat",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({model:t.fortuneModel,messages:a,profile:V()})}),i=await s.json().catch(()=>({}));if(!s.ok)throw s.status===404?new Error("当前打开的是静态托管页面，命理对话需在本地运行此项目，并配合 `ollama serve` 后方可真正连到小光子。"):new Error(i.message||`本地命理对话暂时不可用（HTTP ${s.status}）。`);t.fortuneMessages=[...a,{role:"assistant",content:String(i.reply||"").trim()||"山风过耳，此刻尚未得辞。"}],t.fortuneModel=i.model||t.fortuneModel}catch(s){t.fortuneError=s instanceof Error?s.message:"本地命理对话暂时不可用，请稍后再试。"}finally{t.fortuneLoading=!1,l()}}function V(){return{gender:t.fortuneProfile.gender.trim(),city:t.fortuneProfile.city.trim(),birthDate:t.fortuneProfile.birthDate.trim(),birthTime:t.fortuneProfile.birthTime.trim(),starSign:t.fortuneProfile.starSign.trim()}}function X(){const e=document.querySelector("#fortune-chat-log");e&&(e.scrollTop=e.scrollHeight)}function n(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}_();C();m();
