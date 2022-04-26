<?php

namespace Database\Seeders;

use App\Models\CalendarPhase;
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

class PermissionsAndGroupsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $schools = [
            ["code" => "ESAD.CR",   "name_pt" => "Escola Superior de Artes e Design - Caldas da Rainha",   "name_en" => "School of Arts and Design - Caldas da Rainha"  ],
            ["code" => "ESECS",     "name_pt" => "Escola Superior de Educação e Ciências Sociais",         "name_en" => "School of Education and Social Sciences"       ],
            ["code" => "ESSLEI",    "name_pt" => "Escola Superior de Saúde",                               "name_en" => "School of Health Sciences"                     ],
            [
                "code" => "ESTG",
                "name_pt" => "Escola Superior de Tecnologia e Gestão",
                "name_en" => "School of Technology and Management",
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
            ["code" => "ESTM",  "name_pt" => "Escola Superior de Turismo e Tecnologia do Mar - Peniche",    "name_en" => "School of Tourism and Maritime Technology - Peniche" ],
        ];

        foreach ($schools as $school) {
            $newSchool = new School($school);
            $newSchool->save();
        }

        $userGroups = [
            ["code" => "super_admin",             "is_removable" => false,  "name_pt" => "Super Admin",                     "name_en" => "Super Admin"                       ],
            ["code" => "admin",                   "is_removable" => false,  "name_pt" => "Administrador de Sistema",        "name_en" => "System Admin"                      ],
            ["code" => "student",                 "is_removable" => false,  "name_pt" => "Estudante",                       "name_en" => "Student"                           ],
            ["code" => "comission",               "is_removable" => false,  "name_pt" => "Comissão Científico-Pedagógica",  "name_en" => "Scientific-Pedagogical Commission" ],
            ["code" => "pedagogic",               "is_removable" => false,  "name_pt" => "Conselho Pedagógico",             "name_en" => "Pedagogical Council"               ],
            ["code" => "coordinator",             "is_removable" => false,  "name_pt" => "Coordenador de Curso",            "name_en" => "Course coordinator"                ],
            ["code" => "board",                   "is_removable" => false,  "name_pt" => "Direção",                         "name_en" => "Management"                        ],
            ["code" => "gop",                     "is_removable" => false,  "name_pt" => "GOP",                             "name_en" => "GOP"                               ],
            ["code" => "teacher",                 "is_removable" => false,  "name_pt" => "Docente",                         "name_en" => "Teacher"                           ],
            ["code" => "responsible_pedagogic",   "is_removable" => false,  "name_pt" => "Responsável Conselho Pedagógico", "name_en" => "Responsible Pedagogical Council"   ],
            ["code" => "responsible_course_unit", "is_removable" => false,  "name_pt" => "Responsável Unidade Curricular",  "name_en" => "Responsible Curricular Unit"       ],
            ["code" => "board_estg",              "is_removable" => true,   "name_pt" => "Direção ESTG",                    "name_en" => "Management ESTG"                   ],
            ["code" => "gop_estg",                "is_removable" => true,   "name_pt" => "GOP ESTG",                        "name_en" => "GOP ESTG"                          ],
            ["code" => "pedagogic_estg",          "is_removable" => true,   "name_pt" => "Conselho Pedagógico ESTG",        "name_en" => "Pedagogical Council ESTG"          ],
        ];

        foreach ($userGroups as $userGroup) {
            $newUserGroup = new Group();
            $newUserGroup->code = $userGroup['code'];
            $newUserGroup->name_pt = $userGroup['name_pt'];
            $newUserGroup->name_en = $userGroup['name_en'];
            $newUserGroup->enabled = true;
            $newUserGroup->removable = $userGroup['is_removable'];
            $newUserGroup->save();
        }

        $users = [
            ["name" => "Administrador",             "email" => "admin@ipleiria.pt",             "group_code" => "super_admin"             ],
            ["name" => "Administrador de Sistema",  "email" => "sys_admin@ipleiria.pt",         "group_code" => "admin"                   ],
            ["name" => "CCP",                       "email" => "ccp@ipleiria.pt",               "group_code" => "comission"               ],
            ["name" => "CP",                        "email" => "cp@ipleiria.pt",                "group_code" => "pedagogic"               ],
            ["name" => "CC",                        "email" => "cc@ipleiria.pt",                "group_code" => "coordinator"             ],
            ["name" => "Direção",                   "email" => "direcao@ipleiria.pt",           "group_code" => "board"                   ],
            ["name" => "GOP",                       "email" => "gop@ipleiria.pt",               "group_code" => "gop"                     ],
            ["name" => "Docente",                   "email" => "docente@ipleiria.pt",           "group_code" => "teacher"                 ],
            ["name" => "Responsável CP",            "email" => "responsavel_cp@ipleiria.pt",    "group_code" => "responsible_pedagogic"   ],
            ["name" => "Responsável UC",            "email" => "responsavel_uc@ipleiria.pt",    "group_code" => "responsible_course_unit" ],
        ];

        foreach ($users as $user) {
            $newUser = new User();
            $newUser->name = $user['name'];
            $newUser->email = $user['email'];
            $newUser->password = bcrypt('password');
            $newUser->protected = true;
            $newUser->save();
            $newUser->groups()->attach(Group::where('code', $user['group_code'])->get());
            $newUser->save();
        }

        $interruptionTypes = [
            ["name_pt" => "Natal",               "name_en" => "Christmas"       ],
            ["name_pt" => "Páscoa",              "name_en" => "Easter"          ],
            ["name_pt" => "Desfile do caloiro",  "name_en" => "Freshman Parade" ],
            ["name_pt" => "Abertura solene",     "name_en" => "Solemn Opening"  ],
            ["name_pt" => "Desfile académico",   "name_en" => "Academic parade" ],
            ["name_pt" => "Feriado",             "name_en" => "Holiday"         ],
            ["name_pt" => "Semana académica",    "name_en" => "Academic week"   ],
            ["name_pt" => "Dia aberto",          "name_en" => "Open Day"        ],
            ["name_pt" => "Carnaval",            "name_en" => "Carnival"        ],
        ];

        foreach ($interruptionTypes as $interruptionType) {
            $newInterruptionType = new InterruptionType();
            $newInterruptionType->name_pt = $interruptionType["name_pt"];
            $newInterruptionType->name_en = $interruptionType["name_en"];
            $newInterruptionType->save();
        }

        $evaluationTypes = [
            ["code" => "written_exam",              "name_pt" => "Prova escrita",                    "name_en" => "Written test"                     ],
            ["code" => "oral_exam",                 "name_pt" => "Prova oral",                       "name_en" => "Oral test"                        ],
            ["code" => "practical_exam",            "name_pt" => "Teste prático",                    "name_en" => "Practical test"                   ],
            ["code" => "report",                    "name_pt" => "Relatório ou trabalho escrito",    "name_en" => "Report or written work"           ],
            ["code" => "public_oral_presentation",  "name_pt" => "Apresentação oral pública",        "name_en" => "Public oral presentation"         ],
            ["code" => "prototype",                 "name_pt" => "Protótipo",                        "name_en" => "Prototype"                        ],
            ["code" => "laboratory_work",           "name_pt" => "Trabalho laboratorial",            "name_en" => "Laboratory work"                  ],
            ["code" => "project",                   "name_pt" => "Projeto",                          "name_en" => "Project"                          ],
            ["code" => "internship",                "name_pt" => "Estágios ou projetos externos",    "name_en" => "Internships or external projects" ],
            ["code" => "portfolio",                 "name_pt" => "Portfolios",                       "name_en" => "portfolios"                       ],
        ];

        foreach ($evaluationTypes as $evaluationType) {
            $newEvaluationType = new EvaluationType($evaluationType);
            $newEvaluationType->save();
        }

        $phases = [
            ["code"=> "created",             "name_pt" => "Criado",                             "name_en" => "Created"                                ],
            ["code"=> "edit_gop",            "name_pt" => "Em edição (GOP)",                    "name_en" => "In edit (GOP)"                          ],
            ["code"=> "edit_cc",             "name_pt" => "Em edição (Coordenador de Curso)",   "name_en" => "In edit (Course coordinator)"           ],
            ["code"=> "edit_responsible",    "name_pt" => "Em edição (Responsável UC)",         "name_en" => "In edit (UC responsible)"               ],
            ["code"=> "evaluation_ccp",      "name_pt" => "Em avaliação (CCP)",                 "name_en" => "Under evaluation (CCP)"                 ],
            ["code"=> "evaluation_cp",       "name_pt" => "Em avaliação (Conselho Pedagógico)", "name_en" => "Under evaluation (Pedagogical Council)" ],
            ["code"=> "evaluation_gop",      "name_pt" => "Em avaliação (GOP)",                 "name_en" => "Under evaluation (GOP)"                 ],
            ["code"=> "evaluation_board",    "name_pt" => "Em avaliação (Direção)",             "name_en" => "Under evaluation (Direction)"           ],
            ["code"=> "evaluation_students", "name_pt" => "Em avaliação (Alunos)",              "name_en" => "Under evaluation (Students)"            ],
            ["code"=> "approved",            "name_pt" => "Aprovado",                           "name_en" => "Approved"                               ],
            ["code"=> "published",           "name_pt" => "Publicado",                          "name_en" => "Published"                              ],
            ["code"=> "system",              "name_pt" => "System",                             "name_en" => "System"                                 ],
        ];

        foreach ($phases as $phase) {
            $newPhase = new CalendarPhase();
            $newPhase->code = $phase["code"];
            $newPhase->name_pt = $phase["name_pt"];
            $newPhase->name_en = $phase["name_en"];
            $newPhase->removable = false;
            $newPhase->save();
        }

        $categories = [
            ["code"=> "general",    "name_pt" => "Geral",       "name_en" => "General"  ],
            ["code"=> "calendar",   "name_pt" => "Calendário",  "name_en" => "Calendar" ],
        ];

        $categoryGeneral = new PermissionCategory($categories[0]);
        $categoryGeneral->save();
        $categoryCalendar = new PermissionCategory($categories[1]);
        $categoryCalendar->save();

        $permissionSections = [
            ["code" => "calendar",          "name_pt" => "Calendário",               "name_en" => "Calendar"            ],
            ["code" => "ucs",               "name_pt" => "UCs",                      "name_en" => "CUs"                 ],
            ["code" => "users",             "name_pt" => "Utilizadores",             "name_en" => "Users"               ],
            ["code" => "user_groups",       "name_pt" => "Grupos de Utilizador",     "name_en" => "Users Groups"        ],
            ["code" => "courses",           "name_pt" => "Cursos",                   "name_en" => "Courses"             ],
            ["code" => "evaluation",        "name_pt" => "Avaliações",               "name_en" => "Evaluation"          ],
            ["code" => "interruption",      "name_pt" => "Interrupções",             "name_en" => "Interruption"        ],
            ["code" => "calendar_phases",   "name_pt" => "Fases do calendário",      "name_en" => "Calendar Phases"     ],
            ["code" => "languages",         "name_pt" => "Linguagens",               "name_en" => "languages"           ],
            ["code" => "schools",           "name_pt" => "Escolas",                  "name_en" => "schools"             ],
            ["code" => "academic_years",    "name_pt" => "Anos Letivos",             "name_en" => "Academic Years"      ],
            ["code" => "permissions",       "name_pt" => "Permissões",               "name_en" => "Permissions"         ],
        ];

        foreach ($permissionSections as $section) {
            $newSection = new PermissionSection();
            $newSection->code = $section["code"];
            $newSection->name_pt = $section["name_pt"];
            $newSection->name_en = $section["name_en"];
            $newSection->save();
        }

        $newPermissions = [
            ["code" => "create_calendar",                  "section_code" => "calendar",        "name_pt" => "Criar calendário",                                "name_en" => "Create calendar"               , "is_general" => true  ],
            ["code" => "delete_calendar",                  "section_code" => "calendar",        "name_pt" => "Eliminar calendário",                             "name_en" => "Delete calendar"               , "is_general" => true  ],
            ["code" => "view_calendar_info",               "section_code" => "calendar",        "name_pt" => "Ver informações do calendário",                   "name_en" => "View calendar information"     , "is_general" => true  ],
            ["code" => "view_comments",                    "section_code" => "calendar",        "name_pt" => "Ver comentários",                                 "name_en" => "See comments"                  , "is_general" => true  ],
            ["code" => "view_calendar_history",            "section_code" => "calendar",        "name_pt" => "Ver o histórico do calendário",                   "name_en" => "View calendar history"         , "is_general" => true  ],
            ["code" => "view_actual_phase",                "section_code" => "calendar",        "name_pt" => "Ver fase atual",                                  "name_en" => "See current phase"             , "is_general" => true  ],

            ["code" => "publish_calendar",                 "section_code" => "calendar",        "name_pt" => "Publicar calendário",                             "name_en" => "Publish calendar"              , "is_general" => true  ],
            ["code" => "create_copy",                      "section_code" => "calendar",        "name_pt" => "Criar cópia",                                     "name_en" => "Create copy"                   , "is_general" => true  ],

            ["code" => "view_course_units",                "section_code" => "ucs",             "name_pt" => "Ver UCs",                                         "name_en" => "See CUs"                       , "is_general" => true  ],
            ["code" => "create_course_units",              "section_code" => "ucs",             "name_pt" => "Criar UCs",                                       "name_en" => "Create CUs"                    , "is_general" => true  ],
            ["code" => "edit_course_units",                "section_code" => "ucs",             "name_pt" => "Editar UCs",                                      "name_en" => "Edit CUs"                      , "is_general" => true  ],
            ["code" => "delete_course_units",              "section_code" => "ucs",             "name_pt" => "Eliminar UCs",                                    "name_en" => "Delete CUs"                    , "is_general" => true  ],

            ["code" => "edit_user_groups",                 "section_code" => "user_groups",     "name_pt" => "Editar Grupos de Utilizador",                     "name_en" => "Edit User Groups"              , "is_general" => true  ],
            ["code" => "delete_user_groups",               "section_code" => "user_groups",     "name_pt" => "Eliminar Grupos de Utilizador",                   "name_en" => "Delete User Groups"            , "is_general" => true  ],
            ["code" => "create_user_groups",               "section_code" => "user_groups",     "name_pt" => "Criar Grupos de Utilizador",                      "name_en" => "Create User Groups"            , "is_general" => true  ],

            ["code" => "edit_users",                       "section_code" => "users",           "name_pt" => "Editar utilizadores",                             "name_en" => "Edit users"                    , "is_general" => true  ],
            ["code" => "lock_users",                       "section_code" => "users",           "name_pt" => "Bloquear utilizadores",                           "name_en" => "Block users"                   , "is_general" => true  ],

            ["code" => "create_evaluation_types",          "section_code" => "evaluation",      "name_pt" => "Criar tipos de avaliações",                       "name_en" => "Create types of evaluations"   , "is_general" => true  ],
            ["code" => "edit_evaluation_types",            "section_code" => "evaluation",      "name_pt" => "Editar tipos de avaliações",                      "name_en" => "Edit types of evaluations"     , "is_general" => true  ],
            ["code" => "delete_evaluation_types",          "section_code" => "evaluation",      "name_pt" => "Eliminar tipos de avaliações",                    "name_en" => "Delete types of evaluations"   , "is_general" => true  ],
            ["code" => "manage_evaluation_methods",        "section_code" => "evaluation",      "name_pt" => "Gerir métodos de Avaliação",                      "name_en" => "Manage evaluations Methods"    , "is_general" => true  ],

            ["code" => "create_interruption_types",        "section_code" => "interruption",    "name_pt" => "Criar tipos de interrupções",                     "name_en" => "Create types of interruptions" , "is_general" => true  ],
            ["code" => "edit_interruption_types",          "section_code" => "interruption",    "name_pt" => "Editar tipos de interrupções",                    "name_en" => "Edit types of interruptions"   , "is_general" => true  ],
            ["code" => "delete_interruption_types",        "section_code" => "interruption",    "name_pt" => "Eliminar tipos de interrupções",                  "name_en" => "Delete types of interruptions" , "is_general" => true  ],

            ["code" => "create_calendar_phases",           "section_code" => "calendar_phases", "name_pt" => "Criar fases de calendário",                       "name_en" => "Create calendar phases"        , "is_general" => true  ],
            ["code" => "edit_calendar_phases",             "section_code" => "calendar_phases", "name_pt" => "Editar fases de calendário",                      "name_en" => "Edit calendar phases"          , "is_general" => true  ],
            ["code" => "delete_calendar_phases",           "section_code" => "calendar_phases", "name_pt" => "Eliminar fases de calendário",                    "name_en" => "Delete calendar phases"        , "is_general" => true  ],

            ["code" => "create_languages",                 "section_code" => "languages",       "name_pt" => "Criar idiomas",                                   "name_en" => "Create languages"              , "is_general" => true  ],
            ["code" => "edit_languages",                   "section_code" => "languages",       "name_pt" => "Editar idiomas",                                  "name_en" => "Edit languages"                , "is_general" => true  ],
            ["code" => "translate",                        "section_code" => "languages",       "name_pt" => "Traduzir idiomas",                                "name_en" => "Translate languages"           , "is_general" => true  ],

            ["code" => "create_schools",                   "section_code" => "schools",         "name_pt" => "Criar escolas",                                   "name_en" => "Create schools"                , "is_general" => true  ],
            ["code" => "edit_schools",                     "section_code" => "schools",         "name_pt" => "Editar escolas",                                  "name_en" => "Edit schools"                  , "is_general" => true  ],

            ["code" => "create_academic_years",            "section_code" => "academic_years",  "name_pt" => "Criar anos letivos",                              "name_en" => "Create academic years"         , "is_general" => true  ],
            ["code" => "edit_academic_years",              "section_code" => "academic_years",  "name_pt" => "Editar anos letivos",                             "name_en" => "Edit academic years"           , "is_general" => true  ],
            ["code" => "delete_academic_years",            "section_code" => "academic_years",  "name_pt" => "Eliminar anos letivos",                           "name_en" => "Delete academic years"         , "is_general" => true  ],

            ["code" => "change_permissions",               "section_code" => "permissions",     "name_pt" => "Gerir permissões",                                "name_en" => "Manage permissions"            , "is_general" => true  ],
            ["code" => "define_course_coordinator",        "section_code" => "permissions",     "name_pt" => "Definir Coordenador de Curso",                    "name_en" => "Define course coordinator"     , "is_general" => true  ],
            ["code" => "define_course_unit_responsible",   "section_code" => "permissions",     "name_pt" => "Definir Responsável da Unidade Curricular",       "name_en" => "Define course unit responsible", "is_general" => true  ],
            ["code" => "define_course_unit_teachers",      "section_code" => "permissions",     "name_pt" => "Definir Professores das Unidades Curriculares",   "name_en" => "Define course unit teachers"   , "is_general" => true  ],

            ["code" => "create_courses",                   "section_code" => "courses",         "name_pt" => "Criar cursos",                                    "name_en" => "Create courses"                , "is_general" => true  ],
            ["code" => "edit_courses",                     "section_code" => "courses",         "name_pt" => "Editar cursos",                                   "name_en" => "Edit courses"                  , "is_general" => true  ],
            ["code" => "delete_courses",                   "section_code" => "courses",         "name_pt" => "Eliminar cursos",                                 "name_en" => "Delete courses"                , "is_general" => true  ],

            // for each phase
            ["code" => "add_comments",                     "section_code" => "calendar",        "name_pt" => "Adicionar comentários",                           "name_en" => "Add comments"                  , "is_general" => false ],
            ["code" => "change_calendar_phase",            "section_code" => "calendar",        "name_pt" => "Mudar fase de calendário",                        "name_en" => "Change calendar phase"         , "is_general" => false ],
            ["code" => "add_exams",                        "section_code" => "evaluation",      "name_pt" => "Adicionar avaliações",                            "name_en" => "Add exams"                     , "is_general" => false ],
            ["code" => "edit_exams",                       "section_code" => "evaluation",      "name_pt" => "Editar avaliações",                               "name_en" => "Edit exams"                    , "is_general" => false ],
            ["code" => "remove_exams",                     "section_code" => "evaluation",      "name_pt" => "Remover avaliações",                              "name_en" => "Remove exams"                  , "is_general" => false ],
            ["code" => "add_interruption",                 "section_code" => "interruption",    "name_pt" => "Adicionar interrupções",                          "name_en" => "Add interruption"              , "is_general" => false ],
            ["code" => "edit_interruption",                "section_code" => "interruption",    "name_pt" => "Editar interrupções",                             "name_en" => "Edit interruptions"            , "is_general" => false ],
            ["code" => "remove_interruption",              "section_code" => "interruption",    "name_pt" => "Remover interrupções",                            "name_en" => "Remove interruptions"          , "is_general" => false ],
        ];

        $super_admin_id = Group::where('code', 'super_admin')->first()->id;
        $phase_system_id = CalendarPhase::where('code', 'system')->first()->id;

        foreach ($newPermissions as $newPerm) {
            $newPermission = new Permission();
            $newPermission->code = $newPerm["code"];
            $newPermission->name_pt = $newPerm["name_pt"];
            $newPermission->name_en = $newPerm["name_en"];
            $newPermission->category_id = $newPerm["is_general"] ? $categoryGeneral->id : $categoryCalendar->id;
            $newPermission->section_id = PermissionSection::where('code', $newPerm["section_code"])->first()->id;
            $newPermission->save();

            if ($newPerm["is_general"]) {
                $newPermission->group()->attach(
                    [ $super_admin_id ],
                    [
                        'phase_id' => $phase_system_id,
                        'enabled' => true,
                    ]
                );
            }
        }

        $epochTypes = [
            ["name_pt" => "Época Periódica",        "name_en" => "Periodic Season"      ],
            ["name_pt" => "Época Normal",           "name_en" => "Normal Season"        ],
            ["name_pt" => "Época Recurso",          "name_en" => "Resource Season"      ],
            ["name_pt" => "Época Especial",         "name_en" => "Special Season"       ],
            ["name_pt" => "Época Especialíssima",   "name_en" => "Very Special Season"  ],
        ];
        foreach ($epochTypes as $epochType) {
            $newEpochType = new EpochType($epochType);
            $newEpochType->save();
        }

        $semesters = [
            ["name_pt" => "1º Semestre",     "name_en" => "1st Semester",  "special" => 0, "epoch_types" => [1, 2, 3]   ],
            ["name_pt" => "2º Semestre",     "name_en" => "2nd Semester",  "special" => 0, "epoch_types" => [1, 2, 3]   ],
            ["name_pt" => "Especial",        "name_en" => "Special",       "special" => 1, "epoch_types" => [4]         ],
            ["name_pt" => "Especialíssima",  "name_en" => "Very Special",  "special" => 1, "epoch_types" => [5]         ],
        ];

        foreach ($semesters as $semester) {
            $newSemester = new Semester();
            $newSemester->name_pt = $semester["name_pt"];
            $newSemester->name_en = $semester["name_en"];
            $newSemester->special = $semester["special"];
            $newSemester->save();

            $newSemester->epochTypes()->attach($semester["epoch_types"]);
        }
    }
}
