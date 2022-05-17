import React from 'react';
import {Container, Header, Icon, Segment} from "semantic-ui-react";
import {Link} from "react-router-dom";

const About = () => {
    return (
        <Container>
            <Segment raised placeholder textAlign="center" color='green'>
                <Header as="h2" content="Créditos V3:"/>
                <p>
                    <Link to={{pathname: 'https://github.com/mrgriever93'}} target="_blank">
                        <Icon name="github"/>
                    </Link>
                    <Link to={{pathname: 'https://www.linkedin.com/in/alexandre-santos-5779429a/'}} target="_blank">
                        <Icon name="linkedin"/>
                    </Link>
                    {' '}
                    Alexandre Santos - 2181593
                </p>
                <p>
                    <Link to={{pathname: 'https://github.com/SrPatinhas'}} target="_blank">
                        <Icon name="github"/>
                    </Link>
                    <Link to={{pathname: 'https://www.linkedin.com/in/miguelcerejo/'}} target="_blank">
                        <Icon name="linkedin"/>
                    </Link>
                    {' '}
                    Miguel Cerejo - 2192779
                </p>
            </Segment>
            <Segment placeholder textAlign="center" color='red'>
                <Header as="h2" content="Créditos V2:"/>
                <p>Francisco Fernandes - 2161349</p>
                <p>
                    <Link to={{pathname: 'https://github.com/RafaelFerreiraTVD'}} target="_blank">
                        <Icon name="github"/>
                    </Link>
                    <Link to={{pathname: 'https://www.linkedin.com/in/rafaelferreiratvd/'}} target="_blank">
                        <Icon name="linkedin"/>
                    </Link>
                    {' '}
                    Rafael Ferreira - 2171636
                </p>
            </Segment>
        </Container>
    );
};

export default About;
