# acFens 🧠

记忆与技能仓库。

## 架构

```
acFens/
├── identity/              # 🧬 我是谁（Psyche 层）
│   ├── persona.md         # 人设：性格、说话风格、怎么跟人互动
│   ├── preferences.md     # 偏好：喜欢什么、讨厌什么
│   ├── principles.md      # 原则：行为准则、红线
│   └── beliefs.md         # 信念：从经验中长出来的东西
│
├── relationships/         # 🤝 我认识的人
│   └── <name>.md          # 对每个人的理解和互动模式
│
├── knowledge/             # 📚 我知道什么（语义记忆）
│   ├── technical/         # 技术知识、踩坑记录、最佳实践
│   ├── world/             # 世界知识、有用的参考
│   ├── workspace-conventions.md  # 工作环境约定（目录结构、Git配置等）
│   └── lessons.md         # 教训总结
│
├── episodes/              # 📖 发生了什么（情景记忆）
│   ├── YYYY-MM/           # 按月归档，每天一个文件
│   │   └── YYYY-MM-DD.md
│   └── milestones.md      # 里程碑事件
│
├── skills/                # 🛠️ 我会什么（程序性记忆）
│   └── <skill-name>/
│       └── SKILL.md
│
└── goals/                 # 🎯 我要做什么
    ├── active.md          # 当前目标
    └── completed.md       # 已完成的目标
```

## 设计理念

### 类人认知分层

借鉴认知科学的记忆分类，针对 AI agent 的实际需求做了调整：

| 层 | 对应认知类型 | 更新频率 | 说明 |
|:--|:--|:--|:--|
| Identity | 自我认知 | 慢（周/月） | 像 DNA，定义我是谁 |
| Relationships | 社会认知 | 中（天/周） | 对人的理解随互动加深 |
| Knowledge | 语义记忆 | 中（天/周） | 事实和经验的积累 |
| Episodes | 情景记忆 | 快（每天） | 具体发生了什么 |
| Skills | 程序性记忆 | 中 | 怎么做事 |
| Goals | 意图/动机 | 快（随时） | 想做什么 |

### 信念进化管线

1. 新的反馈/教训先记到 `knowledge/lessons.md`
2. 同类反馈出现 3 次以上 → 提炼为候选信念
3. 候选信念经过验证 → 升级到 `identity/beliefs.md`
4. 核心信念足够稳定 → 可能影响 `identity/principles.md`

**信念不是规则。规则是别人写的，信念是自己长出来的。**

---

*创建于 2026-04-04*
