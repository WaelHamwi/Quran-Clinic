# BACKEND SCAN INSTRUCTIONS (FIRST STEP)

## IGNORED DIRECTORIES
../mobile/, node_modules/, vendor/, resources/js/, resources/css/

## SCAN COMMANDS
dir /b
dir /b app\Models
dir /b app\Http\Controllers\Api 2>nul
dir /b app\Http\Middleware 2>nul
dir /b app\Http\Requests\Api 2>nul
dir /b app\Http\Resources\Api 2>nul
dir /b app\Filament\Resources 2>nul
dir /b database\migrations
type routes\api.php
type routes\web.php 2>nul
dir /b app\Repositories 2>nul
dir /b app\Services 2>nul
dir /b app\Policies 2>nul

## AFTER SCAN COMPLETE
Say: "BACKEND SCAN COMPLETE. ../mobile/ IGNORED. Ready for Phase 1."
