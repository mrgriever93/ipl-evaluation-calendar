import React from 'react';
import {Navigate, Route, Routes} from 'react-router';
import List from './list';
import New from './new';
import Methods from './methods';

const UnidadeCurricular = ({match}) => (
    <Routes>
        <Route path={`/novo`} exact element={<New />}/>
        <Route path={`/:id(\\d+)`} exact element={() => <b>Not found</b>}/>
        <Route path={`/edit/:id(\\d+)`} exact element={<New />}/>
        <Route path={`/:id(\\d+)/metodos`} exact element={<Methods />}/>
        <Route path={`/`} exact element={<List />}/>
        <Route path={`/*`} element={<Navigate replace to="/404"/>}/>
    </Routes>
);

export default UnidadeCurricular;
