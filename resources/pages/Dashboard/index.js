import React, { useState } from 'react';
import {
  Link,
  Navigate, Route, Routes, useLocation,
} from 'react-router-dom';
import {
  Container,
  Grid,
  Header,
  Icon,
  Segment,
} from 'semantic-ui-react';
import { createGlobalStyle } from 'styled-components';
import HeaderMenu from '../../components/Menu';
import AnoLetivo from '../AnoLetivo';
import Escola from '../Escola';
import Calendario from '../Calendario';
import Curso from '../Curso';
import Idioma from '../Idioma';
import Utilizador from '../Utilizador';
import Interrupacao from '../Interrupcao';
import TipoAvaliacao from '../TipoAvaliacao';
import GrupoUtilizador from '../GrupoUtilizador';
import Permissoes from '../Permissoes';

import AgrupamentoUnidadeCurricular from '../AgrupamentoUnidadeCurricular';
import UnidadeCurricular from '../UnidadeCurricular';
import { useComponentIfAuthorized } from '../../components/ShowComponentIfAuthorized';
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
      <GlobalStyle />
      <HeaderMenu />
      <Container className="resize-container" fluid={location.pathname.includes('/permissoes')}>
        <Routes>
          <Route path="/calendario" component={Calendario} />
          {
            (isAuthorized.CREATE_COURSE_UNITS
              || isAuthorized.VIEW_COURSE_UNITS
            || isAuthorized.EDIT_COURSE_UNITS
            || isAuthorized.DELETE_COURSE_UNITS)
            && (
            <Route
              path="/agrupamento-unidade-curricular"
              component={AgrupamentoUnidadeCurricular}
            />
            )
}
          {
               (isAuthorized.CREATE_COURSE_UNITS
                || isAuthorized.VIEW_COURSE_UNITS
                || isAuthorized.EDIT_COURSE_UNITS
                || isAuthorized.DELETE_COURSE_UNITS)
                && (
                <Route
                  path="/unidade-curricular"
                  component={UnidadeCurricular}
                />
                )
              }

          {
            true && <Route path="/curso" component={Curso} />
          }
          {
            (isAuthorized.CREATE_ACADEMIC_YEARS
            || isAuthorized.EDIT_ACADEMIC_YEARS
            || isAuthorized.DELETE_ACADEMIC_YEARS)
            && <Route path="/ano-letivo" component={AnoLetivo} />
          }
          {
            (isAuthorized.CREATE_SCHOOLS
              || isAuthorized.EDIT_SCHOOLS)
            && <Route path="/escola" component={Escola} />
          }
          {
            false && (
              isAuthorized.CREATE_LANGUAGES
              || isAuthorized.EDIT_LANGUAGES
              || isAuthorized.TRANSLATE
            ) && <Route path="/idioma" component={Idioma} />
          }
          {
            (
              isAuthorized.EDIT_USERS
              || isAuthorized.LOCK_USERS
            ) && <Route path="/utilizador" component={Utilizador} />
          }
          {
            (
              isAuthorized.CREATE_INTERRUPTION_TYPES
              || isAuthorized.EDIT_INTERRUPTION_TYPES
              || isAuthorized.DELETE_INTERRUPTION_TYPES
            ) && <Route path="/interrupcao" component={Interrupacao} />
          }
          {
            (
              isAuthorized.CREATE_EVALUATION_TYPES
              || isAuthorized.EDIT_EVALUATION_TYPES
              || isAuthorized.DELETE_EVALUATION_TYPES
            ) && <Route path="/tipo-avaliacao" component={TipoAvaliacao} />
          }
          {
            (
              isAuthorized.EDIT_USER_GROUPS
              || isAuthorized.CREATE_USER_GROUPS
              || isAuthorized.DELETE_USER_GROUPS
            ) && (
            <Route
              path="/grupo-utilizador"
              component={GrupoUtilizador}
            />
            )
          }
          {
            (true || isAuthorized.CHANGE_PERMISSIONS) && <Route path="/permissoes" component={Permissoes} />
          }
          <Route path="/" exact component={Calendario}  element={<Navigate replace to="/404" />} />
        </Routes>
      </Container>
      <Segment
        className="footer"
        inverted
        vertical
        style={{ margin: '5em 0em 0em', padding: '5em 0em' }}
      >
        <Container textAlign="center">
          <Grid divided inverted stackable>
            <Grid.Column width={16}>
              <Header inverted as="h4" content="Créditos:" />

              <p>
                <Link to={{ pathname: 'https://github.com/RafaelFerreiraTVD' }} target="_blank">
                  <Icon name="github" />
                </Link>
                <Link to={{ pathname: 'https://www.linkedin.com/in/rafaelferreiratvd/' }} target="_blank">
                  <Icon name="linkedin" />
                </Link>
                {' '}
                Rafael Ferreira - 2171636
              </p>

              <p>Francisco Fernandes - 2161349</p>
            </Grid.Column>
          </Grid>
        </Container>
      </Segment>
    </div>
  );
};

export default DashboardPage;
