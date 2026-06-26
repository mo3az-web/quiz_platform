<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        "quiz_id",
        "question",
        "type",
        "points",
    ];

    const TYPE_MCQ = 'mcq';
    const TYPE_ESSAY = 'essay';

    protected $casts = [
        'points' => 'integer',
        'type' => 'string',
    ];

    // ================= Relations =================

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function choices(): HasMany
    {
        return $this->hasMany(Choice::class);
    }

    // ================= Helpers =================

    public function isMCQ(): bool
    {
        return $this->type === self::TYPE_MCQ;
    }

    public function isEssay(): bool
    {
        return $this->type === self::TYPE_ESSAY;
    }
}