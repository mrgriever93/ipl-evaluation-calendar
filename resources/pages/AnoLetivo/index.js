import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import List from './list';

const AnoLetivo = ({ match }) => (
  <Switch>
    <Route path={`${match.path}/`} exact component={List} />
    <Route path={`${match.path}/*`} component={List}>
      <Redirect to="/404" />
    </Route>
  </Switch>
);

export default AnoLetivo;
