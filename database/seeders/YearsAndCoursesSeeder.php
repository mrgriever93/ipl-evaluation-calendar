<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Branch;
use App\Models\Course;
use App\Models\School;
use Illuminate\Database\Seeder;

class YearsAndCoursesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $academicYears = [
            [ "code" => "202122", "display" => "2021-22", "active" => 1, "selected" => 1 ],
            [ "code" => "202223", "display" => "2022-23", "active" => 1, "selected" => 0 ],
        ];

        foreach ($academicYears as $year) {
            $newYear = new AcademicYear($year);
            $newYear->save();
        }

        $estg_school_id = School::where('code', 'ESTG')->first()->id;
        $courses = [
            [ "school_id" => $estg_school_id,   "code" => "2098",   "name_pt" => "Inglês Geral",                                                                                "name_en" => "Inglês Geral",                                                                               "initials" => NULL,  "degree" => NULL,   "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2100",   "name_pt" => "Matemáticas Gerais",                                                                          "name_en" => "Matemáticas Gerais",                                                                         "initials" => NULL,  "degree" => NULL,   "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2004",   "name_pt" => "Mestrado em Finanças Empresariais",                                                           "name_en" => "Mestrado em Finanças Empresariais",                                                          "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2005",   "name_pt" => "Mestrado em Negócios Internacionais",                                                         "name_en" => "Mestrado em Negócios Internacionais",                                                        "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2011",   "name_pt" => "Mestrado em Engenharia Automóvel",                                                            "name_en" => "Mestrado em Engenharia Automóvel",                                                           "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2023",   "name_pt" => "Mestrado em Engenharia Civil - Construções Civis",                                            "name_en" => "Mestrado em Engenharia Civil - Construções Civis",                                           "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2030",   "name_pt" => "Mestrado em Engenharia Informática - Computação Móvel",                                       "name_en" => "Mestrado em Engenharia Informática - Computação Móvel",                                      "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2037",   "name_pt" => "Mestrado em Marketing Relacional",                                                            "name_en" => "Mestrado em Marketing Relacional",                                                           "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2047",   "name_pt" => "Mestrado em Administração Pública",                                                           "name_en" => "Mestrado em Administração Pública",                                                          "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2056",   "name_pt" => "Mestrado em Engenharia da Energia e do Ambiente",                                             "name_en" => "Mestrado em Engenharia da Energia e do Ambiente",                                            "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2059",   "name_pt" => "Mestrado em Engenharia Mecânica - Produção Industrial",                                       "name_en" => "Mestrado em Engenharia Mecânica - Produção Industrial",                                      "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2075",   "name_pt" => "Mestrado em Solicitadoria de Empresa",                                                        "name_en" => "Mestrado em Solicitadoria de Empresa",                                                       "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2089",   "name_pt" => "Master in Product Design Engineering",                                                        "name_en" => "Master in Product Design Engineering",                                                       "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2093",   "name_pt" => "Master in Civil Engineering - Building Construction",                                         "name_en" => "Master in Civil Engineering - Building Construction",                                        "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2095",   "name_pt" => "Master in International Business",                                                            "name_en" => "Master in International Business",                                                           "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2109",   "name_pt" => "Mestrado em Engenharia para Fabricação Digital Direta",                                       "name_en" => "Mestrado em Engenharia para Fabricação Digital Direta",                                      "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2130",   "name_pt" => "Master in Computer Engineering - Mobile Computing",                                           "name_en" => "Master in Computer Engineering - Mobile Computing",                                          "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2158",   "name_pt" => "Master in Electrical and Electronic - Engineering",                                           "name_en" => "Master in Electrical and Electronic - Engineering",                                          "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "2159",   "name_pt" => "Mestrado em Cibersegurança e Informática Forense",                                            "name_en" => "Mestrado em Cibersegurança e Informática Forense",                                           "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2164",   "name_pt" => "Mestrado em Empreendorismo e Inovação",                                                       "name_en" => "Mestrado em Empreendorismo e Inovação",                                                      "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2165",   "name_pt" => "Mestrado em Contabilidade e Fiscalidade",                                                     "name_en" => "Mestrado em Contabilidade e Fiscalidade",                                                    "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2170",   "name_pt" => "Mestrado em Ciência de Dados",                                                                "name_en" => "Mestrado em Ciência de Dados",                                                               "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "2197",   "name_pt" => "Undergraduate in Games and Multimedia",                                                       "name_en" => "Undergraduate in Games and Multimedia",                                                      "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "2259",   "name_pt" => "Mestrado em Cibersegurança e Informática Forense",                                            "name_en" => "Mestrado em Cibersegurança e Informática Forense",                                           "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "4506",   "name_pt" => "Curso Técnico Superior Profissional de Apoio à Gestão",                                       "name_en" => "Curso Técnico Superior Profissional de Apoio à Gestão",                                      "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4507",   "name_pt" => "Curso Técnico Superior Profissional de Automação, Robótica e Manutenção Industrial",          "name_en" => "Curso Técnico Superior Profissional de Automação, Robótica e Manutenção Industrial",         "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4510",   "name_pt" => "Curso Técnico Superior Profissional de Eletrónica e Redes de Telecomunicações",               "name_en" => "Curso Técnico Superior Profissional de Eletrónica e Redes de Telecomunicações",              "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4511",   "name_pt" => "Curso Técnico Superior Profissional de Energias Renováveis e Eficiência Energética",          "name_en" => "Curso Técnico Superior Profissional de Energias Renováveis e Eficiência Energética",         "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4512",   "name_pt" => "Curso Técnico Superior Profissional de Fabricação Automática",                                "name_en" => "Curso Técnico Superior Profissional de Fabricação Automática",                               "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4515",   "name_pt" => "Curso Técnico Superior Profissional de Programação de Sistemas de Informação",                "name_en" => "Curso Técnico Superior Profissional de Programação de Sistemas de Informação",               "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4517",   "name_pt" => "Curso Técnico Superior Profissional de Redes e Sistemas Informáticos",                        "name_en" => "Curso Técnico Superior Profissional de Redes e Sistemas Informáticos",                       "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4519",   "name_pt" => "Curso Técnico Superior Profissional de Sistemas Eletromecânicos",                             "name_en" => "Curso Técnico Superior Profissional de Sistemas Eletromecânicos",                            "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4520",   "name_pt" => "Curso Técnico Superior Profissional de Tecnologia Automóvel",                                 "name_en" => "Curso Técnico Superior Profissional de Tecnologia Automóvel",                                "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4521",   "name_pt" => "Curso Técnico Superior Profissional de Venda e Negociação Comercial",                         "name_en" => "Curso Técnico Superior Profissional de Venda e Negociação Comercial",                        "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4534",   "name_pt" => "Curso Técnico Superior Profissional de Gestão da Qualidade",                                  "name_en" => "Curso Técnico Superior Profissional de Gestão da Qualidade",                                 "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4538",   "name_pt" => "Curso Técnico Superior Profissional de Veículos Elétricos e Híbridos",                        "name_en" => "Curso Técnico Superior Profissional de Veículos Elétricos e Híbridos",                       "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4539",   "name_pt" => "Curso Técnico Superior Profissional de Desenvolvimento Web e Multimédia PBL",                 "name_en" => "Curso Técnico Superior Profissional de Desenvolvimento Web e Multimédia PBL",                "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4541",   "name_pt" => "Curso Técnico Superior Profissional de Apoio à Gestão",                                       "name_en" => "Curso Técnico Superior Profissional de Apoio à Gestão",                                      "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4542",   "name_pt" => "Curso Técnico Superior Profissional de Programação de Sistemas de Informação",                "name_en" => "Curso Técnico Superior Profissional de Programação de Sistemas de Informação",               "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4546",   "name_pt" => "Curso Técnico Superior Profissional de Processo Industrial",                                  "name_en" => "Curso Técnico Superior Profissional de Processo Industrial",                                 "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4547",   "name_pt" => "Curso Técnico Superior Profissional de Tecnologias Informáticas",                             "name_en" => "Curso Técnico Superior Profissional de Tecnologias Informáticas",                            "initials" => NULL,  "degree" => 5,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "4548",   "name_pt" => "Curso Técnico Superior Profissional de Construção Civil",                                     "name_en" => "Curso Técnico Superior Profissional de Construção Civil",                                    "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4555",   "name_pt" => "Curso Técnico Superior Profissional de Produção de Construções Metálicas",                    "name_en" => "Curso Técnico Superior Profissional de Produção de Construções Metálicas",                   "initials" => NULL,  "degree" => 5,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "4558",   "name_pt" => "Curso Técnico Superior Profissional de Cibersegurança e Redes Informáticas",                  "name_en" => "Curso Técnico Superior Profissional de Cibersegurança e Redes Informáticas",                 "initials" => NULL,  "degree" => 5,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "4559",   "name_pt" => "Curso Técnico Superior Profissional de Análise de Dados e Estudos de Mercado",                "name_en" => "Curso Técnico Superior Profissional de Análise de Dados e Estudos de Mercado",               "initials" => NULL,  "degree" => 5,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "4707",   "name_pt" => "Curso Técnico Superior Profissional de Automação, Robótica e Manutenção Industrial",          "name_en" => "Curso Técnico Superior Profissional de Automação, Robótica e Manutenção Industrial",         "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4713",   "name_pt" => "Curso Técnico Superior Profissional de Gestão dos Negócios Internacionais",                   "name_en" => "Curso Técnico Superior Profissional de Gestão dos Negócios Internacionais",                  "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4715",   "name_pt" => "Curso Técnico Superior Profissional de Programação de Sistemas de Informação",                "name_en" => "Curso Técnico Superior Profissional de Programação de Sistemas de Informação",               "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4716",   "name_pt" => "Curso Técnico Superior Profissional de Projeto de Moldes",                                    "name_en" => "Curso Técnico Superior Profissional de Projeto de Moldes",                                   "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4718",   "name_pt" => "Curso Técnico Superior Profissional de Serviços Jurídicos",                                   "name_en" => "Curso Técnico Superior Profissional de Serviços Jurídicos",                                  "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4720",   "name_pt" => "Curso Técnico Superior Profissional de Tecnologia Automóvel",                                 "name_en" => "Curso Técnico Superior Profissional de Tecnologia Automóvel",                                "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4745",   "name_pt" => "Curso Técnico Superior Profissional de Gestão e Tecnologias Avançadas em Recursos Minerais",  "name_en" => "Curso Técnico Superior Profissional de Gestão e Tecnologias Avançadas em Recursos Minerais", "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "4755",   "name_pt" => "Curso Técnico Superior Profissional de Produção de Construções Metálicas",                    "name_en" => "Curso Técnico Superior Profissional de Produção de Construções Metálicas",                   "initials" => NULL,  "degree" => 5,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "6358",   "name_pt" => "Mestrado em Engenharia Eletrotécnica",                                                        "name_en" => "Mestrado em Engenharia Eletrotécnica",                                                       "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "6848",   "name_pt" => "Mestrado em Controlo de Gestão",                                                              "name_en" => "Mestrado em Controlo de Gestão",                                                             "initials" => NULL,  "degree" => 7,      "num_years" => 2],
            [ "school_id" => $estg_school_id,   "code" => "8015",   "name_pt" => "Licenciatura em Solicitadoria",                                                               "name_en" => "Licenciatura em Solicitadoria",                                                              "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9002",   "name_pt" => "Licenciatura em Administração Pública",                                                       "name_en" => "Licenciatura em Administração Pública",                                                      "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9089",   "name_pt" => "Licenciatura em Engenharia Civil",                                                            "name_en" => "Licenciatura em Engenharia Civil",                                                           "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9104",   "name_pt" => "Licenciatura em Engenharia e Gestão Industrial",                                              "name_en" => "Licenciatura em Engenharia e Gestão Industrial",                                             "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9112",   "name_pt" => "Licenciatura em Engenharia Eletrotécnica e de Computadores",                                  "name_en" => "Licenciatura em Engenharia Eletrotécnica e de Computadores",                                 "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9119",   "name_pt" => "Licenciatura em Engenharia Informática",                                                      "name_en" => "Licenciatura em Engenharia Informática",                                                     "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9123",   "name_pt" => "Licenciatura em Engenharia Mecânica",                                                         "name_en" => "Licenciatura em Engenharia Mecânica",                                                        "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9147",   "name_pt" => "Licenciatura em Gestão",                                                                      "name_en" => "Licenciatura em Gestão",                                                                     "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9205",   "name_pt" => "Licenciatura em Marketing",                                                                   "name_en" => "Licenciatura em Marketing",                                                                  "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9242",   "name_pt" => "Licenciatura em Solicitadoria",                                                               "name_en" => "Licenciatura em Solicitadoria",                                                              "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9295",   "name_pt" => "Mestrado em Gestão",                                                                          "name_en" => "Mestrado em Gestão",                                                                         "initials" => NULL,  "degree" => 7,      "num_years" => 1],
            [ "school_id" => $estg_school_id,   "code" => "627",    "name_pt" => "Licenciatura em Contabilidade e Finanças",                                                    "name_en" => "Licenciatura em Contabilidade e Finanças",                                                   "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9648",   "name_pt" => "Licenciatura em Engenharia da Energia e do Ambiente",                                         "name_en" => "Licenciatura em Engenharia da Energia e do Ambiente",                                        "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9690",   "name_pt" => "Licenciatura em Biomecânica",                                                                 "name_en" => "Licenciatura em Biomecânica",                                                                "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9741",   "name_pt" => "Licenciatura em Engenharia Automóvel",                                                        "name_en" => "Licenciatura em Engenharia Automóvel",                                                       "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9885",   "name_pt" => "Licenciatura em Engenharia Informática",                                                      "name_en" => "Licenciatura em Engenharia Informática",                                                     "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9886",   "name_pt" => "Licenciatura em Engenharia Mecânica",                                                         "name_en" => "Licenciatura em Engenharia Mecânica",                                                        "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9991",   "name_pt" => "Licenciatura em Gestão",                                                                      "name_en" => "Licenciatura em Gestão",                                                                     "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9998",   "name_pt" => "Licenciatura em Engenharia Eletrotécnica e de Computadores",                                  "name_en" => "Licenciatura em Engenharia Eletrotécnica e de Computadores",                                 "initials" => NULL,  "degree" => 6,      "num_years" => 3],
            [ "school_id" => $estg_school_id,   "code" => "9871",   "name_pt" => "Licenciatura em Contabilidade e Finanças",                                                    "name_en" => "Licenciatura em Contabilidade e Finanças",                                                   "initials" => NULL,  "degree" => 6,      "num_years" => 1],
        ];

        $year2122_id = AcademicYear::where('code', '202122')->first()->id;
        foreach ($courses as $course) {
            $newCourse = new Course($course);
            $newCourse->save();

            $newCourse->academicYears()->attach($year2122_id);
        }


        $branches = [
            ["couse_id" => 1,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 2,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 3,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 4,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 5,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 6,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 7,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 8,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 9,   "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 10,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 11,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 12,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 13,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 14,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 15,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 16,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 17,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 18,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 19,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 20,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 21,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 22,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 23,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 24,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 25,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 26,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 27,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 28,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 29,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 30,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 31,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 32,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 33,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 34,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 35,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 36,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 37,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 38,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 39,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 40,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 41,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 42,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 43,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 44,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 45,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 46,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 47,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 48,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 49,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 50,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 51,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 52,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 53,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 54,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 55,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 56,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 57,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 58,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 59,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 60,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 61,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 62,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 63,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 64,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 65,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 66,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 67,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 68,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 69,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 70,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 71,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 72,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 73,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 74,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 75,  "name_pt" => "Tronco Comum",                "name_en" => "Common Branch",           "initials_pt" => "TComum",      "initials_en" => "CommonB" ],
            ["couse_id" => 61,  "name_pt" => "Sistemas de Informação",      "name_en" => "Information Systems",     "initials_pt" => "SI",          "initials_en" => "IS",     ],
            ["couse_id" => 61,  "name_pt" => "Tecnologias de Informação",   "name_en" => "Information technology",  "initials_pt" => "TI",          "initials_en" => "IT",     ],
            ["couse_id" => 71,  "name_pt" => "Sistemas de Informação",      "name_en" => "Information Systems",     "initials_pt" => "SI",          "initials_en" => "IS",     ],
            ["couse_id" => 71,  "name_pt" => "Tecnologias de Informação",   "name_en" => "Information technology",  "initials_pt" => "TI",          "initials_en" => "IT",     ],
        ];

        foreach ($branches as $branch) {
            $newBranch = new Branch($branch);
            $newBranch->save();
        }




    }
}
