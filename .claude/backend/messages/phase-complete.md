# PHASE COMPLETION TEMPLATE

COMMANDS:
- "✓ Next" → Create next file
- "PHASE X complete. Proceed to Phase X+1" → Run verification, start next phase

BEFORE EACH PHASE:
- SCAN existing relevant directories (Researcher)
- Report findings to Parent, confirm no conflicts, confirm ../mobile/ not in scope

ON FAILURE:
1. Researcher SCANs relevant files (DEBUG mode)
2. Analyzes root cause, documents analysis
3. Parent reviews and approves
4. Executor fixes
5. QA re-validates, checks regression, confirms ../mobile/ untouched
6. If debate fails: stop execution

PHASE COMPLETION LOG:
[YYYY-MM-DD HH:MM:SS] [PARENT] [PHASE X] [COMPLETE] Phase X finished
[YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VERIFICATION] No inline comments
[YYYY-MM-DD HH:MM:SS] [QA] [PHASE X] [VERIFICATION] ../mobile/ untouched
