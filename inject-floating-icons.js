/**
 * inject-floating-icons.js
 * ========================
 * Automatically injects the floating-icons CSS and JS links into every
 * HTML file inside pages/articles/** (and any extra folders you add).
 *
 * HOW TO RUN:
 *   1. Place this file in the ROOT of your project (next to index.html).
 *   2. Open a terminal in that folder and run:
 *        node inject-floating-icons.js
 *   3. Done — every HTML file will be updated once. Running it again is safe
 *      (it will NOT add duplicate tags).
 *
 * REQUIREMENTS: Node.js (no extra packages needed).
 */

const fs   = require('fs');
const path = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────────

/**
 * Folders to scan (relative to this script's location).
 * Every .html file found recursively inside will be updated.
 */
const TARGET_DIRS = [
  'pages/articles',
  'pages/services',
  'pages/about',
  'pages/contact',
  'shared',
];

/**
 * We also patch the root index.html separately.
 */
const ROOT_HTML_FILES = ['index.html'];

// ─── WHAT TO INJECT ────────────────────────────────────────────────────────────

/**
 * Calculate the correct relative path back to the project root from a given
 * HTML file path, then build the correct href/src strings.
 *
 * For example, a file at:
 *   pages/articles/data-analysis/data-analysis.html
 * needs:
 *   ../../../css/floating-icons.css
 *   ../../../js/floating-icons.js
 */
function getRelativePaths(htmlFilePath) {
  const rootDir   = path.dirname(path.resolve(__filename)); // project root
  const fileDir   = path.dirname(path.resolve(htmlFilePath));
  const rel       = path.relative(fileDir, rootDir).replace(/\\/g, '/') || '.';

  return {
    css: `${rel}/css/floating-icons.css`,
    js:  `${rel}/js/floating-icons.js`,
  };
}

/**
 * Build the exact tag strings we want to insert.
 */
function buildTags(cssPath, jsPath) {
  const cssTag = `  <link rel="stylesheet" href="${cssPath}">`;
  const jsTag  = `  <script src="${jsPath}" defer></script>`;
  return { cssTag, jsTag };
}

// ─── CORE LOGIC ────────────────────────────────────────────────────────────────

function injectIntoFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const { css: cssPath, js: jsPath } = getRelativePaths(filePath);
  const { cssTag, jsTag }            = buildTags(cssPath, jsPath);

  let changed = false;

  // ── 1. Inject CSS before </head> (skip if already present) ──
  if (!html.includes('floating-icons.css')) {
    if (html.includes('</head>')) {
      html    = html.replace('</head>', `${cssTag}\n</head>`);
      changed = true;
    } else {
      console.warn(`  ⚠  No </head> found in: ${filePath}`);
    }
  }

  // ── 2. Inject JS before </body> (skip if already present) ──
  if (!html.includes('floating-icons.js')) {
    if (html.includes('</body>')) {
      html    = html.replace('</body>', `${jsTag}\n</body>`);
      changed = true;
    } else {
      console.warn(`  ⚠  No </body> found in: ${filePath}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  ✅ Updated : ${filePath}`);
  } else {
    console.log(`  ⏭  Skipped (already injected): ${filePath}`);
  }
}

/** Recursively collect all .html files in a directory */
function collectHtmlFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`  ⚠  Directory not found, skipping: ${dir}`);
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

(function main() {
  console.log('\n🚀 Floating Icons Injector\n' + '─'.repeat(45));

  const allFiles = [];

  // Collect from target directories
  for (const dir of TARGET_DIRS) {
    allFiles.push(...collectHtmlFiles(dir));
  }

  // Add root HTML files
  for (const file of ROOT_HTML_FILES) {
    if (fs.existsSync(file)) {
      allFiles.push(file);
    }
  }

  console.log(`\n📄 Found ${allFiles.length} HTML file(s)\n`);

  for (const file of allFiles) {
    injectIntoFile(file);
  }

  console.log('\n✨ Done!\n');
})();