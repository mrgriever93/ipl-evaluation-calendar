<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use LdapRecord\Connection;

class LdapController extends Controller
{
    protected $connection;

    public function __construct()
    {
        $this->connection = new Connection([
            'hosts'    => [env('LDAP_HOST')],
            'username' => env('LDAP_USERNAME'),
            'password' => env('LDAP_PASSWORD'),
             'version' => 3,
         ]);
    }

    public function searchStudents(Request $request) {
        $query = $this->connection->query()->setDn('OU=Estudantes,dc=ipleiria,dc=pt');
        $records = $query->whereContains('displayName', $request->q)->orWhereContains('mail', $request->q)->orWhereContains('cn', $request->q)->get();

        $results = [];

        foreach ($records as $foundObj) {
            if (isset($foundObj['mail'])) {
                $results[] = ["mail" => $foundObj['mail'][0], "name" => $foundObj["cn"][0]];
            }
        }

        $usersFound = User::where('name', 'like', "%$request->q%")->orWhere('email', 'like', "%$request->q%")->get();

        foreach ($usersFound as $user) {
            if (array_search($user->email, array_column($results, 'mail')) === false) {
                $results[] = ["mail" => $user->email, "name" => $user->name];
            }
        }
        return response()->json($results);
    }

    public function searchUsers(Request $request) {

        $query = $this->connection->query()->setDn('OU=Docentes,OU=Funcionarios,dc=ipleiria,dc=pt');

        $records = $query->whereContains('displayName', $request->q)->orWhereContains('cn', $request->q)->get();

        $results = [];

        foreach ($records as $foundObj) {
            if (isset($foundObj['mail'])) {
                $results[] = ["mail" => $foundObj['mail'][0], "name" => $foundObj["cn"][0]];
            }
        }

        $usersFound = User::where('name', 'like', "%$request->q%")->orWhere('email', 'like', "%$request->q%")->get();

        foreach ($usersFound as $user) {
            if (array_search($user->email, array_column($results, 'mail')) === false) {
                $results[] = ["mail" => $user->email, "name" => $user->name];
            }
        }
        return response()->json($results);
   }
}
