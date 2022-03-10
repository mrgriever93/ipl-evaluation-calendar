import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import List from './list';
import Detail from './detail';

const Curso = ({ match }) => (
  <Routes>
    <Route path={`${match.path}/:id(\\d+)`} exact element={<Detail />} />
    <Route path={`${match.path}/`} exact element={<List />} />
    <Route path={`${match.path}/*`} element={<Navigate replace to="/404" />} />
  </Routes>
);

export default Curso;
