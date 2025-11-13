<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Upload;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/uploads', function () {
    return Upload::with('status')->orderBy('created_at', 'desc')->get();
});
