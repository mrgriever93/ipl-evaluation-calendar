<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Config;

class Interruption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ["interruption_type_id", "calendar_id", "start_date", "end_date", "description_pt", "description_en", "enabled"];

    public function calendar()
    {
        return $this->belongsTo(Calendar::class);
    }

    public function interruptionType()
    {
        return $this->hasOne(InterruptionType::class);
    }

    public static function importYearHolidays($yearToImport, $calendarId)
    {
        $apiEndpoint = Config::get('constants.api.sapo_holidays_endpoint');
        $url = "{$apiEndpoint}?year={$yearToImport}";
        $holidays = simplexml_load_file($url);

        foreach ($holidays->GetNationalHolidaysResult->Holiday as $key => $holiday) {
            $newInterruption = new Interruption();
            $newInterruption->start_date            = $holiday->Date;
            $newInterruption->end_date              = $holiday->Date;
            $newInterruption->description           = $holiday->Name;
            $newInterruption->interruption_type_id  = InterruptionType::where('name', InterruptionTypesEnum::HOLIDAYS)->first()->id;
            $newInterruption->calendar_id           = $calendarId;
            $newInterruption->save();
        }
    }
}
