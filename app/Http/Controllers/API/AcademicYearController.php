<?php

namespace App\Http\Controllers\API;

use App\Models\AcademicYear;
use App\Events\AcademicYearRegistered;
use App\Http\Controllers\Controller;
use App\Http\Requests\AcademicYearRequest;
use App\Http\Requests\AcademicYearSwitchRequest;
use App\Http\Resources\AcademicYearResource;
use App\Jobs\ProcessNewAcademicYear;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return AcademicYearResource::collection(AcademicYear::all());
    }

    public function switch(AcademicYearSwitchRequest $request)
    {
        return response()->json()->withCookie('academic_year', $request->switch_to);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(AcademicYearRequest $request)
    {
        try {
            DB::beginTransaction();
            //AcademicYear::query()->update(['active' => false, 'selected' => false]);

            $oldYear = AcademicYear::withTrashed()
                ->where('code', $request->code)
                ->first();

            if($oldYear){
                $oldYear->restore();
            } else {
                $newAcademicYear = new AcademicYear($request->all());
                $newAcademicYear->active = false;
                $newAcademicYear->selected = false;
                $newAcademicYear->save();
            }
            DB::commit();
        } catch (Exception $ex) {
            DB::rollBack();
            return response()->json("An error has occurred! {$ex->getMessage()}", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // TODO @miguel.cerejo
        // This will fetch the courses for this new year
        //ProcessNewAcademicYear::dispatchAfterResponse($newAcademicYear);

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    public function active($id)
    {
        $year = AcademicYear::find($id);
        $year->active = !$year->active;
        $year->save();
        return response()->json("Updated!", Response::HTTP_OK);
    }

    public function selected($id)
    {
        AcademicYear::where('selected', true)->update(['selected' => false]);
        $year = AcademicYear::find($id);
        $year->selected = !$year->selected;
        $year->save();
        return response()->json("Updated!", Response::HTTP_OK);
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        AcademicYear::find($id)->delete();
        return response()->json("Deleted!", Response::HTTP_OK);
    }
}
