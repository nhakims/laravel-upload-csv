<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CsvData extends Model
{
    protected $fillable = [
        'upload_id',
        'unique_key',
        'product_title',
        'product_description',
        'style',
        'sanmar_mainframe_color',
        'size',
        'color_name',
        'piece_price',
    ];

    protected $casts = [
        'piece_price' => 'decimal:2',
    ];

    public function upload()
    {
        return $this->belongsTo(Upload::class);
    }
}
