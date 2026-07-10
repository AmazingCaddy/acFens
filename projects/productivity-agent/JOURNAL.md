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

## 2026-07-10 (Fri) - Day 2

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
