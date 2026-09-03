<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthUserResource;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private AuthService $service) {}

    public function register(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|max:255|unique:users,email',
                'password' => 'required|string|min:8',
                'phone'    => 'nullable|string|max:30|unique:users,phone',
                'country'  => 'nullable|string|max:100',
                'gender'   => 'nullable|in:male,female',
            ]);

            $result = $this->service->register($data);

            return $this->success([
                'user'  => new AuthUserResource($result['user']),
                'token' => $result['token'],
            ], 'Registered successfully', 201);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            Log::error('AuthController@register failed', ['message' => $e->getMessage(), 'exception' => $e]);
            return $this->error('Server error', 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);

            $result = $this->service->login($data['email'], $data['password']);

            if (! $result) {
                return $this->error('Invalid credentials', 401);
            }

            return $this->success([
                'user'  => new AuthUserResource($result['user']),
                'token' => $result['token'],
            ]);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            Log::error('AuthController@login failed', ['message' => $e->getMessage(), 'exception' => $e]);
            return $this->error('Server error', 500);
        }
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $data = $request->validate([
                'name'    => 'sometimes|required|string|max:255',
                'phone'   => 'nullable|string|max:30|unique:users,phone,' . $user->id,
                'country' => 'nullable|string|max:100',
                'gender'  => 'nullable|in:male,female',
            ]);

            $user = $this->service->updateProfile($user, $data);

            return $this->success(new UserResource($user), 'Profile updated');
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            Log::error('AuthController@updateProfile failed', ['message' => $e->getMessage(), 'exception' => $e]);
            return $this->error('Server error', 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $this->service->logout($request->user());

            return $this->success(null, 'Logged out');
        } catch (\Throwable $e) {
            Log::error('AuthController@logout failed', ['message' => $e->getMessage(), 'exception' => $e]);
            return $this->error('Server error', 500);
        }
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        try {
            $this->service->deleteAccount($request->user());

            return $this->success(null, 'Account deleted');
        } catch (\Throwable $e) {
            Log::error('AuthController@deleteAccount failed', ['message' => $e->getMessage(), 'exception' => $e]);
            return $this->error('Server error', 500);
        }
    }
}
