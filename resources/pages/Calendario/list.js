import React, {useEffect, useState} from 'react';
import {
    Card,
    Container,
    Table,
    Form,
    Icon,
    Modal,
    Button,
    Header,
    Message,
    Dimmer,
    Loader,
} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import _ from 'lodash';
import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import {errorConfig, successConfig} from '../../utils/toastConfig';

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const MessageFading = styled(Message)`
    @keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.05;
        }
        100% {
            opacity: 1;
        }
    }
    animation: flickerAnimation 1s infinite;
`;

const List = ({match}) => {
    const [calendars, setCalendars] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [messageVisible, setMessageVisible] = useState(false);
    const [removingCalendar, setRemovingCalendar] = useState([]);
    const [myCourseOnly, setMyCourseOnly] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const loadCalendars = () => axios.get(`/calendar?myCourseOnly=${myCourseOnly}`).then((response) => {
        setIsLoading(false);
        if (response.status >= 200 && response.status < 300) {
            setCalendars(_.orderBy(response.data.data, 'display_id'));
        }
    });

    useEffect(() => {
        setIsLoading(true);
        loadCalendars();
    }, [myCourseOnly]);

    useEffect(() => {
        if (calendars.filter((x) => JSON.parse(x.differences)?.length)?.length > 0) {
            setMessageVisible(true);
        }
    }, [calendars]);

    const remove = (course) => {
        setModalInfo(course);
        setModalOpen(true);
    };

    const handleModalClose = () => setModalOpen(false);

    const handleRemoval = () => {
        setRemovingCalendar((current) => {
            current.push(modalInfo.id);
            return current;
        });
        handleModalClose();
        axios.delete(`/calendar/${modalInfo.id}`).then((res) => {
            setRemovingCalendar((current) => current.filter((x) => x !== modalInfo.id));
            if (res.status === 200) {
                loadCalendars();
                toast('Calendário removido com sucesso!', successConfig);
            } else {
                toast('Ocorreu um problema ao remover um calendário!', errorConfig);
            }
        });
    };

    const columns = [
        {name: 'ID'},
        {name: 'Curso'},
        {name: 'Grau'},
        {name: 'Semestre'},
        {name: 'Estado'},
        {
            name: 'Publicado?',
            textAlign: 'center',
            restrictedToCreators: true,
            permission: SCOPES.VIEW_CALENDAR_INFO,
        },
        {
            name: 'Fase',
            restrictedToCreators: true,
            permission: SCOPES.VIEW_ACTUAL_PHASE
        },
        {name: 'Ações'},
    ];

    return (
        <Container style={{marginTop: '2em'}}>
            {messageVisible && (
                <MessageFading
                    onDismiss={() => setMessageVisible(false)}
                    success
                    header="Alterações ao calendário!"
                    content="Deverá verificar com atenção todas as alterações."
                />
            )}
            <Card fluid>
                <Card.Content>
                    <Wrapper>
                        <Header as="span">Calendários</Header>
                        <ShowComponentIfAuthorized
                            permission={[SCOPES.CREATE_CALENDAR]}
                            renderIfNotAllowed={() => (
                                <Button
                                    floated="right"
                                    toggle
                                    active={myCourseOnly}
                                    onClick={() => setMyCourseOnly((curr) => !curr)}
                                    icon
                                    labelPosition="left"
                                >
                                    <Icon name="eye"/>
                                    {myCourseOnly ? 'Meus calendários' : 'Todos'}
                                </Button>
                            )}
                        >
                            <Link to="/calendario/novo">
                                <Button floated="right" color="green">
                                    Novo
                                </Button>
                            </Link>
                        </ShowComponentIfAuthorized>

                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    {isLoading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar os calendários</Loader>
                        </Dimmer>
                    )}
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map(
                                    ({
                                         name,
                                         textAlign,
                                         restrictedToCreators,
                                         permission,
                                     }) => (restrictedToCreators ? (
                                        <ShowComponentIfAuthorized
                                            permission={[permission]}
                                        >
                                            <Table.HeaderCell
                                                textAlign={textAlign}
                                            >
                                                {name}
                                            </Table.HeaderCell>
                                        </ShowComponentIfAuthorized>
                                    ) : (
                                        <Table.HeaderCell
                                            textAlign={textAlign}
                                        >
                                            {name}
                                        </Table.HeaderCell>
                                    )),
                                )}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {calendars.map(
                                (
                                    {
                                        id, display_id, course, temporary, phase, semester, published,
                                    },
                                ) => (
                                    <Table.Row key={id}>
                                        <Table.Cell>{display_id}</Table.Cell>
                                        <Table.Cell>{course.display_name}</Table.Cell>
                                        <Table.Cell>{course.level}</Table.Cell>
                                        <Table.Cell>{semester}</Table.Cell>
                                        <ShowComponentIfAuthorized
                                            permission={[SCOPES.VIEW_CALENDAR_INFO]}
                                            renderIfNotAllowed={() => (
                                                <Table.Cell>
                                                    {published
                                                        ? temporary
                                                            ? 'Provisório'
                                                            : 'Definitivo'
                                                        : phase.description}
                                                </Table.Cell>
                                            )}
                                        >
                                            <Table.Cell>
                                                {temporary
                                                    ? 'Provisório'
                                                    : 'Definitivo'}
                                            </Table.Cell>
                                        </ShowComponentIfAuthorized>
                                        <ShowComponentIfAuthorized
                                            permission={[SCOPES.VIEW_CALENDAR_INFO]}
                                        >
                                            <Table.Cell textAlign="center">
                                                <Icon
                                                    name={
                                                        published
                                                            ? 'checkmark'
                                                            : 'close'
                                                    }
                                                />
                                            </Table.Cell>
                                        </ShowComponentIfAuthorized>
                                        <ShowComponentIfAuthorized
                                            permission={[SCOPES.VIEW_ACTUAL_PHASE]}
                                        >
                                            <Table.Cell>
                                                {phase.description}
                                            </Table.Cell>
                                        </ShowComponentIfAuthorized>
                                        <Table.Cell>
                                            <Link to={`../calendario/${id}`}>
                                                <Button color="green" icon>
                                                    <Icon name="eye"/>
                                                </Button>
                                            </Link>
                                            <ShowComponentIfAuthorized permission={[SCOPES.DELETE_CALENDAR]}>
                                                <Button
                                                    onClick={() => remove({
                                                        id,
                                                        course: course.display_name,
                                                    })}
                                                    color="red"
                                                    icon
                                                    disabled={published}
                                                    loading={!!removingCalendar?.find((x) => x === id)}
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
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
                <Modal.Header>Remover Calendário</Modal.Header>
                <Modal.Content>
                    Tem a certeza que deseja remover o calendário do curso
                    {' '}
                    <strong>{modalInfo?.course}</strong>
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
