# 成果卡片生成

## 卡片模板

模板位于 `assets/result-card.html`，3种风格通过 URL hash 切换：

| 风格 | CSS类 | URL hash | 视觉特点 |
|------|--------|----------|---------|
| Warm Swiss | `.theme-swiss` | `#swiss` | 暖白底+赤陶橙，Inter字体 |
| Dark Terminal | `.theme-terminal` | `#terminal` | 近黑底+荧光绿，等宽字体 |
| Newspaper | `.theme-newspaper` | `#newspaper` | 暖白纸+深红，衬线字体 |

## 生成流程

1. 复制 `assets/result-card.html` 到临时工作文件
2. 用 sed/编辑替换占位数据：
   - `data-field="skill-name"` → 实际skill名
   - `data-field="score-before/after/delta"` → 实际分数
   - 8个维度的 `dim-bar-before/after` width → 实际百分比
   - `data-field="improvement-1/2/3"` → 实际改进摘要
   - `data-field="date"` → 当前日期
3. 随机选择风格（hash 设为 swiss/terminal/newspaper）
4. 截图：
   ```bash
   node <skill_dir>/scripts/screenshot.mjs /abs/path/to/card.html /abs/path/to/output.png
   ```
   回退方案：
   ```bash
   npx playwright screenshot "file:///path/to/card.html#[theme]" output.png --viewport-size=960,1280 --wait-for-timeout=2000
   ```
5. 展示成果卡片 PNG 给用户

## 何时生成

- **单skill卡片**：每个skill优化完成后
- **总览卡片**：全部优化完成后（Phase 3）
