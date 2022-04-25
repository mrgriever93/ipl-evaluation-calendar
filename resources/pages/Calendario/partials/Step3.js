import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {Button, Container, Dimmer, Form, Grid, List, Loader, Segment, Table} from 'semantic-ui-react';
import {Field, useField} from 'react-final-form';
import axios from "axios";
import PaginationDetail from "../../../components/Pagination";

const Step3 = ({allCourses, setAllCourses, courses, removeCourse, addCourse, loading, setLoading}) => {
    const {input: coursesFieldInput} = useField('step3.courses');
    const [courseList, setCourseList] = useState([]);
    const [courseSearch, setCourseSearch] = useState();
    const [currentPage, setCurrentPage] = useState(1);

    const [paginationInfo, setPaginationInfo] = useState({});

    useEffect(() => {
        coursesFieldInput.onChange(courses);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses]);

    const searchCourse = (evt, {value}) => {
        setCourseSearch(value);
    };

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseSearch, currentPage]);

    const fetchCourses = () => {
        setLoading(true);

        let searchLink = `/courses?page=${currentPage}`;
        searchLink += `${courseSearch ? `&search=${courseSearch}` : ''}`;
        //searchLink += `${school ? `&school=${school}` : ''}`;
        //searchLink += `${degree ? `&degree=${degree}` : ''}`;
        //searchLink += '&per_page=' + perPage;

        axios.get(searchLink).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                setCourseList(response.data.data);
                setPaginationInfo(response.data.meta);
            }
            setLoading(false);
        });
    };

    const changedPage = (activePage) => {
        setCurrentPage(activePage);
    }

    return (
        <Container>
            <Grid padded>
                <Grid.Row>
                    <Container>
                        <Field name="step3.allCourses">
                            {({input: allCoursesInput}) => (
                                <Button.Group>
                                    <Button positive={allCourses}
                                        onClick={() => {
                                            setAllCourses(true);
                                            allCoursesInput.onChange(true);
                                        }}
                                    >
                                        Todos os Cursos
                                    </Button>
                                    <Button.Or/>
                                    <Button positive={!allCourses}
                                        onClick={() => {
                                            setAllCourses(false);
                                            allCoursesInput.onChange(false);
                                        }}
                                    >
                                        Selecionar Cursos
                                    </Button>
                                </Button.Group>
                            )}
                        </Field>
                    </Container>
                </Grid.Row>
                {!allCourses && (
                    <>
                        {courses.length ? (
                            <Segment style={{width: '100%'}}>
                                <List divided verticalAlign="middle">
                                    {courses.map((course, index) => (
                                        <List.Item key={index}>
                                            <List.Content floated="right">
                                                <Button color="red" onClick={() => removeCourse(course.id)}>
                                                    Remover
                                                </Button>
                                            </List.Content>
                                            <List.Content>{course.code + ' - ' + course.name}</List.Content>
                                        </List.Item>
                                    ))}
                                </List>
                            </Segment>
                        ) : null}

                        <Grid.Row>
                            <Form.Input label="Pesquisar curso (Código, Sigla ou Nome)" placeholder="Pesquisar ..." fluid onChange={_.debounce(searchCourse, 900)}/>
                        </Grid.Row>
                        <Grid.Row>
                            <Table color="green">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Código</Table.HeaderCell>
                                        <Table.HeaderCell>Sigla</Table.HeaderCell>
                                        <Table.HeaderCell>Nome</Table.HeaderCell>
                                        <Table.HeaderCell>Adicionar?</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {courseList.map((course, index) => (
                                        <Table.Row key={index}>
                                            <Table.Cell>{course.code}</Table.Cell>
                                            <Table.Cell>{course.initials}</Table.Cell>
                                            <Table.Cell>{course.name}</Table.Cell>
                                            <Table.Cell>
                                                <Button onClick={() => addCourse(course)} color="teal" disabled={courses.find(({id: courseId}) => courseId === course.id)} >
                                                    Adicionar
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </Grid.Row>
                        <Grid.Row>
                            <PaginationDetail currentPage={currentPage} info={paginationInfo} eventHandler={changedPage} />
                        </Grid.Row>
                        {loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>
                                    A carregar os cursos
                                </Loader>
                            </Dimmer>
                        )}
                    </>
                )}
            </Grid>
        </Container>
    );
};

export default Step3;
