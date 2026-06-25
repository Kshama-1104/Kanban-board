<?php

use App\Http\Controllers\BoardController;
use App\Http\Controllers\CardListController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\MemberController;
use Illuminate\Support\Facades\Route;

// Boards endpoints
Route::get('/boards', [BoardController::class, 'index']);
Route::get('/boards/{id}', [BoardController::class, 'show']);
Route::post('/boards', [BoardController::class, 'store']);
Route::delete('/boards/{id}', [BoardController::class, 'destroy']);

// Card Lists endpoints
Route::post('/card-lists', [CardListController::class, 'store']);
Route::put('/card-lists/positions', [CardListController::class, 'updatePositions']);
Route::put('/card-lists/{id}', [CardListController::class, 'update']);
Route::delete('/card-lists/{id}', [CardListController::class, 'destroy']);

// Cards endpoints
Route::post('/cards', [CardController::class, 'store']);
Route::put('/cards/positions', [CardController::class, 'updatePositions']);
Route::put('/cards/{id}', [CardController::class, 'update']);
Route::delete('/cards/{id}', [CardController::class, 'destroy']);

// Tags endpoints
Route::get('/tags', [TagController::class, 'index']);
Route::post('/tags', [TagController::class, 'store']);

// Members endpoints
Route::get('/members', [MemberController::class, 'index']);
Route::post('/members', [MemberController::class, 'store']);
