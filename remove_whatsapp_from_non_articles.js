#!/usr/bin/env node
/**
 * remove_whatsapp_from_non_articles.js
 *
 * Run from the ROOT of your project (Benaan folder):
 *   node remove_whatsapp_from_non_articles.js
 *
 * Removes the full WhatsApp panel (CSS + HTML + JS) from every HTML file
 * that is NOT inside pages/articles/
 *
 * Safe for: index.html, pages/about/, pages/contact/,
 *           pages/services/, shared/, allarticles.html, etc.
 *
 * Leaves untouched: anything inside pages/articles/
 */

const fs   = require('fs');
const path = require('path');

// ─── Folder that should KEEP the panel ───────────────────────────────────────
const KEEP_DIR = path.normalize('pages' + path.sep + 'articles');

// ─── Folders to skip entirely ────────────────────────────────────────────────
const SKIP_DIRS = new Set(['.git', 'node_modules', '.vscode', '.idea', 'dist', 'build']);

// ─── Colors ──────────────────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan   = (s) => `\x1b[36m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// ═══════════════════════════════════════════════════════════════════════════════
// REMOVAL FUNCTION
// Strips three blocks from the normalised (LF) content:
//   1. The <style> block that contains "#wa-trigger"
//   2. The WA trigger + panel HTML (from <!-- ===== WHATSAPP TRIGGER TAB ===== -->
//      to <!-- ===== END WHATSAPP PANEL ===== -->)
//   3. The <script> block that contains "waToggle"
// ═══════════════════════════════════════════════════════════════════════════════
function removeWhatsApp(content) {
  // ── 1. Remove WA <style> block ─────────────────────────────────────────────
  // Matches <style> ... WHATSAPP ... </style>
  content = content.replace(
    /<style>\s*\/\*\s*={3,}\s*\n\s*WHATSAPP[\s\S]*?<\/style>/g,
    ''
  );

  // ── 2. Remove WA HTML block ────────────────────────────────────────────────
  // From the trigger comment to the end-panel comment (inclusive)
  content = content.replace(
    /\s*<!-- ={4,} WHATSAPP TRIGGER TAB ={4,} -->[\s\S]*?<!-- ={4,} END WHATSAPP PANEL ={4,} -->/g,
    ''
  );

  // ── 3. Remove WA <script> block ────────────────────────────────────────────
  // Matches <script> blocks that contain waToggle or waSend
  content = content.replace(
    /<script>\s*\/\*\s*={4,} WhatsApp Panel Logic ={4,} \*\/[\s\S]*?<\/script>/g,
    ''
  );

  // ── 4. Clean up extra blank lines left behind ──────────────────────────────
  content = content.replace(/\n{3,}/g, '\n\n');

  return content;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECURSIVE FILE COLLECTOR — skips pages/articles/
// ═══════════════════════════════════════════════════════════════════════════════
function collectFiles(dir, cwd, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    const rel      = path.relative(cwd, fullPath);

    if (entry.isDirectory()) {
      // Skip the articles folder — panel stays there
      if (rel.startsWith(KEEP_DIR)) continue;
      collectFiles(fullPath, cwd, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
function main() {
  const cwd = process.cwd();

  console.log(bold('\n📂  Project root: ') + cyan(cwd));
  console.log(bold('🛡️   Keeping panel in: ') + cyan(path.join(cwd, KEEP_DIR)));
  console.log('🔍  Scanning all other HTML files…\n');

  const files = collectFiles(cwd, cwd);

  if (files.length === 0) {
    console.log('  No HTML files found outside articles/.\n');
    return;
  }

  console.log(`    Found ${bold(String(files.length))} HTML files to check.\n`);
  console.log(bold('🗑️   Processing…\n'));

  let removed  = 0;
  let clean    = 0;
  let errors   = 0;

  for (const filePath of files) {
    const rel = path.relative(cwd, filePath);
    try {
      const raw  = fs.readFileSync(filePath, 'utf8');
      const crlf = raw.includes('\r\n');
      const norm = crlf ? raw.replace(/\r\n/g, '\n') : raw;

      // Check if this file has the WA panel
      const hasPanel = norm.includes('id="wa-trigger"') || norm.includes("id='wa-trigger'");

      if (!hasPanel) {
        console.log(`  ${yellow('✔  no panel')}  ${rel}`);
        clean++;
        continue;
      }

      let updated = removeWhatsApp(norm);
      if (crlf) updated = updated.replace(/\n/g, '\r\n');

      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`  ${green('🗑️  removed')}   ${rel}`);
      removed++;

    } catch (err) {
      console.log(`  ${red('✗  error')}     ${rel} — ${err.message}`);
      errors++;
    }
  }

  console.log(bold(`\n────────────────────────────────────────`));
  console.log(`  ${green('🗑️  Removed:  ')} ${bold(String(removed))} file(s)`);
  console.log(`  ${yellow('✔  Clean:    ')} ${bold(String(clean))} file(s) (no panel found)`);
  if (errors) console.log(`  ${red('✗  Errors:   ')} ${errors} file(s)`);
  console.log(bold(`────────────────────────────────────────\n`));

  if (removed > 0) {
    console.log(`  🎉  Done! Panel removed from ${removed} non-article page(s).\n`);
  } else {
    console.log(`  ✔  No non-article pages had the panel. Nothing changed.\n`);
  }
}

main();