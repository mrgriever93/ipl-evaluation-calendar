import React, {useState} from 'react';
import {Link, Navigate, Route, Routes, useLocation,} from 'react-router-dom';
import {
    Container,
    Grid,
    Header,
    Icon,
    Segment,
} from 'semantic-ui-react';
import {createGlobalStyle} from 'styled-components';
import HeaderMenu from '../../components/Menu';
import AnoLetivo from '../AnoLetivo';
import Escola from '../Escola';
import Calendar from '../Calendario';
import Curso from '../Curso';
import Idioma from '../Idioma';
import Utilizador from '../Utilizador';
import Interrupacao from '../Interrupcao';
import TipoAvaliacao from '../TipoAvaliacao';
import GrupoUtilizador from '../GrupoUtilizador';
import Permissoes from '../Permissoes';

import About from '../About';
import CalendarList from '../Calendario/list';

import AgrupamentoUnidadeCurricular from '../AgrupamentoUnidadeCurricular';
import UnidadeCurricular from '../UnidadeCurricular';
import {useComponentIfAuthorized} from '../../components/ShowComponentIfAuthorized';
import {
    ACADEMIC_YEAR_SCOPES,
    CALENDAR_PHASES_SCOPES,
    COURSE_SCOPES,
    COURSE_UNIT_SCOPES,
    EVALUATION_TYPE_SCOPES,
    INTERRUPTION_TYPES_SCOPES,
    LANGUAGE_SCOPES,
    PERMISSIONS_SCOPES,
    SCHOOLS_SCOPES,
    USER_GROUPS_SCOPES,
    USER_SCOPES,
} from '../../utils/scopesConstants';

const GlobalStyle = createGlobalStyle`
.resize-container {
  min-height: calc(100vh - 330px);
}
.footer {
  height: 223px;
}
`;

const DashboardPage = () => {
    const location = useLocation();
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
    return (
        <div>
            <GlobalStyle/>
            <HeaderMenu/>
            <Container className="resize-container" fluid={location.pathname.includes('/permissoes')}>
                <Routes>
                    <Route path="/" exact element={<CalendarList />} />
                    <Route path="/about" exact element={<About />} />
                    <Route path="/calendario" element={<Calendar />}/>
                    {
                        (isAuthorized.CREATE_COURSE_UNITS || isAuthorized.VIEW_COURSE_UNITS || isAuthorized.EDIT_COURSE_UNITS || isAuthorized.DELETE_COURSE_UNITS)
                        && <Route path="/agrupamento-unidade-curricular" element={<AgrupamentoUnidadeCurricular />} />
                    }
                    {
                        (isAuthorized.CREATE_COURSE_UNITS || isAuthorized.VIEW_COURSE_UNITS || isAuthorized.EDIT_COURSE_UNITS || isAuthorized.DELETE_COURSE_UNITS)
                        && <Route path="/unidade-curricular" element={<UnidadeCurricular />} />
                    }
                    <Route path="/curso" element={<Curso />}/>
                    {
                        (isAuthorized.CREATE_ACADEMIC_YEARS || isAuthorized.EDIT_ACADEMIC_YEARS || isAuthorized.DELETE_ACADEMIC_YEARS)
                        && <Route path="/ano-letivo" element={<AnoLetivo />}/>
                    }
                    {
                        (isAuthorized.CREATE_SCHOOLS || isAuthorized.EDIT_SCHOOLS)
                        && <Route path="/escola" element={<Escola />}/>
                    }
                    {
                        ( isAuthorized.CREATE_LANGUAGES || isAuthorized.EDIT_LANGUAGES || isAuthorized.TRANSLATE)
                        && <Route path="/idioma" element={<Idioma />}/>
                    }
                    {
                        (isAuthorized.EDIT_USERS || isAuthorized.LOCK_USERS)
                        && <Route path="/utilizador" element={<Utilizador />}/>
                    }
                    {
                        (isAuthorized.CREATE_INTERRUPTION_TYPES || isAuthorized.EDIT_INTERRUPTION_TYPES || isAuthorized.DELETE_INTERRUPTION_TYPES)
                        && <Route path="/interrupcao" element={<Interrupacao />}/>
                    }
                    {
                        (isAuthorized.CREATE_EVALUATION_TYPES || isAuthorized.EDIT_EVALUATION_TYPES || isAuthorized.DELETE_EVALUATION_TYPES)
                        && <Route path="/tipo-avaliacao" element={<TipoAvaliacao />}/>
                    }
                    {
                        (isAuthorized.EDIT_USER_GROUPS || isAuthorized.CREATE_USER_GROUPS || isAuthorized.DELETE_USER_GROUPS)
                        && <Route path="/grupo-utilizador" element={<GrupoUtilizador />}/>
                    }
                    {
                        (isAuthorized.CHANGE_PERMISSIONS)
                        && <Route path="/permissoes" element={<Permissoes />}/>
                    }
                    <Route path="*" element={<Navigate replace to="/404"/>} />
                </Routes>
            </Container>
        </div>
    );
};

export default DashboardPage;
