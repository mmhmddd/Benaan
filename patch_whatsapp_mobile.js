#!/usr/bin/env node
/**
 * patch_whatsapp_mobile.js
 *
 * Run from the ROOT of your project (Benaan folder):
 *   node patch_whatsapp_mobile.js
 *
 * Fixes the WhatsApp panel on mobile so it slides in from the LEFT SIDE
 * (same as desktop) instead of appearing as a floating bottom button.
 *
 * Works on Windows (CRLF) and Linux/Mac (LF) files.
 */

const fs   = require('fs');
const path = require('path');

// ─── CSS to find (LF version — we normalise files before matching) ────────────
const OLD_CSS_LF = `    @media (max-width: 820px) {
      #wa-trigger { top: auto; bottom: 24px; left: 16px; transform: none; }
      #wa-pill { flex-direction: row; width: auto; padding: 11px 18px; border-radius: 50px; gap: 8px; }
      #wa-pill:hover { width: auto; }
      #wa-pill-label { writing-mode: horizontal-tb; transform: none; font-size: 13px; }
      #wa-panel { left: -340px; top: auto; bottom: 78px; transform: none; border-radius: 16px; border: 1px solid #e0e0e0; width: 300px; }
      #wa-panel.open { left: 16px; }
    }`;

// ─── CSS replacement (side-slide on mobile, same as desktop) ─────────────────
const NEW_CSS_LF = `    @media (max-width: 820px) {
      #wa-trigger { top: 50%; transform: translateY(-50%); left: 0; bottom: auto; }
      #wa-pill { flex-direction: column; width: 40px; padding: 18px 0; border-radius: 0 12px 12px 0; gap: 8px; }
      #wa-pill:hover { width: 46px; }
      #wa-pill-label { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 11px; }
      #wa-panel { left: -310px; top: 50%; bottom: auto; transform: translateY(-50%); border-radius: 0 16px 16px 0; border: 1px solid #e0e0e0; border-left: none; width: 290px; }
      #wa-panel.open { left: 40px; }
    }`;

// ─── Folders to skip ─────────────────────────────────────────────────────────
const SKIP_DIRS = new Set(['.git', 'node_modules', '.vscode', '.idea', 'dist', 'build']);

// ─── Terminal colors ──────────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan   = (s) => `\x1b[36m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// ─── Recursively collect all .html files ─────────────────────────────────────
function collectHtmlFiles(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const cwd = process.cwd();
  console.log(bold('\n📂  Project root: ') + cyan(cwd));
  console.log('🔍  Scanning ALL subfolders for .html files…\n');

  const allFiles = collectHtmlFiles(cwd);

  if (allFiles.length === 0) {
    console.error('  No .html files found. Run from the Benaan root folder.\n');
    process.exit(1);
  }

  console.log(`    Found ${bold(String(allFiles.length))} HTML files total.\n`);
  console.log(bold('🔧  Processing…\n'));

  let fixed   = 0;
  let already = 0;
  let skipped = 0;

  for (const filePath of allFiles) {
    const rel = path.relative(cwd, filePath);

    // Read raw bytes, detect line ending style
    const raw  = fs.readFileSync(filePath, 'utf8');
    const crlf = raw.includes('\r\n');

    // Normalise to LF for matching
    const normalized = crlf ? raw.replace(/\r\n/g, '\n') : raw;

    if (normalized.includes(OLD_CSS_LF)) {
      // Replace on normalised content
      let updated = normalized.split(OLD_CSS_LF).join(NEW_CSS_LF);

      // Restore original line endings if file was CRLF
      if (crlf) updated = updated.replace(/\n/g, '\r\n');

      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`  ${green('✅ fixed')}    ${rel}  ${crlf ? '(CRLF)' : '(LF)'}`);
      fixed++;

    } else if (normalized.includes(NEW_CSS_LF)) {
      console.log(`  ${yellow('⏭  already')}  ${rel}`);
      already++;
    } else {
      skipped++;
    }
  }

  console.log(bold(`\n────────────────────────────────────────`));
  console.log(`  ${green('✅ Fixed:   ')} ${bold(String(fixed))} file(s)`);
  console.log(`  ${yellow('⏭  Already: ')} ${bold(String(already))} file(s)`);
  console.log(`     No panel: ${skipped} file(s)`);
  console.log(bold(`────────────────────────────────────────\n`));

  if (fixed === 0 && already === 0) {
    console.log('  ⚠️  Nothing patched. Try running: node patch_whatsapp_mobile.js\n');
    console.log('  Tip: Make sure you are inside the Benaan project root folder.\n');
  } else if (fixed > 0) {
    console.log(`  🎉  Done! ${fixed} file(s) updated successfully.\n`);
  } else {
    console.log(`  ✔  All files were already patched.\n`);
  }
}

main();