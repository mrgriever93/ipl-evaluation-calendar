import React from 'react';
import {Navigate, Route, Routes} from 'react-router';
import List from './list';
import New from './new';
import Phases from './phases';
import Calendar from './calendar';

const Calendario = ({match}) => {
    console.log("calendario");
    return (
        <Routes>
            <Route path={`/novo`} exact element={<New/>}/>
            <Route path={`/fases`} element={<Phases/>}/>
            <Route path={`/:id(\\d+)`} exact element={<Calendar/>}/>
            <Route path={`/`} exact element={<List/>}/>
            <Route path={`/*`} element={<Navigate replace to="/404"/>}/>
        </Routes>
    );
};

export default Calendario;
