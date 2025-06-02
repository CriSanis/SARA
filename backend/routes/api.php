<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ConductorController;
use App\Http\Controllers\VehiculoController;

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::put('/conductores/{id}/verificar', [ConductorController::class, 'verificar']);

    Route::get('/vehiculos', [VehiculoController::class, 'index']);
    Route::post('/vehiculos', [VehiculoController::class, 'store']);
    Route::put('/vehiculos/{id}', [VehiculoController::class, 'update']);
    Route::delete('/vehiculos/{id}', [VehiculoController::class, 'destroy']); //en caso de errores revisar
});

Route::middleware(['auth:sanctum', 'role:admin|driver|client'])->get('/user', [AuthController::class, 'user']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');