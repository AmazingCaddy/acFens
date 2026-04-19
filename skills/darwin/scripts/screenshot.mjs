#!/usr/bin/env node
/**
 * Darwin Skill - 高清截图脚本
 *
 * 用法: node scripts/screenshot.mjs [html文件路径] [输出png路径]
 *
 * 特性:
 * - 2x deviceScaleFactor，输出高清图
 * - 只截 .card 元素
 * - 等待字体加载完成
 */

import { chromium } from 'playwright';

const htmlPath = process.argv[2];
const outputPath = process.argv[3];

if (!htmlPath || !outputPath) {
  console.error('用法: node screenshot.mjs <html路径> <输出png路径>');
  process.exit(1);
}

async function screenshot() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 920, height: 1600 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2000);

    const card = await page.locator('.card');
    await card.screenshot({ path: outputPath, type: 'png' });

    const box = await card.boundingBox();
    console.log(`截图完成: ${outputPath}`);
    console.log(`卡片尺寸: ${Math.round(box.width)}x${Math.round(box.height)}px (CSS)`);
    console.log(`输出尺寸: ${Math.round(box.width * 2)}x${Math.round(box.height * 2)}px (2x高清)`);
  } finally {
    await browser.close();
  }
}

screenshot().catch(err => {
  console.error('截图失败:', err.message);
  process.exit(1);
});
