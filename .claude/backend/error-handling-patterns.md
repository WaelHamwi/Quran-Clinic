# ERROR HANDLING PATTERNS

CONTROLLER PATTERN:
try {
    return $this->success($result);
} catch (ModelNotFoundException $e) {
    Log::channel('build')->error('Not found', ['exception' => $e]);
    return $this->error('Not found', 404);
} catch (ValidationException $e) {
    Log::channel('build')->error('Validation failed', ['errors' => $e->errors()]);
    return $this->error('Validation failed', 422, $e->errors());
} catch (AuthorizationException $e) {
    Log::channel('build')->error('Unauthorized', ['exception' => $e]);
    return $this->error('Unauthorized', 403);
} catch (QueryException $e) {
    if ($e->errorInfo[1] == 1062) { return $this->error('Already exists', 409); }
    Log::channel('build')->error('Database error', ['exception' => $e]);
    return $this->error('Database error', 500);
} catch (Throwable $e) {
    Log::channel('build')->error('Server error', ['exception' => $e]);
    return $this->error('Server error', 500);
}

SERVICE TRANSACTION PATTERN:
DB::transaction(function() use ($data) {
    Log::channel('build')->info('Transaction started');
    $result = $this->repository->create($data);
    Log::channel('build')->info('Transaction completed');
    return $result;
}, 3);

DELETION ERROR:
Awaiting user response for [file] deletion
User declined deletion, preserving [file]
