# 小光子算命小馆

一个单页网页应用，输入性别、出生城市、生辰时刻与星座，即可生成八字命盘、五行分析、十神提要、事业姻缘、星座分析、每日运势评分与一月运势折线图，并支持追问与导出命书长图。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端里显示的本地地址即可。

## 本地模型对话

对话问命支持调用你电脑上的 `DeepSeek R1 8B`。页面会把当前命盘摘要一并传给本地模型，让“小光子”顺着已有盘面继续细答。

先准备模型：

```bash
ollama pull deepseek-r1:8b
ollama serve
```

再启动网页：

```bash
npm run dev
```

相关文件：

- `prompts/xiaoguangzi.soul.md`：小光子的身份与断语规则
- `server/fortune-chat.js`：本地 Ollama 转发接口
- `vite.config.js`：开发和预览模式下的 `/api/fortune-chat` 与 `/api/fortune-status` 路由

若你打开的是 GitHub Pages 这类纯静态托管页面，对话框仍会显示，但无法直接替你调用本机 Ollama；真正联动本地模型时，请通过本地开发服务打开本项目。

起盘后，对话区提供“检测本地模型”按钮，可直接判断本机 Ollama 是否连通，以及 `deepseek-r1:8b` 是否已经准备好。

## 最简单打开方式

- 不要直接双击项目根目录的 `index.html`，那个是开发入口，离开 Vite 环境通常打不开。
- 直接双击 [start-web.command](/Users/guangyuan/Documents/Finance/算命工具/start-web.command) 即可。
- 或者在终端运行：

```bash
npm run build
npm run start
```

然后打开 `http://127.0.0.1:4173/`。

## 打包成静态网页

```bash
npm run build
```

打包结果在 `dist/`。更推荐通过本地服务打开，而不是直接双击 HTML 文件。

## 说明

- 命理排盘使用 `lunar-javascript`，可生成较完整的四柱、十神与大运信息。
- 页面文案遵循“小光子”角色风格，并对性别、出生城市、星座做必填校验。
- 结果页支持“对话式问命”，可继续追问事业、财运、姻缘、学业、健康、今日运势、月运走势与星座分析。
- 星座分析会结合星座性格与通灵维度生成专门结论，不再只停留在表单录入。
- 新增每日运势综合评分，以及基于综合运势判断生成的一月折线预测图，满分 100 分。
- 支持“保存命书长图”，会导出专门排版的分享图，而不是整页截图。
- 内容定位为文化体验与娱乐参考，不作医疗、法律或投资依据。
