<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\PasswordController;


require __DIR__.'/auth.php';

Route::middleware('auth:sanctum')->group(function () {
    Route::get ('/me',          [MeController::class,'show']);
    Route::put ('/me',          [MeController::class,'update']);
    Route::post('/me/password', [PasswordController::class,'update']);

    Route::get   ('/contacts',       [ContactController::class,'index']);
    Route::post  ('/contacts',       [ContactController::class,'store']);
    Route::get   ('/contacts/{id}',  [ContactController::class,'show']);
    Route::put   ('/contacts/{id}',  [ContactController::class,'update']);
    Route::delete('/contacts/{id}',  [ContactController::class,'destroy']);

    Route::get   ('/address/search', [AddressController::class,'search']);
    Route::get   ('/address/',       [AddressController::class,'byCep']);
    Route::delete('/account',        [AccountController::class,'destroy']);
});
