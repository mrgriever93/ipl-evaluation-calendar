import React, {useEffect, useState} from 'react';
import {Card, Container, Table, Form, Icon, Modal, Button, Header, Pagination} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import {toast} from 'react-toastify';
import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import EmptyTable from "../../components/EmptyTable";
import Semesters from "../../components/Filters/Semesters";
import Courses from "../../components/Filters/Courses";
import {useTranslation} from "react-i18next";
import FilterOptionPerPage from "../../components/Filters/PerPage";

const CourseUnitsList = () => {
    const { t } = useTranslation();
    const [courseUnits, setCourseUnits] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState();
    const [semesterFilter, setSemesterFilter] = useState();
    const [searchFilter, setSearchFilter] = useState();
    const [perPage, setPerPage] = useState(10);

    const fetchCourseUnits = (page = 1) => {
        setIsLoading(true);
        let link = '/course-units?page=' + page;
        link += (semesterFilter ? '&semester=' + semesterFilter : '');
        link += (courseFilter   ? '&course='   + courseFilter   : '');
        link += (searchFilter   ? '&search='   + searchFilter   : '');
        link += '&per_page=' + perPage;

        axios.get(link).then((response) => {
            setIsLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setCourseUnits(response.data.data);
                setPaginationInfo(response.data.meta);
            }
        });
    };

    useEffect(() => {
        fetchCourseUnits();
    }, [semesterFilter, courseFilter, searchFilter]);


    const filterByCourse = (course) => {
        setCourseFilter(course);
    };

    const remove = (courseUnit) => {
        setModalInfo(courseUnit);
        setModalOpen(true);
    };

    const handleModalClose = () => setModalOpen(false);

    const handleRemoval = () => {
        handleModalClose();
        axios.delete(`/course-units/${modalInfo.id}`).then((res) => {
            if (res.status === 200) {
                fetchCourseUnits();
                toast(t('Unidade curricular eliminada com sucesso!'), successConfig);
            } else {
                toast(t('Ocorreu um erro ao eliminar a unidade curricular!'), errorConfig);
            }
        });
    };

    const loadCourseUnits = (evt, {activePage}) => fetchCourseUnits(activePage);

    const handleSearchCourseUnits = (evt, {value}) => {
        setSearchFilter(value);
    };

    const filterBySemester = (value) => {
        setSemesterFilter(value);
    };

    const columns = [
        {name: t('Nome')},
        {name: t('Curso')},
        {name: t('Ramo'),           width: 2},
        {name: t('Métodos definidos?')},
        {name: t('Agrupamento'),    width: 4},
        {name: t('Ações'),          align: 'center', style: {width: '15%'} },
    ];
    return (
        <Container>
            <Card fluid>
                <Card.Content>
                    <div className='card-header-alignment'>
                        <Header as="span">{t("Unidades Curriculares")}</Header>
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_COURSE_UNITS]}>
                            { !isLoading && (
                                <Link to="/unidade-curricular/novo">
                                    <Button floated="right" color="green">{t("Novo")}</Button>
                                </Link>
                            )}
                        </ShowComponentIfAuthorized>
                    </div>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group>
                            <Courses widthSize={4} eventHandler={filterByCourse} />
                            <Semesters widthSize={4} eventHandler={filterBySemester} withSpecial={false} />
                            <Form.Input width={4} onChange={_.debounce(handleSearchCourseUnits, 400)} search label={t("Pesquisar por nome")} />
                            <Form.Field width={2} />
                            <FilterOptionPerPage widthSize={2} eventHandler={(value) => setPerPage(value)} />
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    { courseUnits.length < 1 || isLoading ? (
                        <EmptyTable isLoading={isLoading} label={t("Ohh! Não foi possível encontrar Unidades Curriculares!")}/>
                    ) : (
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    {columns.map((col, index) => (
                                        <Table.HeaderCell key={index} textAlign={col.align} style={col.style} width={col.width}>{col.name}</Table.HeaderCell>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {courseUnits.map(({id, name, course_description, methods, branch, group_name}) => (
                                    <Table.Row key={id}>
                                        <Table.Cell>
                                            {name}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {course_description}
                                        </Table.Cell>
                                        <Table.Cell>{branch?.name}</Table.Cell>
                                        <Table.Cell><Icon name={methods?.length > 0 ? 'check' : 'close'}/></Table.Cell>
                                        <Table.Cell>{group_name || '-'}</Table.Cell>
                                        <Table.Cell width="5">
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS]}>
                                                <Link to={`/unidade-curricular/edit/${id}`}>
                                                    <Button color="yellow" icon>
                                                        <Icon name="edit"/>
                                                    </Button>
                                                </Link>
                                            </ShowComponentIfAuthorized>
                                            <ShowComponentIfAuthorized permission={[SCOPES.DELETE_COURSE_UNITS]}>
                                                <Button onClick={() => remove({id, course: course_description})} color="red" icon>
                                                    <Icon name="trash"/>
                                                </Button>
                                            </ShowComponentIfAuthorized>
                                            <ShowComponentIfAuthorized permission={[SCOPES.MANAGE_EVALUATION_METHODS]}>
                                                <Link to={`unidade-curricular/${id}/metodos`}>
                                                    <Button color="olive" icon labelPosition="left">
                                                        <Icon name="file alternate"/>
                                                        { t('Métodos') }
                                                    </Button>
                                                </Link>
                                            </ShowComponentIfAuthorized>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                    { courseUnits.length > 0 && (
                        <Pagination defaultActivePage={1} totalPages={paginationInfo.last_page}
                                    onPageChange={loadCourseUnits} activePage={paginationInfo.current_page}
                                    ellipsisItem={{content: <Icon name='ellipsis horizontal'/>, icon: true}}
                                    prevItem={{content: <Icon name='angle left'/>, icon: true}}
                                    nextItem={{content: <Icon name='angle right'/>, icon: true}}
                                    firstItem={null}
                                    lastItem={null}/>
                    )}
                </Card.Content>
            </Card>
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
                <Modal.Header>{ t("Remover Unidade Curricular") }</Modal.Header>
                <Modal.Content>
                    { t("Tem a certeza que deseja remover a Unidade Curricular") } {modalInfo?.course}?
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={handleModalClose}>{ t("Cancelar") }</Button>
                    <Button positive onClick={handleRemoval}>{ t("Sim") }</Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
};

export default CourseUnitsList;
