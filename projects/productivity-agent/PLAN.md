# 生产力 Agent - 30天学习+落地计划

**Owner**: 老王
**Coach**: OldWang (Ada)
**启动日期**: 2026-07-08 (Wed)
**交付日期**: 2026-08-07 (Fri)

---

## 🎯 交付物清单（30天后要拿到手的）

1. **一个能跑的生产力 Agent**——挂在飞书上，任务管理 + 决策辅助 + HTML 知识分享
2. **3+ 个框架的对比笔记**（LangGraph / CrewAI / Claude SDK 至少）
3. **1 个深度研究笔记**（Agent 记忆管理与长期任务追踪）
4. **公开可分享的成果**（技术博客 or Twitter thread or 知识库）

---

## 📐 技术架构（先定死，避免后期反复）

```
飞书聊天入口
    │
    ├──> OpenClaw 主脑（Ada / 老王你）
    │      │
    │      ├──> 快速对话直接答
    │      │
    │      └──> 复杂任务转给 productivity-agent（MCP 或子进程）
    │
    └──> productivity-agent（LangGraph 主体）
           ├── 任务状态机（LangGraph）
           ├── 任务后台（飞书多维表格）
           ├── 知识库（本地 SQLite + 向量库 chromadb）
           ├── HTML 生成器（Jinja2 模板 + LLM 结构化内容）
           └── 定时器（cron 或 APScheduler）
```

**为什么这么设计：**
- LangGraph 负责"agent 大脑"：状态、决策、断点续跑
- 飞书多维表格负责"任务可视化"：老王能自己看能自己改
- OpenClaw 负责"聊天入口"：不重复造轮子
- HTML 生成独立成模块：任何 agent 都能调

---

## 📅 30天 Daily Checklist

### 🗓️ Week 1: 建立地图 + 手感 (7/8 - 7/14)

**周主题**: 打通 LangChain/OpenAI API 基础，把 3 个代表性框架各跑一个 demo

#### Day 1 (Wed 7/8) - 环境准备 + 第一个 API call
- [ ] Python 环境确认（3.11+，建议用 uv 管理）
- [ ] 拿到并配置 OpenAI / Anthropic / DeepSeek API key（至少一个）
- [ ] 建项目目录：`~/projects/productivity-agent/`
- [ ] 装依赖：`langchain langgraph langsmith openai anthropic`
- [ ] 跑通 3 个 API call：直调 OpenAI、直调 Anthropic、通过 LangChain 调
- [ ] **产出**：`day1-hello-llm.py`，能看到 3 种方式的差异

#### Day 2 (Thu 7/9) - LangChain 基础
- [ ] 读 LangChain 官方 quickstart（1-2h）
- [ ] 理解核心概念：LLM / Prompt / Chain / Tool / Agent
- [ ] 手写一个"有工具的对话 Agent"（比如：能搜索+能算数的助手）
- [ ] **产出**：`day2-langchain-agent.py`
- [ ] 记笔记：LangChain 的抽象哪里好、哪里烦

#### Day 3 (Fri 7/10) - LangGraph 入门（重点！）
- [ ] 读 LangGraph 官方 tutorial（Get Started 全过一遍）
- [ ] 理解：StateGraph、Node、Edge、Conditional Edge、Checkpoint
- [ ] 手写一个双节点的 Agent（researcher → writer）
- [ ] 加上 checkpoint，重启后能续跑
- [ ] **产出**：`day3-langgraph-basic.py` + checkpoint demo
- [ ] LangSmith 注册，看 trace

#### Day 4 (Sat 7/11) - LangGraph 进阶
- [ ] 学 Human-in-the-loop：怎么在 graph 中间停下等人
- [ ] 学 Multi-agent：Supervisor 模式
- [ ] 手写一个"研究+写+人类确认+发布"的 workflow
- [ ] **产出**：`day4-langgraph-hitl.py`

#### Day 5 (Sun 7/12) - CrewAI 对比
- [ ] 读 CrewAI 官方 quickstart
- [ ] 用 CrewAI 实现和 Day 3/4 一样的功能
- [ ] **对比**：同样的任务，LangGraph 和 CrewAI 分别写起来什么感受
- [ ] **产出**：`day5-crewai-same-task.py` + 对比笔记

#### Day 6 (Mon 7/13) - Claude Agent SDK（选读 OpenClaw 源码）
- [ ] 读 Anthropic Claude Agent SDK 文档
- [ ] 或者：`cd ~/forks/openclaw && ls`，读 OpenClaw 的 agent 循环怎么写的
- [ ] 理解"single-agent + subagent + tools"这一派的哲学
- [ ] **产出**：一份"单主脑派 vs 多 agent 派"的笔记

#### Day 7 (Tue 7/14) - Week 1 总结 + 决策
- [ ] 写 Week 1 复盘（哪个框架你最喜欢，为什么）
- [ ] **锁定**：生产力 Agent 就用 LangGraph 做主脑
- [ ] 把 Week 1 学习笔记整理成博客初稿（顺便测试你的 HTML 生成需求）
- [ ] **产出**：Week 1 博客初稿 (markdown)

