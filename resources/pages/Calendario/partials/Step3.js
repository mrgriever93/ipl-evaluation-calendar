import _ from 'lodash';
import React, {useEffect} from 'react';
import {Button, Container, Dimmer, Form, Grid, Image, List, Loader, Pagination, Segment, Table,} from 'semantic-ui-react';
import {Field, useField} from 'react-final-form';
import IplLogo from '../../../../public/images/ipl.png';

const Step3 = ({
                   allCourses,
                   setCourseList,
                   setAllCourses,
                   courses,
                   removeCourse,
                   courseList,
                   addCourse,
                   loadCourses,
                   loading,
                   setLoading,
                   paginationInfo,
                   setPaginationInfo,
                   onCourseSearch,
               }) => {
    const {input: coursesFieldInput} = useField('step3.courses');

    useEffect(() => {
        coursesFieldInput.onChange(courses);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courses]);

    const searchCourse = (evt, {value}) => {
        onCourseSearch(value);
    };

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
                                            <Image avatar src={IplLogo}/>
                                            <List.Content>
                                                {course.code + ' - ' + course.name}
                                            </List.Content>
                                        </List.Item>
                                    ))}
                                </List>
                            </Segment>
                        ) : null}

                        <Grid.Row>
                            <Form.Input label="Pesquisar curso (Código, Sigla ou Nome)" placeholder="Pesquisar ..." fluid
                                onChange={_.debounce(searchCourse, 900)}
                            />
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
                                    {courseList.map((course) => (
                                        <Table.Row>
                                            <Table.Cell>
                                                {course.code}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {course.initials}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {course.name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Button
                                                    onClick={() => addCourse(course)}
                                                    color="teal"
                                                    disabled={courses.find(
                                                        ({id: courseId}) => courseId
                                                            === course.id,
                                                    )}
                                                >
                                                    Adicionar
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>

                            <Pagination
                                secondary
                                pointing
                                fluid
                                activePage={paginationInfo.current_page}
                                totalPages={paginationInfo.last_page}
                                onPageChange={loadCourses}
                            />
                            {loading && (
                                <Dimmer active inverted>
                                    <Loader indeterminate>
                                        A carregar os cursos
                                    </Loader>
                                </Dimmer>
                            )}
                        </Grid.Row>
                    </>
                )}
            </Grid>
        </Container>
    );
};

export default Step3;
