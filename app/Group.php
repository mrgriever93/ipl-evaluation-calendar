<?php

namespace App;

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

    protected $fillable = ["name", "description", "enabled"];

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
        return $this->belongsToMany(Permission::class, 'group_permissions')->withPivot(['phase_id', 'enabled']);
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
}
