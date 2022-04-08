import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import {Card, Container, Form, Icon, Input, Table, Button, Popup, Pagination, Dimmer, Loader} from 'semantic-ui-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';

const SweetAlertComponent = withReactContent(Swal);

const List = () => {
    const [userList, setUserList] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [userGroups, setUserGroups] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState();
    const [perPage, setPerPage] = useState(10);
    const [filterGroups, setFilterGroups] = useState([]);

    const fetchUserList = useCallback((page = 1, search, groups, resultsQuant) => {
        if (search) setSearching(true);
        setLoading(true);

        let searchLink = `/users?page=${page}`;
        searchLink += `${search ? `&search=${search}` : ''}`;
        searchLink += `${groups?.length ? `&groups=${JSON.stringify(groups)}` : ''}`;
        searchLink += '&per_page=' + resultsQuant;

        axios.get(searchLink)
            .then((response) => {
                setLoading(false);
                if (search)
                    setSearching(false);
                setPaginationInfo(response.data.meta);
                setUserList(response?.data?.data);
            });
    }, []);

    const loadUsers = (evt, {activePage}) => fetchUserList(activePage);

    useEffect(() => {
        fetchUserList(1, searchTerm, filterGroups, perPage);
    }, [searchTerm, filterGroups, perPage]);

    const setUserEnabled = (userId, enabled) => {
        axios.patch(`/user/${userId}`, {enabled})
            .then((response) => {
                if (response.status === 200) {
                    fetchUserList();
                    SweetAlertComponent.fire({
                        title: 'Sucesso!',
                        text: 'Utilizador atualizado com sucesso!',
                        icon: 'success',
                        confirmButtonColor: '#21ba45',
                    });
                }
            });
    };

    const searchUser = ({target: {value}}) => {
        setSearchTerm(value);
    };

    useEffect(() => {
        axios.get('/user-group').then((response) => {
            if (response.status === 200) {
                setLoadingGroups(false);
                setUserGroups(response?.data?.data?.map(({id, description}) => ({key: id, value: id, text: description})));
            }
        });
    }, []);

    const columns = [
        {name: 'User ID'},
        {name: 'Email'},
        {name: 'Nome'},
        {name: 'Ativo?', textAlign: 'center'},
        {name: 'Ações'},
    ];

    const filterByGroup = (e, {value}) => {
        setFilterGroups(value);
    };
    const filterByQuant = (e, {value}) => {
        setPerPage(value);
    };
    const pageQuants = [
        {value:10, text: 10},
        {value:25, text: 25},
        {value:50, text: 50},
        {value:100, text: 100}
    ];
    return (
        <Container style={{marginTop: '2em'}}>
            <Card fluid>
                <Card.Content header="Utilizadores"/>
                <Card.Content>
                    <Form>
                        <Form.Group>
                            <Form.Field width={7}>
                                <label>Utilizador</label>
                                <Input fluid loading={searching} placeholder="Pesquisar utilizador..." onChange={_.debounce(searchUser, 900)}/>
                            </Form.Field>

                            <Form.Field width={7}>
                                <Form.Dropdown options={userGroups}
                                    selection search
                                    multiple clearable
                                    label="Grupo de Utilizador"
                                    loading={loadingGroups}
                                    onChange={filterByGroup}
                                />
                            </Form.Field>
                            <Form.Field width={1} />
                            <Form.Dropdown width={1} selection options={pageQuants} label="Per Page" loading={loadingGroups} onChange={filterByQuant}/>
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map(({name, textAlign}) => (
                                    <Table.HeaderCell textAlign={textAlign}>{name}</Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {userList.map(({id, email, name, enabled,}) => (
                                <Table.Row key={id}>
                                    <Table.Cell>{id}</Table.Cell>
                                    <Table.Cell>{email}</Table.Cell>
                                    <Table.Cell>{name}</Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <Icon name={enabled ? 'checkmark' : 'close'}/>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <ShowComponentIfAuthorized permission={[SCOPES.EDIT_USERS]}>
                                            <Link to={`/utilizdor/edit/${id}`}>
                                                <Button color="yellow" icon>
                                                    <Icon name="edit"/>
                                                </Button>
                                            </Link>
                                        </ShowComponentIfAuthorized>
                                        <ShowComponentIfAuthorized permission={[SCOPES.LOCK_USERS]}>
                                            <Popup content={`${enabled ? 'Bloquear' : 'Desbloquear'} a conta do utilizador.`}
                                                trigger={(
                                                    <Button color={enabled ? 'red' : 'green'} icon onClick={() => setUserEnabled(id, !enabled,)}>
                                                        <Icon name={enabled ? 'lock' : 'unlock'}/>
                                                    </Button>
                                                )}
                                            />
                                        </ShowComponentIfAuthorized>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                        {loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>
                                    A carregar os utilizadores
                                </Loader>
                            </Dimmer>
                        )}
                    </Table>
                    <Pagination defaultActivePage={1} totalPages={paginationInfo.last_page} onPageChange={loadUsers}
                                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                firstItem={null} lastItem={null} /> {/* paginationInfo.current_page > 1 ? <>: null */} {/*paginationInfo.current_page < paginationInfo.last_page ? <> : null */}
                </Card.Content>
            </Card>
        </Container>
    );
};

export default List;
