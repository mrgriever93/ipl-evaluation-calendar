import React, {useEffect, useState} from 'react';
import {Card, Container, Table, Form, Icon, Modal, Button, Header, Dimmer, Loader, Popup} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import {toast} from 'react-toastify';
import {useTranslation} from "react-i18next";

import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import EmptyTable from "../../components/EmptyTable";
import Semesters from "../../components/Filters/Semesters";
import Courses from "../../components/Filters/Courses";
import FilterOptionPerPage from "../../components/Filters/PerPage";
import PaginationDetail from "../../components/Pagination";

const CourseUnitsList = () => {
    const { t } = useTranslation();
    const [courseUnits, setCourseUnits] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(true);

    const [courseFilter, setCourseFilter] = useState();
    const [semesterFilter, setSemesterFilter] = useState();
    const [searchFilter, setSearchFilter] = useState();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCourseUnits = () => {
        setContentLoading(true);
        let link = '/course-units?page=' + currentPage;
        link += (semesterFilter ? '&semester=' + semesterFilter : '');
        link += (courseFilter   ? '&course='   + courseFilter   : '');
        link += (searchFilter   ? '&search='   + searchFilter   : '');
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
        fetchCourseUnits();
    }, [semesterFilter, courseFilter, searchFilter, currentPage]);


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
        {name: t('Agrupamento')},
        {name: t('Ações'),  align: 'center', style: {width: '10%'} },
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
                            <Form.Input icon='search' iconPosition='left' width={5} onChange={_.debounce(handleSearchCourseUnits, 400)} search placeholder={t("Pesquisar por nome")} label={t("Pesquisar por nome")} />
                            <Courses widthSize={5} eventHandler={filterByCourse} />
                            <Semesters widthSize={5} eventHandler={filterBySemester} withSpecial={false} />
                            <FilterOptionPerPage widthSize={2} eventHandler={(value) => setPerPage(value)} />
                        </Form.Group>
                    </Form>
                </Card.Content>
                <Card.Content>
                    { courseUnits.length < 1 || isLoading ? (
                        <EmptyTable isLoading={isLoading} label={t("Ohh! Não foi possível encontrar Unidades Curriculares!")}/>
                    ) : (
                        <>
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        {columns.map((col, index) => (
                                            <Table.HeaderCell key={index} textAlign={col.align} style={col.style}>{col.name}</Table.HeaderCell>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {courseUnits.map(({id, name, code, methods, branch_label, group_name, course_description}) => (
                                        <Table.Row key={id}>
                                            <Table.Cell>
                                                { methods?.length > 0 ? (
                                                    <Popup trigger={<Icon name='check' />} content={t('Métodos de avaliação preenchidos.')} position='top center'/>
                                                ) : (
                                                    <Popup trigger={<Icon name='close' />} content={t('Falta preencher os métodos de avaliação.')} position='top center'/>
                                                )}
                                                ({code}) - {name}
                                            </Table.Cell>
                                            <Table.Cell>{branch_label}</Table.Cell>
                                            <Table.Cell>{group_name || '-'}</Table.Cell>
                                            <Table.Cell>
                                                <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS]}>
                                                    <Link to={`/unidade-curricular/edit/${id}`}>
                                                        <Button color="yellow" icon="edit" />
                                                    </Link>
                                                </ShowComponentIfAuthorized>
                                                <ShowComponentIfAuthorized permission={[SCOPES.DELETE_COURSE_UNITS]}>
                                                    <Button color="red" icon="trash" onClick={() => remove({id, course: course_description})} />
                                                </ShowComponentIfAuthorized>
                                            </Table.Cell>
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
