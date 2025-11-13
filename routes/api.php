<?php

use Illuminate\Support\Facades\Route;
use App\Models\Upload;

Route::get('/uploads', function () {
    return Upload::with('status')->orderBy('created_at', 'desc')->get();
});