---

### 🗓️ Week 2: 生产力 Agent MVP (7/15 - 7/21)

**周主题**: 从 0 到 1，做出一个"能跑通全流程"的 MVP，就算丑也没关系

#### Day 8 (Wed 7/15) - 需求细化 + 数据模型
- [ ] 详细列出生产力 Agent 的用户故事（用户 = 你自己）
  - "我下班前跟 Agent 说'明天要跟客户开会'，它记下来，明早 9 点提醒我准备"
  - "我读完一篇文章说'这个记住'，它保存并归类"
  - "我说'把我这周学的 LangGraph 内容生成一个网页'，它给我一个 HTML 链接"
- [ ] 设计数据模型：Task / Knowledge / Decision
- [ ] 在飞书多维表格里建 3 张表
- [ ] **产出**：数据模型文档 + 飞书表格建好

#### Day 9 (Thu 7/16) - LangGraph 骨架
- [ ] 搭 LangGraph 主图：意图分类节点 + N 个专用节点
- [ ] 节点列表：
  - `classify_intent`（分是任务/知识/决策/查询）
  - `handle_task`（增删改查任务）
  - `handle_knowledge`（存知识 or 生成 HTML）
  - `handle_decision`（记录决策请求）
  - `handle_query`（回答"我今天要做啥"这类问题）
- [ ] **产出**：`agent/graph.py` 主流程能跑通（工具都是 mock）

#### Day 10 (Fri 7/17) - 任务管理模块
- [ ] 写飞书多维表格的读写封装
- [ ] 实现任务的 CRUD：add / list / update_status / mark_done
- [ ] 接入 LangGraph 的 handle_task 节点
- [ ] 测试：CLI 里跟 Agent 说"帮我记一下：明天下午写周报"，能存到表格
- [ ] **产出**：任务管理模块 + 集成测试

#### Day 11 (Sat 7/18) - 主动提醒（定时任务）
- [ ] 用 APScheduler 或 cron，每天定时扫描飞书任务表
- [ ] 到期任务 → 通过飞书发消息给你
- [ ] 待决策任务 > 24h → 主动 push
- [ ] **产出**：定时提醒能力，你能收到 Agent 的主动消息

#### Day 12 (Sun 7/19) - 知识存储
- [ ] 装 chromadb（向量库），设计知识 schema
- [ ] 实现：贴 URL → Agent 抓取 → 用 LLM 总结 → 存入向量库 + SQLite
- [ ] 实现：直接说"记住这段" → 也能存
- [ ] 支持按主题 tag / 时间检索
- [ ] **产出**：知识存储模块

#### Day 13 (Mon 7/20) - HTML 生成（重头戏）
- [ ] 挑一个漂亮的 HTML 模板（可以用 TailwindCSS + 现成模板）
- [ ] 设计流程：
  1. LLM 把知识组织成结构化 JSON（标题、章节、要点、示例）
  2. Jinja2 模板渲染成 HTML
  3. 生成的文件放 `~/projects/productivity-agent/knowledge-site/`
- [ ] 让 Agent 支持"把 X 主题生成一个页面"的命令
- [ ] **产出**：能生成一个漂亮的知识 HTML 页面

#### Day 14 (Tue 7/21) - MVP 集成 + Week 2 总结
- [ ] 端到端测试：从聊天到任务到提醒到知识到 HTML，都跑通
- [ ] 找 3 个真实场景实测（比如：把今天学的 LangGraph 生成 HTML）
- [ ] 写 Week 2 复盘（遇到什么坑，MVP 有哪些不足）
- [ ] **产出**：MVP v0.1 tag

---

### 🗓️ Week 3: 深挖 - Agent 的记忆管理 + 长期任务追踪 (7/22 - 7/28)

**周主题**: 你的 Agent 用起来了，但你会发现"记不住上下文""任务追踪很傻"，这周深挖

#### Day 15 (Wed 7/22) - 定题 + 读论文
- [ ] 精读 5 篇高质量材料：
  - MemGPT 论文
  - Anthropic 的 "Building effective agents"
  - LangGraph memory 文档
  - Zep / Mem0 这类开源记忆库的设计
  - "context engineering" 相关的 blog
- [ ] **产出**：文献综述笔记

#### Day 16 (Thu 7/23) - 记忆分层设计
- [ ] 设计你的 Agent 的记忆分层：
  - Working memory（当前对话）
  - Short-term（今天的事件）
  - Long-term（人物、偏好、原则）
  - Episodic（时间线上的事件）
  - Semantic（结构化知识）
- [ ] 参考 acFens 已有的分层设计（老王你已经在做这个！）
- [ ] **产出**：记忆架构设计文档

