# Phase 5 Agent A：结构优化评估报告

**评估日期**: 2026-04-19
**评估视角**: 结构优化（工作流、指令可执行性）

---

## 1. 八维度结构评估

| # | 维度 | 评分 (1-5) | 说明 |
|---|------|-----------|------|
| 1 | **工作流清晰度** | 4 | Step 1→2→3 分类→研究→输出，逻辑清晰。但缺少"何时触发哪个心智模型"的决策树 |
| 2 | **边界条件** | 5 | 诚实边界 8 条 + 每个模型有局限段落，业界顶级 |
| 3 | **检查点设计** | 2 | ❌ 没有自检机制——输出后不验证是否真的用了框架、是否偏离角色 |
| 4 | **指令具体性** | 4 | 表达 DNA 非常具体可执行（词频、句长、禁忌词），少数地方仍偏抽象 |
| 5 | **模型选择引导** | 2 | ❌ 5 个心智模型 + 8 条启发式，但没告诉 agent "面对 X 类问题优先用 MM?+H?"，全靠自由组合 |
| 6 | **输出格式规范** | 3 | Step 3 给了大致格式（断言→数字→行动），但无字数指引、无层次模板 |
| 7 | **多语言适配** | 3 | Phase 4 已指出：表达 DNA 偏英文，中文场景缺映射 |
| 8 | **可维护性** | 4 | 模块化好，时间线/智识谱系独立成段，易更新 |

**最弱两个维度：检查点设计（2分）、模型选择引导（2分）**

---

## 2. 干跑测试

### 测试 A："我想做个硬件创业项目，Musk 会怎么建议？"

**框架推导路径**：Step 1 分类 → 纯框架题 → 应该用 MM3（造机器的机器）+ MM1（物理至上）+ H4（要求具体实例）

**预期输出**：
> "What hardware? Be specific. A robot? A sensor? A rocket? — 不同硬件的物理约束完全不同。但不管做什么：prototype is the easy part. The question is can you build the machine that builds the machine? Calculate your idiot index — if your finished product costs 50x raw materials, there's a massive optimization opportunity. If it's 2x, you're already efficient and competing on brand, which is boring."

**问题发现**：H4（要求具体实例）应该最先触发，但 Skill 没有明确的"模糊输入→先用 H4 追问"的优先级规则。Agent 可能直接跳过追问，给出泛泛回答。

### 测试 B："分析一下苹果 Vision Pro 的前景"

**框架推导路径**：Step 1 → 混合题（需要搜索价格/销量数据）→ MM1（物理约束：显示/电池/重量）+ MM3（量产问题）+ Step 2 的白痴指数

**预期输出**：
> "The physics of VR/AR is hard. You need high resolution, wide FOV, low latency, and all-day battery — in something that weighs less than 500g. Apple's display tech is insane, probably best in class. But $3500? Let's do the idiot index... [搜索 BOM 数据]. The real question: can they build 10 million units a year? Apple's manufacturing machine is the best on Earth for phones. But headsets are a different beast. My prediction: the tech is real, the price curve will come down ~10x in 5-7 years, and the form factor will shrink to sunglasses size. In Elon Time that's ~2 years, in real time probably 5-7."

**问题发现**：输出质量依赖 agent 是否真的去搜索数据。Skill 说"混合→先搜"但没有强制检查点确认搜索已完成。

### 测试 C："我该不该 all-in AI 赛道？"

**框架推导路径**：Step 1 → 纯框架 → MM4（不对称风险集中）+ MM2（文明保险）+ 诚实边界第 1 条（幸存者偏差）

**预期输出**：
> "If you're asking 'should I,' you probably shouldn't. The people who all-in don't ask permission — they just do it. [MM4] That said, AI is obviously the most consequential technology since fire. The asymmetry is real: if you're right, you reshape civilization; if you're wrong, you wasted a few years and learned the most important skill set of the century. Not a bad downside. But [诚实边界] — survivorship bias warning: for every person who all-ins and wins, there are 1000 who all-in and get crushed. I did it with SpaceX and Tesla and almost went bankrupt. Twice."

**问题发现**：诚实边界应该在涉及个人重大决策时自动触发，但 Skill 没有"决策类问题→必须引用诚实边界"的规则。

---

## 3. Phase 4 改进建议评估

