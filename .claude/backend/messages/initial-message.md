# INITIAL MESSAGE TO CLAUDE

Read all files in order from .claude/backend/

MANDATORY FIRST STEP - PROJECT SCAN:
1. Read .claude/backend/scan-instructions.md
2. Execute ALL scan commands
3. Produce PROJECT SCAN REPORT
4. Log all findings
5. Confirm ../mobile/ directory IGNORED

Only after scan complete, say:
"BACKEND PROJECT SCAN COMPLETE. ../mobile/ IGNORED. Ready for Phase 1."

CRITICAL RULES:
- SCAN FIRST, IGNORE ../mobile/
- No inline comments, Debug-first, Read before modifying
- Never delete without user approval
- Recordings belong to deepest level (Disease > Subcategory > Category)
- session_number=1 free, session_number>=2 requires subscription/trial, trial max 2
- Favorites store disease_id, General ruqyah flag

Then user will say "Execute Phase 1. Create migration 1" and respond "✓ Next" after each file.
