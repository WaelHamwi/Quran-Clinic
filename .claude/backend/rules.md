# BACKEND GOLDEN RULES

RULE_1: NO_RAW_SQL
RULE_2: NO_N_PLUS_ONE
RULE_3: REPOSITORY_PATTERN
RULE_4: SERVICE_PATTERN
RULE_5: TRANSACTIONS
RULE_6: TRY_CATCH
RULE_7: SHORT_CACHE - Max TTL 300 seconds
RULE_8: RUQYAH_SESSION - session_number=1 free, >=2 requires subscription/trial, trial max 2
RULE_9: FLEXIBLE_HIERARCHY - Recordings may be attached at any level (Category, Subcategory, or Disease) via the polymorphic relation. Whichever level holds recordings directly becomes a TERMINAL node and cannot have children. Rules enforced by the Filament CMS as hard validation errors:
  • Category with direct recordings → CANNOT have subcategories
  • Subcategory with direct recordings → CANNOT have diseases
  • Category that already has subcategories → CANNOT receive direct recordings
  • Subcategory that already has diseases → CANNOT receive direct recordings
  • Disease is always terminal (recordings only — no further children)
  • Disease must have exactly one of subcategory_id or category_id (never both, never neither)
RULE_10: POLYMORPHIC_RECORDINGS - recordable_id + recordable_type. Before allowing a child node to be created, verify recordings_count = 0 on the parent. Before allowing a recording to be attached to a parent, verify children_count = 0 on that parent.
RULE_11: FAVORITES_DISEASES_ONLY - store disease_id
RULE_12: GENERAL_RUQYAH - is_general flag
RULE_13: PAGINATION - 15 default, max 100
RULE_14: CLEAN_CODE - No doc comments, no version markers
RULE_16: NO_COMMENTS - No inline comments
RULE_17: DEBUG_FIRST
RULE_18: READ_EXISTING
RULE_20: NO_DELETE - NEVER delete without approval
RULE_21: LOG_SUCCESS
RULE_22: LOG_FAILURE
RULE_23: LOG_PHASE
RULE_24: PARENT_FINAL
RULE_25: RESEARCHER_NO_CODE
RULE_26: QA_NO_CODE
RULE_27: EXECUTOR_ONE_FILE
