import { useRoutes, Navigate } from "react-router-dom";
import React from "react";

import Login from './pages/Auth/Login';
import NotFoundPage from './pages/NotFound';
import NoPermissionsPage from './pages/NoPermissions';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

// Calendar pages
import CalendarList from './pages/Calendario/list';
import CalendarNew from './pages/Calendario/new';
import CalendarDetail from './pages/Calendario/calendar';
import PhasesNew from './pages/Calendario/Phases/new';
import PhasesList from './pages/Calendario/Phases/list';
// Curso Pages
import CursoList from './pages/Curso/list';
import CursoDetail from './pages/Curso/detail';
//Idioma Pages
import Idioma from './pages/Idioma';
import IdiomaNew from './pages/Idioma/new';
import IdiomaList from './pages/Idioma/list';
//Utilizador Pages
import Utilizador from './pages/Utilizador';
import UtilizadorDetail from './pages/Utilizador/edit';
import UtilizadorList from './pages/Utilizador/list';
//Interrupacao Pages
import Interrupcao from './pages/Interrupcao';
import InterrupcaoNew from './pages/Interrupcao/new';
import InterrupcaoList from './pages/Interrupcao/list';
//TipoAvaliacao Pages
import TipoAvaliacao from './pages/TipoAvaliacao';
import TipoAvaliacaoNew from './pages/TipoAvaliacao/new';
import TipoAvaliacaoList from './pages/TipoAvaliacao/list';
//GrupoUtilizador Pages
import GrupoUtilizador from './pages/GrupoUtilizador';
import GrupoUtilizadorNew from './pages/GrupoUtilizador/new';
import GrupoUtilizadorList from './pages/GrupoUtilizador/list';
//Permissoes Pages
import Permissoes from './pages/Permissoes';
//AgrupamentoUnidadeCurricular Pages
import AgrupamentoUnidadeCurricular from './pages/AgrupamentoUnidadeCurricular';
import AgrupamentoUnidadeCurricularList from './pages/AgrupamentoUnidadeCurricular/list';
import AgrupamentoUnidadeCurricularNew from './pages/AgrupamentoUnidadeCurricular/new';
import AgrupamentoUnidadeCurricularMethods from './pages/AgrupamentoUnidadeCurricular/methods';
//UnidadeCurricular Pages
import UnidadeCurricular from './pages/UnidadeCurricular';
import UnidadeCurricularList from './pages/UnidadeCurricular/list';
import UnidadeCurricularNew from './pages/UnidadeCurricular/new';
import UnidadeCurricularMethods from './pages/UnidadeCurricular/methods';
//AnoLetivo Pages
import AnoLetivo from './pages/AnoLetivo';
//Escola Pages
import Escola from './pages/Escola';
import EscolaNew from './pages/Escola/new';
import EscolaList from './pages/Escola/list';

//auth and roles
import {useComponentIfAuthorized} from "./components/ShowComponentIfAuthorized";
import {
    ACADEMIC_YEAR_SCOPES,
    CALENDAR_PHASES_SCOPES,
    COURSE_SCOPES, COURSE_UNIT_SCOPES, EVALUATION_TYPE_SCOPES, INTERRUPTION_TYPES_SCOPES,
    LANGUAGE_SCOPES, PERMISSIONS_SCOPES,
    SCHOOLS_SCOPES, USER_GROUPS_SCOPES, USER_SCOPES
} from "./utils/scopesConstants";

const isAuthorized = useComponentIfAuthorized([
    ...ACADEMIC_YEAR_SCOPES,
    ...SCHOOLS_SCOPES,
    ...COURSE_SCOPES,
    ...LANGUAGE_SCOPES,
    ...CALENDAR_PHASES_SCOPES,
    ...INTERRUPTION_TYPES_SCOPES,
    ...EVALUATION_TYPE_SCOPES,
    ...USER_GROUPS_SCOPES,
    ...USER_SCOPES,
    ...PERMISSIONS_SCOPES,
    ...COURSE_UNIT_SCOPES,
], true);

