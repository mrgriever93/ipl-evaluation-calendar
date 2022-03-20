<?php

use App\Http\Controllers\API\CalendarChangeController;
use App\Http\Controllers\API\CalendarPhaseController;
use App\Http\Controllers\API\EvaluationTypeController;
use App\Http\Controllers\API\GroupController;
use App\Http\Controllers\API\InterruptionTypeController;
use App\Http\Controllers\API\LoginController;
use App\Models\AcademicYear;
use App\Models\Course;
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

Route::get('/v2/sync-courses', function () {
    Course::importCoursesFromWebService(AcademicYear::where('active', true)->first()->code);
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('/login', [LoginController::class, "login"]);//'API\LoginController@login');
Route::post('/logout', [LoginController::class, "logout"]);

/** NEW ENDPOINTS! **/

Route::middleware('auth:api')->get('/calendar', [CalendarController::class, 'index']);
Route::middleware('auth:api')->get('/calendar/{calendar}', [CalendarController::class, 'show']);
Route::middleware('auth:api')->post('/calendar', [CalendarController::class, 'store']);
Route::middleware('auth:api')->patch('/calendar/{calendar}', [CalendarController::class, 'update']);
Route::middleware('auth:api')->delete('/calendar/{calendar}', [CalendarController::class, 'destroy']);


Route::middleware('auth:api')->get('/evaluation-types', [EvaluationTypeController::class, 'list']);
Route::middleware('auth:api')->get('/evaluation-types/{id}', [EvaluationTypeController::class, 'show']);
Route::middleware('auth:api')->delete('/evaluation-types/{evaluationType}', [EvaluationTypeController::class, 'destroy']);
Route::middleware('auth:api')->post('/evaluation-types', [EvaluationTypeController::class, 'store']);
Route::middleware('auth:api')->patch('/evaluation-types/{evaluationType}', [EvaluationTypeController::class, 'update']);


Route::middleware('auth:api')->post('/interruption-types', [InterruptionTypeController::class, 'store']);
Route::middleware('auth:api')->get('/interruption-types', [InterruptionTypeController::class, 'index']);
Route::middleware('auth:api')->get('/interruption-types/{interruptionType}', [InterruptionTypeController::class, 'show']);
Route::middleware('auth:api')->patch('/interruption-types/{interruptionType}', [InterruptionTypeController::class, 'update']);
Route::middleware('auth:api')->delete('/interruption-types/{interruptionType}', [InterruptionTypeController::class, 'destroy']);

Route::middleware('auth:api')->get('/calendar-history/{calendar}', [CalendarChangeController::class, 'show']);


Route::middleware('auth:api')->get('/user-group', [GroupController::class, 'index']);
Route::middleware('auth:api')->get('/user-group/{group}', [GroupController::class, 'show']);
Route::middleware('auth:api')->post('/user-group', [GroupController::class, 'store']);
Route::middleware('auth:api')->patch('/user-group/{group}', [GroupController::class, 'update']);
Route::middleware('auth:api')->delete('/user-group/{group}', [GroupController::class, 'destroy']);
Route::middleware('auth:api')->get('/permissions/groups', [GroupController::class, 'listPermissions']);

Route::middleware('auth:api')->delete('/calendar-phases/{calendarPhase}', [CalendarPhaseController::class, 'destroy']);
Route::middleware('auth:api')->get('/calendar-phases', [CalendarPhaseController::class, 'index']);
Route::middleware('auth:api')->patch('/calendar-phases/{calendarPhase}', [CalendarPhaseController::class, 'update']);
Route::middleware('auth:api')->get('/calendar-phases/{calendarPhase}', [CalendarPhaseController::class, 'show']);
Route::middleware('auth:api')->post('/calendar-phases', [CalendarPhaseController::class, 'store']);

Route::middleware('auth:api')->group(function () {
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/user/{user}', [UserController::class, 'update']);


    Route::get('/available-methods/{calendar}', [CalendarController::class, 'getAvailableMethods']);

    Route::post('/course-unit-groups', [CourseUnitGroupController::class, 'store']);
    Route::delete('/course-unit-groups/{courseUnitGroup}', [CourseUnitGroupController::class, 'destroy']);
    Route::patch('/course-unit-groups/{courseUnitGroup}', [CourseUnitGroupController::class, 'update']);
    Route::get('/course-unit-groups', [CourseUnitGroupController::class, 'index']);
    Route::get('/course-unit-groups/{courseUnitGroup}', [CourseUnitGroupController::class, 'show']);

    Route::get('/semesters', [CalendarController::class, 'listSemesters']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::delete('/courses/{course}/student/{student}', [CourseController::class, 'removeStudent']);
    Route::patch('/courses/{course}/student', [CourseController::class, 'addStudent']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    Route::patch('/courses/{course}', [CourseController::class, 'update']);
    Route::patch('/courses/{course}/coordinator', [CourseController::class, 'assignCoordinator']);

    Route::delete('/branches/{branch}', [CourseController::class, 'deleteBranch']);

    Route::post('/methods', [MethodController::class, 'store']);
    Route::get('/methods', [MethodController::class, 'index']);
    Route::get('/methods/{method}', [MethodController::class, 'show']);
    Route::patch('/methods/{method}', [MethodController::class, 'update']);
    Route::delete('/methods/{method}', [MethodController::class, 'destroy']);

    Route::post('/calendar/{calendar}/publish', [CalendarController::class, 'publish']);

    Route::post('/academic-years', [AcademicYearController::class, 'store']);
    Route::get('/academic-years', [AcademicYearController::class, 'index']);
    Route::post('/academic-years/switch', [AcademicYearController::class, 'switch']);

    Route::get('/schools', [SchoolController::class, 'index']);
    Route::get('/schools/{school}', [SchoolController::class, 'show']);
    Route::patch('/schools/{school}', [SchoolController::class, 'update']);


    Route::get('/exams/{exam}', [ExamController::class, 'show']);
    Route::post('/exams', [ExamController::class,'store']);
    Route::patch('/exams/{exam}', [ExamController::class, 'update']);
    Route::delete('/exams/{exam}', [ExamController::class, 'destroy']);

    Route::post('/comment', [ExamCommentController::class, 'store']);
    Route::post('/comment/{comment}/ignore', [ExamCommentController::class, 'ignore']);
    Route::patch('/comment/{examComment}', [ExamCommentController::class, 'update']);

    Route::post('/interruptions', [InterruptionController::class, 'store']);
    Route::patch('/interruptions/{interruption}', [InterruptionController::class, 'update']);
    Route::delete('/interruptions/{interruption}', [InterruptionController::class, 'destroy']);

    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::get('/permissions/calendar', [PermissionController::class, 'calendar']);
    Route::put('/permission', [PermissionController::class, 'store']);
    Route::get('/permission/{type}', [PermissionController::class, 'list']);
    Route::get('/permission/{type}/groups/{phaseId?}', [PermissionController::class, 'listGroupPermissions']);


    Route::get('/search/users', [LdapController::class, 'searchUsers']);
    Route::get('/search/students', [LdapController::class, 'searchStudents']);

    Route::get('/course-units', [CourseUnitController::class, 'index']);
    Route::get('/course-units/{courseUnit}', [CourseUnitController::class, 'show']);
    Route::get('/course-units/{courseUnit}/branches', [CourseUnitController::class, 'branches']);
    Route::post('/course-units', [CourseUnitController::class, 'store']);
    Route::patch('/course-units/{courseUnit}', [CourseUnitController::class, 'update']);
    Route::delete('/course-units/{courseUnit}', [CourseUnitController::class, 'destroy']);
    Route::get('/course-units/{courseUnit}/epochs', [CourseUnitController::class, 'epochsForCourseUnit']);
    Route::get('/course-units/{courseUnit}/methods', [CourseUnitController::class, 'methodsForCourseUnit']);
    Route::patch('/course-units/{courseUnit}/responsible', [CourseUnitController::class, 'assignResponsible']);

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
