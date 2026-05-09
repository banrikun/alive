# AGENTS.md

本文件是当前仓库的协作规则。

## 语言

- 与用户沟通时全程使用中文。
- 新增或修改项目文档时使用中文。

## 提交与推送

- 需要提交时，使用 `git-commit` skill 或等效流程生成 Conventional Commits 格式的提交信息。
- 只有在用户明确发出 push 或推送指令后，才执行 `git push`。
- 提交前检查暂存区，避免把无关文件带入提交。

## `timestamp.json`

- `timestamp.json` 由 Home Assistant 自动化流程提交和维护。
- `main` 分支不应跟踪 `timestamp.json`；线上数据位于 `gh-pages` 分支根目录。
- 本地开发样例数据位于 `dev/timestamp.json`，通过 Vite 中间件以 `/timestamp.json` 暴露。
- 日常代码、文档、UI、工作流提交不要修改、格式化或重新生成 `timestamp.json`。
- 如果 `timestamp.json` 被误暂存，应先取消暂存，再继续提交其它文件。
- GitHub Pages 部署需要保留 `gh-pages` 上已有的 `timestamp.json`，不能用构建产物覆盖它。

## 前端与部署

- 项目使用 Vite；本地开发使用 `npm run dev`，生产构建使用 `npm run build`。
- 站点静态配置位于 `src/status-config.js`，会被编译进前端 bundle，不再使用运行时 `config.json`。
- `main` 是源码分支；`gh-pages` 是发布分支，包含构建产物、`CNAME`、`.nojekyll` 和线上 `timestamp.json`。
- HA 设备只应推送 `gh-pages` 分支根目录的 `timestamp.json`，不要推送 `main`。
- 部署 workflow 只应由 `main` 分支触发，不应由 `gh-pages` 上的高频 timestamp 更新触发。
- 通知 workflow 从 `main` 读取通知逻辑和配置，从 `gh-pages` 读取线上 `timestamp.json`；当 `gh-pages` 或 `timestamp.json` 尚不存在时应跳过通知，不应失败。