const RouterList = (isLoggedIn) => {
    return useRoutes([
        {
            element: isLoggedIn ? <Dashboard /> : <Navigate to="/no-permissions" />,
            children: [
                { path:"/", exact: true, element: <CalendarList /> },
                { path:"/about", exact:true, element:<About />},
                {
                    path:"/calendario",
                    children: [
                        { path: 'novo', exact: true, element: <CalendarNew />},
                        {
                            path: 'fases',
                            children: [
                                { path: 'novo', exact: true, element: <PhasesNew />},
                                { path: 'edit/:id', exact: true, element: <PhasesNew /> },
                                { path: '', exact: true, element: <PhasesList />},
                                { path: '*', element: <NotFoundPage />}
                            ],
                        },
                        { path: ':id', exact: true, element: <CalendarDetail />},
                        { path: '', exact: true, element: <CalendarList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path:"/curso",
                    children: [
                        { path: ':id', exact: true, element: <CursoDetail />},
                        { path: '', exact: true, element: <CursoList /> },
                        { path: '*', element: <NotFoundPage />}
                    ]
                },
                {
                    path: "/agrupamento-unidade-curricular",
                    element: (isAuthorized.CREATE_COURSE_UNITS || isAuthorized.VIEW_COURSE_UNITS || isAuthorized.EDIT_COURSE_UNITS || isAuthorized.DELETE_COURSE_UNITS) ? <AgrupamentoUnidadeCurricular /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <AgrupamentoUnidadeCurricularNew />},
                        { path: 'edit/:id', exact: true, element: <AgrupamentoUnidadeCurricularNew />},
                        { path: ':id/metodos', exact: true, element: <AgrupamentoUnidadeCurricularMethods />},
                        { path: '', exact: true, element: <AgrupamentoUnidadeCurricularList /> },
                        { path: '*', element: <NotFoundPage />}
                    ]
                },
                {
                    path: "/unidade-curricular",
                    element: (isAuthorized.CREATE_COURSE_UNITS || isAuthorized.VIEW_COURSE_UNITS || isAuthorized.EDIT_COURSE_UNITS || isAuthorized.DELETE_COURSE_UNITS) ? <UnidadeCurricular /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <UnidadeCurricularNew />},
                        { path: ':id', exact: true, element: <UnidadeCurricularNew />},
                        { path: 'edit/:id', exact: true, element: <UnidadeCurricularNew />},
                        { path: ':id/metodos', exact: true, element: <UnidadeCurricularMethods />},
                        { path: '', exact: true, element: <UnidadeCurricularList /> },
                        { path: '*', element: <NotFoundPage />}
                    ]
                },
                {
                    path: "/ano-letivo",
                    element: (isAuthorized.CREATE_ACADEMIC_YEARS || isAuthorized.EDIT_ACADEMIC_YEARS || isAuthorized.DELETE_ACADEMIC_YEARS) ? <AnoLetivo /> : <Navigate to="/no-permissions" />
                },
                {
                    path: "/escola",
                    element: (isAuthorized.CREATE_SCHOOLS || isAuthorized.EDIT_SCHOOLS) ? <Escola /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <EscolaNew />},
                        { path: 'edit/:id', exact: true, element: <EscolaNew />},
                        { path: '', exact: true, element: <EscolaList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/idioma",
                    element: ( isAuthorized.CREATE_LANGUAGES || isAuthorized.EDIT_LANGUAGES || isAuthorized.TRANSLATE) ? <Idioma /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <IdiomaNew />},
                        { path: 'edit/:id', exact: true, element: <IdiomaNew />},
                        { path: '', exact: true, element: <IdiomaList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/utilizador",
                    element: (isAuthorized.EDIT_USERS || isAuthorized.LOCK_USERS) ? <Utilizador /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'edit/:id', exact: true, element: <UtilizadorDetail />},
                        { path: '', exact: true, element: <UtilizadorList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/interrupcao",
                    element: (isAuthorized.CREATE_INTERRUPTION_TYPES || isAuthorized.EDIT_INTERRUPTION_TYPES || isAuthorized.DELETE_INTERRUPTION_TYPES) ? <Interrupcao /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <InterrupcaoNew />},
                        { path: 'edit/:id', exact: true, element: <InterrupcaoNew />},
                        { path: '', exact: true, element: <InterrupcaoList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/tipo-avaliacao",
                    element: (isAuthorized.CREATE_EVALUATION_TYPES || isAuthorized.EDIT_EVALUATION_TYPES || isAuthorized.DELETE_EVALUATION_TYPES) ? <TipoAvaliacao /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <TipoAvaliacaoNew />},
                        { path: 'edit/:id', exact: true, element: <TipoAvaliacaoNew />},
                        { path: '', exact: true, element: <TipoAvaliacaoList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/grupo-utilizador",
                    element: (isAuthorized.EDIT_USER_GROUPS || isAuthorized.CREATE_USER_GROUPS || isAuthorized.DELETE_USER_GROUPS) ? <GrupoUtilizador /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'novo', exact: true, element: <GrupoUtilizadorNew />},
                        { path: 'edit/:id', exact: true, element: <GrupoUtilizadorNew />},
                        { path: '', exact: true, element: <GrupoUtilizadorList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/permissoes",
                    element: (isAuthorized.CHANGE_PERMISSIONS) ? <Permissoes /> : <Navigate to="/no-permissions" />,
                },
            ],
        },
        { path: "/login", element: <Login /> },
        { path: "/404", element: <NotFoundPage /> },
        { path: "/no-permissions", element: <NoPermissionsPage /> },
        { path: "*", element: <NotFoundPage /> },
    ]);
}

export default RouterList;
