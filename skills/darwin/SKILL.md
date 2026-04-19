---
name: darwin
description: "Darwin Skill: autonomous skill optimizer inspired by Karpathy's autoresearch. Evaluates SKILL.md files using 8-dimension rubric, runs hill-climbing with git version control, validates via test prompts, generates visual result cards. Triggers: 优化skill, skill评分, 自动优化, auto optimize, skill质量检查, 达尔文, darwin, 帮我改改skill, skill怎么样, 提升skill质量, skill review, skill打分."
---

# Darwin Skill

> 借鉴 Karpathy autoresearch：**评估 → 改进 → 实测验证 → 人类确认 → 保留或回滚 → 生成成果卡片**

## 设计原则

1. **单一可编辑资产** — 每次只改一个 SKILL.md
2. **双重评估** — 结构评分（静态）+ 效果验证（跑测试）
3. **棘轮机制** — 只保留改进，自动回滚退步
4. **独立评分** — 评分用子agent，避免自己改自己评
5. **人在回路** — 每个skill优化完后暂停，用户确认再继续

## 评估 Rubric 概览（8维度，总分100）

结构维度（60分）：Frontmatter质量(8) | 工作流清晰度(15) | 边界条件覆盖(10) | 检查点设计(7) | 指令具体性(15) | 资源整合度(5)
效果维度（40分）：整体架构(15) | 实测表现(25)

> 详细评分标准见 `references/rubric.md`

## 工作流

### Phase 0: 初始化

1. 确认优化范围：
   - 全部skills → 扫描项目中所有 `SKILL.md`
   - 指定skills → 用户指定列表
2. 创建 git 分支：`auto-optimize/YYYYMMDD-HHMM`
3. 初始化或读取 `results.tsv`（格式见下方）

### Phase 0.5: 测试Prompt设计

为每个skill设计测试prompt——没有测试prompt，实测表现维度打不了分。

```
for each skill:
  1. 读取 SKILL.md，理解功能
  2. 设计2-3个测试prompt：
     - 最典型使用场景（happy path）
     - 一个稍复杂或有歧义的场景
  3. 保存到 skill目录/test-prompts.json：
     [{"id": 1, "prompt": "...", "expected": "..."}]
```

展示所有测试prompt给用户，**确认后再进入评估**。

### Phase 1: 基线评估

```
for each skill:
  1. 读取 SKILL.md，按维度1-7逐项打分（附简短理由）
  2. 维度8：用子agent跑测试prompt（带skill vs 不带skill）
     - 无法跑子agent时退化为干跑验证，标注 dry_run
  3. 计算加权总分，记录到 results.tsv
```

展示评分卡后**暂停等用户确认**再进入优化。

### Phase 2: 优化循环

按基线分数从低到高排序。

```
for each skill:
  round = 0
  while round < MAX_ROUNDS (默认3):
    round += 1

    # 诊断：找出得分最低的维度
    # 提出改进方案：改什么、为什么、预期提升
    # 执行改进：编辑 SKILL.md，git commit
    # 重新评估：结构维度主agent打分，效果维度用子agent独立评
    # 决策：
    if 新总分 > 旧总分:
      keep，更新旧总分
    else:
      git revert HEAD
      记录失败，break

    记录到 results.tsv

  # 人类检查点：展示 diff + 分数变化 + 测试输出对比
  # 用户确认 OK 继续，否则回滚
```

### Phase 2.5: 探索性重写（可选）

当 hill-climbing 连续2个skill在 round 1 就 break 时，提议探索性重写：

1. `git stash` 保存当前最优版本
2. 从头重写 SKILL.md（不是微调，是重新组织）
3. 重新评估
4. 重写版更好则采用，否则 `git stash pop` 恢复

**必须征得用户同意。**

### Phase 3: 汇总报告 + 成果卡片

生成优化报告：优化数量、实验次数、保留/回滚率、分数变化表。

## results.tsv 格式

```tsv
timestamp	commit	skill	old_score	new_score	status	dimension	note	eval_mode
```

status: `baseline` | `keep` | `revert` | `error`
eval_mode: `full_test` | `dry_run`
文件位置：skill项目根目录下 `results.tsv`

## 约束规则

1. **不改变skill的核心功能和用途** — 只优化写法和执行方式
2. **不引入新依赖** — 不添加skill原本没有的文件
3. **每轮只改一个维度** — 避免多变更无法归因
4. **文件大小不超原始150%**
5. **可回滚** — 用 `git revert`，不用 `reset --hard`
6. **评分独立性** — 效果维度必须用子agent或干跑验证

## 使用方式

| 指令 | 执行内容 |
|------|---------|
| "优化所有skills" | Phase 0-3 完整流程 |
| "优化 xxx 这个skill" | 只对指定skill执行 Phase 0.5-2 |
| "评估所有skills的质量" | 只执行 Phase 0.5-1（不优化） |
| "看看skill优化历史" | 读取展示 results.tsv |

## 参考文件

| 路径 | 内容 |
|------|------|
| `references/rubric.md` | 8维度评分标准详解 |
| `references/strategies.md` | 优化策略库（P0-P3） |
| `references/error-handling.md` | 异常处理表 |
