<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\Admin\Edit\GroupEditResource;
use App\Http\Resources\Admin\PermissionSectionsByPhaseResource;
use App\Http\Resources\Admin\PermissionSectionsResource;
use App\Models\CalendarPhase;
use App\Models\Group;
use App\Http\Controllers\Controller;
use App\Http\Requests\GroupRequest;
use App\Http\Resources\GroupsResource;
use App\Models\Permission;
use App\Models\PermissionSection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return GroupsResource::collection(Group::orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(GroupRequest $request)
    {
        $newGroup = new Group($request->all());
        $newGroup->save();

        return response()->json("Created!", Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     *
     * @param  Group  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Group $group)
    {
        return new GroupEditResource($group);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(GroupRequest $request, Group $group)
    {
        $group->fill($request->all());
        $group->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Group  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Group $group)
    {
        $group->delete();
    }

    /**
     * Get permissions of the specified group.
     *
     * @param Group $group
     * @return PermissionSectionsResource
     */
    public function groupPermissions(Group $group) {
        return $this->getPermissions( 1, $group->id, 12);
    }

    public function groupCalendarPermissions(Group $group){
        $phases = CalendarPhase::all();
        foreach ($phases as $key_phase => $phase){
            $phases[$key_phase]["sections"] = $this->getPermissions( 2, $group->id, $phase->id);
        }
        return PermissionSectionsByPhaseResource::collection($phases);
    }


    /**
     * This will get all the permissions associated
     * with a group, and filtered by phase_id and category_id
     *
     * @param $sections
     * @param $categoryId
     * @param $groupId
     * @param $phaseId
     * @return PermissionSectionsResource
     */
    private function getPermissions( $categoryId, $groupId, $phaseId) {
        $sections = PermissionSection::whereHas('permissions', function ($query) use ($categoryId) {
            $query->where('category_id', $categoryId);
        })->orderBy('code')->get();

        foreach ($sections as $section) {
            $permList= Permission::selectRaw('permissions.*, group_permissions.enabled as hasPermission')
                ->leftJoin('group_permissions', function ($join) use ($groupId, $phaseId) {
                    $join->on('group_permissions.permission_id', '=', 'permissions.id');
                    $join->on('group_permissions.group_id', '=', DB::raw($groupId));
                    $join->on('group_permissions.phase_id', '=', DB::raw($phaseId));
                })->where([
                    'section_id' => $section['id'],
                    'category_id' => $categoryId
                ])->get();

            $section['perm'] = $permList;
        }
        return PermissionSectionsResource::collection($sections);
    }



    /**
     * Duplicate the specified group.
     *
     * @param Group $group
     * @return              SOMETHING HERE
     */
    public function cloneGroup(Group $group) {


        // TODO: @Miguel, fazes isto melhor q eu xD

        // $newGroup = new Group($group->id();
        // $newGroup->save();

    return response()->json("Created!", Response::HTTP_FORBIDDEN /*HTTP_CREATED*/);
    }

    
}
