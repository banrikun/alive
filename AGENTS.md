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
- 日常代码、文档、UI、工作流提交应忽略 `timestamp.json` 的变动。
- 普通维护提交不要修改、格式化或重新生成 `timestamp.json`。
- 如果 `timestamp.json` 被误暂存，应先取消暂存，再继续提交其它文件。
