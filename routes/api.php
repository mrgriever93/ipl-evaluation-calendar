<?php

use App\Http\Controllers\API\CalendarChangeController;
use App\Http\Controllers\API\CalendarPhaseController;
use App\Http\Controllers\API\EvaluationTypeController;
use App\Http\Controllers\API\GroupController;
use App\Http\Controllers\API\InterruptionTypeController;
use App\Http\Controllers\API\LoginController;
use App\Models\AcademicYear;
use App\Services\ExternalImports;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\API\AcademicYearController;
use App\Http\Controllers\API\CalendarController;
use App\Http\Controllers\API\CourseUnitController;
use App\Http\Controllers\API\ExamCommentController;
use App\Http\Controllers\API\ExamController;
use App\Http\Controllers\API\InterruptionController;
use App\Http\Controllers\API\LdapController;
use App\Http\Controllers\API\MethodController;
use App\Http\Controllers\API\PermissionController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseUnitGroupController;
use App\Http\Controllers\SchoolController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::get('/version', function () {
    return 'v2';
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login',   [LoginController::class, "login"]   ); //'API\LoginController@login');
Route::post('/logout',  [LoginController::class, "logout"]  );

Route::middleware('auth:api')->group(function () {

    /** NEW ENDPOINTS! **/
    Route::get('/calendar-history/{calendar}',   [CalendarChangeController::class, 'show']);

    Route::get('/v2/sync-courses', function () {
        $month = date('m');
        ExternalImports::importCoursesFromWebService(AcademicYear::where('selected', true)->first()->code, ($month > 1 && $month < 7? 2 : 1));
    });

    Route::controller(CalendarController::class)->group(function () {
        Route::get('/calendar',                            'index'            );
        Route::get('/calendar/{calendar}',                 'show'             );
        Route::post('/calendar',                           'store'            );
        Route::patch('/calendar/{calendar}',               'update'           );
        Route::delete('/calendar/{calendar}',              'destroy'          );

        /* Previous Methods */
        Route::get('/available-methods/{calendar}',        'getAvailableMethods'  );
        Route::get('/semesters',                           'listSemesters'        );
        Route::post('/calendar/{calendar}/publish',        'publish'              );
    });

    Route::controller(EvaluationTypeController::class)->group(function () {
        Route::get('/evaluation-types',                         'index'   );
        Route::get('/evaluation-types/{id}',                    'show'   );
        Route::delete('/evaluation-types/{evaluationType}',     'destroy');
        Route::post('/evaluation-types',                        'store'  );
        Route::patch('/evaluation-types/{evaluationType}',      'update' );
    });

    Route::controller(InterruptionTypeController::class)->group(function () {
        Route::get('/interruption-types',                       'index'  );
        Route::post('/interruption-types',                      'store'  );
        Route::get('/interruption-types/{interruptionType}',    'show'   );
        Route::patch('/interruption-types/{interruptionType}',  'update' );
        Route::delete('/interruption-types/{interruptionType}', 'destroy');
    });

    Route::controller(GroupController::class)->group(function () {
        Route::get('/user-group',                               'index'                   );
        Route::get('/user-group/{group}',                       'show'                    );
        Route::post('/user-group',                              'store'                   );
        Route::patch('/user-group/{group}',                     'update'                  );
        Route::delete('/user-group/{group}',                    'destroy'                 );
        Route::get('/user-group/{group}/permissions',           'groupPermissions'        );
        Route::get('/user-group/{group}/calendar-permissions',  'groupCalendarPermissions');
        Route::get('/user-group/{group}/clone',                 'cloneGroup'              );
        Route::get('/permissions/groups',                       'listPermissions'         );     /* TO DELETE? */
    });

    Route::controller(CalendarPhaseController::class)->group(function () {
        Route::delete('/calendar-phases/{calendarPhase}',       'destroy'     );
        Route::get('/calendar-phases',                          'index'       );
        Route::patch('/calendar-phases/{calendarPhase}',        'update'      );
        Route::get('/calendar-phases/{calendarPhase}',          'show'        );
        Route::post('/calendar-phases',                         'store'       );
    });

    /*
     * Old Endpoints already inside this group
     */

    Route::controller(UserController::class)->group(function () {
        Route::get('/users/{user}',           'show'  );
        Route::get('/users',                  'index' );
        Route::patch('/user/{user}',          'update');
    });

    Route::controller(ExamController::class)->group(function () {
        Route::get('/exams/{exam}',           'show'   );
        Route::post('/exams',                 'store'  );
        Route::patch('/exams/{exam}',         'update' );
        Route::delete('/exams/{exam}',        'destroy');
    });

    Route::controller(ExamCommentController::class)->group(function () {
        Route::post('/comment',                 'store' );
        Route::post('/comment/{comment}/ignore','ignore');
        Route::patch('/comment/{examComment}',  'update');
    });

    Route::controller(AcademicYearController::class)->group(function () {
        Route::post('/academic-years',                      'store' );
        Route::get('/academic-years',                       'index' );
        Route::get('/academic-years/menu',                  'menu' );
        Route::post('/academic-years/switch',               'switch');
        Route::delete('/academic-year/{id}',                'destroy');
        Route::post('/academic-year/{id}/active',           'active');
        Route::post('/academic-year/{id}/selected',         'selected');
        Route::get('/academic-year/{id}/sync/{semester}',   'sync')->where(['id' => '[0-9]+', 'semester' => '[1-2]']);;
    });

    Route::controller(SchoolController::class)->group(function () {
        Route::get('/schools',                  'index' );
        Route::get('/schools-list',             'list' );
        Route::get('/schools/{school}',         'show'  );
        Route::patch('/schools/{school}',       'update');
    });

    Route::controller(MethodController::class)->group(function () {
        Route::post('/methods',                 'store'  );
        Route::get('/methods',                  'index'  );
        Route::get('/methods/{method}',         'show'   );
        Route::patch('/methods/{method}',       'update' );
        Route::delete('/methods/{method}',      'destroy');
    });

    Route::controller(InterruptionController::class)->group(function () {
        Route::post('/interruptions',                 'store'  );
        Route::patch('/interruptions/{interruption}', 'update' );
        Route::delete('/interruptions/{interruption}','destroy');
    });

    Route::controller(PermissionController::class)->group(function () {
        Route::get('/permissions',                         'index'               );
        Route::get('/permissions/calendar',                'calendar'            );
        Route::put('/permission',                          'store'               );
        Route::get('/permission/{type}',                   'list'                );
        Route::get('/permission/{type}/groups/{phaseId?}', 'listGroupPermissions');
    });

    Route::controller(CourseController::class)->group(function () {
        Route::get('/courses',                               'index'            );
        Route::get('/courses/degrees',                       'listDegrees'      );
        Route::get('/courses/{course}',                      'show'             );

        Route::get('/courses/{course}/branches',             'branchesList'     );
        Route::post('/courses/{course}/branch',              'branchAdd'        );
        Route::delete('/courses/{course}/branch/{branch}',   'deleteBranch'     );

        Route::get('/courses/{course}/units',                'getUnits'         );
        Route::post('/courses/{course}/unit',                'addUnit'          );
        Route::delete('/courses/{course}/unit/{unit}',       'removeUnit'       );

        Route::get('/courses/{course}/students',             'getStudents'      );
        Route::patch('/courses/{course}/student',            'addStudent'       );
        Route::delete('/courses/{course}/student/{student}', 'removeStudent'    );

        Route::delete('/courses/{course}',                   'destroy'          );
        Route::patch('/courses/{course}',                    'update'           );
        Route::patch('/courses/{course}/coordinator',        'assignCoordinator');
    });

    Route::controller(CourseUnitGroupController::class)->group(function () {
        Route::post('/course-unit-groups',                    'store'  );
        Route::delete('/course-unit-groups/{courseUnitGroup}','destroy');
        Route::patch('/course-unit-groups/{courseUnitGroup}', 'update' );
        Route::get('/course-unit-groups',                     'index'  );
        Route::get('/course-unit-groups/{courseUnitGroup}',   'show'   );
    });

    Route::controller(CourseUnitController::class)->group(function () {
        Route::get('/course-units',                           'index'               );
        Route::get('/course-units/{courseUnit}',              'show'                );
        Route::get('/course-units/{courseUnit}/branches',     'branches'            );
        Route::post('/course-units',                          'store'               );
        Route::patch('/course-units/{courseUnit}',            'update'              );
        Route::delete('/course-units/{courseUnit}',           'destroy'             );
        Route::get('/course-units/{courseUnit}/epochs',       'epochsForCourseUnit' );
        Route::get('/course-units/{courseUnit}/methods',      'methodsForCourseUnit');
        Route::patch('/course-units/{courseUnit}/responsible','assignResponsible'   );
    });

    Route::get('/search/users',         [LdapController::class, 'searchUsers']      );
    Route::get('/search/students',      [LdapController::class, 'searchStudents']   );
});

// TODO
/**
 * Entities to finish Controllers
 * Avaliacao -> Exam -> ExamController (DONE)
 * Comentario -> ExamComment -> ExamCommentController (DONE)
 * HistoricoFaseCalendario -> CalendarChange -> CalendarChangeController (DONE)
 * Interrupcao -> Interruption -> InterruptionController (DONE)
 * Permissao -> Permission -> PermissionController (DONE)
 * TipoAvaliacao -> EvaluationType -> EvaluationTypeController (DONE)
 * CalendarioAvaliacao -> Calendar -> CalendarController (DONE)
 * Grupo -> Group -> GroupController (DONE)
 * TipoInterrupcao -> InterruptionType -> InterruptionTypeController (DONE)
 * FaseCalendario -> CalendarPhase -> CalendarPhaseController (TODO: Verify if DELETE is needed)
 * AgrupamentoUnidadeCurricular -> CourseUnitGroup -> CourseUnitGroupController (DONE)
 * MetodoAvaliacao -> Method -> MethodController (DONE)
 * Curso -> Course -> CourseController (DONE)
 *
 *
 * UnidadeEnsino -> School -> SchoolController (TODO: View/List/Update/Add/Delete)
 * UnidadeCurricular -> CourseUnit -> CourseUnitController (TODO: Others)
 * User
 *
 *
 *
 * AnoLetivo -> AcademicYear -> AcademicYearController (TODO: Everything)
 *
 *
 * Ramo -> Branch -> BranchController (TODO: Everything)
 *
 *
 * Traducao -> Translation -> TranslationController (TODO: Everything)
 * Dicionario -> Dictionary -> DictionaryController (TODO: Everything)
 * Idioma -> Language -> LanguageController (TODO: Everything)
 *
 *
 * UnidadeCurricularAgrupamentoAssoc -> Not needed
 * Epoca -> Epoch -> Not needed (Controller)
 * Entidade -> Not Needed
 * UtilizadorProfessorUnidadeCurricularAssoc -> Not needed
 *
 * TODO: GrauEnsino?
 *
 */
