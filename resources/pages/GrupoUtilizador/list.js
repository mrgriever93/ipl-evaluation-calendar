import React, {useCallback, useEffect, useState} from 'react';
import {
    Card,
    Container,
    Table,
    Form,
    Button,
    Header,
    Icon,
    Modal,
    Dimmer,
    Loader,
} from 'semantic-ui-react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-toastify';
import {successConfig} from '../../utils/toastConfig';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const columns = [
    {name: 'Descrição'},
    {name: 'Ativo?', align: 'center'},
    {name: 'Ações', align: 'center'},
];

const List = ({match}) => {
    const [filteredResults, setFilteredResults] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [userGroups, setUserGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadUserGroups = useCallback(() => {
        setIsLoading(true);
        axios.get('/user-group').then((response) => {
            setIsLoading(false);
            if (response.status === 200) {
                setUserGroups(response?.data?.data);
            }
        });
    }, []);

    useEffect(() => {
        loadUserGroups();
    }, []);

    const filterResults = useCallback(
        (searchTerm) => {
            const filtered = userGroups.filter(
                (x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())
                    || x.description.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            if (filtered.length) {
                setFilteredResults(filtered);
            }
        },
        [userGroups],
    );

    const handleModalClose = () => setModalOpen(false);

    const handleSearch = ({target: {value: searchTerm}}) => {
        filterResults(searchTerm);
    };

    const remove = (userGroup) => {
        setModalInfo(userGroup);
        setModalOpen(true);
    };

    const handleRemoval = () => {
        axios.delete(`/user-group/${modalInfo.id}`).then((res) => {
            if (res.status === 200) {
                toast('Grupo de utilizador removido com sucesso!', successConfig);
            }
            loadUserGroups();
        });
        handleModalClose();
    };

    return (
        <Container style={{marginTop: '2em'}}>
            <Card fluid>
                <Card.Content>
                    {isLoading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar os grupos</Loader>
                        </Dimmer>
                    )}
                    <Wrapper>
                        <Header as="span">Grupos de Utilizador</Header>
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_USER_GROUPS]}>
                            <Link to="/grupo-utilizador/novo">
                                <Button floated="right" color="green">
                                    Novo
                                </Button>
                            </Link>
                        </ShowComponentIfAuthorized>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group widths="2">
                            <Form.Input
                                label="Pesquisar"
                                placeholder="Pesquisar grupos de utilizador..."
                                onChange={handleSearch}
                            />
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map((col, index) => (
                                    <Table.HeaderCell
                                        key={index}
                                        textAlign={col.align}
                                    >
                                        {col.name}
                                    </Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {(filteredResults?.length
                                    ? filteredResults
                                    : userGroups
                            )?.map(
                                (
                                    {
                                        id, description, enabled, removable,
                                    },
                                    index,
                                ) => (
                                    <Table.Row key={index}>
                                        <Table.Cell>{description}</Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Icon
                                                name={!enabled ? 'close' : 'check'}
                                            />
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_USER_GROUPS]}>
                                                <Link to={`/grupo-utilizador/edit/${id}`}>
                                                    <Button color="yellow" icon>
                                                        <Icon name="edit"/>
                                                    </Button>
                                                </Link>
                                            </ShowComponentIfAuthorized>
                                            <ShowComponentIfAuthorized permission={[SCOPES.DELETE_USER_GROUPS]}>
                                                <Button
                                                    onClick={() => remove({
                                                        id,
                                                        name: description,
                                                    })}
                                                    color="red"
                                                    icon
                                                    disabled={!removable}
                                                >
                                                    <Icon name="trash"/>
                                                </Button>
                                            </ShowComponentIfAuthorized>
                                        </Table.Cell>
                                    </Table.Row>
                                ),
                            )}
                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
            <Modal
                dimmer="blurring"
                open={modalOpen}
                onClose={handleModalClose}
            >
                <Modal.Header>Remover Grupo de Utilizador</Modal.Header>
                <Modal.Content>
                    Tem a certeza que deseja remover o grupo de utilizador
                    {' '}
                    <strong>{modalInfo?.name}</strong>
                    ?
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={handleModalClose}>
                        Cancelar
                    </Button>
                    <Button positive onClick={handleRemoval}>
                        Sim
                    </Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
};

export default List;