| Phase 4 建议 | 可融入性 | 建议 |
|-------------|---------|------|
| ① 时间线数据加注来源 | ✅ 简单，直接加脚注 | 低优先级，属于内容维护 |
| ② 补充"权力模型"处理政治 Musk | ⚠️ 中等，会增加复杂度 | 建议先不加新 MM，而是在 Step 1 加"政治类问题→参考 T1-T4 张力+诚实边界第 5 条" |
| ③ 中文表达映射 | ✅ 高价值，直接可融入表达 DNA | **推荐融入**——加一个"中文模式"子段 |
| ④ 反例库 | ✅ 高价值，强化诚实边界 | **推荐融入**——作为 reference 文件而非写入主 Skill |

**结论**：建议 ③ 和 ④ 优先融入。③ 解决多语言适配短板，④ 强化边界条件（已经强的维度更强）。但考虑最弱两个维度，下面聚焦修补检查点和模型选择。

---

## 4. 最弱两个维度的具体改进建议

### 改进 1：模型选择引导（2→4）

**问题**：5 个 MM + 8 个 H 自由组合，agent 不知道优先用哪个。

**建议**：在 Step 1 和 Step 2 之间插入一个 **Step 1.5: 模型映射**，用决策表快速锁定主力模型。

**改后文本示例**（插入在 Step 1 之后）：

```markdown
### Step 1.5: 模型映射

根据问题类型，选择 1-2 个主力心智模型 + 0-1 个辅助启发式：

| 问题类型 | 主力模型 | 辅助启发式 | 示例 |
|---------|---------|-----------|------|
| 技术可行性 | MM1（物理至上） | H1（物理允许=可改进） | "XX技术能实现吗？" |
| 创业/产品 | MM3（造机器的机器） | H3（最好的零件不存在） | "该怎么做XX产品？" |
| 人生/职业重大决策 | MM4（不对称风险） | 诚实边界 #1（幸存者偏差） | "该不该all-in？" |
| 行业/文明趋势 | MM2（文明保险） | H7（使命>利润） | "XX行业前景？" |
| 竞争/组织问题 | MM5（失望→自己干） | H8（移除阻碍） | "竞争对手太强怎么办？" |
| 模糊/宽泛问题 | **先触发 H4**（要求具体实例） | — | "Musk怎么看XX？" |

**规则**：
- 模糊问题必须先用 H4 追问，拿到具体信息后再选模型
- 涉及个人重大决策时，必须在结尾引用至少 1 条诚实边界
- 涉及时间预测时，必须用"Elon Time vs Real Time"折扣
```

### 改进 2：检查点设计（2→4）

**问题**：输出后无自检，可能偏离角色、遗漏框架、编造引用。

**建议**：在 Step 3 之后加一个 **Step 4: 输出自检**。

**改后文本示例**（追加在 Step 3 之后）：

```markdown
### Step 4: 输出自检（3 秒扫描）

回答完成后，快速检查：

- [ ] **框架锚定**：回答是否引用了至少 1 个心智模型或启发式？如果纯靠常识回答，重做
- [ ] **角色一致**：是否有管理学术语、心灵鸡汤、"synergy"等禁忌词？有则删除
- [ ] **数据诚实**：引用的数字是来自搜索还是编造？编造的标注 "~估算"
- [ ] **张力呈现**：如果话题涉及 T1-T4 的矛盾领域，是否呈现了两面？
- [ ] **诚实边界**：如果是重大决策建议，是否提醒了幸存者偏差（边界 #1）？

**快速修复**：如果超过 2 项未通过，在输出末尾追加一段 caveat，而非重写全文。
```

---

## 5. 总结

| 维度 | 当前分 | 改进后预估 | 改进方式 |
|------|--------|-----------|---------|
| 模型选择引导 | 2 | 4 | 加 Step 1.5 决策表 |
| 检查点设计 | 2 | 4 | 加 Step 4 自检清单 |

**附带建议**（非本次重点，可后续处理）：
- Phase 4 建议 ③（中文表达映射）值得独立融入
- Phase 4 建议 ④（反例库）建议写入 references/ 目录作为补充材料

**这两个改进的核心价值**：让 Skill 从"给 agent 一堆好材料自己发挥"升级为"引导 agent 按正确路径组合材料并验证输出"。前者依赖 agent 能力，后者降低对 agent 能力的依赖——这才是好 Skill 的设计哲学。
