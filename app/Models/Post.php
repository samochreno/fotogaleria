<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'width',
        'height',
        'average_color',
        'mini_thumbnail',
        'attachment_url',
        'attachment_thumbnail_url',
    ];
}