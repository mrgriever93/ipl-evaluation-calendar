<?php

namespace App\Http\Middleware;

use App\AcademicYear;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class EnsureWeSendCookies
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('switch_to')) {
            Cookie::queue('academic_year', AcademicYear::findOrFail($request->switch_to)->id);
        } elseif ($request->hasCookie('academic_year')) {
            if (AcademicYear::where('id', $request->cookie('academic_year'))->get()->count() == 0) {
                if (AcademicYear::where('active', true)->get()->count() > 0) {
                    Cookie::queue('academic_year', AcademicYear::where('active', true)->first()->id, 120);
                }
            } 
            else {
                Cookie::queue('academic_year', AcademicYear::find($request->cookie('academic_year'))->id, 120);
            }
        } else {
            if (AcademicYear::where('active', true)->get()->count() > 0) {
                Cookie::queue('academic_year', AcademicYear::where('active', true)->first()->id, 120);
            }
        }

        return $next($request);
    }
}
