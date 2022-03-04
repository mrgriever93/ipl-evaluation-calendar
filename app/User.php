<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use LdapRecord\Laravel\Auth\AuthenticatesWithLdap;
use LdapRecord\Laravel\Auth\HasLdapUser;
use LdapRecord\Laravel\Auth\LdapAuthenticatable;
use tiagomichaelsousa\LaravelFilters\Traits\Filterable;
use Znck\Eloquent\Traits\BelongsToThrough;

class PermissionTypes
{
    const CALENDAR_PHASE = "calendar_phase";
    const CALENDAR_EVALUATION = "calendar_evaluation";
    const CALENDAR = "calendar";
    const PERMISSIONS = "permissions";
}

class User extends Authenticatable implements LdapAuthenticatable
{
    use \Staudenmeir\EloquentHasManyDeep\HasRelationships;
    use SoftDeletes, Filterable;
    use HasApiTokens, Notifiable, AuthenticatesWithLdap, HasLdapUser;
    use BelongsToThrough;

    const PERMISSION_TYPES = [
        PermissionTypes::CALENDAR_PHASE,
        PermissionTypes::CALENDAR_EVALUATION,
        PermissionTypes::CALENDAR,
        PermissionTypes::PERMISSIONS
    ];


    protected $fillable = ['name', 'email', 'password', 'fillable', 'enabled'];

    public function getLdapDomainColumn()
    {
        return 'domain';
    }

    public function getLdapGuidColumn()
    {
        return 'guid';
    }

    public function gopSchools() {
        return $this->hasManyDeepFromRelations($this->groups(), (new Group)->gopSchool());
    }
    public function boardSchools() {
        return $this->hasManyDeepFromRelations($this->groups(), (new Group)->boardSchool());
    }
    public function pedagogicSchools() {
        return $this->hasManyDeepFromRelations($this->groups(), (new Group)->pedagogicSchool());
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class);
    }
    
    public function courseUnits() 
    {
        return $this->belongsToMany(CourseUnit::class);
    }

    public function permissions()
    {
        return $this->hasManyDeepFromRelations($this->groups(), (new Group)->permissions());
    }

    public function calendars()
    {
        return $this->hasManyDeepFromRelations($this->courses(), (new Course)->calendars());
    }

    public function scopeWithPermissionAndAction($query, $permissionType, $actionType)
    {
        return $this->permissions()
            ->where('permission_id', Permission::where('name', $permissionType)->first()->id);
    }

    public function scopeWithPermissionAndActionInPhase($query, $permissionType, $actionType, $phase)
    {
        $this->permissions()
            ->where('permission_id', Permission::where('name', $permissionType)->first()->id)
            ->where('phase_id', $phase->id);
    }
}
