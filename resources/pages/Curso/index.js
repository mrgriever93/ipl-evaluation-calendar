import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import List from './list';
import Detail from './detail';

const Curso = ({ match }) => (
  <Switch>
    <Route path={`${match.path}/:id(\\d+)`} exact component={Detail} />
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/*`} component={List}>
      <Redirect to="/404" />
    </Route>
  </Switch>
);

export default Curso;
