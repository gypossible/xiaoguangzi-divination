# 世界监测财经简报

这是一个商务风资讯单页，参考 `World Monitor` 公开财经源配置，聚合可直达原文的市场、政策与加密资讯，并每 60 秒自动刷新一次。

## 当前页面特性

- 顶部为自动滚动资讯条，每次滚动展示 5 条标题，点击即可进入原文
- 左侧为“资讯排行榜”，按重要度输出前 10 条资讯并给出分数
- 主内容区展示全部中文资讯，按“标题 + 中文摘要”方式浏览
- 新增“小光子命理对话”面板，可在页面内调用本地 `DeepSeek R1 8B`
- 页面所有资讯统一翻译为中文
- 页面简介保留“由刘光远设计开发”

## 本地运行

```bash
npm install
npm run dev
```

## 构建预览

```bash
npm run build
npm run start
```

然后访问 [http://127.0.0.1:4173/](http://127.0.0.1:4173/)。

## 说明

- 页面依赖本地 Vite 服务提供 `/api/worldmonitor-finance-digest` 接口，因此不要直接双击 HTML 文件打开。
- 命理对话依赖本地 Ollama HTTP 服务；默认会请求 `http://127.0.0.1:11434` 上的 `deepseek-r1:8b`。
- 算命先生的人设写在 [prompts/xiaoguangzi.soul.md](/Users/guangyuan/Documents/Finance/算命工具/prompts/xiaoguangzi.soul.md)，本地接口会在每次对话时自动读取。
- 后端会抓取公开 RSS 源、自动翻译为中文，并生成排行榜和顶部滚动标题数据。
- 若部署到 GitHub Pages，这个命理对话面板仍会显示，但由于 Pages 只托管静态文件，真正调用本地模型仍需在你自己的电脑上本地运行本项目。

## 启动本地命理模型

先确认本机已安装 Ollama，并准备好对应模型：

```bash
ollama pull deepseek-r1:8b
ollama serve
```

然后再运行网页开发或预览服务。
