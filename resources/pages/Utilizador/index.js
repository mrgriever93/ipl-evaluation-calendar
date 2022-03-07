import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import List from './list';
import Edit from './edit';

const Utilizador = ({ match }) => (
  <Routes>
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/edit/:id`} exact component={Edit} />
    <Route path={`${match.path}/*`} component={List} element={<Navigate replace to="/404" />} />
  </Routes>
);

export default Utilizador;
