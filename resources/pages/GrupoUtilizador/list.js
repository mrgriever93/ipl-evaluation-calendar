import React, {useCallback, useEffect, useState} from 'react';
import {Card, Container, Table, Form, Button, Header, Icon, Modal, Dimmer, Loader} from 'semantic-ui-react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-toastify';
import {useTranslation} from "react-i18next";
import {successConfig} from '../../utils/toastConfig';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import EmptyTable from "../../components/EmptyTable";

const List = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const columns = [
        {name: t('Descrição')},
        {name: t('Ativo?'), align: 'center'},
        {name: t('Ações'), align: 'center'},
    ];
    const [filteredResults, setFilteredResults] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [userGroups, setUserGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchInfo, setSearchInfo] = useState("");

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
                setSearchInfo("");
                setFilteredResults(filtered);
            } else {
                setSearchInfo(searchTerm.length > 0 ? t("Sem resultados para esta pesquisa") : "");
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
                toast(t("Grupo de utilizador removido com sucesso!"), successConfig);
            }
            loadUserGroups();
        });
        handleModalClose();
    };
    return (
        <Container>
            <Card fluid>
                <Card.Content>
                    { isLoading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>{t("A carregar os grupos")}</Loader>
                        </Dimmer>
                    )}
                    <div>
                        <Header as="span">{t("Grupos de Utilizador")}</Header>
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_USER_GROUPS]}>
                            <Link to="/grupo-utilizador/novo">
                                <Button floated="right" color="green">{t("Novo")}</Button>
                            </Link>
                        </ShowComponentIfAuthorized>
                    </div>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group widths="2">
                            <Form.Input label={t("Pesquisar")} placeholder={t("Pesquisar grupos de utilizador...")} onChange={handleSearch} />
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map((col, index) => (
                                    <Table.HeaderCell key={index} textAlign={col.align} >{col.name} </Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            { (searchInfo.length> 0 && filteredResults?.length) || isLoading ?
                                (<EmptyTable isLoading={isLoading} onBtnClick={() => navigate("/grupo-utilizador/novo")} colspan={3} label={searchInfo} permissions={[SCOPES.CREATE_USER_GROUPS]}/>) :
                                (
                                    (filteredResults?.length ? filteredResults : userGroups )?.map(({ id, description, enabled, removable }, index ) => (
                                                <Table.Row key={index}>
                                                    <Table.Cell>{description}</Table.Cell>
                                                    <Table.Cell textAlign="center">
                                                        <Icon name={!enabled ? 'close' : 'check'} />
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
                                                            <Button onClick={() => remove({id,name: description}) } color="red" icon disabled={!removable} >
                                                                <Icon name="trash"/>
                                                            </Button>
                                                        </ShowComponentIfAuthorized>
                                                    </Table.Cell>
                                                </Table.Row>
                                            )
                                        )
                                )
                            }
                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose} >
                <Modal.Header>{t("Remover Grupo de Utilizador")}</Modal.Header>
                <Modal.Content>
                                {t("Tem a certeza que deseja remover o grupo de utilizador")} <strong>{modalInfo?.name}</strong> ?
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={handleModalClose}>{t("Cancelar")}</Button>
                    <Button positive onClick={handleRemoval}>{t("Sim")}</Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
};

export default List;
