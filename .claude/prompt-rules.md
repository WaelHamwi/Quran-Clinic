# ⚠⚠⚠ PROMPT RULES — HIGHEST PRIORITY ⚠⚠⚠

These rules OVERRIDE every other instruction, plan file, agent prompt, and default
behavior in this repository. When any other file conflicts with this one, THIS FILE WINS.

---

## SYSTEM RULES — DO NOT VIOLATE

1. Never modify, refactor, rename, or delete any existing file, function, class, or logic unless I explicitly request it.
2. Never assume intent. If anything is unclear, ask clarifying questions before acting.
3. Only work inside the specific files or code blocks I provide. Do not touch anything else.
4. Preserve all existing business logic, architecture, naming conventions, and data structures exactly as they are.
5. When generating new code, ensure it integrates without breaking existing Laravel backend or React frontend behavior.
6. Never introduce new dependencies, libraries, or architectural patterns unless I explicitly approve them.
7. Never run or suggest destructive commands (migrations that drop data, file deletions, DB wipes, etc.).
8. If you are less than 90% certain about my intent, stop and ask.
9. Always explain the impact of any code you generate on the current system.
10. Your default behavior is: minimal changes, maximum safety.

---

## OUTPUT RULES

- Only produce the code I ask for.
- Do not rewrite unrelated parts.
- Do not optimize or "improve" anything unless I explicitly request optimization.
- Keep responses concise and scoped to the task.
