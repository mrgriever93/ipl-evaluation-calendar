<?php

use App\Http\Controllers\ReactController;
use Felix\RickRoll\Facades\RickRoll;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

//Route::get('/', function () {
//    return view('welcome');
//});
/*
 * '.env',
 * '.git',
 * 'wp-admin',
 * 'wp-login.php',
 * 'composer.lock',
 * 'yarn.lock',
 * 'package-lock.json',
 * 'xmlrpc.php',
 * 'typo3',
 **/
RickRoll::routes();
Route::get('/{any}', [ReactController::class, 'index'])->where('any', '.*');
