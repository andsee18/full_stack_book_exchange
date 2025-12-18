import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const DEFAULT_DIRS = [
  'frontend/src',
  'bookexchange_backend/src/main/java',
  'bookexchange_backend/src/main/resources',
];

const DEFAULT_EXTS = new Set(['.js', '.jsx', '.css', '.java', '.properties', '.sql']);

const IGNORE_DIR_NAMES = new Set([
  'node_modules',
  'target',
  'build',
  'dist',
  '.git',
  '.idea',
  '.vscode',
]);

function parseArgs(argv) {
  const args = { write: false, dirs: [...DEFAULT_DIRS] };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a.startsWith('--dirs=')) {
      const raw = a.slice('--dirs='.length);
      args.dirs = raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return args;
}

function normalizeCommentText(input) {
  // russian only, 3-4 meaningful words, no punctuation/special symbols
  const raw = String(input || '').toLocaleLowerCase('ru-RU');
  const cleaned = raw
    .replace(/[^\p{Script=Cyrillic}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const STOP = new Set([
    'и', 'а', 'но', 'или', 'либо',
    'в', 'во', 'на', 'по', 'к', 'ко', 'с', 'со', 'у',
    'от', 'до', 'из', 'за', 'для', 'при', 'под', 'над', 'об', 'о', 'про', 'без',
    'что', 'это', 'как', 'же', 'ли', 'бы', 'не', 'ни',
    'то', 'та', 'те', 'этот', 'эта', 'эти', 'тот', 'тогда',
    'здесь', 'тут', 'там', 'где', 'когда', 'если',
    'я', 'ты', 'он', 'она', 'они', 'мы', 'вы',
    'мой', 'моя', 'мои', 'твой', 'твоя', 'твои', 'наш', 'наша', 'наши', 'ваш', 'ваша', 'ваши',
  ]);

  const allWords = cleaned.split(' ').filter(Boolean);
  const isGood = (w) => w.length >= 3 && !STOP.has(w);

  const picked = [];
  const seen = new Set();
  for (const w of allWords) {
    if (!isGood(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    picked.push(w);
    if (picked.length >= 4) break;
  }

  // if too few after filtering, try longer words without stopword filter
  if (picked.length < 3) {
    for (const w of allWords) {
      if (w.length < 3) continue;
      if (seen.has(w)) continue;
      seen.add(w);
      picked.push(w);
      if (picked.length >= 3) break;
    }
  }

  // pad to 3-4 words so comments aren't only prepositions
  const PAD = ['важный', 'ключевой', 'момент', 'логика'];
  for (const w of PAD) {
    if (picked.length >= 3) break;
    if (seen.has(w)) continue;
    seen.add(w);
    picked.push(w);
  }

  if (picked.length === 0) return 'важный ключевой момент';
  return picked.slice(0, 4).join(' ');
}

function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function transformLines(lines, fileExt) {
  let changed = false;
  const out = [];
  let prevWasComment = false;

  const supportsSlashComments = fileExt === '.js' || fileExt === '.jsx' || fileExt === '.java';
  const supportsBlock = supportsSlashComments || fileExt === '.css' || fileExt === '.sql';

  const lineCommentMatchers = [
    supportsSlashComments ? /^([\t ]*\/\/\s*)(.*)$/ : null,
    fileExt === '.properties' ? /^([\t ]*[#!]\s*)(.*)$/ : null,
    fileExt === '.sql' ? /^([\t ]*--\s*)(.*)$/ : null,
  ].filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // collapse block comments (must start at line start)
    if (supportsBlock) {
      const m = line.match(/^([\t ]*)\/\*\*?(.*)$/);
      if (m) {
        const indent = m[1] || '';

        // collect until */
        let collected = m[2] || '';
        let endLineIndex = i;
        let endPos = line.indexOf('*/');

        if (endPos !== -1) {
          // same-line end
          collected = line.slice(line.indexOf('/*') + 2, endPos);
        } else {
          // multi-line
          for (let j = i + 1; j < lines.length; j += 1) {
            endLineIndex = j;
            const l2 = lines[j];
            const end = l2.indexOf('*/');
            if (end !== -1) {
              collected += ' ' + l2.slice(0, end);
              break;
            }
            collected += ' ' + l2;
          }
        }

        // strip leading * decoration common in javadoc
        collected = collected
          .split(/\r?\n/)
          .join(' ')
          .replace(/^\s*\*+\s*/g, ' ')
          .replace(/\s+\*+\s+/g, ' ');

        const normalized = normalizeCommentText(collected);

        if (!prevWasComment) {
          const nextLine = `${indent}/* ${normalized} */`;
          out.push(nextLine);
          if (nextLine !== line || endPos === -1) changed = true;
          prevWasComment = true;
        } else {
          // drop consecutive comment blocks
          changed = true;
        }

        i = endPos !== -1 ? i : endLineIndex;
        continue;
      }
    }

    // line comments at line start
    let matched = false;
    for (const re of lineCommentMatchers) {
      const mm = line.match(re);
      if (!mm) continue;
      matched = true;
      const prefix = mm[1];
      const body = mm[2];
      const normalized = normalizeCommentText(body);

      if (!prevWasComment) {
        const nextLine = prefix + normalized;
        out.push(nextLine);
        if (nextLine !== line) changed = true;
        prevWasComment = true;
      } else {
        // drop consecutive comment-only lines
        changed = true;
      }
      break;
    }
    if (matched) continue;

    // normal code / blank line
    out.push(line);
    prevWasComment = false;
  }

  return { lines: out, changed };
}

async function* walk(dirAbs) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIR_NAMES.has(entry.name)) continue;
      yield* walk(abs);
    } else if (entry.isFile()) {
      yield abs;
    }
  }
}

async function processFile(fileAbs, write) {
  const ext = path.extname(fileAbs).toLowerCase();
  if (!DEFAULT_EXTS.has(ext)) return { touched: false, changed: false };

  const raw = await fs.readFile(fileAbs, 'utf8');
  const eol = detectEol(raw);
  const lines = raw.split(/\r?\n/);

  const { lines: nextLines, changed } = transformLines(lines, ext);
  if (!changed) return { touched: true, changed: false };

  const next = nextLines.join(eol);
  if (write) await fs.writeFile(fileAbs, next, 'utf8');
  return { touched: true, changed: true };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let touched = 0;
  let changedFiles = 0;

  for (const relDir of args.dirs) {
    const absDir = path.resolve(ROOT, relDir);
    try {
      const st = await fs.stat(absDir);
      if (!st.isDirectory()) continue;
    } catch {
      continue;
    }

    for await (const fileAbs of walk(absDir)) {
      const res = await processFile(fileAbs, args.write);
      if (!res.touched) continue;
      touched += 1;
      if (res.changed) changedFiles += 1;
    }
  }

  const mode = args.write ? 'write' : 'check';
  console.log(`${mode} done files_scanned ${touched} files_changed ${changedFiles}`);

  if (!args.write && changedFiles > 0) {
    process.exitCode = 2;
  }
}

await main();
