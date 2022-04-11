import React, {useEffect, useState} from 'react';
import {
    Card,
    Container,
    Dimmer,
    Form,
    Loader,
    Pagination,
    Table,
    Button,
    Icon,
    Header,
} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {toast} from 'react-toastify';
import ShowComponentIfAuthorized, {useComponentIfAuthorized} from '../../components/ShowComponentIfAuthorized';
import SCOPES, {COURSE_SCOPES} from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const Wrapper = styled.div`
.header {
  display: inline;
}
`;

const List = ({match}) => {
    const [courseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [removingCourse, setRemovingCourse] = useState(undefined);
    const [searchTerm, setSearchTerm] = useState();

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const fetchCourses = (page = 1) => {
        setLoading(true);
        axios.get(`/courses?page=${page}${searchTerm ? `&search=${searchTerm}` : ''}`).then((response) => {
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
    const syncCursos = () => {

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
                    <Wrapper>
                        <Header as="span">Cursos</Header>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group widths="2">
                            <Form.Input placeholder="Pesquisar curso..."
                                        onChange={(e, {value}) => _.debounce(setSearchTerm(value), 500)}/>
                        </Form.Group>
                        <Button color="green" icon onClick={() => syncCursos()}>
                            <Icon name="eye"/>
                            Sync Cursos
                        </Button>
                    </Form>
                </Card.Content>
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
                            {courseList.map(
                                ({
                                     id,
                                     school,
                                     code,
                                     name,
                                     initials,
                                     level,
                                     duration,
                                 }) => (
                                    <Table.Row key={code}>
                                        <Table.Cell>{school.code}</Table.Cell>
                                        <Table.Cell>{code}</Table.Cell>
                                        <Table.Cell>{name}</Table.Cell>
                                        <Table.Cell>{initials}</Table.Cell>
                                        <Table.Cell>{level}</Table.Cell>
                                        <Table.Cell>{duration}</Table.Cell>
                                        <Table.Cell>
                                            <Link
                                                to={`../curso/${id}`}
                                            >
                                                <Button color="green" icon>
                                                    <Icon name="eye"/>
                                                </Button>
                                            </Link>
                                            <ShowComponentIfAuthorized
                                                permission={[SCOPES.DELETE_COURSES]}
                                            >
                                                <Button
                                                    onClick={() => remove(id)}
                                                    color="red"
                                                    icon
                                                    loading={removingCourse === id}
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
                    {paginationInfo && paginationInfo.current_page
                        !== paginationInfo.last_page && (
                            <Pagination
                                secondary
                                pointing
                                fluid
                                defaultActivePage={1}
                                activePage={paginationInfo.current_page}
                                totalPages={paginationInfo.last_page}
                                onPageChange={loadCourses}
                            />
                        )}
                    {loading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar os cursos</Loader>
                        </Dimmer>
                    )}
                </Card.Content>
            </Card>
        </Container>
    );
};

export default List;
