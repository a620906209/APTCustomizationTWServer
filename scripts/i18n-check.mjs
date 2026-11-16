// 檢查 cmn-Hant/app_i18n.json 相對於 en/app_i18n.json 缺少哪些翻譯
// 用法: npm run i18n:check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'renderer', 'public', 'data');
const load = lang => JSON.parse(fs.readFileSync(path.join(dataDir, lang, 'app_i18n.json'), 'utf8'));

const flat = (o, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object') flat(v, `${prefix}${k}.`, out);
    else out[prefix + k] = v;
  }
  return out;
};

const en = flat(load('en'));
const tw = flat(load('cmn-Hant'));

const missing = Object.keys(en).filter(k => !(k in tw));
const unused = Object.keys(tw).filter(k => !(k in en));

if (missing.length) {
  console.log(`\n缺少翻譯 (${missing.length}):`);
  for (const k of missing) console.log(`  ${k} = ${JSON.stringify(en[k])}`);
}
if (unused.length) {
  console.log(`\n英文版已不存在的 key (${unused.length})，可能是舊的或台服自訂:`);
  for (const k of unused) console.log(`  ${k}`);
}
if (!missing.length) console.log('✓ 所有 en 的 key 都已有繁中翻譯');
process.exit(missing.length ? 1 : 0);
