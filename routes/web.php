<?php

use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/posts/index', [PostController::class, 'index']);
Route::post('/posts/upload', [PostController::class, 'upload']);
Route::post('/posts/{post}/download', [PostController::class, 'download']);
Route::post('/posts/{post}/delete', [PostController::class, 'delete']);

Route::view('/', 'user');
Route::view('/'.config('app.admin_path'), 'admin');

Route::get('/setup', function () {
    Artisan::call('storage:link');
    Artisan::call('config:cache');
});
