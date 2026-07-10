# memory-agent - 10天冲刺计划 (v2)

**Owner**: 老王
**Coach**: OldWang (Ada)
**启动日期**: 2026-07-10 (Fri) — 从 productivity-agent v1 (Python/30天) 重启
**交付日期**: 2026-07-19 (Sun)
**上一版计划**: [`PLAN-v1-python-30day.md`](./PLAN-v1-python-30day.md)（30 天 Python 版，Day 2 后废弃）

---

## 🎯 项目定位（一句话）

> **memory-agent 是一个 MCP server，负责老王 md 知识库的读、写、治三件事——让 Claude Code / GitHub Copilot / OpenClaw 都能在 IDE 里查到正确的 memory 作为 context，让所有新知识必须通过它入库以防脏化，让老库能被逐步治理干净。**

## 🔑 差异化价值

现在市面上：

- ❌ 通用 RAG 工具偏"聊天问答"，不接 IDE
- ❌ Copilot 的 workspace context 只看代码，看不到你写的 md 笔记
- ❌ Cursor 的 `@docs` 只做索引，不做**冲突/过时治理**
- ❌ 大部分方案没有**代码路径 ↔ memory 双向索引**

**memory-agent** = MCP server + 代码感知 agentic retrieval + 治理 + 写入守门 → 四合一

---

## 📦 核心能力清单

1. **Ingest** — md 库 → 索引（元数据 + 向量 + code_refs）
2. **Read** — Copilot/Claude Code 通过 MCP 查询，返回带引用的答案
3. **Write** — 新知识经 agent 入库，自动判断 fresh / update / conflict / merge
4. **Curate** — 检测冲突/过时/重复，输出治理报告

**范围外（v2）**：任务管理、定时提醒、多轮对话 session memory、飞书主动入口

---

## 🏗️ 技术栈

| 组件 | 选型 |
|---|---|
| 语言 | **TypeScript** |
| 运行时 | **Node 22 LTS** + **pnpm** |
| Agent 主框架 | **LangGraph.js**（StateGraph / checkpoint / HITL） |
| 对比参考 | **Vercel AI SDK** + **手写 while 循环** |
| LLM 接入 | `@anthropic-ai/sdk` / `openai` / 或 `ai` SDK 统一 |
| MCP | `@modelcontextprotocol/sdk` |
| 向量库 | **LanceDB**（TS 一等公民、embedded、快） |
| 元数据 | **SQLite** (`better-sqlite3`) |
| md 解析 | `gray-matter` + `remark` + `unified` |
| HTML 分享 | React + Tailwind（静态构建） |
| lint/format | biome |
| 测试 | vitest |

---

## 💾 Memory 系统设计

### 存储布局

```
~/repos/memory-agent/               ← 代码
~/memory/                           ← 数据（独立 git repo，版本化）
├── index.db                          SQLite: memories / relations / ingest_log
├── vectors/                          LanceDB 索引
├── domains/                          按领域组织（不按时间）
│   ├── edge/
│   │   ├── rendering/
│   │   ├── networking/
│   │   ├── security/
│   │   └── ...
│   └── ai-agents/
├── inbox/                            新知识暂存（未治理）
└── quarantine/                       冲突未决
```

### frontmatter schema

```yaml
---
id: mem_a3f9c2
title: Edge Site Isolation 进程模型与 RFH 生命周期
domain: edge/security/site-isolation
status: canonical           # canonical | legacy | draft | quarantined
created: 2025-03-15
updated: 2026-07-10
last_verified: 2026-07-10
supersedes: [mem_1a2b3c]
superseded_by: null

# ★ memory-agent 独有的杀手锏：代码锚点
code_refs:
  files:
    - path: content/browser/renderer_host/render_frame_host_impl.cc
      relevance: primary                    # primary | mentioned | related
      symbols: [RenderFrameHostImpl, CommitNavigation]
      lines: [1234-1289]                    # 可选
    - path: content/browser/site_instance_impl.h
      relevance: mentioned
      symbols: [SiteInstance]
  concepts: [site-isolation, process-model, out-of-process-iframes]
  version: edge-131
  verified_against_commit: abc123def

sources:
  - type: my-investigation
    date: 2026-05-15
  - type: chromium-doc
    ref: https://www.chromium.org/developers/design-documents/site-isolation

confidence: high
tags: [edge, security, rfh, process-model]
---
```

### MCP tools 契约

```ts
// 高频：调研代码时补 memory context
find_memory_for_code({ file_path?, symbol?, query? })

// 语义查询
search_memory({ query, top_k? })

// 反查：给主题/id 返回代码位置
get_code_refs({ memory_id?, topic? })

// 写入（守门人）
add_memory({ content, code_refs?, suggested_domain? })
  → agent 决定 fresh_write | update | conflict | merge_suggestion

// 治理
list_conflicts({ topic? })
list_stale({ domain?, older_than? })
```

