import React, {useEffect, useState} from 'react';
import {Card, Container, Dimmer, Form, Loader, Table, Button, Icon, Header} from 'semantic-ui-react';
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
import FilterOptionSchool from "../../components/Filters/Schools";
import FilterOptionDegree from "../../components/Filters/Degree";
import FilterOptionPerPage from "../../components/Filters/PerPage";
import PaginationDetail from "../../components/Pagination";

const SweetAlertComponent = withReactContent(Swal);

const CoursesList = () => {
    const { t } = useTranslation();
    const [courseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [removingCourse, setRemovingCourse] = useState(undefined);

    // Filters
    const [searchTerm, setSearchTerm] = useState();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [school, setSchool] = useState();
    const [degree, setDegree] = useState();

    // Table columns
    const columns = [
        {name: 'Unidade de Ensino', style: {width: '15%'} },
        {name: 'Código', style: {width: '10%'} },
        {name: 'Nome'},
        //{name: 'Sigla'},
        {name: 'Grau de Ensino', style: {width: '15%'}},
        //{name: 'Numero de Anos'},
        {name: t('Ações'),  align: 'center', style: {width: '10%'} },
    ];

    useEffect(() => {
        fetchCourses();
    }, [searchTerm, school, degree, perPage, currentPage]);

    const changedPage = (activePage) => {
        setCurrentPage(activePage);
    }

    const fetchCourses = () => {
        setLoading(true);

        let searchLink = `/courses?page=${currentPage}`;
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
                            <Form.Input icon='search' iconPosition='left' width={5} label="Pesquisar curso..." placeholder="Pesquisar curso..." onChange={(e, {value}) => _.debounce(setSearchTerm(value), 500)}/>
                            <FilterOptionSchool widthSize={5} eventHandler={(value) => setSchool(value)} />
                            <FilterOptionDegree widthSize={5} eventHandler={(value) => setDegree(value)} />
                            <FilterOptionPerPage widthSize={2} eventHandler={(value) => setPerPage(value)} />
                        </Form.Group>
                    </Form>
                </Card.Content>
                { !loading && courseList.length > 0 ? (
                    <Card.Content>
                        <Table celled fixed>
                            <Table.Header>
                                <Table.Row>
                                    {columns.map((col, index) => (
                                        <Table.HeaderCell key={index} textAlign={col.align} style={ col.style } >{col.name} </Table.HeaderCell>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {courseList.map(({id, school, code, name, initials, level, duration, has_issues}) => (
                                    <Table.Row key={code} warning={has_issues}>
                                        <Table.Cell>{school}</Table.Cell>
                                        <Table.Cell>{code}</Table.Cell>
                                        <Table.Cell>
                                            {has_issues ? <Icon name='warning sign' /> : ''}{name}
                                        </Table.Cell>
                                        {/*<Table.Cell>{initials}</Table.Cell>*/}
                                        <Table.Cell>{level}</Table.Cell>
                                        {/*<<Table.Cell>{duration}</Table.Cell>*/}
                                        <Table.Cell textAlign="center">
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
                        <PaginationDetail currentPage={currentPage} info={paginationInfo} eventHandler={changedPage} />
                        {loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>A carregar os cursos</Loader>
                            </Dimmer>
                        )}
                    </Card.Content>
                    ) : ( <EmptyTable isLoading={loading} label={t('Sem resultados')}/> ) }
            </Card>
        </Container>
    );
};

export default CoursesList;
