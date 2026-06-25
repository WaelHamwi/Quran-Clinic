# HELPER FUNCTIONS DESIGNER

FILE: app/Helpers/Helpers.php

FUNCTIONS:
formatDuration($seconds) -> MM:SS or HH:MM:SS
generateSignedUrl($filePath, $expiryMinutes) -> signed URL
getPaginationMeta($paginator) -> pagination meta array
canAccessRecording($user, $recording) -> business rule check
hasActiveTrial($user) -> checks trial_used_count and subscription_expires_at
grantTrial($user) -> increments trial_used_count, sets subscription_expires_at +7 days
highlightSearchTerm($text, $query) -> highlighted text
logBuildMessage($message, $level) -> logs to build channel

AUTOLOAD: composer.json: "autoload": { "files": ["app/Helpers/Helpers.php"] }
