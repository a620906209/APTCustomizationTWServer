#!/usr/bin/env node
/**
 * scripts/setup.mjs
 * 環境檢查 & 依賴安裝工具
 * 用法: node scripts/setup.mjs
 */
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ─── 顏色輸出 ──────────────────────────────────────────────
const green  = s => `\x1b[32m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const bold   = s => `\x1b[1m${s}\x1b[0m`;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe','pipe','pipe'] }).trim();
  } catch {
    return null;
  }
}

// ─── 1. 系統需求檢查 ───────────────────────────────────────
console.log(bold('\n=== APT TW Server — 環境檢查 ===\n'));

const checks = [
  {
    name: 'Node.js',
    cmd: 'node -v',
    required: true,
    minMajor: 18,
    installHint: '請至 https://nodejs.org 下載 v18+ 版本'
  },
  {
    name: 'Yarn',
    cmd: 'yarn -v',
    required: true,
    installCmd: 'npm install -g yarn',
    installHint: '將自動執行: npm install -g yarn'
  },
  {
    name: 'Python',
    cmd: 'python --version',
    required: false,
    installHint: '建議安裝 Python 3.x（編譯原生模組用）'
  },
  {
    name: 'Git',
    cmd: 'git --version',
    required: false,
    installHint: '建議安裝 Git 2.x'
  }
];

let allRequired = true;

for (const c of checks) {
  const ver = run(c.cmd);
  if (ver) {
    // 版本最低限制
    if (c.minMajor) {
      const major = parseInt(ver.replace(/[^0-9.].*/, '').split('.')[0].replace('v',''));
      if (major < c.minMajor) {
        console.log(`${red('✗')} ${c.name}: ${ver}  ${yellow(`(需要 v${c.minMajor}+)`)}`);
        if (c.required) allRequired = false;
        continue;
      }
    }
    console.log(`${green('✓')} ${c.name}: ${ver}`);
  } else {
    const tag = c.required ? red('✗ [必要]') : yellow('△ [建議]');
    console.log(`${tag} ${c.name} 未安裝  — ${c.installHint ?? ''}`);
    if (c.required) {
      if (c.installCmd) {
        console.log(`  → 嘗試自動安裝: ${c.installCmd}`);
        const r = spawnSync(c.installCmd, { shell: true, stdio: 'inherit' });
        if (r.status === 0) {
          console.log(`${green('✓')} ${c.name} 安裝成功`);
        } else {
          allRequired = false;
        }
      } else {
        allRequired = false;
      }
    }
  }
}

if (!allRequired) {
  console.log(red('\n請先安裝缺少的必要工具後重新執行。\n'));
  process.exit(1);
}

// ─── 2. 依賴安裝 ───────────────────────────────────────────
const modules = [
  { dir: 'main',     label: 'Main  (Electron)' },
  { dir: 'renderer', label: 'Renderer (Vue+Vite)' },
  { dir: 'docs',     label: 'Docs  (VitePress)',  optional: true },
];

console.log(bold('\n=== 安裝子模組依賴 ===\n'));

for (const m of modules) {
  const abs = path.join(ROOT, m.dir);
  if (!fs.existsSync(abs)) {
    if (m.optional) {
      console.log(`${yellow('△')} ${m.label} 目錄不存在，跳過`);
    } else {
      console.log(`${red('✗')} ${m.label} 目錄不存在！`);
    }
    continue;
  }
  const pkgJson = path.join(abs, 'package.json');
  if (!fs.existsSync(pkgJson)) {
    console.log(`${yellow('△')} ${m.label} 無 package.json，跳過`);
    continue;
  }
  console.log(`→ 安裝 ${m.label}...`);
  const r = spawnSync('yarn', ['install'], { cwd: abs, shell: true, stdio: 'inherit' });
  if (r.status !== 0) {
    console.log(red(`  安裝失敗 (exit ${r.status})`));
    process.exit(r.status);
  }
  console.log(green(`  完成`));
}

// ─── 3. 產生 renderer 索引檔 ──────────────────────────────
const rendererDir = path.join(ROOT, 'renderer');
const makeIndex   = path.join(rendererDir, 'src', 'assets', 'make-index-files.mjs');
if (fs.existsSync(makeIndex)) {
  console.log(bold('\n=== 產生 renderer 索引檔 ===\n'));
  const r = spawnSync('yarn', ['make-index-files'], { cwd: rendererDir, shell: true, stdio: 'inherit' });
  if (r.status !== 0) {
    console.log(yellow('  make-index-files 失敗，可繼續但首次執行可能報錯'));
  } else {
    console.log(green('  索引檔產生完成'));
  }
}

console.log(bold(green('\n✨ 環境準備完成！執行 `yarn dev` 啟動開發環境。\n')));
