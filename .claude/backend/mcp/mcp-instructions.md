# MCP INSTRUCTIONS - QURAN ONLY

FILESYSTEM MCP:
- Write all generated files directly to C:/Users/wael/Desktop/Quran/backend
- Never ask user to create files manually
- Log all file operations to build.log
- NEVER read or write to ../mobile/ directory

DATABASE MCP:
- After Phase 1: Verify 9 tables exist
- Verify surahs table exists
- Verify verses table exists

BROWSER MCP:
- After Phase 5: Test GET /api/surahs
- After Phase 5: Test GET /api/surahs/1
- After Phase 5: Test GET /api/verses/search?q=الله

CODE QUALITY MCP:
- Verify no inline comments
- Verify ../mobile/ never accessed
- Verify QURAN ONLY - no other features

SCAN MCP:
- Execute all scan commands in scan-instructions.md
- Save scan results to build.log
- Do NOT proceed to Phase 1 until scan completes
