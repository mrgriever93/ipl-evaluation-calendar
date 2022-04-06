<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\Generic\AcademicYearMenuResource;
use App\Models\AcademicYear;
use App\Http\Controllers\Controller;
use App\Http\Requests\AcademicYearRequest;
use App\Http\Requests\AcademicYearSwitchRequest;
use App\Http\Resources\AcademicYearResource;
use App\Jobs\ProcessNewAcademicYear;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index()
    {
        return AcademicYearResource::collection(AcademicYear::all()->sortBy('display'));
    }

    /**
     * This will return a list of active academic years
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function menu()
    {
        return AcademicYearMenuResource::collection(AcademicYear::where('active', true)->get()->sortBy('display'));
    }

    public function switch(AcademicYearSwitchRequest $request)
    {
        return response()->json()->withCookie('academic_year', $request->switch_to);
    }

    public function store(AcademicYearRequest $request)
    {
        try {
            DB::beginTransaction();
            //AcademicYear::query()->update(['active' => false, 'selected' => false]);

            $oldYear = AcademicYear::withTrashed()
                ->where('code', $request->code)
                ->first();
            $numYears = AcademicYear::all()->count();
            if($oldYear){
                $oldYear->restore();
            } else {
                $newAcademicYear = new AcademicYear($request->all());
                $newAcademicYear->active = $numYears == 0;
                $newAcademicYear->selected = $numYears == 0;
                $newAcademicYear->save();
            }
            DB::commit();
        } catch (Exception $ex) {
            DB::rollBack();
            return response()->json("An error has occurred! {$ex->getMessage()}", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (AcademicYearResource::collection(AcademicYear::all()->sortBy('display')))->response()->setStatusCode(Response::HTTP_CREATED);
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
        return (AcademicYearResource::collection(AcademicYear::all()->sortBy('display')))->response()->setStatusCode(Response::HTTP_OK);
    }

    public function sync($id, $semester)
    {
        if($semester != 1 || $semester != 2) {
            return false;
        }
        $year = AcademicYear::findOrFail($id);

        ProcessNewAcademicYear::dispatchAfterResponse($year->code, $semester);
        return response()->json("Updated!", Response::HTTP_OK);
    }

    public function destroy($id)
    {
        AcademicYear::find($id)->delete();
        return (AcademicYearResource::collection(AcademicYear::all()->sortBy('display')))->response()->setStatusCode(Response::HTTP_OK);
    }
}
