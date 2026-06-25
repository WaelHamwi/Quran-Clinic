# SERVICE LAYER DESIGNER

BASESERVICE: executeInTransaction(callable)

CATEGORY_SERVICE: getHierarchy(Cache TTL 300), getBySlug
DISEASE_SERVICE: getBySubcategory, searchByAlias, getGeneralRuqyah
RECORDING_SERVICE: getByDisease, getStreamUrl (uses canAccessRecording), incrementPlays
FAVORITE_SERVICE: toggle (uses firstOrCreate), getUserFavorites
ADHKAR_SERVICE: getCategories, getItemsByCategory, getToday, getWaking
TAHSINAT_SERVICE: getSelf, getForOthers
COURSE_SERVICE: getAll
SPONSOR_SERVICE: getAll, getSponsorScreen
FEEDBACK_SERVICE: store
FEATURE_FLAG_SERVICE: getVisibleFeatures
NOTIFICATION_SERVICE: getPreferences, updatePreferences, sendPushNotification
TRIAL_SERVICE: canGrantTrial, grantSevenDayTrial, getRemainingTrialDays, hasActiveTrial
SUBSCRIPTION_SERVICE: getStatus
GOOGLE_AUTH_SERVICE: verifyToken, findOrCreateUser, generateSanctumToken
