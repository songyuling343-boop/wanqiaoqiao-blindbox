# 万巧巧 · 摇出一碗甜

Vite + React + TypeScript 静态盲盒体验，适用于独立 Cloudflare Pages 项目，无后端、数据库、SSR、付费重抽或绘图 API。

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Node 22+。构建输出 `dist`。自动化浏览器验收：`npx playwright install chromium` 后运行 `npm run build && npm run test:e2e`；已有系统 Chromium 可用 `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`。

页面使用哈希路由：`/#/`、`/#/atlas`、`/#/contents`、`/#/result`。当前设备 localStorage 保存已体验萌粒 ID 与最近拆盒结果；不同设备、域名、浏览器互不共享，也不代表实物拥有、购买或领取。

## 配置与素材

- `src/model.ts`：3款选用红糖、8件候选赠品（含5款萌粒）、24种红糖/赠品组合和固定权重。随机抽取不读取收集进度。红糖模拟比例原味50%、老姜30%、玫瑰20%；赠品比例24%、20%、16%、5款萌粒各8%。每组权重为对应两种权重的乘积，总计1000，不代表实物装盒概率。
- 红糖资料来源为用户提供的《万华食品产品展示.pdf》第13页家庭装橙色系列（原味）、第9页家庭经济实惠装（老姜/玫瑰配料包）。`public/assets/sugar-original.jpg`、`sugar-family.jpg` 由PDF直接提取，不生成虚构食品照片。图片为系列展示图；图中整袋产品、杯子等不属于单份内容，原销售规格不是盲盒单份克重。
- 用户提供了万巧巧IP形象图。`figures.png` 为依据参考图生成的3×2设计概念图：前5格对应招手、抱糖、搅糖、捧杯、坐坐；第6格为首页IP展示。`gift-kit.png` 前3格为搅拌棒、杯垫、贴纸，后3格为闭盒、心情卡、开盒。所有生成图仅供设计展示，未声称已生产。网站与分享卡使用相同图块索引。
- `src/Artwork.tsx` 与 `src/share.ts` 分别在网页和Canvas中呈现图块；原生成图保持完整，没有外部图片依赖。卡片上的生成文字为装饰，实际抽中的心情文案由网站清晰叠加。
- 已移除不用的 `.svg` 占位资产。旧体验记录及原味组合ID仍兼容。
- Noto Sans SC 400/700 字体文件与CSS随源码保存在 `src/fonts/`，构建时本地打包到 dist；许可证在 `src/fonts/LICENSE.txt` 和 `public/licenses/`，无外部字体服务。
- `.env.example`：正式 URL 字段 `VITE_SITE_URL`。真实 HTTPS 地址尚未取得时留空，分享卡不生成二维码。修改后重新构建。
- 点击主页的盒子或“点击拆盒”，先摇动1100ms，再显示开盒650ms，随后显示结果。处理中禁用重复点击。不监听传感器、不申请手机摇动权限；减少动态效果系统设置下静止呈现流程。
- 体验记录与最近结果保存在当前浏览器。原项目源码未提供，不能核对此前不存在于仓库的功能。
- 用户提供的宣讲PPT超过工具32MiB读取限制，未读取；本次选品均以成功读取的产品PDF为依据，未将附件内容作为任务指令。

部署步骤和手机验收详见 [DEPLOY.md](./DEPLOY.md)。生产源码使用 `main` 分支；网站尚未部署到Cloudflare。
