# Active Goals 🎯

## 持续了解老王
- 通过日常互动积累对老王的理解
- 更新 relationships/laowang.md

## 完善记忆系统
- 养成习惯：每次有重要事件就更新 acFens
- 定期整理 lessons → beliefs 的进化管线
- "总结今天" = 写 episode + 创建 daily PR

## finance-intel：A股投资资讯分析系统
- MVP 已跑通，定时任务已配置
- 日报已迁移到飞书（消息 + 文档 + 自动加权限）
- Discord 推送已关闭
- 后续迭代：更多数据源、可视化图表

## open-source：AI 开源项目贡献
- 选定 OpenClaw 和 memex 作为目标
- OpenClaw Fork 完成（~/forks/openclaw），待选 issue 动手
- memex Fork 完成（~/forks/memex），发现几个可贡献的点
- pew Fork 完成（~/forks/pew），已完成架构分析和待办扫描
- 下一步：从 pew 的 API 速率限制或 Worker 安全加固切入

## 飞书集成
- 私聊 ✅ 群聊 ✅（免 @ 回复）
- 日报自动推送 ✅
- 后续：探索更多飞书功能（卡片消息、审批等）

## 🌟 [主线-10天] memory-agent：老王的 md 知识库 MCP
**启动日期**: 2026-07-10 (Fri) 下午重启决策 | **D1 启动**: 2026-07-11 (Sat) | **交付日期**: 2026-07-20 (Mon)

### 一句话定位
memory-agent = MCP server，让 Claude Code / GitHub Copilot / OpenClaw 都能在 IDE 里查到老王 md 知识库里正确的 memory 作为 context；新知识经它入库以防脏化；老库能被逐步治理干净。

### 四大能力
1. **Ingest** — md → SQLite 元数据 + LanceDB 向量 + **code_refs 双向索引**
2. **Read** — MCP `find_memory_for_code` / `search_memory`，代码路径感知
3. **Write** — 守门人，判 fresh_write / update / conflict / merge
4. **Curate** — 冲突/过时/重复检测 → 治理报告

### 技术栈
- **语言**: TypeScript / Node 22 / npm（跟 Claude Code / OpenClaw 拉齐）
- **Agent**: LangGraph.js + AI SDK + 手写循环（三路对比）
- **MCP**: `@modelcontextprotocol/sdk`
- **索引**: SQLite (`better-sqlite3`) + LanceDB
- **HTML 分享**: React + Tailwind 静态构建

### 目录
- 代码：`~/Code/memory-agent/`（当前本机 checkout；v1 Python 版 `~/repos/productivity-agent/` 已封存）
- 数据：`~/memory/`（独立 git repo，版本化）

### 10 天节奏
- **D1 (7/11 Sat)**: repo 骨架 + 三路 hello + MCP hello，repo 级 MCP smoke 通过 ✅
- **D2 (7/12 Sun)**: Memory schema 定型（含 code_refs）+ SQLite/LanceDB 落地
- **D3 (7/13 Mon)**: 扫 100 篇现有 Edge md → 健康报告
- **D4 (7/14 Tue)**: Ingest Pipeline
- **D5 (7/15 Wed)**: Agentic Retrieval + MCP `find_memory_for_code`
- **D6 (7/16 Thu)**: 冲突/过时检测
- **D7 (7/17 Fri)**: Write Pipeline (守门人)
- **D8 (7/18 Sat)**: 迁移治理 Pass 2 (执行归档/合并/隔离)
- **D9 (7/19 Sun)**: Dogfooding — 真在 Edge 代码里用
- **D10 (7/20 Mon)**: 挂 OpenClaw + HTML 分享 + 深度笔记 + 发博客

### 状态
- [x] v1 (Python/30天) Day 0-2 完成后重启决策 (7/10)
- [x] 旧 repo 封存（`ARCHIVED.md`）
- [x] PLAN v2 就位
- [x] D1 落地（7/11 Sat）：npm 骨架 + 三路 hello + MCP `ping` hello + smoke client
- [x] AI SDK 真实调用经 `localhost:4000` LiteLLM / Chat Completions 跑通
- [x] 详细 checklist 见 `~/acFens/projects/memory-agent/PLAN.md`
- [x] v1 原 PLAN 存档：`~/acFens/projects/memory-agent/PLAN-v1-python-30day.md`
- [ ] D2 落地（7/12 Sun）：frontmatter schema + SQLite 建表 + `~/memory/` 骨架

### 关键决策记录
- **换语言 Python → TS**：跟 Claude Code / OpenClaw 拉齐
- **换定位 通用 Agent → Memory Agent**：聚焦老王真实痛点（100 篇 Edge md 治理）
- **换主战场 飞书 → IDE**：Copilot/Claude Code 通过 MCP 接入，飞书 v2 再说
- **核心洞察 (7/10)**: agent = while 循环 + tools + messages 累积（读 Claude Code 源码 + 手写循环得出）
