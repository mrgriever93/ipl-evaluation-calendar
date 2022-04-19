<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarPhase extends Model
{
    use HasFactory;

    protected $fillable = ["code", "name_pt", "name_en", "enabled"];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permissions');
    }

    public function calendars()
    {
        return $this->hasMany(Calendar::class);
    }
}
