import React, {useState} from 'react';
import {Outlet, useLocation,} from 'react-router-dom';
import {
    Container,
    Grid,
    Header,
    Icon,
    Segment,
} from 'semantic-ui-react';
import {createGlobalStyle} from 'styled-components';
import HeaderMenu from '../../components/Menu';

const GlobalStyle = createGlobalStyle`
.resize-container {
  min-height: calc(100vh - 330px);
}
.footer {
  height: 223px;
}
`;

const DashboardPage = () => {
    const location = useLocation();

    return (
        <div>
            <GlobalStyle/>
            <HeaderMenu/>
            <Container className="resize-container" fluid={location.pathname.includes('/permissoes')}>
                <Outlet />
            </Container>
        </div>
    );
};

export default DashboardPage;
