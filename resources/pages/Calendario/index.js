import React from 'react';
import {Navigate, Route, Routes} from 'react-router';
import List from './list';
import New from './new';
import Phases from './phases';
import Calendar from './calendar';

const Calendario = ({match}) => (
    <Routes>
        <Route path={`${match.path}/novo`} exact element={<New />}/>
        <Route path={`${match.path}/fases`} element={<Phases />}/>
        <Route path={`${match.path}/:id(\\d+)`} exact element={<Calendar />}/>
        <Route path={`${match.path}/`} exact element={<List />}/>
        <Route path={`${match.path}/*`} element={<Navigate replace to="/404"/>}/>
    </Routes>
);

export default Calendario;
