$ErrorActionPreference = 'Stop'

$root      = 'C:\Users\wael\Desktop\Quran'
$memDir    = 'C:\Users\wael\.claude\projects\c--Users-wael\memory'
$claudeDir = Join-Path $root '.claude'
$outMd     = Join-Path $root 'CLAUDE_PROJECT_KNOWLEDGE.md'
$outHtml   = Join-Path $root 'CLAUDE_PROJECT_KNOWLEDGE.html'
$outPdf    = Join-Path $root 'CLAUDE_PROJECT_KNOWLEDGE.pdf'

# ---- Secret redaction ------------------------------------------------------
# Every embedded file passes through this filter so the knowledge pack can
# never leak a live credential (Expo tokens, OAuth secrets, API keys, keys).
function Redact-Secrets([string]$text) {
    $rules = @(
        @{ p = 'GOCSPX-[A-Za-z0-9_\-]+';                                          r = 'GOCSPX-<REDACTED>' },
        @{ p = '(EXPO_TOKEN\\?[''"]?\s*[=:]\s*[\\''"]*)[A-Za-z0-9_\-]{16,}';      r = '$1<REDACTED>' },
        @{ p = 'AIza[0-9A-Za-z_\-]{30,}';                                         r = '<REDACTED-GOOGLE-API-KEY>' },
        @{ p = 'gh[pousr]_[A-Za-z0-9]{20,}';                                      r = '<REDACTED-GITHUB-TOKEN>' },
        @{ p = 'sk-(ant-)?[A-Za-z0-9\-_]{20,}';                                   r = '<REDACTED-API-KEY>' },
        @{ p = '(?s)-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----'; r = '<REDACTED-PRIVATE-KEY>' },
        @{ p = '((PASSWORD|SECRET|API_KEY|ACCESS_TOKEN)\s*=\s*)[^\s<][^\s]{7,}';  r = '$1<REDACTED>' }
    )
    foreach ($rule in $rules) { $text = [regex]::Replace($text, $rule.p, $rule.r) }
    return $text
}

# ---- Build the ordered list of source files -------------------------------
$files = New-Object System.Collections.Generic.List[object]

function Add-File($path, $label) {
    if (Test-Path $path) {
        $files.Add([pscustomobject]@{ Path = $path; Label = $label })
    }
}

# 1) Memory index + memory facts
Add-File (Join-Path $memDir 'MEMORY.md') 'MEMORY/MEMORY.md (index)'
Get-ChildItem -Path $memDir -Filter *.md -File |
    Where-Object { $_.Name -ne 'MEMORY.md' } |
    Sort-Object Name |
    ForEach-Object { Add-File $_.FullName ("MEMORY/" + $_.Name) }

# 2) Top-level .claude context
Add-File (Join-Path $claudeDir 'shared-context.md')   '.claude/shared-context.md'
Add-File (Join-Path $claudeDir 'server-production.md') '.claude/server-production.md'
Add-File (Join-Path $claudeDir 'settings.json')        '.claude/settings.json'
Add-File (Join-Path $claudeDir 'settings.local.json')  '.claude/settings.local.json'

# 3) Everything else under .claude (backend + mobile trees)
$already = $files | ForEach-Object { $_.Path }
Get-ChildItem -Path $claudeDir -Recurse -File |
    Where-Object { $already -notcontains $_.FullName } |
    Where-Object { $_.Extension -in '.md', '.json', '.txt' } |
    Sort-Object FullName |
    ForEach-Object {
        $rel = $_.FullName.Substring($root.Length + 1) -replace '\\','/'
        Add-File $_.FullName $rel
    }

# 4) Root-level mobile CLAUDE.md
Add-File (Join-Path $root 'mobile\CLAUDE.md') 'mobile/CLAUDE.md'

# ---- Intro text -----------------------------------------------------------
$now = Get-Date -Format 'yyyy-MM-dd HH:mm'
$tocLines = ($files | ForEach-Object { "- $($_.Label)" }) -join "`n"
$intro = @"
# Claude Project Knowledge Pack - Quranic Clinic (Al-Mashfa Al-Qurani)

Generated: $now
Source machine: C:\Users\wael\Desktop\Quran

## What this document is

This is a complete, self-contained export of every Claude-specific instruction,
memory, rule, role, agent prompt and configuration file used to build the
Quranic Clinic project (Laravel backend + React Native Expo mobile app).

If the original Claude account is ever lost, give this document to a new Claude
session and it can rebuild the same working context for both backend and frontend.

## How to use it in a new account

1. Copy the project code (the backend/ and mobile/ folders) into place.
2. Recreate the .claude/ directory using the files reproduced below - each
   section header named ".claude/..." is the exact relative path of that file.
