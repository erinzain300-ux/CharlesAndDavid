<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $appends = ['image_url'];

    protected $fillable = [
        'title',
        'category',
        'description',
        'technologies',
        'status',
        'image_path',
        'project_url',
        'repository_url',
        'completed_at',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? url('storage/'.$this->image_path)
            : null;
    }
}
