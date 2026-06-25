# CACHE STRATEGY

CACHED ENDPOINTS:
GET /api/categories: TTL 300s, tags ['hierarchy']
GET /api/adhkar/today: TTL 300s
GET /api/features: TTL 300s
GET /api/sponsor-screen: TTL 300s

NOT CACHED:
User-specific endpoints (favorites, notifications), POST/PUT/DELETE

BACKEND CACHE PATTERN:
Cache::remember($key, 300, fn() => $this->repository->findAll());

BACKEND INVALIDATION PATTERN:
protected static function booted()
{
    static::saved(function () {
        Cache::tags(['hierarchy'])->flush();
        Cache::tags(['features'])->flush();
    });
}

PARALLEL CACHE WARMING: Fan-out to 4 workers
