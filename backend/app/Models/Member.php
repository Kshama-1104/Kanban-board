<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Member extends Model
{
    protected $fillable = ['name', 'email'];

    public function cards(): BelongsToMany
    {
        return $this->belongsToMany(Card::class);
    }
}
