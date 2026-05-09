# Alive

这是我的在线状态，展示我是否还活跃在这个世界上。

- 🟢 24 小时内 - 我当前非常活跃
- 🟠 1-3 天 - 我似乎休息了很长时间
- 🟠 3-7 天 - 我已经失联一段时间了
- 🔴 7-30 天 - 我可能离开了
- ⚪ 超过 30 天 - 往事如风，活在当下

## 运行机制

一个 shell 脚本驻留在某台长期运行的设备上，它被家中的传感器和手机的行为所唤醒。每次执行时，它都会在随机的时间间隔和混淆机制下，悄然更新 `timestamp.json`，记录着我在这个世界上的活动痕迹。

## 开发

本项目使用 Vite 构建。站点配置位于 `src/status-config.js`，会被编译进前端代码；`timestamp.json` 是运行时数据，不参与源码构建。

```bash
npm install
npm run dev
npm run build
npm run preview
```

本地开发和本地预览会通过 Vite 中间件读取 `dev/timestamp.json`，并以 `/timestamp.json` 暴露给页面。线上页面读取 GitHub Pages 根目录的 `/timestamp.json`。

## 分支与部署

- `main`：源码分支，只包含页面源码、构建配置、通知逻辑和文档。
- `gh-pages`：发布分支，包含 Vite 构建产物和线上 `timestamp.json`。
- HA 设备只更新 `gh-pages` 分支根目录的 `timestamp.json`。
- `main` 推送后，GitHub Actions 构建 `dist` 并发布到 `gh-pages`，发布时保留已有文件，避免覆盖线上 `timestamp.json`。

## 邮件通知

系统会在状态变化时，向我的亲友发送邮件通知：
- 每个状态进入后的 24 小时内会发送通知（最多 4 次）
- 超过 24 小时后停止通知，避免重复发送

---

**Made by Banri & Codex**
