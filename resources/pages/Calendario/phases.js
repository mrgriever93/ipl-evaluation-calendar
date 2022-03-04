import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import List from './Phases/list';
import New from './Phases/new';

const Phases = ({ match }) => (
  <Switch>
    <Route path={`${match.path}/novo`} exact component={New} />
    <Route path={`${match.path}/edit/:id`} component={New} />
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/*`} component={List}>
      <Redirect to="/404" />
    </Route>
  </Switch>
);

export default Phases;
