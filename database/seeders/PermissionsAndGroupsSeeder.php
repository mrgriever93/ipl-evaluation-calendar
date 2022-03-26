<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Branch;
use App\Models\CalendarPhase;
use App\Models\Course;
use App\Models\CourseUnit;
use App\Models\EpochType;
use App\Models\EvaluationType;
use App\Models\Group;
use App\Models\InterruptionType;
use App\Models\Permission;
use App\Models\PermissionCategory;
use App\Models\PermissionSection;
use App\Models\School;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionsAndGroupsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $interruptionTypes = [
            ["pt" => "Natal",               "en" => "Christmas"],
            ["pt" => "Páscoa",              "en" => "Easter"],
            ["pt" => "Desfile do caloiro",  "en" => "Freshman Parade"],
            ["pt" => "Abertura solene",     "en" => "Solemn Opening"],
            ["pt" => "Desfile académico",   "en" => "Academic parade"],
            ["pt" => "Feriado",             "en" => "Holiday"],
            ["pt" => "Semana académica",    "en" => "Academic week"],
            ["pt" => "Dia aberto",          "en" => "Open Day"],
            ["pt" => "Carnaval",            "en" => "Carnival"]
        ];

        foreach ($interruptionTypes as $interruptionType) {
            $newInterruptionType = new InterruptionType();
            $newInterruptionType->name = $interruptionType["pt"];
            $newInterruptionType->description_pt = $interruptionType["pt"];
            $newInterruptionType->description_en = $interruptionType["en"];
            $newInterruptionType->save();
        }

        $evaluationTypes = [
            ["code" => "written_exam",              "description_pt" => "Prova escrita",                    "description_en" => "Written test"],
            ["code" => "oral_exam",                 "description_pt" => "Prova oral",                       "description_en" => "Oral test"],
            ["code" => "practical_exam",            "description_pt" => "Teste prático",                    "description_en" => "Practical test"],
            ["code" => "report",                    "description_pt" => "Relatório ou trabalho escrito",    "description_en" => "Report or written work"],
            ["code" => "public_oral_presentation",  "description_pt" => "Apresentação oral pública",        "description_en" => "Public oral presentation"],
            ["code" => "prototype",                 "description_pt" => "Protótipo",                        "description_en" => "Prototype"],
            ["code" => "laboratory_work",           "description_pt" => "Trabalho laboratorial",            "description_en" => "Laboratory work"],
            ["code" => "project",                   "description_pt" => "Projeto",                          "description_en" => "Project"],
            ["code" => "internship",                "description_pt" => "Estágios ou projetos externos",    "description_en" => "Internships or external projects"],
            ["code" => "portfolio",                 "description_pt" => "Portfolios",                       "description_en" => "portfolios"],
        ];

        foreach ($evaluationTypes as $evaluationType) {
            $newEvaluationType = new EvaluationType($evaluationType);
            $newEvaluationType->save();
        }

        $phases = [
            ["name"=> "created",                    "description_pt" => "Criado",                             "description_en" => "Created"],
            ["name"=> "edit_gop",                   "description_pt" => "Em edição (GOP)",                    "description_en" => "In edit (GOP)"],
            ["name"=> "edit_cc",                    "description_pt" => "Em edição (Coordenador de Curso)",   "description_en" => "In edit (Course coordinator)"],
            ["name"=> "edit_responsible",           "description_pt" => "Em edição (Responsável UC)",         "description_en" => "In edit (UC responsible)"],
            ["name"=> "evaluation_ccp",             "description_pt" => "Em avaliação (CCP)",                 "description_en" => "Under evaluation (CCP)"],
            ["name"=> "evaluation_cp",              "description_pt" => "Em avaliação (Conselho Pedagógico)", "description_en" => "Under evaluation (Pedagogical Council)"],
            ["name"=> "evaluation_gop",             "description_pt" => "Em avaliação (GOP)",                 "description_en" => "Under evaluation (GOP)"],
            ["name"=> "evaluation_board",           "description_pt" => "Em avaliação (Direção)",             "description_en" => "Under evaluation (Direction)"],
            ["name"=> "evaluation_students",        "description_pt" => "Em avaliação (Alunos)",              "description_en" => "Under evaluation (Students)"],
            ["name"=> "approved",                   "description_pt" => "Aprovado",                           "description_en" => "Approved"],
            ["name"=> "published",                  "description_pt" => "Publicado",                          "description_en" => "Published"],
            ["name"=> "system",                     "description_pt" => "System",                             "description_en" => "System"]
        ];

        foreach ($phases as $phase) {
            $newPhase = new CalendarPhase();
            $newPhase->name = $phase["name"];
            $newPhase->description_pt = $phase["description_pt"];
            $newPhase->description_en = $phase["description_en"];
            $newPhase->removable = false;
            $newPhase->save();
        }

        $categories = [
            "general",
            "calendar"
        ];

        foreach ($categories as $category) {
            $newCategory = new PermissionCategory();
            $newCategory->name = $category;
            $newCategory->description_pt = $category;
            $newCategory->description_en = $category;
            $newCategory->save();
        }

        $permissionSections = [
            ["code" => "calendar",          "description_pt" => "Calendário",               "description_en" => "Calendar"],
            ["code" => "ucs",               "description_pt" => "UCs",                      "description_en" => "CUs"],
            ["code" => "users",             "description_pt" => "Utilizadores",             "description_en" => "Users"],
            ["code" => "user_groups",       "description_pt" => "Grupos de Utilizador",     "description_en" => "Users Groups"],
            ["code" => "courses",           "description_pt" => "Cursos",                   "description_en" => "Courses"],
            ["code" => "evaluation",        "description_pt" => "Avaliações",               "description_en" => "Evaluation"],
            ["code" => "interruption",      "description_pt" => "Interrupções",             "description_en" => "Interruption"],
            ["code" => "calendar_phases",   "description_pt" => "Fases do calendário",      "description_en" => "Calendar Phases"],
            ["code" => "languages",         "description_pt" => "Linguagens",               "description_en" => "languages"],
            ["code" => "schools",           "description_pt" => "Escolas",                  "description_en" => "schools"],
            ["code" => "academic_years",    "description_pt" => "Anos Letivos",             "description_en" => "Academic Years"],
            ["code" => "permissions",       "description_pt" => "Permissões",               "description_en" => "Permissions"],
        ];

        foreach ($permissionSections as $section) {
            $newSection = new PermissionSection();
            $newSection->code = $section["code"];
            $newSection->description_pt = $section["description_pt"];
            $newSection->description_en = $section["description_en"];
            $newSection->save();
        }

        $newPermissions = [
            ["name" => "create_calendar",                  "section_code" => "calendar",        "description_pt" => "Criar calendário",                                "description_en" => "Create calendar"],
            ["name" => "delete_calendar",                  "section_code" => "calendar",        "description_pt" => "Eliminar calendário",                             "description_en" => "Delete calendar"],
            ["name" => "view_calendar_info",               "section_code" => "calendar",        "description_pt" => "Ver informações do calendário",                   "description_en" => "View calendar information"],
            ["name" => "view_comments",                    "section_code" => "calendar",        "description_pt" => "Ver comentários",                                 "description_en" => "See comments"],
            ["name" => "view_calendar_history",            "section_code" => "calendar",        "description_pt" => "Ver o histórico do calendário",                   "description_en" => "View calendar history"],
            ["name" => "view_actual_phase",                "section_code" => "calendar",        "description_pt" => "Ver fase atual",                                  "description_en" => "See current phase"],

            ["name" => "publish_calendar",                 "section_code" => "calendar",        "description_pt" => "Publicar calendário",                             "description_en" => "Publish calendar"],
            ["name" => "create_copy",                      "section_code" => "calendar",        "description_pt" => "Criar cópia",                                     "description_en" => "Create copy"],

            ["name" => "view_course_units",                "section_code" => "ucs",             "description_pt" => "Ver UCs",                                         "description_en" => "See CUs"],
            ["name" => "create_course_units",              "section_code" => "ucs",             "description_pt" => "Criar UCs",                                       "description_en" => "Create CUs"],
            ["name" => "edit_course_units",                "section_code" => "ucs",             "description_pt" => "Editar UCs",                                      "description_en" => "Edit CUs"],
            ["name" => "delete_course_units",              "section_code" => "ucs",             "description_pt" => "Eliminar UCs",                                    "description_en" => "Delete CUs"],

            ["name" => "edit_user_groups",                 "section_code" => "user_groups",     "description_pt" => "Editar Grupos de Utilizador",                     "description_en" => "Edit User Groups"],
            ["name" => "delete_user_groups",               "section_code" => "user_groups",     "description_pt" => "Eliminar Grupos de Utilizador",                   "description_en" => "Delete User Groups"],
            ["name" => "create_user_groups",               "section_code" => "user_groups",     "description_pt" => "Criar Grupos de Utilizador",                      "description_en" => "Create User Groups"],

            ["name" => "edit_users",                       "section_code" => "users",           "description_pt" => "Editar utilizadores",                             "description_en" => "Edit users"],
            ["name" => "lock_users",                       "section_code" => "users",           "description_pt" => "Bloquear utilizadores",                           "description_en" => "Block users"],

            ["name" => "create_evaluation_types",          "section_code" => "evaluation",      "description_pt" => "Criar tipos de avaliações",                       "description_en" => "Create types of evaluations"],
            ["name" => "edit_evaluation_types",            "section_code" => "evaluation",      "description_pt" => "Editar tipos de avaliações",                      "description_en" => "Edit types of evaluations"],
            ["name" => "delete_evaluation_types",          "section_code" => "evaluation",      "description_pt" => "Eliminar tipos de avaliações",                    "description_en" => "Delete types of evaluations"],
            ["name" => "manage_evaluation_methods",        "section_code" => "evaluation",      "description_pt" => "Gerir métodos de Avaliação",                      "description_en" => "Manage evaluations Methods"],

            ["name" => "create_interruption_types",        "section_code" => "interruption",    "description_pt" => "Criar tipos de interrupções",                     "description_en" => "Create types of interruptions"],
            ["name" => "edit_interruption_types",          "section_code" => "interruption",    "description_pt" => "Editar tipos de interrupções",                    "description_en" => "Edit types of interruptions"],
            ["name" => "delete_interruption_types",        "section_code" => "interruption",    "description_pt" => "Eliminar tipos de interrupções",                  "description_en" => "Delete types of interruptions"],
                // for each phase
                ["name" => "edit_interruption",            "section_code" => "interruption",    "description_pt" => "Editar interrupções",                             "description_en" => "Edit interruptions"],
                ["name" => "remove_interruption",          "section_code" => "interruption",    "description_pt" => "Remover interrupções",                            "description_en" => "Remove interruptions"],

            ["name" => "create_calendar_phases",           "section_code" => "calendar_phases", "description_pt" => "Criar fases de calendário",                       "description_en" => "Create calendar phases"],
            ["name" => "edit_calendar_phases",             "section_code" => "calendar_phases", "description_pt" => "Editar fases de calendário",                      "description_en" => "Edit calendar phases"],
            ["name" => "delete_calendar_phases",           "section_code" => "calendar_phases", "description_pt" => "Eliminar fases de calendário",                    "description_en" => "Delete calendar phases"],

            ["name" => "create_languages",                 "section_code" => "languages",       "description_pt" => "Criar idiomas",                                   "description_en" => "Create languages"],
            ["name" => "edit_languages",                   "section_code" => "languages",       "description_pt" => "Editar idiomas",                                  "description_en" => "Edit languages"],
            ["name" => "translate",                        "section_code" => "languages",       "description_pt" => "Traduzir idiomas",                                "description_en" => "Translate languages"],

            ["name" => "create_schools",                   "section_code" => "schools",         "description_pt" => "Criar escolas",                                   "description_en" => "Create schools"],
            ["name" => "edit_schools",                     "section_code" => "schools",         "description_pt" => "Editar escolas",                                  "description_en" => "Edit schools"],

            ["name" => "create_academic_years",            "section_code" => "academic_years",  "description_pt" => "Criar anos letivos",                              "description_en" => "Create academic years"],
            ["name" => "edit_academic_years",              "section_code" => "academic_years",  "description_pt" => "Editar anos letivos",                             "description_en" => "Edit academic years"],
            ["name" => "delete_academic_years",            "section_code" => "academic_years",  "description_pt" => "Eliminar anos letivos",                           "description_en" => "Delete academic years"],

            ["name" => "change_permissions",               "section_code" => "permissions",     "description_pt" => "Gerir permissões",                                "description_en" => "Manage permissions"],
            ["name" => "define_course_coordinator",        "section_code" => "permissions",     "description_pt" => "Definir Coordenador de Curso",                    "description_en" => "Define course coordinator"],
            ["name" => "define_course_unit_responsible",   "section_code" => "permissions",     "description_pt" => "Definir Responsável da Unidade Curricular",       "description_en" => "Define course unit responsible"],
            ["name" => "define_course_unit_teachers",      "section_code" => "permissions",     "description_pt" => "Definir Professores das Unidades Curriculares",   "description_en" => "Define course unit teachers"],

            ["name" => "create_courses",                   "section_code" => "courses",         "description_pt" => "Criar cursos",                                    "description_en" => "Create courses"],
            ["name" => "edit_courses",                     "section_code" => "courses",         "description_pt" => "Editar cursos",                                   "description_en" => "Edit courses"],
            ["name" => "delete_courses",                   "section_code" => "courses",         "description_pt" => "Eliminar cursos",                                 "description_en" => "Delete courses"],


            // for each phase
            ["name" => "add_comments",                     "section_code" => "calendar",        "description_pt" => "Adicionar comentários",                           "description_en" => "Add comments"],
            ["name" => "change_calendar_phase",            "section_code" => "calendar",        "description_pt" => "Mudar fase de calendário",                        "description_en" => "Change calendar phase"],
            ["name" => "add_exams",                        "section_code" => "calendar",        "description_pt" => "Adicionar avaliações",                            "description_en" => "Add exams"],
            ["name" => "edit_exams",                       "section_code" => "calendar",        "description_pt" => "Editar avaliações",                               "description_en" => "Edit exams"],
            ["name" => "remove_exams",                     "section_code" => "calendar",        "description_pt" => "Remover avaliações",                              "description_en" => "Remove exams"],
            ["name" => "add_interruption",                 "section_code" => "calendar",        "description_pt" => "Adicionar interrupções",                          "description_en" => "Add interruption"],
        ];

        $userGroups = [
            ["code" => "super_admin",                       "description_pt" => "Super Admin",                         "description_en" => "Super Admin"],
            ["code" => "admin",                             "description_pt" => "Administrador de Sistema",            "description_en" => "System Admin"],
            ["code" => "student",                           "description_pt" => "Estudante",                           "description_en" => "Student"],
            ["code" => "comission",                         "description_pt" => "Comissão Científico-Pedagógica",      "description_en" => "Scientific-Pedagogical Commission"],
            ["code" => "pedagogic",                         "description_pt" => "Conselho Pedagógico",                 "description_en" => "Pedagogical Council"],
            ["code" => "coordinator",                       "description_pt" => "Coordenador de Curso",                "description_en" => "Course coordinator"],
            ["code" => "board",                             "description_pt" => "Direção",                             "description_en" => "Management"],
            ["code" => "gop",                               "description_pt" => "GOP",                                 "description_en" => "GOP"],
            ["code" => "teacher",                           "description_pt" => "Docente",                             "description_en" => "Teacher"],
            ["code" => "responsible_pedagogic",             "description_pt" => "Responsável Conselho Pedagógico",     "description_en" => "Responsible Pedagogical Council"],
            ["code" => "responsible_course_unit",           "description_pt" => "Responsável Unidade Curricular",      "description_en" => "Responsible Curricular Unit"],
            ["code" => "board_estg",                        "description_pt" => "Direção ESTG",                        "description_en" => "Management ESTG"],
            ["code" => "gop_estg",                          "description_pt" => "GOP ESTG",                            "description_en" => "GOP ESTG"],
            ["code" => "pedagogic_estg",                    "description_pt" => "Conselho Pedagógico ESTG",            "description_en" => "Pedagogical Council ESTG"],
        ];

        $users = [
            ["name" => "Administrador",             "email" => "admin@ipleiria.pt",             "group" => "super_admin"],
            ["name" => "Administrador de Sistema",  "email" => "sys_admin@ipleiria.pt",         "group" => "admin"],
            ["name" => "CCP",                       "email" => "ccp@ipleiria.pt",               "group" => "comission"],
            ["name" => "CP",                        "email" => "cp@ipleiria.pt",                "group" => "pedagogic"],
            ["name" => "CC",                        "email" => "cc@ipleiria.pt",                "group" => "coordinator"],
            ["name" => "Direção",                   "email" => "direcao@ipleiria.pt",           "group" => "board"],
            ["name" => "GOP",                       "email" => "gop@ipleiria.pt",               "group" => "gop"],
            ["name" => "Docente",                   "email" => "docente@ipleiria.pt",           "group" => "teacher"],
            ["name" => "Responsável CP",            "email" => "responsavel_cp@ipleiria.pt",    "group" => "responsible_pedagoci"],
            ["name" => "Responsável UC",            "email" => "responsavel_uc@ipleiria.pt",    "group" => "responsible_course_unit"],
        ];



        $schools = [
            ["code" => "ESAD.CR",   "name" => "Escola Superior de Artes e Design - Caldas da Rainha"],
            ["code" => "ESECS",     "name" => "Escola Superior de Educação e Ciências Sociais"],
            ["code" => "ESSLEI",    "name" =>"Escola Superior de Saúde"],
            [
                "code" => "ESTG",
                "name" => "Escola Superior de Tecnologia e Gestão",
                "base_link" => "http://www.dei.estg.ipleiria.pt/intranet/horarios/ws/inscricoes/cursos_ucs.php",
                "index_course_code" => "0",
                "index_course_name" => "1",
                "index_course_unit_name" => "3",
                "index_course_unit_curricular_year" => "5",
                "index_course_unit_code" => "2",
                "index_course_unit_teachers"=> "4",
                "query_param_academic_year"=> "anoletivo",
                "query_param_semester" => "periodo"
            ],
            ["code" => "ESTM", "name" => "Escola Superior de Turismo e Tecnologia do Mar"],
        ];

        foreach ($schools as $school) {
            $newSchool = new School($school);
            $newSchool->save();
        }

        foreach ($userGroups as $userGroup) {
            $newUserGroup = new Group();
            $newUserGroup->name = $userGroup['code'];
            $newUserGroup->description_pt = $userGroup['description_pt'];
            $newUserGroup->description_en = $userGroup['description_en'];
            $newUserGroup->enabled = true;
            $newUserGroup->removable = ($userGroup['code'] == 'board_estg' || $userGroup['code'] == 'gop_estg' || $userGroup['code'] == 'pedagogic_estg') ? : false;
            $newUserGroup->save();
        }


        $isGeneral = true;
        foreach ($newPermissions as $newPerm) {
            if ($newPerm["name"] == "add_comments") $isGeneral = false;
            $newPermission = new Permission();
            $newPermission->name = $newPerm["name"];
            $newPermission->description_pt = $newPerm["description_pt"];
            $newPermission->description_en = $newPerm["description_en"];
            $newPermission->category_id = $isGeneral ? 1 : 2;
            $newPermission->section_id = PermissionSection::where('code', $newPerm["section_code"])->first()->id;
            $newPermission->save();
            if ($isGeneral) {
                $newPermission->group()->attach(
                    [
                        Group::where('name', 'super_admin')->first()->id
                    ],
                    [
                        'phase_id' => CalendarPhase::where('name', 'system')->first()->id,
                        'enabled' => true,
                    ]
                );
            }
        }


        foreach ($users as $user) {
            $newUser = new User();
            $newUser->name = $user['name'];
            $newUser->email = $user['email'];
            $newUser->password = bcrypt('password');
            $newUser->protected = true;
            $newUser->save();
            $newUser->groups()->attach(Group::where('name', $user['group'])->get());
            $newUser->save();
        }

        $epochTypes = [
            ["pt" => "Época Periódica", "en" => "Periodic Season"],
            ["pt" => "Época Normal", "en" => "Normal Season"],
            ["pt" => "Época Recurso", "en" => "Resource season"],
            ["pt" => "Época Especial", "en" => "Special season"],
            ["pt" => "Época Especialíssima", "en" => "Very Special season"],
        ];
        foreach ($epochTypes as $epochType) {
            $newEpochType = new EpochType([
                'name_pt' => $epochType["pt"],
                'name_en' => $epochType["en"],
            ]);
            $newEpochType->save();
        }

        $semesters = [
            ["pt" => "1º Semestre", "en" => "1st Semester"],
            ["pt" => "2º Semestre", "en" => "2nd Semester"],
            ["pt" => "Especial", "en" => "Special"],
            ["pt" => "Especialíssima", "en" => "Very Special"],
        ];
        foreach ($semesters as $semester) {
            $newSemester = new Semester([
                'name_pt' => $semester["pt"],
                'name_en' => $semester["en"],
            ]);
            $newSemester->save();
            if ($semester["pt"] == "Especial") {
                $newSemester->epochTypes()->attach([4]);
            } else if ($semester["pt"] == "Especialíssima") {
                $newSemester->epochTypes()->attach([5]);
            } else {
                $newSemester->epochTypes()->attach([1, 2, 3]);
            }
        }
    }
}
