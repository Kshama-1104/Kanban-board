<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Card extends Model
{
    protected $fillable = ['card_list_id', 'title', 'description', 'due_date', 'position'];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public function cardList(): BelongsTo
    {
        return $this->belongsTo(CardList::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class);
    }
}
