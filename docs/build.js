// Build script: Markdown -> styled, print-ready HTML (Mermaid + highlight.js + auto-TOC)
// Usage: node build.js <input.md> <output.html>
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const inFile = process.argv[2] || 'REVERSE_ENGINEERING.md';
const outFile = process.argv[3] || 'REVERSE_ENGINEERING.html';

const md = fs.readFileSync(inFile, 'utf8');

marked.setOptions({ gfm: true, breaks: false, headerIds: false, mangle: false });
let html = marked.parse(md);

// --- Convert ```mermaid code blocks into <pre class="mermaid"> (unescaped) ---
function unescapeHtml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
  (m, code) => `<div class="mermaid-wrap"><pre class="mermaid">${unescapeHtml(code)}</pre></div>`);

// --- Add ids to headings + collect TOC ---
const toc = [];
let secNum = 0;
const used = {};
function slug(t) {
  let s = t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (used[s] != null) { used[s]++; s = s + '-' + used[s]; } else { used[s] = 0; }
  return s || 'sec';
}
html = html.replace(/<h([1-3])>([\s\S]*?)<\/h\1>/g, (m, lvl, text) => {
  const id = slug(text);
  const cls = lvl === '1' ? ' class="sec-h1"' : '';
  toc.push({ lvl: +lvl, id, text: text.replace(/<[^>]+>/g, '') });
  return `<h${lvl} id="${id}"${cls}>${text}</h${lvl}>`;
});

const tocHtml = '<nav class="toc"><h1 class="toc-title">Table of Contents</h1><ul>' +
  toc.filter(t => t.lvl <= 2).map(t =>
    `<li class="toc-l${t.lvl}"><a href="#${t.id}">${t.text}</a></li>`).join('') +
  '</ul></nav>';

const css = `
:root{--brand:#0b6b5e;--brand2:#0e8a78;--ink:#1a2027;--muted:#5b6770;--line:#dfe6e9;--code-bg:#0f1b2d;--accent:#c89b3c;}
*{box-sizing:border-box;}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);line-height:1.85;font-size:13pt;margin:0;}
.cover{height:1040px;background:linear-gradient(160deg,#08433b 0%,#0b6b5e 45%,#0e8a78 100%);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:80px;page-break-after:always;}
.cover h1{font-size:46pt;line-height:1.1;margin:0 0 10px;font-weight:800;letter-spacing:-1px;}
.cover h2{font-size:18pt;font-weight:400;color:#d7f3ec;margin:0 0 40px;}
.cover .meta{font-size:12pt;color:#bfe9df;border-top:1px solid rgba(255,255,255,.3);padding-top:20px;max-width:560px;}
.cover .badge{display:inline-block;background:var(--accent);color:#1a2027;font-weight:700;padding:6px 14px;border-radius:4px;font-size:11pt;margin-bottom:28px;}
.toc{padding:50px 70px;page-break-after:always;}
.toc-title{color:var(--brand);border-bottom:3px solid var(--brand);}
.toc ul{list-style:none;padding:0;}
.toc li{margin:3px 0;}
.toc a{color:var(--ink);text-decoration:none;}
.toc-l1{font-weight:700;margin-top:10px !important;font-size:11.5pt;}
.toc-l2{padding-left:22px;color:var(--muted);font-size:10pt;}
.content{padding:0 70px 70px;}
h1.sec-h1{color:var(--brand);font-size:24pt;border-bottom:3px solid var(--brand);padding-bottom:8px;margin-top:0;padding-top:20px;page-break-before:always;}
h2{color:var(--brand2);font-size:17pt;border-bottom:1px solid var(--line);padding-bottom:5px;margin-top:40px;}
h3{color:var(--ink);font-size:14pt;margin-top:32px;}
h4{color:var(--muted);font-size:12pt;margin-top:24px;text-transform:uppercase;letter-spacing:.5px;}
p{margin:14px 0;}
a{color:var(--brand2);}
code{font-family:"Cascadia Code","Consolas",monospace;font-size:10pt;background:#eef3f2;padding:1px 5px;border-radius:3px;color:#0b4a42;}
pre{background:var(--code-bg);color:#e6edf3;padding:18px 20px;border-radius:8px;overflow-x:auto;font-size:9.9pt;line-height:1.7;page-break-inside:avoid;border:1px solid #1f2d44;margin:16px 0;}
pre code{background:none;color:inherit;padding:0;font-size:9.7pt;}
table{border-collapse:collapse;width:100%;margin:16px 0;font-size:10.2pt;page-break-inside:avoid;}
th,td{border:1px solid var(--line);padding:8px 11px;text-align:left;vertical-align:top;}
th{background:var(--brand);color:#fff;font-weight:600;}
tr:nth-child(even) td{background:#f4f8f7;}
blockquote{border-left:4px solid var(--accent);background:#fff9ec;margin:14px 0;padding:10px 18px;color:#5b4a1f;}
.mermaid-wrap{text-align:center;margin:22px 0;page-break-inside:avoid;}
.mermaid{background:#fff;}
hr{border:none;border-top:1px solid var(--line);margin:30px 0;}
ul,ol{margin:10px 0;padding-left:28px;}
li{margin:5px 0;}
strong{color:#0b4a42;}
@page{margin:20mm 0;}
`;

const out = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Quranic Clinic — Reverse Engineering Dossier</title>
<link rel="stylesheet" href="vendor/github-dark.min.css">
<style>${css}</style></head><body>
<div class="cover">
  <div class="badge">CONFIDENTIAL · INTERNAL ENGINEERING</div>
  <h1>Quranic Clinic</h1>
  <h2>Complete Reverse-Engineering &amp; Architecture Dossier</h2>
  <div class="meta">
    Laravel 13 API + Filament 5 Admin &nbsp;·&nbsp; React Native (Expo) Mobile Client<br/>
    Full-stack teardown: database, models, services, repositories, API, mobile state, rendering, security &amp; performance.<br/><br/>
    Generated for senior-engineer onboarding · ${new Date().toISOString().slice(0,10)}
  </div>
</div>
${tocHtml}
<div class="content">
${html}
</div>
<script src="vendor/mermaid.min.js"></script>
<script src="vendor/highlight.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: 'neutral', flowchart:{useMaxWidth:true}, securityLevel:'loose' });
  document.querySelectorAll('pre code:not(.language-mermaid)').forEach(b => { try { hljs.highlightElement(b); } catch(e){} });
</script>
</body></html>`;

fs.writeFileSync(outFile, out);
console.log('Wrote ' + outFile + ' (' + (out.length/1024).toFixed(0) + ' KB), ' + toc.length + ' headings');
