import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import List from './list';
import New from './new';
import Phases from './phases';
import Calendar from './calendar';

const Calendario = ({ match }) => (
  <Switch>
    <Route path={`${match.path}/novo`} exact component={New} />
    <Route path={`${match.path}/fases`} component={Phases} />
    <Route
      path={`${match.path}/:id(\\d+)`}
      exact
      component={Calendar}
    />
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/*`} component={List}>
      <Redirect to="/404" />
    </Route>
  </Switch>
);

export default Calendario;
