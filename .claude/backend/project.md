# QURANIC CLINIC BACKEND

## PROJECT IDENTITY
Path: C:\Users\wael\Desktop\Quran\backend
Stack: Laravel 13 + Filament 5 + MySQL 8.0
PHP: 8.4.6
Mode: DEVELOPMENT (direct migration editing)

## EXISTING PACKAGES
laravel/framework:13.4.0, laravel/sanctum:4.3.1, laravel/socialite:5.26.1, filament/filament:5.4.5, spatie/laravel-permission, spatie/laravel-medialibrary, livewire/livewire:4.2.4

## DATABASE HIERARCHY
Level 1: CATEGORIES
Level 2: SUBCATEGORIES (belongs to category)
Level 3: DISEASES (belongs to subcategory or directly to category)
Level 4: RECORDINGS (polymorphic — may belong to Disease, Subcategory, or Category)

TERMINAL NODE RULE: Whichever level has recordings attached directly is the terminal level for that branch. No children may be added below a terminal node, and a node with children cannot become terminal. The Filament CMS enforces this as a hard validation error in both directions:
  • Category + recordings → cannot add subcategories (and vice versa)
  • Subcategory + recordings → cannot add diseases (and vice versa)

## BUSINESS RULES
session_number=1 → ALWAYS FREE
session_number>=2 → REQUIRES subscription OR trial
Trial: 7 days, max 2 per user
Favorites: DISEASES only
Free users: access 1st recording only
Paid users: access 1st, 2nd, 3rd recordings
General Ruqyah: is_general flag

## USER ROLES
Super_Admin: Full Filament access
Admin: Manage content
Regular_User: API only

## DEVELOPMENT RULES
NO inline comments, NO doc comments, NO version markers
Direct migration editing, Debug-first
NEVER delete without user approval

## IGNORED DIRECTORIES
../mobile/, node_modules/, vendor/, resources/js/, resources/css/

## READY SIGNAL
BACKEND CONTEXT LOADED. Ready for Phase 1.
