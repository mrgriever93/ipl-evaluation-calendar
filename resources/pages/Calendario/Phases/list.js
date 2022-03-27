import React, {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {
    Button,
    Card,
    Container,
    Dimmer,
    Form,
    Header,
    Icon,
    Loader,
    Modal,
    Table,
} from 'semantic-ui-react';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import {successConfig} from '../../../utils/toastConfig';
import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const columns = [
    {name: 'Nome'},
    {name: 'Descrição'},
    {name: 'Ativo?', align: 'center'},
    {name: 'Ações', align: 'center'},
];

const List = ({match}) => {
    const [filteredResults, setFilteredResults] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [calendarPhases, setCalendarPhases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPhaseList = () => {
        setIsLoading(true);
        axios.get('/calendar-phases').then((res) => {
            setIsLoading(false);
            if (res.status === 200) {
                setCalendarPhases(res?.data?.data);
            }
        });
    };

    useEffect(() => {
        fetchPhaseList();
    }, []);

    const filterPhases = useCallback(
        (searchTerm) => {
            const filtered = calendarPhases.filter(
                (x) => x.name.toLowerCase().includes(searchTerm.toLowerCase())
                    || x.description.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            if (filtered.length) {
                setFilteredResults(filtered);
            }
        },
        [calendarPhases],
    );

    const handleModalClose = () => setModalOpen(false);

    const handleSearch = ({target: {value: searchTerm}}) => {
        filterPhases(searchTerm);
    };

    const remove = (phase) => {
        setModalInfo(phase);
        setModalOpen(true);
    };

    const handleRemoval = () => {
        axios.delete(`/calendar-phases/${modalInfo?.id}`).then((res) => {
            if (res.status === 200) {
                fetchPhaseList();
                toast('Eliminou a fase do calendário com sucesso!', successConfig);
            }
        });
        handleModalClose();
    };

    return (
        <Container style={{marginTop: '2em'}}>
            <Card fluid>
                <Card.Content>
                    {isLoading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar as fases do calendário</Loader>
                        </Dimmer>
                    )}
                    <Wrapper>
                        <Header as="span">Fases do Calendário</Header>
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_CALENDAR_PHASES]}>
                            <Link to={`/calendario/fases/novo`}>
                                <Button floated="right" color="green">
                                    Nova Fase
                                </Button>
                            </Link>
                        </ShowComponentIfAuthorized>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group widths="5">
                            <Form.Input
                                label="Pesquisar"
                                placeholder="Pesquisar fase..."
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
                                    : calendarPhases
                            )?.map(
                                (
                                    {
                                        id, name, description, removable, enabled,
                                    },
                                    index,
                                ) => (
                                    <Table.Row key={index}>
                                        <Table.Cell>{name}</Table.Cell>
                                        <Table.Cell>{description}</Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Icon
                                                name={!enabled ? 'close' : 'check'}
                                            />
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_CALENDAR_PHASES]}>
                                                <Link
                                                    to={`/calendario/edit/${id}`}
                                                >
                                                    <Button color="yellow" icon>
                                                        <Icon name="edit"/>
                                                    </Button>
                                                </Link>
                                            </ShowComponentIfAuthorized>
                                            <ShowComponentIfAuthorized permission={[SCOPES.DELETE_CALENDAR_PHASES]}>
                                                <Button
                                                    disabled={!removable}
                                                    onClick={() => remove({
                                                        id,
                                                        name,
                                                        description,
                                                    })}
                                                    color="red"
                                                    icon
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
                <Modal.Header>Remover Fase</Modal.Header>
                <Modal.Content>
                    Tem a certeza que deseja remover a fase
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
