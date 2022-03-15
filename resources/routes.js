import { useRoutes, Navigate } from "react-router-dom";
import React from "react";

import Login from './pages/Auth/Login';
import NotFoundPage from './pages/NotFound';
import Dashboard from './pages/Dashboard';

import AnoLetivo from './pages/AnoLetivo';
import Escola from './pages/Escola';
import Calendar from './pages/Calendario';
import Curso from './pages/Curso';
import Idioma from './pages/Idioma';
import Utilizador from './pages/Utilizador';
import Interrupacao from './pages/Interrupcao';
import TipoAvaliacao from './pages/TipoAvaliacao';
import GrupoUtilizador from './pages/GrupoUtilizador';
import Permissoes from './pages/Permissoes';

import About from './pages/About';
import CalendarList from './pages/Calendario/list';

import AgrupamentoUnidadeCurricular from './pages/AgrupamentoUnidadeCurricular';
import UnidadeCurricular from './pages/UnidadeCurricular';

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
            element: isLoggedIn ? <Dashboard /> : <Navigate to="/login" />,
            children: [
                { path:"/", exact: true, element: <CalendarList /> },
                { path:"/about", exact:true, element:<About />},
                { path:"/calendario",  element:<Calendar />},
                { path:"/curso",  element:<Curso />},
                {
                    path: "/agrupamento-unidade-curricular",
                    element: (isAuthorized.CREATE_COURSE_UNITS || isAuthorized.VIEW_COURSE_UNITS || isAuthorized.EDIT_COURSE_UNITS || isAuthorized.DELETE_COURSE_UNITS) ? <AgrupamentoUnidadeCurricular /> : <Navigate to="/login" />
                },
                {
                    path: "/unidade-curricular",
                    element: (isAuthorized.CREATE_COURSE_UNITS || isAuthorized.VIEW_COURSE_UNITS || isAuthorized.EDIT_COURSE_UNITS || isAuthorized.DELETE_COURSE_UNITS) ? <UnidadeCurricular /> : <Navigate to="/login" />
                },
                {
                    path: "/ano-letivo",
                    element: (isAuthorized.CREATE_ACADEMIC_YEARS || isAuthorized.EDIT_ACADEMIC_YEARS || isAuthorized.DELETE_ACADEMIC_YEARS) ? <AnoLetivo /> : <Navigate to="/login" />
                },
                {
                    path: "/escola",
                    element: (isAuthorized.CREATE_SCHOOLS || isAuthorized.EDIT_SCHOOLS) ? <Escola /> : <Navigate to="/login" />
                },
                {
                    path: "/idioma",
                    element: ( isAuthorized.CREATE_LANGUAGES || isAuthorized.EDIT_LANGUAGES || isAuthorized.TRANSLATE) ? <Idioma /> : <Navigate to="/login" />
                },
                {
                    path: "/utilizador",
                    element: (isAuthorized.EDIT_USERS || isAuthorized.LOCK_USERS) ? <Utilizador /> : <Navigate to="/login" />
                },
                {
                    path: "/interrupcao",
                    element: (isAuthorized.CREATE_INTERRUPTION_TYPES || isAuthorized.EDIT_INTERRUPTION_TYPES || isAuthorized.DELETE_INTERRUPTION_TYPES) ? <Interrupacao /> : <Navigate to="/login" />
                },
                {
                    path: "/tipo-avaliacao",
                    element: (isAuthorized.CREATE_EVALUATION_TYPES || isAuthorized.EDIT_EVALUATION_TYPES || isAuthorized.DELETE_EVALUATION_TYPES) ? <TipoAvaliacao /> : <Navigate to="/login" />
                },
                {
                    path: "/grupo-utilizador",
                    element: (isAuthorized.EDIT_USER_GROUPS || isAuthorized.CREATE_USER_GROUPS || isAuthorized.DELETE_USER_GROUPS) ? <GrupoUtilizador /> : <Navigate to="/login" />
                },
                {
                    path: "/permissoes",
                    element: (isAuthorized.CHANGE_PERMISSIONS) ? <Permissoes /> : <Navigate to="/login" />
                },
            ],
        },
        { path: "/login", element: <Login /> },
        { path: "/404", element: <NotFoundPage /> },
        { path: "*", element: <NotFoundPage /> },
    ]);
}

export default RouterList;
