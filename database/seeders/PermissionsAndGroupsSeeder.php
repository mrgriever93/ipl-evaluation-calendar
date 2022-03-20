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
            "Natal",
            "Páscoa",
            "Desfile do caloiro",
            "Abertura solene",
            "Desfile académico",
            "Feriado",
            "Semana académica",
            "Dia aberto",
            "Carnaval"
        ];

        $evaluationTypes = [
            ["code" => "written_exam", "description" => "Prova escrita"],
            ["code" => "oral_exam", "description" => "Prova oral"],
            ["code" => "practical_exam", "description" => "Teste prático"],
            ["code" => "report", "description" => "Relatório ou trabalho escrito"],
            ["code" => "public_oral_presentation", "description" => "Apresentação oral pública"],
            ["code" => "prototype", "description" => "Protótipo"],
            ["code" => "laboratory_work", "description" => "Trabalho laboratorial"],
            ["code" => "project", "description" => "Projeto"],
            ["code" => "internship", "description" => "Estágios ou projetos externos"],
            ["code" => "portfolio", "description" => "Portfolios"]
        ];

        $phases = [
            ["description" => "Criado", "name"=> "created"],
            ["description" => "Em edição (GOP)", "name"=> "edit_gop"],
            ["description" => "Em edição (Coordenador de Curso)", "name"=> "edit_cc"],
            ["description" => "Em edição (Responsável UC)", "name"=> "edit_responsible"],
            ["description" => "Em avaliação (CCP)", "name"=> "evaluation_ccp"],
            ["description" => "Em avaliação (Conselho Pedagógico)", "name"=> "evaluation_cp"],
            ["description" => "Em avaliação (GOP)", "name"=> "evaluation_gop"],
            ["description" => "Em avaliação (Direção)", "name"=> "evaluation_board"],
            ["description" => "Em avaliação (Alunos)", "name"=> "evaluation_students"],
            ["description" => "Aprovado", "name"=> "approved"],
            ["description" => "Publicado", "name"=> "published"],
            ["description" => "System", "name"=> "system"]
        ];

        $categories = [
            "general",
            "calendar"
        ];

        $newPermissions = [
            ["name" => "create_calendar", "description" => "Criar calendário"],
            ["name" => "delete_calendar", "description" => "Eliminar calendário"],
            ["name" => "view_calendar_info", "description" => "Ver informações do calendário"],
            ["name" => "view_comments", "description" => "Ver comentários"],
            ["name" => "view_calendar_history", "description" => "Ver o histórico do calendário"],
            ["name" => "view_actual_phase", "description" => "Ver fase atual"],
            ["name" => "view_course_units", "description" => "Ver UCs"],
            ["name" => "create_course_units", "description" => "Criar UCs"],
            ["name" => "edit_course_units", "description" => "Editar UCs"],
            ["name" => "delete_course_units", "description" => "Eliminar UCs"],

            ["name" => "edit_user_groups", "description" => "Editar Grupos de Utilizador"],
            ["name" => "delete_user_groups", "description" => "Eliminar Grupos de Utilizador"],
            ["name" => "create_user_groups", "description" => "Criar Grupos de Utilizador"],

            ["name" => "edit_users", "description" => "Editar utilizadores"],
            ["name" => "lock_users", "description" => "Bloquear utilizadores"],

            ["name" => "create_evaluation_types", "description" => "Criar tipos de avaliações"],
            ["name" => "edit_evaluation_types", "description" => "Editar tipos de avaliações"],
            ["name" => "delete_evaluation_types", "description" => "Eliminar tipos de avaliações"],

            ["name" => "create_interruption_types", "description" => "Criar tipos de interrupções"],
            ["name" => "edit_interruption_types", "description" => "Editar tipos de interrupções"],
            ["name" => "delete_interruption_types", "description" => "Eliminar tipos de interrupções"],

            ["name" => "create_calendar_phases", "description" => "Criar fases de calendário"],
            ["name" => "edit_calendar_phases", "description" => "Editar fases de calendário"],
            ["name" => "delete_calendar_phases", "description" => "Eliminar fases de calendário"],

            ["name" => "create_languages", "description" => "Criar idiomas"],
            ["name" => "edit_languages", "description" => "Editar idiomas"],
            ["name" => "translate", "description" => "Traduzir idiomas"],

            ["name" => "create_schools", "description" => "Criar escolas"],
            ["name" => "edit_schools", "description" => "Editar escolas"],

            ["name" => "create_academic_years", "description" => "Criar anos letivos"],
            ["name" => "edit_academic_years", "description" => "Editar anos letivos"],
            ["name" => "delete_academic_years", "description" => "Eliminar anos letivos"],

            ["name" => "change_permissions", "description" => "Gerir permissões"],
            ["name" => "define_course_coordinator", "description" => "Definir Coordenador de Curso"],
            ["name" => "define_course_unit_responsible", "description" => "Definir Responsável da Unidade Curricular"],
            ["name" => "define_course_unit_teachers", "description" => "Definir Professores das Unidades Curriculares"],

            ["name" => "create_courses", "description" => "Criar cursos"],
            ["name" => "edit_courses", "description" => "Editar cursos"],
            ["name" => "delete_courses", "description" => "Eliminar cursos"],
            ["name" => "publish_calendar", "description" => "Publicar calendário"],
            ["name" => "create_copy", "description" => "Criar cópia"],

            ["name" => "manage_evaluation_methods", "description" => "Gerir métodos de Avaliação"],

            // for each phase
            ["name" => "add_comments", "description" => "Adicionar comentários"],
            ["name" => "change_calendar_phase", "description" => "Mudar fase de calendário"],
            ["name" => "add_exams", "description" => "Adicionar avaliações"],
            ["name" => "edit_exams", "description" => "Editar avaliações"],
            ["name" => "remove_exams", "description" => "Remover avaliações"],
            ["name" => "add_interruption", "description" => "Adicionar interrupções"],
            ["name" => "edit_interruption", "description" => "Editar interrupções"],
            ["name" => "remove_interruption", "description" => "Remover interrupções"],

        ];

        $userGroups = [
            ["code" => "super_admin", "description" => "Super Admin"],
            ["code" => "admin", "description" => "Administrador de Sistema"],
            ["code" => "student", "description" => "Estudante"],
            ["code" => "comission", "description" => "Comissão Científico-Pedagógica"],
            ["code" => "pedagogic", "description" => "Conselho Pedagógico"],
            ["code" => "coordinator", "description" => "Coordenador de Curso"],
            ["code" => "board", "description" => "Direção"],
            ["code" => "gop", "description" => "GOP"],
            ["code" => "teacher", "description" => "Docente"],
            ["code" => "responsible_pedagogic", "description" => "Responsável Conselho Pedagógico"],
            ["code" => "responsible_course_unit", "description" => "Responsável Unidade Curricular"],
            ["code" => "board_estg", "description" => "Direção ESTG"],
            ["code" => "gop_estg", "description" => "GOP ESTG"],
            ["code" => "pedagogic_estg", "description" => "Conselho Pedagógico ESTG"],
        ];

        $users = [
            ["name" => "Administrador", "email" => "admin@ipleiria.pt", "group" => "super_admin"],
            ["name" => "Administrador de Sistema", "email" => "sys_admin@ipleiria.pt", "group" => "admin"],
            ["name" => "CCP", "email" => "ccp@ipleiria.pt", "group" => "comission"],
            ["name" => "CP", "email" => "cp@ipleiria.pt", "group" => "pedagogic"],
            ["name" => "CC", "email" => "cc@ipleiria.pt", "group" => "coordinator"],
            ["name" => "Direção", "email" => "direcao@ipleiria.pt", "group" => "board"],
            ["name" => "GOP", "email" => "gop@ipleiria.pt", "group" => "gop"],
            ["name" => "Docente", "email" => "docente@ipleiria.pt", "group" => "teacher"],
            ["name" => "Responsável CP", "email" => "responsavel_cp@ipleiria.pt", "group" => "responsible_pedagoci"],
            ["name" => "Responsável UC", "email" => "responsavel_uc@ipleiria.pt", "group" => "responsible_course_unit"],
        ];



        $schools = [
            ["code" => "ESAD.CR", "name" => "Escola Superior de Artes e Design - Caldas da Rainha"],
            ["code" => "ESECS", "name" => "Escola Superior de Educação e Ciências Sociais"],
            ["code" => "ESSLEI", "name" =>"Escola Superior de Saúde"],
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

        foreach ($evaluationTypes as $evaluationType) {
            $newEvaluationType = new EvaluationType($evaluationType);
            $newEvaluationType->save();
        }

        foreach ($phases as $phase) {
            $newPhase = new CalendarPhase();
            $newPhase->name = $phase["name"];
            $newPhase->description = $phase["description"];
            $newPhase->removable = false;
            $newPhase->save();
        }

        foreach ($categories as $category) {
            $newCategory = new PermissionCategory();
            $newCategory->name = $category;
            $newCategory->description = $category;
            $newCategory->save();
        }

        foreach ($userGroups as $userGroup) {
            $newUserGroup = new Group();
            $newUserGroup->name = $userGroup['code'];
            $newUserGroup->description = $userGroup['description'];
            $newUserGroup->enabled = true;
            $newUserGroup->removable = ($userGroup['code'] == 'board_estg' || $userGroup['code'] == 'gop_estg' || $userGroup['code'] == 'pedagogic_estg') ? : false;
            $newUserGroup->save();
        }


        $isGeneral = true;
        foreach ($newPermissions as $newPerm) {
            if ($newPerm["name"] == "add_comments") $isGeneral = false;
            $newPermission = new Permission();
            $newPermission->name = $newPerm["name"];
            $newPermission->description = $newPerm["description"];
            $newPermission->category_id = $isGeneral ? 1 : 2;
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

        foreach ($interruptionTypes as $interruptionType) {
            $newInterruptionType = new InterruptionType();
            $newInterruptionType->name = $interruptionType;
            $newInterruptionType->description = $interruptionType;
            $newInterruptionType->save();
        }

        foreach (["Época Periódica", "Época Normal", "Época Recurso", "Época Especial"] as $epochType) {
            $newEpochType = new EpochType(['name' => $epochType]);
            $newEpochType->save();
        }

        foreach (["1º Semestre", "2º Semestre", "Especial"] as $semester) {
            $newSemester = new Semester(['name' => $semester]);
            $newSemester->save();
            if ($semester == "Especial") {
                $newSemester->epochTypes()->attach([4]);
            } else {
                $newSemester->epochTypes()->attach([1, 2, 3]);
            }
        }
    }
}
