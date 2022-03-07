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
            AcademicYear::query()->update(['active' => false]);

            $newAcademicYear = new AcademicYear($request->all());
            $newAcademicYear->save();
            DB::commit();
        } catch (Exception $ex) {
            DB::rollBack();
            return response()->json("An error has occurred! {$ex->getMessage()}", Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        ProcessNewAcademicYear::dispatchAfterResponse($newAcademicYear);

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
