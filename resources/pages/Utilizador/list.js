import axios from 'axios';
import React, {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import {Card, Container, Form, Icon, Input, Table, Button, Popup, Pagination, Dimmer, Loader} from 'semantic-ui-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import FilterOptionPerPage from "../../components/Filters/PerPage";
import FilterOptionUserGroups from "../../components/Filters/UserGroups";

const SweetAlertComponent = withReactContent(Swal);

const List = () => {
    const [userList, setUserList] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [loading, setLoading] = useState(true);
    // Filters
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState();
    const [perPage, setPerPage] = useState(10);
    const [userGroups, setUserGroups] = useState([]);

    // Table columns
    const columns = [
        {name: 'User ID'},
        {name: 'Email'},
        {name: 'Nome'},
        {name: 'Ativo?', textAlign: 'center'},
        {name: 'Ações'},
    ];

    useEffect(() => {
        fetchUserList(1, searchTerm, userGroups, perPage);
    }, [searchTerm, userGroups, perPage]);

    const fetchUserList = useCallback((page = 1, search, groups, per_page) => {
        if (search) {
            setSearching(true);
        }
        setLoading(true);

        let searchLink = `/users?page=${page}`;
        searchLink += `${search ? `&search=${search}` : ''}`;
        searchLink += `${groups?.length ? `&groups=${JSON.stringify(groups)}` : ''}`;
        searchLink += '&per_page=' + per_page;

        axios.get(searchLink)
            .then((response) => {
                setLoading(false);
                if (search) {
                    setSearching(false);
                }
                setPaginationInfo(response.data.meta);
                setUserList(response?.data?.data);
            });
    }, []);

    // Handle Pagination
    const loadUsers = (evt, {activePage}) => fetchUserList(activePage);

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

    return (
        <Container>
            <Card fluid>
                <Card.Content header="Utilizadores"/>
                <Card.Content>
                    <Form>
                        <Form.Group>
                            <Form.Field width={7}>
                                <label>Utilizador</label>
                                <Input fluid loading={searching} placeholder="Pesquisar utilizador..." onChange={_.debounce(searchUser, 900)}/>
                            </Form.Field>
                            <FilterOptionUserGroups widthSize={7} eventHandler={(value) => setUserGroups(value)} />
                            <FilterOptionPerPage widthSize={2} eventHandler={(value) => setPerPage(value)} />
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