3. Recreate the persistent memory: each "MEMORY/..." section is one memory file.
   Put them in your new account's memory folder and rebuild MEMORY.md from the
   index section.
4. Recreate mobile/CLAUDE.md at the project root from its section.
5. Paste this whole file into a fresh chat first so Claude absorbs the rules,
   conventions, deployment runbook, OAuth contract and offline-cache design
   before doing any work.

Note: text/markdown is the best format for re-injection because Claude reads text
directly. The .md twin of this PDF is the most faithful copy - prefer it when
recreating individual files (copy/paste preserves exact formatting).

## Table of contents

$tocLines

"@

# ---- Assemble Markdown ----------------------------------------------------
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine($intro)

foreach ($f in $files) {
    $content = Redact-Secrets (Get-Content -Path $f.Path -Raw -Encoding UTF8)
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("# FILE: $($f.Label)")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine('```')
    [void]$sb.AppendLine($content.TrimEnd())
    [void]$sb.AppendLine('```')
}

$mdText = $sb.ToString()
[System.IO.File]::WriteAllText($outMd, $mdText, (New-Object System.Text.UTF8Encoding($false)))

# ---- Build HTML (for PDF) -------------------------------------------------
function HtmlEnc($s) {
    return ($s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;')
}

$css = @'
body{font-family:Segoe UI,Arial,sans-serif;color:#1a1a1a;margin:32px;line-height:1.45;}
h1{color:#0b3231;border-bottom:3px solid #135452;padding-bottom:6px;}
h2.file{color:#fff;background:#135452;padding:8px 12px;margin-top:34px;border-radius:5px;
        font-size:15px;page-break-after:avoid;}
pre{background:#f6f8f8;border:1px solid #d5e9e9;border-radius:6px;padding:14px;
    white-space:pre-wrap;word-wrap:break-word;font-family:Consolas,Menlo,monospace;
    font-size:11.5px;line-height:1.4;}
ul{font-size:13px;} a{color:#0f4342;}
.intro{font-size:13.5px;}
.toc li{margin:2px 0;}
'@

$h = New-Object System.Text.StringBuilder
[void]$h.AppendLine('<!DOCTYPE html><html><head><meta charset="utf-8"><style>')
[void]$h.AppendLine($css)
[void]$h.AppendLine('</style></head><body>')
[void]$h.AppendLine('<div class="intro">')
[void]$h.AppendLine('<h1>Claude Project Knowledge Pack - Quranic Clinic</h1>')
[void]$h.AppendLine("<p><b>Generated:</b> $now | <b>Source:</b> C:\Users\wael\Desktop\Quran</p>")
[void]$h.AppendLine('<p>Complete export of every Claude instruction, memory, rule, role, agent prompt and config used to build the Quranic Clinic project (Laravel backend + React Native Expo mobile). Paste into a fresh Claude session to rebuild full project context, then recreate each file from its section (the header is the exact relative path).</p>')
[void]$h.AppendLine('<h2 class="file">Table of contents</h2><ul class="toc">')
foreach ($f in $files) { [void]$h.AppendLine("<li>$(HtmlEnc $f.Label)</li>") }
[void]$h.AppendLine('</ul></div>')

foreach ($f in $files) {
    $content = Redact-Secrets (Get-Content -Path $f.Path -Raw -Encoding UTF8)
    $title = HtmlEnc $f.Label
    $body  = HtmlEnc ($content.TrimEnd())
    [void]$h.AppendLine("<h2 class=`"file`">FILE: $title</h2>")
    [void]$h.AppendLine("<pre>$body</pre>")
}
[void]$h.AppendLine('</body></html>')

[System.IO.File]::WriteAllText($outHtml, $h.ToString(), (New-Object System.Text.UTF8Encoding($false)))

# ---- Convert to PDF via headless Chrome -----------------------------------
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $chrome)) { $chrome = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' }

$fileUrl = 'file:///' + ($outHtml -replace '\\','/')
$tmpProfile = Join-Path $env:TEMP 'chrome-pdf-profile'
& $chrome --headless=new --disable-gpu --no-first-run --no-pdf-header-footer `
    --user-data-dir="$tmpProfile" "--print-to-pdf=$outPdf" $fileUrl 2>$null

Write-Host "Files included: $($files.Count)"
Write-Host "Markdown: $outMd"
Write-Host "HTML:     $outHtml"
if (Test-Path $outPdf) {
    $kb = [math]::Round((Get-Item $outPdf).Length / 1KB, 1)
    Write-Host ("PDF:      {0} ({1} KB)" -f $outPdf, $kb)
} else {
    Write-Host "PDF:      NOT created (Chrome/Edge headless failed)"
}
