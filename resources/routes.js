import { useRoutes, Navigate } from "react-router-dom";
import React, {lazy} from "react";

import Login from './pages/Auth/Login';
import NotFoundPage from './pages/NotFound';
import NoPermissionsPage from './pages/NoPermissions';
import Layout from './pages/Layout';
import About from './pages/About';

// Calendar pages

const CalendarList = lazy(() => import('./pages/Calendario/list'));
const CalendarNew = lazy(() => import('./pages/Calendario/new'));
const CalendarDetail = lazy(() => import('./pages/Calendario/calendar'));
const PhasesNew = lazy(() => import('./pages/Calendario/Phases/new'));
const PhasesList = lazy(() => import('./pages/Calendario/Phases/list'));
    // Curso Pages
const CursoList = lazy(() => import('./pages/Curso/list'));
const CursoDetail = lazy(() => import('./pages/Curso/detail'));
    //Utilizador Pages
const Utilizador = lazy(() => import('./pages/Utilizador'));
const UtilizadorDetail = lazy(() => import('./pages/Utilizador/edit'));
const UtilizadorList = lazy(() => import('./pages/Utilizador/list'));
    //Interrupacao Pages
const Interrupcao = lazy(() => import('./pages/TipoInterrupcao'));
const InterrupcaoNew = lazy(() => import('./pages/TipoInterrupcao/new'));
const InterrupcaoList = lazy(() => import('./pages/TipoInterrupcao/list'));
    //TipoAvaliacao Pages
const TipoAvaliacao = lazy(() => import('./pages/TipoAvaliacao'));
const TipoAvaliacaoNew = lazy(() => import('./pages/TipoAvaliacao/new'));
const TipoAvaliacaoList = lazy(() => import('./pages/TipoAvaliacao/list'));
    //GrupoUtilizador Pages
const GrupoUtilizador = lazy(() => import('./pages/GrupoUtilizador'));
const GrupoUtilizadorNew = lazy(() => import('./pages/GrupoUtilizador/new'));
const GrupoUtilizadorList = lazy(() => import('./pages/GrupoUtilizador/list'));
    //Permissoes Pages
// const Permissoes = lazy(() => import('./pages/Permissoes'));
    //AgrupamentoUnidadeCurricular Pages
const AgrupamentoUnidadeCurricular = lazy(() => import('./pages/AgrupamentoUnidadeCurricular'));
const AgrupamentoUnidadeCurricularList = lazy(() => import('./pages/AgrupamentoUnidadeCurricular/list'));
const AgrupamentoUnidadeCurricularNew = lazy(() => import('./pages/AgrupamentoUnidadeCurricular/new'));
const AgrupamentoUnidadeCurricularMethods = lazy(() => import('./pages/AgrupamentoUnidadeCurricular/methods'));
    //UnidadeCurricular Pages
const UnidadeCurricular = lazy(() => import('./pages/UnidadeCurricular'));
const UnidadeCurricularList = lazy(() => import('./pages/UnidadeCurricular/list'));
const UnidadeCurricularNew = lazy(() => import('./pages/UnidadeCurricular/new'));
const UnidadeCurricularMethods = lazy(() => import('./pages/UnidadeCurricular/methods'));
    //AnoLetivo Pages
const AnoLetivo = lazy(() => import('./pages/AnoLetivo'));
    //Escola Pages
const Escola = lazy(() => import('./pages/Escola'));
const EscolaNew = lazy(() => import('./pages/Escola/new'));
const EscolaList = lazy(() => import('./pages/Escola/list'));

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
            element: isLoggedIn ? <Layout /> : <Navigate to="/no-permissions" />,
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
                    path: "/utilizador",
                    element: (isAuthorized.EDIT_USERS || isAuthorized.LOCK_USERS) ? <Utilizador /> : <Navigate to="/no-permissions" />,
                    children: [
                        { path: 'edit/:id', exact: true, element: <UtilizadorDetail />},
                        { path: '', exact: true, element: <UtilizadorList />},
                        { path: '*', element: <NotFoundPage />}
                    ],
                },
                {
                    path: "/tipo-interrupcao",
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
                // {
                //     path: "/permissoes",
                //     element: (isAuthorized.CHANGE_PERMISSIONS) ? <Permissoes /> : <Navigate to="/no-permissions" />,
                // },
            ],
        },
        { path: "/login", element: <Login /> },
        { path: "/404", element: <NotFoundPage /> },
        { path: "/no-permissions", element: <NoPermissionsPage /> },
        { path: "*", element: <NotFoundPage /> },
    ]);
}

export default RouterList;
