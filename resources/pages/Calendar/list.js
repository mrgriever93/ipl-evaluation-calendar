import React, {useEffect, useState} from 'react';
import {
    Card,
    Container,
    Table,
    Icon,
    Modal,
    Button,
    Header,
    Message,
    Dimmer,
    Loader,
    Label,
    Form
} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import {toast} from 'react-toastify';
import _ from 'lodash';
import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import {errorConfig, successConfig} from '../../utils/toastConfig';
import {useTranslation} from "react-i18next";
import Courses from "../../components/Filters/Courses";
import Semesters from "../../components/Filters/Semesters";
import FilterOptionPerPage from "../../components/Filters/PerPage";
import EmptyTable from "../../components/EmptyTable";
import PaginationDetail from "../../components/Pagination";

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

const CalendarList = () => {
    const { t } = useTranslation();
    const [calendars, setCalendars] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [messageVisible, setMessageVisible] = useState(false);
    const [removingCalendar, setRemovingCalendar] = useState([]);
    const [myCourseOnly, setMyCourseOnly] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [semesterList, setSemesterList] = useState([]);
    const [contentLoading, setContentLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState();
    const [semesterFilter, setSemesterFilter] = useState();
    const [searchFilter, setSearchFilter] = useState();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({});


    const loadCalendars = () => {
        setContentLoading(true);
        let link = '/calendar?page=' + currentPage;
        link += (myCourseOnly ? '&myCourseOnly=' + myCourseOnly : '');
        link += (semesterFilter ? '&semester=' + semesterFilter : '');
        link += (courseFilter   ? '&course='   + courseFilter   : '');
        link += (searchFilter   ? '&search='   + searchFilter   : '');
        link += '&per_page=' + perPage;

        axios.get(link).then((response) => {
            setIsLoading(false);
            setContentLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setPaginationInfo(response.data.meta);
                setCalendars(_.orderBy(response.data.data, 'display_id'));
            }
        });
    };

    useEffect(() => {
        axios.get('/new-calendar/semesters').then((response) => {
            if (response.status >= 200 && response.status < 300) {
                setSemesterList(response.data.data);
            }
        });
    }, []);

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

    useEffect(() => {
        loadCalendars();
    }, [semesterFilter, courseFilter, searchFilter, currentPage, myCourseOnly]);


    const filterByCourse = (course) => {
        setCourseFilter(course);
    };

    const changedPage = (activePage) => {
        setCurrentPage(activePage);
    }

    const handleSearchCourseUnits = (evt, {value}) => {
        setSearchFilter(value);
    };

    const filterBySemester = (value) => {
        setSemesterFilter(value);
    };

    const columns = [
        {name: 'ID',            align: 'center', style: {width: '5%' } },
        {name: 'Curso',         align: 'center', style: {width: '40%' } },
        {
            name: 'Fase',
            restrictedToCreators: true,
            permission: SCOPES.VIEW_ACTUAL_PHASE,
            style: {width: '10%' }
        },
        {
            name: 'Estado',
            textAlign: 'center',
            restrictedToCreators: true,
            permission: SCOPES.VIEW_CALENDAR_INFO,
            style: {width: '10%' }
        },
        {name: t('Ações'),      align: 'center', style: {width: '10%'} },
    ];

    return (
        <Container>
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
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_CALENDAR]}
                            renderIfNotAllowed={() => (
                                <Button floated="right" toggle active={myCourseOnly} onClick={() => setMyCourseOnly((curr) => !curr)} icon labelPosition="left">
                                    <Icon name="eye"/>
                                    {myCourseOnly ? 'Meus calendários' : 'Todos'}
                                </Button>
                            )}>
                            <Link to="/calendario/novo">
                                <Button floated="right" color="green">
                                    Novo
                                </Button>
                            </Link>
                        </ShowComponentIfAuthorized>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group>
                            <Button.Group>
                                {semesterList.length > 0 && semesterList.map((semester, index) => (
                                    <Button key={'semester_button_' + index} toggle active={semesterFilter === semester.id} onClick={() => setSemesterFilter(semester.id)}>
                                        {semester.name}
                                    </Button>
                                ))}
                            </Button.Group>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input icon='search' iconPosition='left' width={5} onChange={_.debounce(handleSearchCourseUnits, 400)} placeholder={t("Pesquisar por nome")} label={t("Pesquisar por nome")} />
                            <Courses widthSize={5} eventHandler={filterByCourse} />
                            <FilterOptionPerPage widthSize={2} eventHandler={(value) => setPerPage(value)} />
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    { calendars.length < 1 || isLoading ? (
                        <EmptyTable isLoading={isLoading} label={t("Ohh! Não foi possível encontrar Calendarios!")}/>
                    ) : (
                        <>
                            <Table celled fixed>
                                <Table.Header>
                                    <Table.Row key={'table_header'}>
                                        {columns.map(({name, textAlign, restrictedToCreators, permission, style}, index) => (
                                            restrictedToCreators ?
                                                (
                                                    <ShowComponentIfAuthorized permission={[permission]} key={'auth_table_header_cell_' + index}>
                                                        <Table.HeaderCell textAlign={textAlign} key={'table_header_cell_' + index} style={style}>
                                                            {name}
                                                        </Table.HeaderCell>
                                                    </ShowComponentIfAuthorized>
                                                ) :
                                                (
                                                    <Table.HeaderCell textAlign={textAlign} key={'table_header_cell_' + index} style={style}>
                                                        {name}
                                                    </Table.HeaderCell>
                                                )
                                            ),
                                        )}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {calendars.map(({id, display_id, course, temporary, phase, published}) => (
                                            <Table.Row key={id}>
                                                <Table.Cell>{display_id}</Table.Cell>
                                                <Table.Cell>{course}</Table.Cell>
                                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_ACTUAL_PHASE]}>
                                                    <Table.Cell>
                                                        {phase.description}
                                                    </Table.Cell>
                                                </ShowComponentIfAuthorized>
                                                <Table.Cell textAlign="center">
                                                    { !published ? (
                                                        <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]}>
                                                            <Label color={"blue"}>Nao Publicado</Label>
                                                        </ShowComponentIfAuthorized>
                                                    ) : (
                                                        <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]} renderIfNotAllowed={() => (
                                                                    <>{published ? <Label color={temporary ? undefined : 'blue' }>{temporary ? 'Provisório' : 'Definitivo'}</Label> : phase.description}</>
                                                            )}>
                                                            <Label color={temporary ? undefined : 'blue' }>{temporary ? 'Provisório' : 'Definitivo'}</Label>
                                                        </ShowComponentIfAuthorized>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Link to={`/calendario/${id}`}>
                                                        <Button color="green" icon>
                                                            <Icon name="eye"/>
                                                        </Button>
                                                    </Link>
                                                    <ShowComponentIfAuthorized permission={[SCOPES.DELETE_CALENDAR]}>
                                                        <Button onClick={() => remove({id, course: course})} color="red" icon disabled={!!published} loading={!!removingCalendar?.find((x) => x === id)}>
                                                            <Icon name="trash"/>
                                                        </Button>
                                                    </ShowComponentIfAuthorized>
                                                </Table.Cell>
                                            </Table.Row>
                                        ),
                                    )}
                                </Table.Body>
                            </Table>

                            <PaginationDetail currentPage={currentPage} info={paginationInfo} eventHandler={changedPage} />
                            {contentLoading && (
                                <Dimmer active inverted>
                                    <Loader indeterminate>
                                        { t("A carregar os calendarios") }
                                    </Loader>
                                </Dimmer>
                            )}
                        </>
                    )}
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

export default CalendarList;
