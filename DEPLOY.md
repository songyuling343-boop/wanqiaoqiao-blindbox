# Cloudflare Pages 独立部署

本项目为独立纯静态网站，生产源码使用GitHub仓库 `songyuling343-boop/wanqiaoqiao-blindbox` 的 `main` 分支。Codex开发环境的发布与Cloudflare网站部署是独立操作；网站尚未部署到Cloudflare，不覆盖原红糖测试网站。

## 控制台填写

| 项目 | 填写值 |
|---|---|
| 代码仓库 | `songyuling343-boop/wanqiaoqiao-blindbox` |
| 生产分支 | `main` |
| 独立 Pages 项目名 | 建议 `wanqiaoqiao-blindbox`，若重名另取唯一名称 |
| 框架预设 | React (Vite)，没有该预设时手动填写以下字段 |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 根目录 | 留空：package.json 位于仓库根目录，**不要填云机器路径 /workspace/...** |
| 环境变量 | 第一版无需 API 密钥。`.node-version` 已固定 Node 22，可选显式设置 `NODE_VERSION=22`。首次部署不填 `VITE_SITE_URL` |

## 一步一步操作

1. 将源码、`package.json`、`package-lock.json`、`public`、测试和部署文档提交到上述仓库的 `main`（不要提交 node_modules、dist 或 .env）。
2. 登录 Cloudflare，进入 **Workers & Pages → Create application → Pages → Connect to Git**（若新版界面显示 Import an existing Git repository，选择该入口）。务必创建**新项目**，不要进入原红糖测试网站的设置。
3. 连接 GitHub，授权上述仓库，选择该仓库后开始设置。填写表格中的项目名、生产分支、构建命令和输出目录，根目录留空。
4. 选择 **Save and Deploy**，等待依赖安装和构建完成。成功后控制台会给出真实的 `https://<项目名>.pages.dev` 地址，失败则查看构建日志。只有控制台确认成功后才算已发布。
5. 用手机打开该真实 HTTPS 地址并完成下方验收。不修改原站域名、DNS、自定义域或任何原站配置。
6. 在**新项目**的 Settings → Environment variables / Variables and Secrets 中，为 Production 设置 `VITE_SITE_URL` 为已验证的正式 HTTPS 地址；若以后绑定自定义域，改为真实自定义域地址。该字段公开到客户端，不能存秘密。不要填 localhost、虚构域名或临时预览地址。
7. 保存变量并重新部署（构建时注入的 Vite 变量不能仅靠运行时设置生效）。再次生成分享卡，用另一部手机扫二维码，确认进入本项目的 `/#/atlas`。此前生成的分享卡不会自动更新，需要重新保存。

Git 集成会在生产分支更新后自动构建；其他分支可产生预览部署。Git 集成项目不能直接改为 Direct Upload，首次建议采用本方案。

## 手机实机验收

- iPhone Safari 与 Android Chrome：小屏导航、图鉴5款生成概念图、24组内容概率表没有横向溢出。
- 直接打开与刷新 `/#/atlas`、`/#/contents`、`/#/result`；没有拆盒记录时结果页显示空状态。
- 点击拆盒：红糖、唯一赠品、心情卡都显示；萌粒是赠品之一，不额外增加公仔。
- 点击盒子：先摇动几下，再出现开盒画面，最后显示所得；动画期间不能重复抽取。网站不申请传感器权限，不需要摇动手机。系统开启“减少动态效果”时仍可完成流程。
- 首次遇见与重复提示正确；重复不增加款式数；刷新后保留；清除确认后图鉴和最近拆盒记录均清空。
- 保存 PNG：名称、实际红糖、对应萌粒图片、心情卡与本次结果一致。手机不能自动下载时长按页面生成的分享卡保存。
- 尚未配置正式网址时没有二维码；配置并重新部署后扫码确实打开真实正式站。
- 浏览器禁用存储时应提示记录不能持久化；隐私模式、清理站点数据、换设备或更换域名不会转移记录。
- 开发者工具确认概念图、PDF提取的产品图和字体均由本站提供，没有外部图片或数据库请求；网站运行不调用绘图API。

## 官方文档核对

2026-10-10 核对了 Cloudflare 当前官方文档源码（官网页面在本环境返回403，以下官方 GitHub production 文档可读取）：

- [Pages Git 集成](https://developers.cloudflare.com/pages/get-started/git-integration/) / [官方源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/get-started/git-integration.mdx)
- [构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/) / [官方源码](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/build-configuration.mdx)
- [创建 Pages 的官方步骤](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/partials/pages/get-started-git-connect-pages.mdx)
- [生产分支、根目录与构建字段](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/partials/pages/get-started-git-configure-deployment.mdx)

官方说明：未指定根目录时使用 Git 仓库根目录；构建目录为构建产物位置；成功以构建进程退出码0判断；生产分支通常为 main/master。
