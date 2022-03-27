<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\Admin\PermissionSectionsResource;
use App\Models\Group;
use App\Http\Controllers\Controller;
use App\Http\Requests\GroupRequest;
use App\Http\Requests\NewGroupRequest;
use App\Http\Resources\GroupsResource;
use App\Models\Permission;
use App\Models\PermissionSection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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
        return new GroupsResource($group);
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

    public function listPermissions() {
        return GroupsResource::collection(Group::with('permissions')->orderBy('name')->get());
    }

    /**
     * Get permissions of the specified group.
     *
     * @param  Group  $id
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function groupPermissions(Group $group) {

        /* Será algo tipo isto:
         *
         * SELECT p.description AS permissionDescription, ps.description_pt as permissionSectionName, g.id as groupId, g.description as groupDescription, coalesce(gp.enabled, 0) AS isEnabled
         * FROM calendar_v2.permissions as p
         * JOIN calendar_v2.permission_sections AS ps ON p.section_id = ps.id
         * LEFT JOIN calendar_v2.group_permissions as gp ON p.id = gp.permission_id
         * LEFT JOIN calendar_v2.groups as g ON gp.group_id = g.id
         * WHERE (g.id = 10 OR g.id IS NULL);
         *
         *
         *
         * MAS n está a aparecer as permissões todas
         */
        return PermissionSectionsResource::collection(PermissionSection::with('permissions')->orderBy('code')->get());
    }
}