### 四种"入库姿势"

| 姿势 | 触发 | 结果 |
|---|---|---|
| **fresh_write** | 全新知识、无关联 | 直接落到 `domains/<domain>/` |
| **update** | 同一主题、内容更新 | 老 → `legacy`，新 → `canonical`，`supersedes` 打上 |
| **conflict** | 与已有内容矛盾 | 都进 `quarantine/`，标 `contradicts`，问老王 |
| **merge_suggestion** | 部分重合 | 起草合并稿，进 `inbox/`，等审 |

---

## 📅 10 天 Daily Checklist

### 🏁 D1 (7/10 Fri) — 基建 + 三路 hello + MCP hello

- [ ] 新建 `~/repos/memory-agent/`，pnpm init，tsconfig，biome，vitest
- [ ] 装依赖：`@langchain/langgraph @langchain/anthropic ai @anthropic-ai/sdk @modelcontextprotocol/sdk better-sqlite3 gray-matter`
- [ ] 三路 hello：
  - `demos/d1-langgraph-hello.ts`（StateGraph 双节点）
  - `demos/d1-ai-sdk-hello.ts`（Vercel AI SDK `generateText` + `tools`）
  - `demos/d1-while-loop-hello.ts`（TS 版手写循环，对照 Python `day2-agent-from-scratch.py`）
- [ ] MCP hello world：起一个只有 `ping` tool 的 MCP server，让 Claude Code 挂上
- [ ] 更新 `~/.claude/mcp.json`（或 repo 级 `.mcp.json`）
- **产出**：repo 就位 + 三路对比笔记初稿 + Claude Code 里能看到 memory-agent MCP server

### 🏗️ D2 (7/11 Sat) — Memory System 定型 + schema 落地

- [ ] frontmatter schema 定稿（含 code_refs），写成 Zod schema + TS type
- [ ] SQLite 建表：`memories / relations / ingest_log`
- [ ] LanceDB 初始化脚本
- [ ] `~/memory/` 独立 repo `git init` + 目录骨架
- [ ] `memory-agent` 里写 `src/schema.ts` + `src/store/sqlite.ts` + `src/store/vector.ts`
- **产出**：`schema.md` 规范文档 + 空索引可以建/查

### 🩺 D3 (7/12 Sun) — 迁移治理 Pass 1：扫描 & 健康报告

- [ ] 老王把 100 篇 Edge md 的文件夹交给我
- [ ] 写 `scripts/scan-existing.ts`：读所有 md，抽 frontmatter（若有）、内容 hash、大小、mtime
- [ ] LLM 抽取每篇 md 提到的 code_refs（文件路径、类名/函数名、Edge 版本线索）
- [ ] 生成 `reports/health-YYYY-MM-DD.md`：冲突候选、过时候选、重复候选、无标题/无 frontmatter 的
- **产出**：健康报告 + 你的库画像（多少领域、平均新鲜度、冲突热点）

### 📥 D4 (7/13 Mon) — Ingest Pipeline (fresh_write 路径)

- [ ] md 解析：`gray-matter` frontmatter + `remark` 内容分块（按 heading + 长度）
- [ ] 每 chunk：生成 embedding、抽 code_refs、算 hash
- [ ] 写入 SQLite（memories + code_refs 反向索引表）+ LanceDB
- [ ] CLI：`memory-agent ingest <path>` 单文件；`memory-agent ingest --all` 批量
- **产出**：把 D3 扫过的 md 全灌进索引，能 `sqlite3 index.db "select ..."` 抽样验证

### 🔍 D5 (7/14 Tue) — Agentic Retrieval + MCP `search_memory` + `find_memory_for_code`

- [ ] LangGraph.js 节点链：`understand_query → retrieve → rerank → format_answer`
- [ ] `find_memory_for_code`：**先查 code_refs 精确表 + 再补向量语义检索**（hybrid）
- [ ] 结果格式：每条含 `memory_id / path / snippet / code_refs / freshness_score`
- [ ] 封装成 MCP tool 暴露
- [ ] Claude Code 实测：给一个 Edge 符号，能拿到相关 md 引用
- **产出**：Claude Code 里 `@memory` 或 tool call 能用

### ⚖️ D6 (7/15 Wed) — 冲突/过时检测（治理核心）+ MCP `list_conflicts`

