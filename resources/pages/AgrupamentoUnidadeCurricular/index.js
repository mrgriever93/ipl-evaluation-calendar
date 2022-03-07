import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import List from './list';
import New from './new.js';
import Methods from './methods';

const AgrupamentoUnidadeCurricular = ({ match }) => (
  <Routes>
    <Route path={`${match.path}/novo`} exact component={New} />
    <Route path={`${match.path}/edit/:id`} exact component={New} />
    <Route
      path={`${match.path}/:id(\\d+)/metodos`}
      exact
      component={Methods}
    />
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/*`} component={List} element={<Navigate replace to="/404" />} />
  </Routes>
);

export default AgrupamentoUnidadeCurricular;
