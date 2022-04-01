<?php

namespace App\Http\Controllers\API;

use App\Models\CalendarPhase;
use App\Models\Group;
use App\Models\GroupPermission;
use App\Models\Permission;
use App\Models\PermissionCategory;
use App\Models\PermissionTypes;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionRequest;
use App\Http\Resources\CalendarPermissionsResource;
use App\Http\Resources\GroupsPermissionsResource;
use App\Http\Resources\GroupsResource;
use App\Http\Resources\PermissionsResource;
use App\Http\Resources\PhaseResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Auth::user()
            ->permissions()
            ->where('group_permissions.enabled', true)
            ->groupBy('permissions.name')->pluck('permissions.name')->values()->toArray();
    }

    public function calendar() {
        return CalendarPermissionsResource::collection(GroupPermission::where('phase_id', '!=', CalendarPhase::where('name', 'system')->first()->id)
                        ->where('enabled', true)
                        ->whereIn('group_id', Auth::user()->groups->pluck('id'))
                        ->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\PermissionRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PermissionRequest $request)
    {
        $isAlreadyRegistered = GroupPermission::where([
            'group_id' => $request['group_id'],
            'permission_id' => $request['permission_id']
        ]);

        if ($request['phase_id']) {
            $isAlreadyRegistered->where('phase_id', '=', $request['phase_id']);
        }

        if ($isAlreadyRegistered->count() > 0) {
            $isAlreadyRegistered->update(['enabled' => $request['enabled']]);
        } else {
            $permission = Permission::find($request['permission_id']);
            $permission->group()->attach(
                [
                    $request['group_id']
                ],
                [
                    'phase_id' => $request['phase_id'] ?? CalendarPhase::where('name', 'System')->first()->id,
                    'enabled' => $request['enabled'],
                ]
            );
        }

        return response()->json("Created/Updated", 200);
    }

    public function list($type)
    {
        Validator::make(['type' => $type], [
            'type' => 'string|in:general,calendar',
        ])->validate();

        $operator = '!=';
        $phases = null;
        $isCalendarPermissions = $type === 'calendar';
        if ($isCalendarPermissions) {
            $operator = '=';
            $phases = CalendarPhase::whereNotIn('name', ['system', 'published'])->get();
        }

        $category = PermissionCategory::where('name', '=', 'calendar')->first('id');
        $permissions = Permission::where('category_id', $operator, $category->id)->get();





        return response()->json([
            'permissions' => PermissionsResource::collection($permissions),
            'groups' => GroupsResource::collection(Group::with(['permissions' => function ($q) use($operator, $category) {
                $q->where('permissions.category_id', $operator, $category->id);
                $q->where('group_permissions.enabled', true);
            }])->where('enabled', true)->get()),
            'phases' => $isCalendarPermissions ? PhaseResource::collection($phases) : null,
        ]);
    }

    public function listGroupPermissions($type, $phaseId = null)
    {
        Validator::make(['type' => $type], [
            'type' => 'string|in:general,calendar',
            'phaseId' => 'integer|sometimes|exists:calendar_phases,id'
        ])->validate();

        $operator = '!=';
        $isCalendarPermissions = $type === 'calendar';
        if ($isCalendarPermissions) {
            $operator = '=';
        }

        $category = PermissionCategory::where('name', '=', 'calendar')->first('id');

        $groupsPermissions = GroupPermission::whereHas('permission', function ($query) use ($operator, $category) {
            $query->where('category_id', $operator, $category->id);
        })->where('enabled', '=', true);

        if ($phaseId) {
            $groupsPermissions->where('phase_id', '=', $phaseId);
        }

        return GroupsPermissionsResource::collection($groupsPermissions->get());
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
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
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