- [ ] 冲突检测：对同 domain 下多篇 memory，LLM 判断 pairwise 是否矛盾
- [ ] 过时检测：mtime + `version` + `verified_against_commit` + LLM 检测"跟同主题最新版对比是否过时"
- [ ] 输出结构化冲突/过时记录到 SQLite `relations` 表
- [ ] MCP tool: `list_conflicts / list_stale`
- **产出**：你库里的真冲突/过时能被自动扒出，Claude Code 能查到

### ✍️ D7 (7/16 Thu) — Write Pipeline（守门人）+ MCP `add_memory`

- [ ] Agent 判定入库姿势：LLM + 检索 top-k 已有 memory → 决定 fresh_write / update / conflict / merge
- [ ] 每种姿势对应的写入实现
- [ ] MCP `add_memory({ content, code_refs?, suggested_domain? })`
- [ ] Claude Code 实测："记这个 → agent 应答'跟 mem_xxx 相似要 update 吗？'"
- **产出**：你能在 IDE 里说记东西，agent 会守门

### 🧹 D8 (7/17 Fri) — 迁移治理 Pass 2：执行

- [ ] 按 D3/D6 的报告，实际执行归档/合并/隔离
- [ ] 老 → `legacy`；冲突 → `quarantine/`；重复 → 合并稿进 `inbox/` 让老王审
- [ ] 治理审批 UI：一个简单 CLI 或 web page 列出待办，你 y/n 通过
- **产出**：你的 Edge 库变干净，`~/memory/` 提交 v0.1 tag

### 🍚 D9 (7/18 Sat) — Dogfooding

- [ ] 真在 Edge 项目里用 Claude Code 写代码，让 memory-agent 全程加持
- [ ] 记录：查询是否准、response 是否快、有没有 memory 应该有但没查到、有没有 memory 应该拒绝但没拒
- [ ] 修 bug、调 prompt、调 chunk 大小 / top_k / rerank 阈值
- **产出**：实测报告 + 一批修复 commit

### 🎁 D10 (7/19 Sun) — 挂 OpenClaw + HTML 分享 + 收官

- [ ] MCP 挂到 OpenClaw（我这边），飞书聊天也能查 memory
- [ ] HTML 分享：`memory-agent publish <topic>` → React 静态构建输出到 `~/memory-site/`
  - 页面显示：主题下的 memory 列表、代码引用、冲突警示、过时标记
  - 部署到 Cloudflare Pages（可选）
- [ ] 写深度笔记（发博客/推特）：
  1. **《Agent = while loop + tools + memory：TS 版祛魅笔记》**
  2. **《为 Copilot / Claude Code 造一个 memory MCP：设计与实现》**
  3. **《100 篇脏 md 的治理实战》**
- **产出**：`v1.0` tag + 公开发出去的 3 篇内容

---

## 📊 与 v1 (Python/30天) 的关键差异

| 维度 | v1 | v2 |
|---|---|---|
| 语言 | Python 3.12 + uv | TypeScript + Node 22 + pnpm |
| 主框架 | LangGraph (Py) + CrewAI | **LangGraph.js + AI SDK + 手写循环** 三路 |
| 定位 | 通用生产力 Agent | **Memory Agent（MCP server）** |
| 主战场 | 飞书聊天 | **IDE (Claude Code / Copilot)** |
| 主功能 | 任务/知识/决策/查询/HTML | **Ingest / Read / Write / Curate + HTML** |
| 记忆管理 | Week 3 深挖一周 | **贯穿全程 D2-D8** |
| 深挖重点 | 通用记忆分层理论 | **代码感知 + 冲突/过时治理** |
| 周期 | 30 天 | **10 天** |
| 飞书 | 主入口 | **v2 再说** |

---

## 🚨 风险 & 预案

| 风险 | 预案 |
|---|---|
| 10 天太紧 | D7 的 Write Pipeline 是最容易砍的，可退化成"只入 inbox，人工审"；D10 深度笔记可延到 D+1/D+2 |
| LanceDB TS binding 有坑 | 备选 chromadb-js 或本地 pgvector |
| code_refs 抽取不准 | 先手写规则（正则 + AST light），LLM 只做兜底 |
| Claude Code MCP 挂载失败 | D1 就跑通 hello，尽早暴露问题 |
| Edge md 里格式差异大 | D3 报告先摸清，D4 ingest 只处理能处理的，其余进 inbox |

---

## 📝 现存 Edge md 库信息（等老王补）

- [ ] 路径：**待老王告知**
- [ ] 量级：**100 篇**
- [ ] 具体冲突/过时的一两个例子：**待老王给靶子**

---

## 🎬 立即行动清单

**今天 (D1) 剩余时间**：
1. 老王把 Edge md 库路径告诉我
2. 我起 `~/repos/memory-agent/` 骨架
3. 三路 hello + MCP hello 落地
4. Claude Code 挂上 memory-agent MCP server 验证

冲 🚀
