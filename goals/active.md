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

## 🌟 [主线-30天] 学 AI Agent + 造个人生产力 Agent
**启动日期**: 2026-07-08 | **交付日期**: 2026-08-07

### 目标
1. **广度**：跑通并理解主流 Agent 框架（LangGraph、CrewAI、AutoGen、OpenAI SDK、Claude SDK）
2. **深度**：自己搭一个生产力 Agent，我每天真的用
3. **研究**：深挖一个 Agent 开发痛点（初选：记忆管理 + 长期任务状态追踪）

### 生产力 Agent 定位
**外脑执行秘书**：任务管理 + 决策辅助 + 知识 HTML 化输出
- 任务：记录、提醒、追踪状态（做/待决策/完成/阻塞）
- 决策：主动 push 待拍板的事，给选项和建议
- 知识：一键把知识主题生成漂亮 HTML 页面（可直接分享）

### 技术选型（Ada 定的）
- **主框架**: LangGraph（学工程派 + 天然适配任务状态机）
- **任务后台**: 飞书多维表格
- **HTML 生成**: LLM → JSON → Jinja2 模板 → 静态 HTML（可发 Cloudflare Pages）
- **入口**: 阶段一本地 CLI，阶段二挂 OpenClaw 让飞书聊天就能用
- **知识来源**: 半自动（贴 URL 自动总结）+ 手动（聊天标记）

### 4 周节奏
- **W1 (7/8-7/14)**: 建立地图 + 3 框架 hello world
- **W2 (7/15-7/21)**: 生产力 Agent MVP
- **W3 (7/22-7/28)**: 深挖记忆管理 + 状态追踪
- **W4 (7/29-8/4)**: 升级 Agent + dogfooding + 收官

### 状态
- [x] 目标 lock in (7/8)
- [ ] Day 1 环境准备 + LangGraph 第一个 demo
- [ ] 详细 30 天 checklist 见 `~/acFens/projects/productivity-agent/PLAN.md`
