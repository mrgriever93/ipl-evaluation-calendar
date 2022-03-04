<?php

namespace App\Http\Controllers\API;

use App\Group;
use App\Http\Controllers\Controller;
use App\Http\Requests\GroupRequest;
use App\Http\Requests\NewGroupRequest;
use App\Http\Resources\GroupsResource;
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
}
