import React, {useEffect, useState} from 'react';
import {
    Card, Container, Table, Button, Icon, Header, Dimmer, Loader,
} from 'semantic-ui-react';
import axios from 'axios';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const List = ({match}) => {
    const [schoolList, setSchoolList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const columns = ['Código', 'Nome', 'Ações'];

    useEffect(() => {
        axios.get('schools').then((response) => {
            setIsLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setSchoolList(response?.data?.data);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container style={{marginTop: '2em'}}>
            <Card fluid>
                <Card.Content>
                    {isLoading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar as escolas</Loader>
                        </Dimmer>
                    )}
                    <Wrapper>
                        <Header as="span">
                            Escolas do Politécnico de Leiria
                        </Header>
                        <ShowComponentIfAuthorized
                            permission={[SCOPES.CREATE_SCHOOLS]}
                        >
                            <Link to="/escola/novo">
                                <Button floated="right" color="green">
                                    Novo
                                </Button>
                            </Link>
                        </ShowComponentIfAuthorized>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map((col) => (
                                    <Table.HeaderCell>{col}</Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {schoolList.map(({id, code, name}) => (
                                <Table.Row key={id}>
                                    <Table.Cell>{code}</Table.Cell>
                                    <Table.Cell>{name}</Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <ShowComponentIfAuthorized permission={[SCOPES.EDIT_SCHOOLS]}>
                                            <Link to={`/escola/edit/${id}`}>
                                                <Button color="yellow" icon>
                                                    <Icon name="edit"/>
                                                </Button>
                                            </Link>
                                        </ShowComponentIfAuthorized>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
        </Container>
    );
};

export default List;
