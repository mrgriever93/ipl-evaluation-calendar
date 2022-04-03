<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InitialGroups
{
    const GOP = "gop";
    const SUPER_ADMIN = "super_admin";
    const BOARD = "board";
    const ADMIN = "admin";
    const COMISSION_CCP = "comission";
    const PEDAGOGIC = "pedagogic";
    const RESPONSIBLE_PEDAGOGIC = "responsible_pedagogic";
    const TEACHER = "teacher";
    const RESPONSIBLE = "responsible_course_unit";
    const COORDINATOR = "coordinator";
    const STUDENT = "Estudante";
}

class Group extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ["name", "description_pt", "description_en", "enabled"];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function gopSchool() {
        return $this->belongsTo(School::class, 'id', 'gop_group_id');
    }
    public function boardSchool() {
        return $this->belongsTo(School::class, 'id', 'board_group_id');
    }
    public function pedagogicSchool() {
        return $this->belongsTo(School::class, 'id', 'pedagogic_group_id');
    }

    public function permissions()
    {
        return $this->belongsToMany( Permission::class, 'group_permissions')->withPivot(['phase_id', 'enabled']);
    }

    public function associatedPermissions()
    {
        return $this->hasMany(GroupPermission::class);
    }

    public function scopeCoordinator($query)
    {
        return $query->where('name', InitialGroups::COORDINATOR);
    }

    public function scopeBoard($query)
    {
        return $query->where('name', InitialGroups::BOARD);
    }

    public function scopeSuperAdmin($query)
    {
        return $query->where('name', InitialGroups::SUPER_ADMIN);
    }

    public function scopeAdmin($query)
    {
        return $query->where('name', InitialGroups::ADMIN);
    }

    public function scopePedagogic($query)
    {
        return $query->where('name', InitialGroups::PEDAGOGIC);
    }

    public function scopeResponsiblePedagogic($query)
    {
        return $query->where('name', InitialGroups::RESPONSIBLE_PEDAGOGIC);
    }

    public function scopeGop($query)
    {
        return $query->where('name', InitialGroups::GOP);
    }

    public function scopeResponsible($query) {
        return $query->where('name', InitialGroups::RESPONSIBLE);
    }

    public function scopeIsTeacher($query) {
        return $query->where('name', InitialGroups::TEACHER);
    }

    public function scopeIsStudent($query) {
        return $query->where('name', InitialGroups::STUDENT);
    }

    /*
     * Clone Group with permissions
     * */
    /**
     * Get the comments for the blog post.
     */
    public function cloneGroupWithPermissions()
    {
        $clone = $this->replicate();
        $clone->name = $this->name . '_copy';
        $clone->description_pt =  'Cópia de ' . $this->description_pt;
        $clone->description_en = 'Copy of ' . $this->description_en;
        $clone->removable = true;
        $clone->push();
        foreach($this->associatedPermissions as $permission)
        {
            $clone->associatedPermissions()->create($permission->toArray());
        }
        $clone->save();
        return $clone;
    }
}
