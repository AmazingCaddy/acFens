# Productivity Agent - Daily Journal

每天一行，记录进度、卡壳、灵感。Ada 会帮忙维护。

---

## 2026-07-08 (Wed) - Day 0
- 目标锁定，方案定型（LangGraph + 飞书多维表格 + Jinja2 HTML）
- 30 天 PLAN.md 就绪
- 明天 Day 1 开始：Python 环境 + 3 个 API 直调

## 2026-07-09 (Thu) - Day 1

### 环境搭建 ✅
- 确认系统 Python 版本：3.12.3（满足 3.11+ 要求）
- 安装 uv 0.11.28 作为包管理器（比 pip 快，项目隔离更干净）
- 初始化项目：`uv init --python 3.12`
- 安装核心依赖：
  - langchain 1.3.12
  - langgraph 1.2.8
  - langsmith 0.10.0
  - openai 2.44.0
  - anthropic 0.116.0
- 项目目录从 `~/projects/productivity-agent/` 移到 `~/repos/productivity-agent/`（跟其他 repo 统一）
- 验证：移动后 `.venv` 正常工作，所有 import OK

### 项目结构
```
~/repos/productivity-agent/
├── .venv/          # 虚拟环境
├── README.md
├── main.py
├── pyproject.toml
└── uv.lock
```

### 待办（Day 1 剩余）
- [ ] 配置 API key（OpenAI / Anthropic / DeepSeek 至少一个）
- [ ] 跑通 3 个 API call：直调 OpenAI、直调 Anthropic、通过 LangChain 调
- [ ] 产出：`day1-hello-llm.py`

## 2026-07-10 (Fri) - Day 3（重启）

### 关键决策：项目重启为 **memory-agent** 🚀
- **启发**：老王看了 Claude Code 源码 + 手写 while 循环 → "agent = while 循环" 祛魅完成
- **四个大调整**：
  1. **Python → TypeScript**（跟 Claude Code / OpenClaw / 我 拉齐）
  2. **通用生产力 Agent → Memory Agent**（盯住老王真实痛点：100 篇 Edge md 治理 + IDE 里查知识）
  3. **飞书主入口 → MCP server（IDE 主战场）**：Copilot/Claude Code 直接接
  4. **30 天 → 10 天冲刺**（交付 7/19）
- **旧项目封存**：`~/repos/productivity-agent/` 加 `ARCHIVED.md`，推到 remote（commit `b58c2dd`）
  - 保留作为学习残档，尤其 `day2-agent-from-scratch.py` 的心智模型直接迁移到 TS 版
- **acFens 里重命名**：`projects/productivity-agent/` → `projects/memory-agent/`
- **PLAN v2 完成**：`projects/memory-agent/PLAN.md`（原版存为 `PLAN-v1-python-30day.md`）
- **`goals/active.md` 同步更新**

### memory-agent 核心设计（D2 要落地）
- **存储分层**：`~/memory/domains/<domain>/` (canonical) + `inbox/` + `quarantine/` + `legacy` 同层保留
- **frontmatter schema 杀手销：`code_refs`**（文件路径 + 类/函数名 + Edge 版本 + verified commit）——这是差异化价值
- **四种入库姿势**：fresh_write / update / conflict / merge_suggestion
- **MCP tools**：`find_memory_for_code` / `search_memory` / `get_code_refs` / `add_memory` / `list_conflicts` / `list_stale`

### 待老王补的
- [ ] 100 篇 Edge md 的文件夹路径
- [ ] 1-2 个具体的冲突 / 过时例子（做 D6 靶子）

### D1 待办（今天剩余时间）
- [ ] 起 `~/repos/memory-agent/` 骨架（pnpm + tsconfig + biome + vitest）
- [ ] 三路 hello：LangGraph.js / AI SDK / 手写 while
- [ ] MCP hello world server + Claude Code 挂上验证

### 敎橁
- 跟老王聊一小时不到，项目从"学习 30 天"变成"10 天搭真家伙"——需求磨到够锚尖时，方案自己就会祛魅
- “Agent = while 循环"这个洞察值得进 `knowledge/lessons.md`（下次提醒老王）

---

## 2026-07-10 (Fri) - Day 2 日记（下面是旧 v1 Python 项目的，保留作学习记录）

### LangChain 有工具的对话 Agent ✅
- 模型接入方案定了：用 `langchain-litellm` 的 `ChatLiteLLM` 挂 `github_copilot/claude-sonnet-4.5`——离线不用真 key 也能跑，避开 Day 1 遗留的 key 问题
- 定义了两个工具：
  - `calculator`：用 `ast.parse` + 白名单 op 递归求值，杜绝 `eval` 任意代码执行
  - `search`：本地 mock 知识库（langgraph / langchain / crewai / mcp / litellm）
- 用 LangChain 1.x 的 `create_agent(model, tools, system_prompt)` 组装 ReAct Agent（底层就是 LangGraph，自带 tool-calling 循环）
- 支持三种入口：默认 demo / 单次提问 / `--chat` 交互模式
- **产出**：`day2-langchain-agent.py`（201 行）

### 加餐：手写 Agent 循环 ✅
- 撕开 `create_agent` 的黑盒，自己写一遍 ReAct 循环，看清"思考→调工具→观察→再回答"到底在干嘛
- 关键三件套：`llm.bind_tools(TOOLS)` → `AIMessage.tool_calls` → `ToolMessage(tool_call_id=...)` 配对回喂
- 加了 `MAX_STEPS=6` 死循环保险
- **产出**：`day2-agent-from-scratch.py`（189 行）

### 收获
- LangChain 抽象里最有用的其实就是 `@tool` 装饰器 + `bind_tools` 的 schema 转换；`create_agent` 只是一个薄壳
- LangGraph 已经是 LangChain 1.x agent 的默认底盘，Day 3 直接进 StateGraph 是顺的
- ChatLiteLLM 换模型只改字符串，后面切 DeepSeek / Anthropic / OpenAI 都很省心

### 提交
- `9146196` Refactor code structure for improved readability and maintainability
- `00d6c60` Add day2-agent-from-scratch.py for manual agent loop implementation

### 下一步（Day 3）
- LangGraph 入门：StateGraph / Node / Edge / Conditional Edge / Checkpoint
- 双节点 Agent（researcher → writer）+ checkpoint 断点续跑
- 注册 LangSmith 看 trace
- 产出：`day3-langgraph-basic.py`
