<?php

namespace App\Http\Controllers\API;

use App\Filters\UserFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{

    public function index(UserFilters $filters)
    {
        $perPage = request('per_page', 10);
        return UserResource::collection(User::filter($filters)->paginate($perPage));
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        return new UserResource(User::with('groups')->find($id));
    }

    public function update(UserRequest $request, User $user)
    {
        $user->fill($request->all());
        $user->groups()->sync($request->get('groups'));
        $user->save();
    }

    public function destroy($id)
    {
        //
    }
}
