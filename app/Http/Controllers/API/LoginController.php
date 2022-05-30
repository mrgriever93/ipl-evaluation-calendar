<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\v1\UtilizadorAutenticadoResource;
use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\Entidade;
use App\Models\Group;
use App\Models\Idioma;
use App\Models\InitialGroups;
use App\Models\Interrupcao;
use App\Models\TipoInterrupcao;
use App\Models\Traducao;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


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
        Log::channel('users_login')->info('Login requested: [ Email: ' . $request->email . ' ]');
        if (Auth::attempt($this->credentials($request))) {
            $user = Auth::user();
            $user->refresh();
            if (!$user->enabled) {
                return response()->json("Unauthorized.", Response::HTTP_UNAUTHORIZED);
            }

            $isServer = env('APP_SERVER', false);
            if($isServer) {
                if (isset($user->ldap)) {
                    $groups = $user->ldap->title;
                    foreach ($groups as $group) {
                        $bdGroup = Group::where('name_pt', $group)->first();
                        if ($bdGroup) {
                            $user->groups()->syncWithoutDetaching([$bdGroup->id]);
                        }

                        if ($group === InitialGroups::STUDENT) {
                            foreach ($user->ldap->departmentnumber as $course) {
                                $bdCourse = Course::where('code', $course)->first();
                                if ($bdCourse) {
                                    $user->courses()->syncWithoutDetaching([$bdCourse->id]);
                                }
                            }
                        }
                    }
                }
            }
            $scopes = $user->permissions()->where('group_permissions.enabled', true)->groupBy('permissions.code')->pluck('permissions.code')->values()->toArray();
            $accessToken = $user->createToken('authToken', $scopes)->accessToken;

            $selectedYear = AcademicYear::where('selected', true)->first();
            if($selectedYear){
                $activeYear = $selectedYear->id;
            } else {
                $activeYear = 0;
            }

            return response()->json([
                'user' => new UserResource($user),
                'accessToken' => $accessToken
            ], Response::HTTP_OK)->withCookie('academic_year', $activeYear);
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
        // TODO - VALIDATE -> UtilizadorAutenticadoResource
        $User = $request->user();
        return new UtilizadorAutenticadoResource($User);
    }
}
