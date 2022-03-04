<?php

namespace App;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarChange extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        "calendar_id",
        "calendar_phase_id",
        "temporary",
        "observations",
    ];

    public function calendar()
    {
        return $this->hasOne(Calendar::class);
    }

    public function calendarPhase()
    {
        return $this->hasOne(CalendarPhase::class);
    }
}
