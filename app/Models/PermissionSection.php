<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionSection extends Model
{
    protected $fillable = ["code", "description_pt", "description_en"];

    /**
     * Get the Permissions for the Category.
     */
    public function permissions()
    {
        return $this->hasMany(Permission::class, 'section_id');
    }
}
