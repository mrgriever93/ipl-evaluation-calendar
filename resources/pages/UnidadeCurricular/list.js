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
    Dimmer,
    Loader,
    Popup,
    Checkbox, Segment
} from 'semantic-ui-react';
import axios from 'axios';
import {Link, useSearchParams} from 'react-router-dom';
import _ from 'lodash';
import {toast} from 'react-toastify';
import {useTranslation} from "react-i18next";

import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized, {useComponentIfAuthorized} from '../../components/ShowComponentIfAuthorized';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import EmptyTable from "../../components/EmptyTable";
import Semesters from "../../components/Filters/Semesters";
import Courses from "../../components/Filters/Courses";
import FilterOptionPerPage from "../../components/Filters/PerPage";
import PaginationDetail from "../../components/Pagination";

const CourseUnitsList = () => {
    const [searchParams] = useSearchParams();
    const searchCourse = searchParams.get('curso');

    const { t } = useTranslation();
    const [courseUnits, setCourseUnits] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);

    const [courseFilter, setCourseFilter] = useState();
    const [courseUnitAllFilter, setCourseUnitAllFilter] = useState();
    const [semesterFilter, setSemesterFilter] = useState();
    const [searchFilter, setSearchFilter] = useState();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if(searchCourse){
            setCourseFilter(searchCourse);
        }
    }, [searchCourse]);

    const fetchCourseUnits = () => {
        setContentLoading(true);
        let link = '/course-units?page=' + currentPage;
        link += (semesterFilter         ? '&semester='  + semesterFilter        : '');
        link += (courseFilter           ? '&course='    + courseFilter          : '');
        link += (searchFilter           ? '&search='    + searchFilter          : '');
        link += (courseUnitAllFilter    ? '&show_all='  + courseUnitAllFilter   : '');
        link += '&per_page=' + perPage;

        axios.get(link).then((response) => {
            setIsLoading(false);
            setContentLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setCourseUnits(response.data.data);
                setPaginationInfo(response.data.meta);
            }
        });
    };

    useEffect(() => {
        if(currentPage === 1){
            fetchCourseUnits();
        } else {
            setCurrentPage(1);
        }
    }, [semesterFilter, courseFilter, searchFilter, courseUnitAllFilter]);

    useEffect(() => {
        fetchCourseUnits();
    }, [currentPage]);

    const filterByAllCourseUnits = (showAll) => {
        setCourseUnitAllFilter(showAll);
    }
    const filterByCourse = (course) => {
        setCourseFilter(course);
    };

    const changedPage = (activePage) => {
        setCurrentPage(activePage);
    }

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

    const handleSearchCourseUnits = (evt, {value}) => {
        setSearchFilter(value);
    };

    const filterBySemester = (value) => {
        setSemesterFilter(value);
    };

    const columns = [
        {name: t('Nome')},
        {name: t('Ramo')},
        {
            name: t('Agrupamento'),
            permission: [SCOPES.VIEW_UC_GROUPS],
        },
        {name: t('Semestre'),   align: 'center', style: {width: '10%'} },
        {
            name: t('Ações'),
            align: 'center',
            permission: [SCOPES.VIEW_COURSE_UNITS, SCOPES.EDIT_COURSE_UNITS, SCOPES.DELETE_COURSE_UNITS],
            style: {width: '10%' }
        },
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
                            <Form.Input icon='search' iconPosition='left' width={5} onChange={_.debounce(handleSearchCourseUnits, 400)} placeholder={t("Pesquisar por nome")} label={t("Pesquisar por nome")} />
                            <Courses widthSize={5} eventHandler={filterByCourse} />
                            <Semesters widthSize={3} eventHandler={filterBySemester} withSpecial={false} />
                            <Form.Field width={2}>
                                <label>Todas as UCs</label>
                                <Form.Field>
                                    <Checkbox onChange={(e, {checked}) => filterByAllCourseUnits(checked) }/>
                                </Form.Field>
                            </Form.Field>
                            <FilterOptionPerPage widthSize={2} eventHandler={(value) => setPerPage(value)} />
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    { courseUnits.length < 1 || isLoading ? (
                        <EmptyTable isLoading={isLoading} label={t("Ohh! Não foi possível encontrar Unidades Curriculares!")}/>
                    ) : (
                        <>
                            <Table celled selectable striped>
                                <Table.Header>
                                    <Table.Row>
                                        {columns.map(({name, align, permission, style}, index) => (
                                            permission ?
                                            (
                                                <ShowComponentIfAuthorized permission={permission} key={'auth_table_header_cell_' + index}>
                                                    <Table.HeaderCell textAlign={align} key={'table_header_cell_' + index} style={style}>
                                                        {name}
                                                    </Table.HeaderCell>
                                                </ShowComponentIfAuthorized>
                                            ) :
                                            (
                                                <Table.HeaderCell textAlign={align} key={'table_header_cell_' + index} style={style}>
                                                    {name}
                                                </Table.HeaderCell>
                                            )
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {courseUnits.map(({id, name, code, has_methods, has_responsable, branch_label, has_branch, group_name, course_description, semester}) => (
                                        <Table.Row key={id} warning={ (useComponentIfAuthorized(SCOPES.EDIT_COURSE_UNITS) ? (!has_methods || !has_responsable) : false) }>
                                            <Table.Cell>
                                                <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS]}>
                                                    { (!has_methods || !has_responsable) && <Popup trigger={<Icon name="warning sign" />} content={(
                                                        <div>
                                                            { (!has_methods && !has_responsable) ? (
                                                                t('Falta preencher os métodos de avaliação e o responsável.')
                                                            ) : (
                                                                (!has_methods ? t('Falta preencher os métodos de avaliação.') : t('Falta preencher o responsável.'))
                                                            )}
                                                        </div>
                                                    )} position='top center'/> }
                                                </ShowComponentIfAuthorized>
                                                ({code}) - {name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                { !has_branch && <Popup trigger={<Icon name="warning sign" />} content={t('Falta preencher a que ramo pertence.')} position='top center'/> }
                                                {branch_label}
                                            </Table.Cell>
                                            <ShowComponentIfAuthorized permission={[SCOPES.VIEW_UC_GROUPS]}>
                                                <Table.Cell>{group_name || '-'}</Table.Cell>
                                            </ShowComponentIfAuthorized>
                                            <Table.Cell>{semester}</Table.Cell>
                                            <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COURSE_UNITS, SCOPES.EDIT_COURSE_UNITS, SCOPES.DELETE_COURSE_UNITS]}>
                                                <Table.Cell textAlign={"center"}>
                                                    <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COURSE_UNITS, SCOPES.EDIT_COURSE_UNITS]}>
                                                        <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS]} renderIfNotAllowed={(
                                                            <Link to={`/unidade-curricular/detail/${id}`}>
                                                                <Button color="green" icon="eye" />
                                                            </Link>
                                                        )}>
                                                            <Link to={`/unidade-curricular/edit/${id}`}>
                                                                <Button color="yellow" icon="edit" />
                                                            </Link>
                                                        </ShowComponentIfAuthorized>
                                                    </ShowComponentIfAuthorized>
                                                    <ShowComponentIfAuthorized permission={[SCOPES.DELETE_COURSE_UNITS]}>
                                                        <Button color="red" icon="trash" onClick={() => remove({id, course: course_description, unit: name})} />
                                                    </ShowComponentIfAuthorized>
                                                </Table.Cell>
                                            </ShowComponentIfAuthorized>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                            <PaginationDetail currentPage={currentPage} info={paginationInfo} eventHandler={changedPage} />
                            {contentLoading && (
                                <Dimmer active inverted>
                                    <Loader indeterminate>
                                        { t("A carregar os unidades curriculares") }
                                    </Loader>
                                </Dimmer>
                            )}
                        </>
                    )}
                </Card.Content>
            </Card>
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
                <Modal.Header>{ t("Remover Unidade Curricular") }</Modal.Header>
                <Modal.Content>
                    { t("Tem a certeza que deseja remover a Unidade Curricular") } <b>{modalInfo?.course}</b> - <b>{modalInfo?.unit}</b>?
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
