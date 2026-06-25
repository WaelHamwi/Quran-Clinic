# REPOSITORY PATTERN DESIGNER

BASE REPOSITORY INTERFACE: RepositoryInterface.php
Methods: all, paginate, findById, findBySlug, create, update, delete, with, withCount

BASE REPOSITORY: BaseRepository.php
Properties: $model, $with = [], $withCount = []

SURAH REPOSITORY: getAllSurahs(), getSurahWithVerses($id)
VERSE REPOSITORY: getVersesBySurah($surahId), searchVerses($query)
CATEGORY REPOSITORY: getHierarchy(), getSubcategories($categoryId)
SUBCATEGORY REPOSITORY: getDiseases($subcategoryId)
DISEASE REPOSITORY: getBySubcategory($subcategoryId), searchByAlias($query), getGeneralRuqyah()
RECORDING REPOSITORY: getByDisease($diseaseId), getFree(), getPremium(), incrementPlaysCount(), canAccess($user, $recording)
FAVORITE REPOSITORY: getByUser($userId), toggle($userId, $diseaseId), isFavorited($userId, $diseaseId)
ADHKAR REPOSITORY: getTodayAdhkar(), getWakingAdhkar()
TAHSINAT REPOSITORY: getSelfTahsinat(), getForOthersTahsinat()
FEATURE_FLAG REPOSITORY: getVisibleFeatures()
NOTIFICATION_REPOSITORY: getPreferences($userId), updatePreferences($userId, $data)

REPOSITORY SERVICE PROVIDER: RepositoryServiceProvider.php
