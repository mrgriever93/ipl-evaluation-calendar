<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarPhase extends Model
{
    use HasFactory;

    protected $fillable = ["name", "description", "enabled"];

    public function permissions()
    {
        $this->belongsToMany(Permission::class);
    }

    public function calendars()
    {
        $this->hasMany(Calendar::class);
    }
}
