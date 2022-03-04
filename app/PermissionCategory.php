<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PermissionCategory extends Model
{
    protected $fillable = ["name", "description"];

    /**
     * Get the Permissions for the Category.
     */
    public function permissions()
    {
        return $this->hasMany(Permission::class, 'category_id');
    }
}
