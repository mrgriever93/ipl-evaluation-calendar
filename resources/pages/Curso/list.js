import React, {useEffect, useState} from 'react';
import {Card, Container, Dimmer, Form, Loader, Pagination, Table, Button, Icon, Header} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {toast} from 'react-toastify';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import EmptyTable from "../../components/EmptyTable";
import {useTranslation} from "react-i18next";

const SweetAlertComponent = withReactContent(Swal);

const CoursesList = () => {
    const { t } = useTranslation();
    const [courseList, setCourseList] = useState([]);
    const [schoolsList, setSchoolsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [removingCourse, setRemovingCourse] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState();
    const [perPage, setPerPage] = useState(10);
    const [school, setSchool] = useState();
    const [degree, setDegree] = useState();

    useEffect(() => {
        axios.get('/schools-list').then((response) => {
            if (response.status >= 200 && response.status < 300) {
                response.data.data.unshift({value: '', text: 'All Schools'});
                setSchoolsList(response.data.data);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, school, degree, perPage]);

    const fetchCourses = (page = 1) => {
        setLoading(true);

        let searchLink = `/courses?page=${page}`;
        searchLink += `${searchTerm ? `&search=${searchTerm}` : ''}`;
        searchLink += `${school ? `&school=${school}` : ''}`;
        searchLink += `${degree ? `&degree=${degree}` : ''}`;
        searchLink += '&per_page=' + perPage;

        axios.get(searchLink).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                setCourseList(response.data.data);
                setPaginationInfo(response.data.meta);
            }
            setLoading(false);
        });
    };

    const loadCourses = (evt, {activePage}) => fetchCourses(activePage);

    const columns = [
        'Unidade de Ensino',
        'Código',
        'Nome',
        'Sigla',
        'Grau de Ensino',
        'Numero de Anos',
        'Ações',
    ];

    const filterByPerPage = (e, {value}) => {
        setPerPage(value);
    };
    const perPageOptions = [
        {value:10, text: 10},
        {value:25, text: 25},
        {value:50, text: 50},
        {value:100, text: 100}
    ];

    const filterByDegree = (e, {value}) => {
        setDegree(value);
    };
    const degreeOptions = [
        {value:'', text: "All Degrees"},
        {value:5, text: "TeSP"},
        {value:6, text: "Licenciatura"},
        {value:7, text: "Mestrado"},
        {value:8, text: "Doutoramento"}
    ];

    const filterBySchool = (e, {value}) => {
        setSchool(value);
    };

    const remove = (courseId) => {
        SweetAlertComponent.fire({
            title: 'Atenção!',
            html: 'Ao eliminar o curso, todos os calendários, avaliações e métodos serão também eliminados.<br/><strong>Tem a certeza que deseja eliminar este curso, em vez de editar?</strong>',
            denyButtonText: 'Não',
            confirmButtonText: 'Sim',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setRemovingCourse(courseId);
                    axios.delete(`/courses/${courseId}`).then((res) => {
                        setRemovingCourse(null);
                        fetchCourses();
                        if (res.status === 200) {
                            toast('Curso eliminado com sucesso!', successConfig);
                        } else {
                            toast('Ocorreu um problema ao eliminar este curso!', errorConfig);
                        }
                    });
                }
            });
    };

    return (
        <Container>
            <Card fluid>
                <Card.Content>
                    <div>
                        <Header as="span">Cursos</Header>
                    </div>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group>
                            <Form.Input width={6} label="Pesquisar curso..." placeholder="Pesquisar curso..." onChange={(e, {value}) => _.debounce(setSearchTerm(value), 500)}/>
                            <Form.Dropdown width={6} selection value={school} options={schoolsList}     label="Escolas" placeholder="All Schools" loading={loading} onChange={filterBySchool}/>
                            <Form.Dropdown width={3} selection value={degree} options={degreeOptions}   label="Degree"  placeholder="All Degrees" loading={loading} onChange={filterByDegree}/>
                            <Form.Dropdown width={1} selection value={perPage} options={perPageOptions} label="Per Page" loading={loading} onChange={filterByPerPage}/>
                        </Form.Group>
                    </Form>
                </Card.Content>
                { !loading && courseList.length > 0 ? (
                    <>
                        <Card.Content>
                            <Table celled fixed>
                                <Table.Header>
                                    <Table.Row>
                                        {columns.map((col) => (
                                            <Table.HeaderCell key={"table_header_" + col}>{col}</Table.HeaderCell>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {courseList.map(({id, school, code, name, initials, level, duration}) => (
                                            <Table.Row key={code}>
                                                <Table.Cell>{school}</Table.Cell>
                                                <Table.Cell>{code}</Table.Cell>
                                                <Table.Cell>{name}</Table.Cell>
                                                <Table.Cell>{initials}</Table.Cell>
                                                <Table.Cell>{level}</Table.Cell>
                                                <Table.Cell>{duration}</Table.Cell>
                                                <Table.Cell>
                                                    <Link to={`/curso/${id}`}>
                                                        <Button color="green" icon>
                                                            <Icon name="eye"/>
                                                        </Button>
                                                    </Link>
                                                    <ShowComponentIfAuthorized permission={[SCOPES.DELETE_COURSES]}>
                                                        <Button onClick={() => remove(id)} color="red" icon loading={removingCourse === id}>
                                                            <Icon name="trash"/>
                                                        </Button>
                                                    </ShowComponentIfAuthorized>
                                                </Table.Cell>
                                            </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                            { paginationInfo && (<div> From <b>{ paginationInfo.from }</b> to  <b>{ paginationInfo.to }</b> of <b>{ paginationInfo.total }</b> results</div>)}
                            {
                                paginationInfo && paginationInfo.current_page !== paginationInfo.last_page && (
                                    <Pagination defaultActivePage={1} totalPages={paginationInfo.last_page} onPageChange={loadCourses}
                                                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                                firstItem={null} lastItem={null} />
                                )
                            }
                            {loading && (
                                <Dimmer active inverted>
                                    <Loader indeterminate>A carregar os cursos</Loader>
                                </Dimmer>
                            )}
                        </Card.Content>
                    </>
                    ) : ( <EmptyTable isLoading={loading} label={t('Sem resultados')}/> ) }
            </Card>
        </Container>
    );
};

export default CoursesList;
