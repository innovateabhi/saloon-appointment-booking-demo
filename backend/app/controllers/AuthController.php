<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Security;
use App\Middleware\AuthMiddleware;
use App\Services\AuthService;
use App\Models\User;
use InvalidArgumentException;

class AuthController
{
    public function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::validationError([
                'email' => empty($email) ? 'Email is required' : null,
                'password' => empty($password) ? 'Password is required' : null,
            ], 'Email and password are required');
        }

        try {
            $user = AuthService::login($email, $password);
            Response::success($user, 'Welcome back, ' . $user['first_name']);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 401);
        } catch (\Throwable $e) {
            Response::error('Authentication error occurred: ' . $e->getMessage(), 500);
        }
    }

    public function register(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $user = AuthService::register($input);
            Response::success($user, 'Account created successfully! Welcome to Aurelia.', 201);
        } catch (InvalidArgumentException $e) {
            Response::validationError(['registration' => $e->getMessage()], $e->getMessage());
        } catch (\Throwable $e) {
            Response::error('Failed to create account: ' . $e->getMessage(), 500);
        }
    }

    public function logout(): void
    {
        AuthService::logout();
        Response::success(null, 'Successfully signed out.');
    }

    public function me(): void
    {
        $user = AuthMiddleware::user();
        if (!$user) {
            Response::success(['authenticated' => false, 'user' => null]);
        }

        Response::success([
            'authenticated' => true,
            'user' => $user
        ]);
    }

    public function updateProfile(): void
    {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $updateData = [];
        if (!empty($input['first_name'])) $updateData['first_name'] = trim($input['first_name']);
        if (!empty($input['last_name'])) $updateData['last_name'] = trim($input['last_name']);
        if (isset($input['phone'])) $updateData['phone'] = trim($input['phone']);

        if (!empty($updateData)) {
            User::update($user['id'], $updateData);
        }

        $fresh = User::findById($user['id']);
        Response::success($fresh, 'Profile updated successfully.');
    }

    public function changePassword(): void
    {
        $user = AuthMiddleware::requireAuth();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $currentPassword = $input['current_password'] ?? '';
        $newPassword = $input['new_password'] ?? '';

        if (strlen($newPassword) < 6) {
            Response::validationError(['new_password' => 'New password must be at least 6 characters.']);
        }

        $fullUser = User::findByEmail($user['email']);
        if (!password_verify($currentPassword, $fullUser['password_hash'])) {
            Response::error('Current password does not match.', 400);
        }

        User::update($user['id'], [
            'password_hash' => password_hash($newPassword, PASSWORD_BCRYPT)
        ]);

        Response::success(null, 'Password updated successfully.');
    }
}

