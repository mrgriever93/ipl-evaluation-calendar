<?php

namespace App\Http\Controllers\API;

use App\CalendarPhase;
use App\Course;
use App\Http\Controllers\Controller;

use App\Http\Requests\IdiomaRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\IdiomaResource;
use App\Http\Resources\TipoInterrupcaoResource;
use App\Http\Resources\UtilizadorAutenticadoResource;
use App\Interrupcao;
use App\Idioma;
use App\Traducao;
use App\TipoInterrupcao;
use App\Entidade;
use App\Group;
use App\GroupPermission;
use App\Http\Resources\CalendarPermissionsResource;
use App\Http\Resources\PermissionsResource;
use App\Http\Resources\UserResource;
use App\InitialGroups;
use App\Ldap\User as LdapUser;
use App\PermissionTypes;
use App\User as Utilizador;
use App\User;
use Carbon\Carbon;
use GuzzleHttp\Client;


use DB;
use \Config as Config;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{

    protected function credentials(Request $request)
    {
        return [
            'mail' => $request->email,
            'password' => $request->password,
            'fallback' => [
                'email' => $request->email,
                'password' => $request->password,
            ],
        ];
    }

    public function login(LoginRequest $request)
    {
        if (Auth::attempt($this->credentials($request))) {
            $user = Auth::user();
            $user->refresh();
            if (!$user->enabled) {
                return response()->json("Unauthorized.", Response::HTTP_UNAUTHORIZED);
            }

            if (isset($user->ldap)) {
                $groups = $user->ldap->title;
                foreach ($groups as $group) {
                    if (Group::where('description', $group)->count() > 0) {
                        $user->groups()->syncWithoutDetaching([Group::where('description', $group)->first()->id]);
                    }

                    if ($group === InitialGroups::STUDENT) {
                        foreach ($user->ldap->departmentnumber as $course) {
                            if (Course::where('code', $course)->count() > 0) {
                                $user->courses()->syncWithoutDetaching([Course::where('code', $course)->first()->id]);
                            }
                        }
                    }
                }
            }
            $scopes = $user->permissions()->where('group_permissions.enabled', true)->groupBy('permissions.name')->pluck('permissions.name')->values()->toArray();
            $accessToken = $user->createToken('authToken', $scopes)->accessToken;

            return response()->json([
                'user' => new UserResource($user),
                'accessToken' => $accessToken
            ], Response::HTTP_OK);
        } else {
            return response()->json("Unauthorized.", Response::HTTP_UNAUTHORIZED);
        }
    }

    public function logout()
    {
        Auth::guard('api')->user()->token()->revoke();
        Auth::guard('api')->user()->token()->delete();

        return response()->json(['message' => 'Successfully logged out'], 200);
    }

    /**
     * GET utilizador autenticado
     */
    public function user(Request $request)
    {
        $User = $request->user();
        return new UtilizadorAutenticadoResource($User);
    }
}
