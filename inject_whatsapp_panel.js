#!/usr/bin/env node
/**
 * inject_whatsapp_panel.js
 *
 * Run from the ROOT of your project (Benaan folder):
 *   node inject_whatsapp_panel.js
 *
 * What it does:
 *  - Scans all .html files recursively
 *  - Skips files that already have the WhatsApp panel (#wa-trigger)
 *  - Injects the full WhatsApp CSS + HTML + JS into files that are missing it
 *
 * Injection points:
 *  - CSS  → inserted before </style> or </head>
 *  - HTML → inserted after <body> (or after <div id="navbar-placeholder"></div>)
 *  - JS   → inserted before </body>
 */

const fs   = require('fs');
const path = require('path');

// ─── Folders to skip ─────────────────────────────────────────────────────────
const SKIP_DIRS = new Set(['.git', 'node_modules', '.vscode', '.idea', 'dist', 'build']);

// ─── Colors ──────────────────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan   = (s) => `\x1b[36m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP CSS BLOCK
// ═══════════════════════════════════════════════════════════════════════════════
const WA_CSS = `
  <style>
    /* =====================================================
       WHATSAPP PROFESSIONAL SLIDING PANEL
    ===================================================== */
    #wa-trigger {
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1001;
      cursor: pointer;
      user-select: none;
    }
    #wa-pill {
      background: #25D366;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 44px;
      padding: 22px 0;
      border-radius: 0 14px 14px 0;
      box-shadow: 3px 0 18px rgba(37,211,102,0.40);
      transition: width 0.22s ease, background 0.18s;
    }
    #wa-pill:hover { background: #1db954; width: 50px; }
    #wa-pill-label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-family: 'Tajawal', sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.6px;
      color: #fff;
      white-space: nowrap;
    }
    #wa-panel {
      position: fixed;
      left: -360px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      width: 320px;
      background: #fff;
      border-radius: 0 20px 20px 0;
      border: 1px solid #e0e0e0;
      border-left: none;
      box-shadow: 6px 0 40px rgba(0,0,0,0.14);
      transition: left 0.38s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      font-family: 'Tajawal', sans-serif;
    }
    #wa-panel.open { left: 44px; }
    #wa-panel-header {
      background: #075E54;
      padding: 18px 18px 14px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #wa-avatar {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #wa-header-info { flex: 1; }
    #wa-header-info h3 { color: #fff; font-size: 15px; font-weight: 700; margin: 0 0 3px; }
    #wa-status { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.75); }
    #wa-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
    #wa-close-btn {
      position: absolute; top: 12px; left: 12px;
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(255,255,255,0.15); border: none;
      color: #fff; font-size: 13px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.18s; font-family: inherit;
    }
    #wa-close-btn:hover { background: rgba(255,255,255,0.28); }
    #wa-bubble-area { background: #ECE5DD; padding: 16px 14px 14px; }
    #wa-bubble {
      background: #fff;
      border-radius: 0 12px 12px 12px;
      padding: 10px 13px 8px;
      font-size: 13px; color: #333; line-height: 1.6;
      max-width: 92%; position: relative;
      box-shadow: 0 1px 3px rgba(0,0,0,0.09);
    }
    #wa-bubble::before {
      content: ''; position: absolute; top: 0; right: 100%;
      border: 6px solid transparent;
      border-top-color: #fff; border-right-color: #fff;
    }
    #wa-bubble-time { font-size: 10px; color: #999; text-align: left; margin-top: 5px; direction: ltr; }
    #wa-form-area {
      padding: 14px 16px 12px; background: #f9fafb;
      border-top: 1px solid #efefef;
      display: flex; flex-direction: column; gap: 9px;
    }
    #wa-form-area input,
    #wa-form-area textarea {
      width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 9px 13px; font-family: 'Tajawal', sans-serif;
      font-size: 13px; color: #222; background: #fff; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      direction: rtl; resize: none; box-sizing: border-box;
    }
    #wa-form-area input:focus,
    #wa-form-area textarea:focus { border-color: #25D366; box-shadow: 0 0 0 3px rgba(37,211,102,0.12); }
    #wa-form-area input.wa-error { border-color: #ef4444; }
    #wa-send-btn {
      background: #25D366; color: #fff; border: none; border-radius: 10px;
      padding: 11px 16px; font-family: 'Tajawal', sans-serif;
      font-size: 13.5px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.18s, transform 0.12s;
    }
    #wa-send-btn:hover { background: #1db954; }
    #wa-send-btn:active { transform: scale(0.97); }
    #wa-success {
      display: none; flex-direction: column; align-items: center;
      text-align: center; gap: 10px; padding: 26px 20px 22px;
      background: #f9fafb; border-top: 1px solid #efefef;
    }
    #wa-success.show { display: flex; }
    #wa-success-icon {
      width: 52px; height: 52px; border-radius: 50%;
      background: #dcfce7; display: flex; align-items: center; justify-content: center;
    }
    #wa-success strong { font-size: 15px; color: #15803d; font-weight: 700; }
    #wa-success p { font-size: 12.5px; color: #666; line-height: 1.6; margin: 0; }
    #wa-footer {
      text-align: center; font-size: 11px; color: #b0b0b0;
      padding: 7px 16px 11px; background: #f9fafb;
      border-top: 1px solid #f0f0f0;
      display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    @media (max-width: 820px) {
      #wa-trigger { top: 50%; transform: translateY(-50%); left: 0; bottom: auto; }
      #wa-pill { flex-direction: column; width: 40px; padding: 18px 0; border-radius: 0 12px 12px 0; gap: 8px; }
      #wa-pill:hover { width: 46px; }
      #wa-pill-label { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 11px; }
      #wa-panel { left: -310px; top: 50%; bottom: auto; transform: translateY(-50%); border-radius: 0 16px 16px 0; border: 1px solid #e0e0e0; border-left: none; width: 290px; }
      #wa-panel.open { left: 40px; }
    }
  </style>`;

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP HTML BLOCK
// ═══════════════════════════════════════════════════════════════════════════════
const WA_HTML = `
  <!-- ===== WHATSAPP TRIGGER TAB ===== -->
  <div id="wa-trigger" onclick="waToggle()">
    <div id="wa-pill">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.077a.75.75 0 0 0 .916.916l5.215-1.478A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.741-.525-5.293-1.44l-.38-.225-3.936 1.115 1.115-3.937-.225-.38A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      <span id="wa-pill-label">تواصل معنا</span>
    </div>
  </div>

  <!-- ===== WHATSAPP SLIDING PANEL ===== -->
  <div id="wa-panel">
    <div id="wa-panel-header">
      <button id="wa-close-btn" onclick="waToggle()">&#10005;</button>
      <div id="wa-avatar">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>
      <div id="wa-header-info">
        <h3>فريق بنان Benaan</h3>
        <div id="wa-status">
          <span id="wa-status-dot"></span>
          <span>متاح الآن للرد</span>
        </div>
      </div>
    </div>
    <div id="wa-bubble-area">
      <div id="wa-bubble">
        مرحبًا! 👋<br>
        كيف يمكننا مساعدتك في خدمات التحليل الإحصائي والمالي؟ أرسل لنا رسالتك وسنرد عليك فورًا.
        <div id="wa-bubble-time"></div>
      </div>
    </div>
    <div id="wa-form-area">
      <input type="text" id="wa-name" placeholder="اسمك الكريم" maxlength="60" />
      <textarea id="wa-message" rows="3" placeholder="رسالتك أو استفسارك..."></textarea>
      <button id="wa-send-btn" onclick="waSend()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.077a.75.75 0 0 0 .916.916l5.215-1.478A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.741-.525-5.293-1.44l-.38-.225-3.936 1.115 1.115-3.937-.225-.38A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        إرسال عبر واتساب
      </button>
    </div>
    <div id="wa-success">
      <div id="wa-success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <strong>تم الإرسال بنجاح!</strong>
      <p>سيتواصل معك فريق بنان عبر واتساب<br>في أقرب وقت ممكن.</p>
    </div>
    <div id="wa-footer">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#b0b0b0">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      </svg>
      محادثتك آمنة ومشفرة
    </div>
  </div>
  <!-- ===== END WHATSAPP PANEL ===== -->`;

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP JS BLOCK
// ═══════════════════════════════════════════════════════════════════════════════
const WA_JS = `
  <script>
    /* ===== WhatsApp Panel Logic ===== */
    var waOpen = false;
    function waToggle() {
      waOpen = !waOpen;
      document.getElementById('wa-panel').classList.toggle('open', waOpen);
    }
    function waSend() {
      var name    = document.getElementById('wa-name').value.trim();
      var message = document.getElementById('wa-message').value.trim();
      var nameEl  = document.getElementById('wa-name');
      if (!name && !message) {
        nameEl.classList.add('wa-error');
        nameEl.focus();
        setTimeout(function () { nameEl.classList.remove('wa-error'); }, 1600);
        return;
      }
      var phone = '201153480793';
      var text  = '';
      if (name)    text += '\\u0627\\u0644\\u0627\\u0633\\u0645: ' + name + '\\n';
      if (message) text += '\\u0627\\u0644\\u0631\\u0633\\u0627\\u0644\\u0629: ' + message;
      if (!text)   text  = '\\u0645\\u0631\\u062d\\u0628\\u064b\\u0627\\u060c \\u0623\\u0648\\u062f \\u0627\\u0644\\u062a\\u0648\\u0627\\u0635\\u0644 \\u0645\\u0639 \\u0641\\u0631\\u064a\\u0642 \\u0628\\u0646\\u0627\\u0646.';
      document.getElementById('wa-form-area').style.display = 'none';
      document.getElementById('wa-success').classList.add('show');
      setTimeout(function () {
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
      }, 650);
    }
    (function () {
      var d = new Date(), h = d.getHours(), m = d.getMinutes();
      var ap = h >= 12 ? '\\u0645' : '\\u0635';
      h = h % 12 || 12;
      document.getElementById('wa-bubble-time').textContent =
        h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
    })();
    document.getElementById('wa-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('wa-message').focus(); }
    });
  <\/script>`;

