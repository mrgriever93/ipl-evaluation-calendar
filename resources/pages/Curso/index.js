import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import List from './list';
import Detail from './detail';

const Curso = ({ match }) => (
  <Routes>
    <Route path={`${match.path}/:id(\\d+)`} exact component={Detail} />
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/*`} component={List} element={<Navigate replace to="/404" />} />
  </Routes>
);

export default Curso;
