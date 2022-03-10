import React from 'react';
import {Navigate, Route, Routes} from 'react-router';
import List from './list';

const EvaluationType = ({ match }) => (
  <Routes>
    <Route path={`${match.path}/`} exact element={<List />} />
    <Route path={`${match.path}/*`} element={<Navigate replace to="/404" />} />
  </Routes>
);

export default EvaluationType;
