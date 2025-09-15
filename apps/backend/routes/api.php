<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/contacts',         [ContactController::class, 'index']);
    Route::post('/contacts',        [ContactController::class, 'store']);
    Route::get('/contacts/{id}',    [ContactController::class, 'show']);
    Route::put('/contacts/{id}',    [ContactController::class, 'update']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);

    Route::get('/address/search', [AddressController::class, 'search']);
    Route::delete('/account', [AccountController::class, 'destroy']);
});

require __DIR__.'/auth.php';
