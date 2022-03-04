<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ["name", "description"];

    public $timestamps = false;

    /**
     * Get the Category associated with the Permission.
     */
    public function category()
    {
        return $this->belongsTo(PermissionCategory::class);
    }

    public function group()
    {
        return $this->belongsToMany(Group::class, 'group_permissions');
    }
    public function phase()
    {
        return $this->belongsToMany(CalendarPhase::class, 'group_permissions','phase_id', 'phase_id');
    }
}
