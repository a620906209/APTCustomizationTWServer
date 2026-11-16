// 打包並發佈 GitHub Release
// 用法: npm run release -- --title "說明" --notes-file notes.md
//   或: npm run release -- --title "說明" --notes "更新內容"
// 發佈前會再次詢問確認。加上 --dry-run 只打包不發佈。
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const mainDir = path.join(ROOT, 'main');
const rendererDir = path.join(ROOT, 'renderer');

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const dryRun = args.includes('--dry-run');
const title = opt('--title');
const notesFile = opt('--notes-file');
const notes = notesFile ? fs.readFileSync(notesFile, 'utf8') : opt('--notes');

const fail = msg => { console.error(`✗ ${msg}`); process.exit(1); };
const run = (cmd, a, cwd = ROOT) => spawnSync(cmd, a, { cwd, shell: true, stdio: 'inherit' }).status === 0;
const out = (cmd, a, cwd = ROOT) => {
  const r = spawnSync(cmd, a, { cwd, shell: true, encoding: 'utf8' });
  return { ok: r.status === 0, text: (r.stdout || '').trim() };
};

const pkg = JSON.parse(fs.readFileSync(path.join(mainDir, 'package.json'), 'utf8'));
const version = pkg.version;
const tag = `V${version}`;
const repo = (pkg.repository?.url || '').match(/github\.com[/:]([^/]+\/[^/.]+)/)?.[1];
if (!repo) fail('無法從 main/package.json 的 repository.url 判斷 GitHub repo');
if (!dryRun && (!title || !notes)) fail('需要 --title 以及 --notes 或 --notes-file');

// ─── 發佈前檢查 ───
if (out('git', ['status', '--porcelain']).text) fail('工作目錄有未 commit 的變更，請先 commit');
out('git', ['fetch', 'origin']);
const head = out('git', ['rev-parse', 'HEAD']).text;
const remote = out('git', ['rev-parse', 'origin/master']).text;
if (head !== remote) fail('HEAD 與 origin/master 不一致，請先 push（或切到 master）');
if (!dryRun) {
  if (!out('gh', ['auth', 'status']).ok) fail('gh 尚未登入，請先執行 gh auth login');
  if (out('gh', ['release', 'view', tag, '-R', repo]).ok) fail(`Release ${tag} 已存在，請先更新 main/package.json 的版本號`);
}

// ─── 建置與打包 ───
console.log(`\n=== 建置 ${tag} ===\n`);
if (!run('npm', ['run', 'build'], rendererDir)) fail('renderer 建置失敗');
if (!run('npm', ['run', 'build'], mainDir)) fail('main 建置失敗');
if (!run('npm', ['run', 'package', '--', '--win', '-p', 'never'], mainDir)) fail('打包失敗');

const files = [`Awakened PoE Trade Setup ${version}.exe`, `Awakened PoE Trade ${version}.exe`]
  .map(f => path.join(mainDir, 'dist', f));
for (const f of files) if (!fs.existsSync(f)) fail(`找不到打包產物: ${f}`);

if (dryRun) {
  console.log('\n✓ --dry-run：打包完成，未發佈。產物：');
  files.forEach(f => console.log(`  ${f}`));
  process.exit(0);
}

// ─── 發佈 ───
console.log(`\n即將發佈 ${tag} 到 https://github.com/${repo} （公開）`);
files.forEach(f => console.log(`  - ${path.basename(f)}`));
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const answer = (await rl.question('確定要發佈嗎？(y/N) ')).trim().toLowerCase();
rl.close();
if (answer !== 'y') fail('已取消');

// notes 一律寫入暫存檔，避免多行文字經過 shell 時被破壞
const notesPath = path.join(os.tmpdir(), `release-notes-${version}.md`);
fs.writeFileSync(notesPath, notes);
const gh = spawnSync('gh', ['release', 'create', tag, '-R', repo, '--target', 'master',
  '--title', `${tag} - ${title}`, '--notes-file', notesPath, ...files], { stdio: 'inherit' });
fs.rmSync(notesPath, { force: true });
if (gh.status !== 0) fail('建立 release 失敗');
console.log(`
✓ 已發佈 ${tag}`);