#### Day 17 (Fri 7/24) - 实验：任务状态的"记忆感知"
- [ ] 问题：Agent 怎么知道"这个任务卡了 3 天，该主动 push 用户了"？
- [ ] 实现：任务状态历史 + LLM 定期"复盘"任务列表
- [ ] 实验：跑几个模拟场景，看 Agent 判断得准不准
- [ ] **产出**：实验代码 + 效果记录

#### Day 18 (Sat 7/25) - 实验：知识的"遗忘 + 更新"
- [ ] 问题：老的知识过时了怎么办？相互矛盾的知识怎么办？
- [ ] 实现：知识更新时保留历史版本 + LLM 检测冲突
- [ ] **产出**：知识版本管理机制

#### Day 19 (Sun 7/26) - 实验：上下文压缩
- [ ] 问题：跟 Agent 聊多了，上下文爆了怎么办？
- [ ] 实现：LLM 定期"总结压缩"历史对话，保留精华
- [ ] **产出**：上下文管理机制

#### Day 20 (Mon 7/27) - 集成到 Agent
- [ ] 把 Day 17-19 的机制集成到 Week 2 的 MVP
- [ ] 端到端测试
- [ ] **产出**：MVP v0.2 tag

#### Day 21 (Tue 7/28) - 深度研究笔记
- [ ] 写一篇长文：《Agent 记忆管理：从 MemGPT 到我自己的实践》
- [ ] 有实验数据、有自己观点、有代码
- [ ] **产出**：可发布的深度研究笔记

---

### 🗓️ Week 4: 打磨 + Dogfooding + 收官 (7/29 - 8/4)

**周主题**: 你每天真的用，改到能撑得起"我的外脑"

#### Day 22 (Wed 7/29) - 挂到 OpenClaw
- [ ] productivity-agent 包成一个可以从 OpenClaw 调用的服务
- [ ] 方案：写成 MCP server，或者写成 skill，或者 subprocess 调用
- [ ] **产出**：飞书聊天 → OpenClaw → productivity-agent 全通

#### Day 23 (Thu 7/30) - UX 优化
- [ ] 让 Agent 的回复更"人味"（不要机器人腔）
- [ ] 让主动提醒不吵人（合并、静默时段）
- [ ] 让 HTML 生成的页面更漂亮
- [ ] **产出**：UX v1

#### Day 24 (Fri 7/31) - Dogfooding Day 1
- [ ] **只用 Agent 管理今天的所有任务**
- [ ] 记录所有踩坑
- [ ] 晚上修 bug

#### Day 25 (Sat 8/1) - Dogfooding Day 2
- [ ] 继续用，重点测知识 → HTML 流程
- [ ] 生成 3 个真实主题的 HTML 分享出去
- [ ] 记录反馈

#### Day 26 (Sun 8/2) - Dogfooding Day 3
- [ ] 继续用，重点测主动提醒
- [ ] 找亲友让他们看你生成的 HTML，收反馈
- [ ] 修 bug

#### Day 27 (Mon 8/3) - 部署 + 稳定性
- [ ] Agent 部署方式定型（本地常驻 / Azure / 自己服务器）
- [ ] 加基本的错误处理和监控
- [ ] **产出**：能长期跑的 v1.0

#### Day 28 (Tue 8/4) - 30 天总结（对外）
- [ ] 写一篇总结博客/thread：《我用 1 个月学 AI Agent 并做了个自己的 Agent》
- [ ] 内容：学习路径、框架对比、我的 Agent 演示、深度研究笔记链接
- [ ] 用你自己的 Agent 把这篇总结生成 HTML！（元乐趣）
- [ ] **产出**：可发布的总结

#### Day 29 (Wed 8/5) - buffer / 修尾巴
- [ ] 修剩下的 bug
- [ ] 补文档

#### Day 30 (Thu 8/6-8/7) - 交付 + 庆祝
- [ ] Review 4 个交付物是否都齐了
- [ ] 写下 v2 的想法（后面继续做的方向）
- [ ] **告诉老王 Ada：搞定了 🎉**

---

## 🚦 关键决策点（提前预留）

- **Day 7 结束时**：如果 LangGraph 感觉不合手，换 CrewAI 或直接 Claude SDK
- **Day 14 结束时**：如果 MVP 完成不了，砍功能保交付（先砍 HTML 生成）
- **Day 21 结束时**：深度研究做不深也没关系，保住"能用"更重要
- **Day 28 结束时**：如果没心力写对外总结，就在 acFens 里写内部复盘

---

## 📊 进度追踪

- Ada 每周日跟老王做一次 review（15 分钟）
- 每天你完成的 checkbox，跟我说一声，我更新
- 有卡壳的地方，随时喊我

---

## 🔑 我（Ada）的角色

- **每日**：早上主动 push 今天要做啥
- **卡壳时**：一起 debug，帮你查资料
- **决策时**：给你分析利弊，帮你拍板
- **产出时**：帮你 review 代码/笔记/HTML
- **心累时**：陪你聊，帮你把情绪跟事情分开