// ═══════════════════════════════════════════════════════════════════════════════
// INJECT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════
function injectWhatsApp(content) {
  // 1. Inject CSS before </head>
  if (content.includes('</head>')) {
    content = content.replace('</head>', WA_CSS + '\n</head>');
  }

  // 2. Inject HTML panel — prefer after navbar placeholder, else after <body>
  if (content.includes('<div id="navbar-placeholder"></div>')) {
    content = content.replace(
      '<div id="navbar-placeholder"></div>',
      '<div id="navbar-placeholder"></div>' + WA_HTML
    );
  } else if (/<body[^>]*>/.test(content)) {
    content = content.replace(/(<body[^>]*>)/, '$1' + WA_HTML);
  }

  // 3. Inject JS before </body>
  if (content.includes('</body>')) {
    content = content.replace('</body>', WA_JS + '\n</body>');
  }

  return content;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE SCANNER
// ═══════════════════════════════════════════════════════════════════════════════
function collectHtmlFiles(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(fullPath, results);
    else if (entry.isFile() && entry.name.endsWith('.html')) results.push(fullPath);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
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

  let injected = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const filePath of allFiles) {
    const rel = path.relative(cwd, filePath);
    try {
      const raw  = fs.readFileSync(filePath, 'utf8');
      const crlf = raw.includes('\r\n');
      const norm = crlf ? raw.replace(/\r\n/g, '\n') : raw;

      // Skip files that already have the panel
      if (norm.includes('id="wa-trigger"') || norm.includes("id='wa-trigger'")) {
        console.log(`  ${yellow('⏭  has panel')}  ${rel}`);
        skipped++;
        continue;
      }

      // Only inject into files that have <body> (real HTML pages)
      if (!norm.includes('<body')) {
        skipped++;
        continue;
      }

      let updated = injectWhatsApp(norm);

      // Restore CRLF if original was Windows
      if (crlf) updated = updated.replace(/\n/g, '\r\n');

      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`  ${green('✅ injected')}  ${rel}`);
      injected++;

    } catch (err) {
      console.log(`  ${red('✗  error')}     ${rel} — ${err.message}`);
      errors++;
    }
  }

  console.log(bold(`\n────────────────────────────────────────`));
  console.log(`  ${green('✅ Injected:  ')} ${bold(String(injected))} file(s)`);
  console.log(`  ${yellow('⏭  Skipped:   ')} ${bold(String(skipped))} file(s) (already have panel or not a page)`);
  if (errors) console.log(`  ${red('✗  Errors:    ')} ${errors} file(s)`);
  console.log(bold(`────────────────────────────────────────\n`));

  if (injected > 0) {
    console.log(`  🎉  Done! WhatsApp panel added to ${injected} file(s).\n`);
  } else {
    console.log(`  ✔  All files already have the panel. Nothing to do.\n`);
  }
}

main();