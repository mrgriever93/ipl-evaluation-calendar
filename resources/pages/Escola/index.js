import React from "react";
import { Redirect, Route, Switch } from "react-router";
import List from "./list";
import New from "./new";

const AnoLetivo = ({ match }) => {
    return (
        <Switch>
            <Route path={`${match.path}/novo`} exact component={New} />
            <Route path={`${match.path}/edit/:id`} component={New} />
            <Route path={`${match.path}/`} exact component={List} />
            <Route path={`${match.path}/*`} component={List}>
                <Redirect to="/404" />
            </Route>
        </Switch>
    );
};

export default AnoLetivo;
