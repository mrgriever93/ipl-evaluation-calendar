import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import List from './Phases/list';
import New from './Phases/new';

const Phases = ({ match }) => (
  <Routes>
    <Route path={`${match.path}/novo`} exact element={New} />
    <Route path={`${match.path}/edit/:id`} element={New} />
    <Route path={`${match.path}/`} exact element={List} />
    <Route path={`${match.path}/*`} element={<Navigate replace to="/404" />} />
  </Routes>
);

export default Phases;
