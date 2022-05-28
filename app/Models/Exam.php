<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;
    use \Staudenmeir\EloquentHasManyDeep\HasRelationships;

    protected $fillable = [
        "epoch_id",
        "method_id",
        "room",
        "date_start",
        "date_end",
        "hour",
        "duration_minutes",
        "observations_pt",
        "observations_en"
    ];

    public function epoch()
    {
        return $this->belongsTo(Epoch::class);
    }

    public function method()
    {
        return $this->belongsTo(Method::class);
    }

    public function comments()
    {
        return $this->hasMany(ExamComment::class);
    }

    public function courseUnit()
    {
        return $this->hasOneDeepFromRelations($this->method(), (new Method)->courseUnits());
    }

    public function course()
    {
        return $this->hasOneDeepFromRelations($this->courseUnit(), (new CourseUnit)->course());
    }
}
