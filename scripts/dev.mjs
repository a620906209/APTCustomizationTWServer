#!/usr/bin/env node
/**
 * scripts/dev.mjs
 * 開發環境啟動管理器
 * 用法: node scripts/dev.mjs [--renderer-only | --main-only]
 *
 * 流程:
 *   1. 啟動 renderer (Vite dev server)
 *   2. 偵測 Vite 就緒訊號 ("Local:" 或 "ready")
 *   3. 啟動 main (Electron)
 *   4. 任一進程退出時一起關閉
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const green  = s => `\x1b[32m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const bold   = s => `\x1b[1m${s}\x1b[0m`;
const dim    = s => `\x1b[2m${s}\x1b[0m`;

const args = process.argv.slice(2);
const rendererOnly = args.includes('--renderer-only');
const mainOnly     = args.includes('--main-only');

let rendererProc = null;
let mainProc     = null;

function killAll(code = 0) {
  rendererProc?.kill();
  mainProc?.kill();
  process.exit(code);
}

process.on('SIGINT',  () => killAll(0));
process.on('SIGTERM', () => killAll(0));

// ─── 啟動 Renderer ─────────────────────────────────────────
function startRenderer() {
  return new Promise((resolve, reject) => {
    console.log(bold('\n[1/2] 啟動 Renderer (Vite)...'));
    rendererProc = spawn('yarn', ['dev'], {
      cwd: path.join(ROOT, 'renderer'),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let ready = false;

    function onData(data) {
      const line = data.toString();
      process.stdout.write(dim(`[renderer] `) + line);
      // Vite 就緒訊號
      if (!ready && (line.includes('Local:') || line.includes('ready in') || line.includes('localhost'))) {
        ready = true;
        resolve(rendererProc);
      }
    }

    rendererProc.stdout.on('data', onData);
    rendererProc.stderr.on('data', onData);

    rendererProc.on('close', code => {
      if (!ready) reject(new Error(`Renderer 異常退出 (code ${code})`));
      else { console.log(yellow('\n[renderer] 進程已退出')); killAll(code ?? 0); }
    });
  });
}

// ─── 啟動 Main (Electron) ──────────────────────────────────
function startMain() {
  console.log(bold('\n[2/2] 啟動 Main (Electron)...'));
  mainProc = spawn('yarn', ['dev'], {
    cwd: path.join(ROOT, 'main'),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  function onData(data) {
    process.stdout.write(dim('[main] ') + data.toString());
  }
  mainProc.stdout.on('data', onData);
  mainProc.stderr.on('data', onData);

  mainProc.on('close', code => {
    console.log(yellow('\n[main] 進程已退出'));
    killAll(code ?? 0);
  });
}

// ─── 入口 ──────────────────────────────────────────────────
console.log(bold('=== APT TW Server — 開發環境 ==='));

if (mainOnly) {
  startMain();
} else if (rendererOnly) {
  startRenderer().catch(e => { console.error(e.message); process.exit(1); });
} else {
  // 預設: renderer → 等待就緒 → main
  startRenderer()
    .then(() => {
      console.log(green('✓ Renderer 已就緒'));
      startMain();
    })
    .catch(e => {
      console.error(e.message);
      process.exit(1);
    });
}
