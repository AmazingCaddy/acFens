# memory-agent Project

**Owner**: 老王 | **Coach**: Ada (OldWang) | **Restart**: 2026-07-10 (Fri) | **交付**: 2026-07-19 (Sun)

一个 MCP server，管好老王的 md 知识库——让 Claude Code / GitHub Copilot / OpenClaw 在 IDE 里都能查到正确的 memory 作为 context，让新知识必须经它入库以防脏化，让老库能被逐步治理干净。

## 目标（10 天冲刺）

1. 100 篇 Edge md 知识库跑通 **Ingest / Read / Write / Curate** 四能力
2. MCP server 挂到 Claude Code / Copilot / OpenClaw
3. HTML 分享 + 深度笔记发出去（LangGraph.js 心得 / MCP 设计 / 脏 md 治理实战）

## 关键文档

- [10 天详细计划 (v2)](./PLAN.md) ← 主要看这个
- [每日进度](./JOURNAL.md) ← 每天记录
- [v1 存档](./PLAN-v1-python-30day.md) ← 原 30 天 Python 版，Day 3 重启后废弃

## 技术栈（v2）

- **语言/运行时**：TypeScript + Node 22 + pnpm
- **Agent 框架**：LangGraph.js + Vercel AI SDK + 手写 while 循环（三路对比）
- **MCP**：`@modelcontextprotocol/sdk`
- **存储**：SQLite (`better-sqlite3`) + LanceDB
- **md 处理**：gray-matter + remark
- **HTML 分享**：React + Tailwind 静态构建
- **入口**：MCP server（IDE 主战场）→ 后期挂 OpenClaw

## 代码库

- 代码：[`AmazingCaddy/memory-agent`](https://github.com/AmazingCaddy/memory-agent) → `~/repos/memory-agent/`
- 数据：`~/memory/`（独立 git repo，版本化）
- 前身：[`AmazingCaddy/productivity-agent`](https://github.com/AmazingCaddy/productivity-agent)（已 `ARCHIVED`）

## 状态

- 2026-07-08：v1 (Py/30 天) 目标 lock in
- 2026-07-09：v1 Day 1 环境搭好（Python + uv + langchain）
- 2026-07-10 上午：v1 Day 2 完成（`create_agent` + 手写 while 循环，看清 agent = 循环）
- 2026-07-10 下午：**v2 重启**——TS + Memory Agent + MCP + 10 天
- **进行中**：D1 基建 + 三路 hello + MCP hello
