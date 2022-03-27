import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Container, Card, Icon, Table, Form, Button, Search, Modal, List, Header, Image, Grid,
} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {Field, Form as FinalForm} from 'react-final-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {useComponentIfAuthorized} from '../../components/ShowComponentIfAuthorized';
import SCOPES, {COURSE_SCOPES} from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import IplLogo from '../../../public/images/ipl.png';

const SweetAlertComponent = withReactContent(Swal);

const Detail = ({match}) => {
    const history = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [courseDetail, setCourseDetail] = useState({});
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [coordinatorUser, setCoordinatorUser] = useState(undefined);
    const [openModal, setOpenModal] = useState(false);
    const [listOfStudents, setListOfStudents] = useState([]);
    const [studentToAdd, setStudentToAdd] = useState([]);
    const [additionalBranches, setAdditionalBranches] = useState([]);

    const hasPermissionToEdit = useComponentIfAuthorized([SCOPES.EDIT_COURSES]);
    const hasPermissionToDefineCoordinator = useComponentIfAuthorized(
        [SCOPES.DEFINE_COURSE_COORDINATOR],
    );

    const loadCourseDetail = () => {
        setLoading(true);
        setAdditionalBranches([]);
        axios.get(`/courses/${paramsId}`).then((res) => {
            setLoading(false);
            const {coordinator} = res.data.data;
            setTeachers((current) => {
                current.push({key: coordinator?.id, value: coordinator?.id, text: coordinator?.name});
                return current;
            });
            setCourseDetail(res.data.data);
            setStudents(res.data.data.students);
        });
    };

    const handleSearchCoordinator = (e, {searchQuery}) => {
        axios.get(`/search/users?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setTeachers(res.data?.map(({mail, name}) => ({
                    key: mail,
                    value: mail,
                    name,
                    text: `${name} - ${mail}`,
                })));
            }
        });
    };

    const setCoordinator = () => {
        axios.patch(`/courses/${paramsId}/coordinator`, {
            coordinator_user_name: coordinatorUser.name,
            coordinator_user_email: coordinatorUser.email,
        }).then((res) => {
            if (res.status === 200) {
                toast('Guardou o coordenador de curso com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao guardar o coordenador de curso!', errorConfig);
            }
        });
    };

    useEffect(() => {
        if(/\d+/.test(paramsId)){
            loadCourseDetail();
        } else {
            history('/curso');
            toast('Ocorreu um erro ao carregar a informacao pretendida', errorConfig);
        }
    }, [paramsId, history]);

    const courseUnits = _.groupBy(
        courseDetail?.course_units,
        (courseUnit) => courseUnit.curricularYear,
    );

    const removeStudent = (studentId) => {
        axios.delete(`/courses/${paramsId}/student/${studentId}`).then((res) => {
            if (res.status === 200) {
                toast('Estudante removido com sucesso do curso!', successConfig);
            } else {
                toast('Ocorreu um problema ao remover o estudante do curso!', errorConfig);
            }
        });
    };

    const onSaveCourse = ({code, name, initials, level, duration}) => {
        axios.patch(`/courses/${paramsId}`, {
            code,
            name,
            initials,
            degree: level,
            num_years: duration,
            branches: [...additionalBranches.map((branch) => ({
                name: branch.name,
                initials: branch.name,
            }))],
        }).then((res) => {
            if (res.status === 200) {
                loadCourseDetail();
                toast('Curso atualizado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao gravar o curso!', errorConfig);
            }
        });
    };

    const searchStudents = (e, {searchQuery}) => {
        axios.get(`/search/students?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setListOfStudents(res.data?.map((students) => ({
                    key: students.mail,
                    value: students.mail,
                    text: `${students.name} - ${students.mail}`,
                    email: students.mail,
                    name: students.name,
                })));
            }
        });
    };

    const removeBranch = (branchId) => {
        SweetAlertComponent.fire({
            title: 'Atenção!',
            html: 'Ao eliminar este ramo, todas as UCs deste ramo, terão de ser atualizadas posteriormente!<br/><strong>Tem a certeza que deseja eliminar este ramo?</strong>',
            denyButtonText: 'Não',
            confirmButtonText: 'Sim',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    axios.delete(`/branches/${branchId}`).then((res) => {
                        if (res.status === 200) {
                            loadCourseDetail();
                            toast('Ramo eliminado com sucesso!', successConfig);
                        } else {
                            toast('Ocorreu um problema ao eliminar este ramo!', errorConfig);
                        }
                    });
                }
            });
    };

    const initialValues = useMemo(() => {
        const {
            code,
            name,
            initials,
            level,
            duration,
            coordinator,
        } = courseDetail || {};
        return {
            code,
            name,
            initials,
            level,
            duration,
            coordinator: coordinator?.id,
        };
    }, [courseDetail]);

    const addStudent = () => {
        setOpenModal(false);
        axios.patch(`/courses/${paramsId}/student`, {
            user_email: studentToAdd.email,
            user_name: studentToAdd.name,
        }).then((res) => {
            if (res.status === 200) {
                loadCourseDetail();
                toast('Aluno adicionado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao adicionar o aluno!', errorConfig);
            }
        });
    };

    return (
        <Container>
            <Card fluid>
                <FinalForm initialValues={initialValues} onSubmit={onSaveCourse} render={({handleSubmit}) => (
                        <>
                            <Card.Content>
                                <Card.Header>
                                    Curso: {' ' + courseDetail?.name}
                                    <Button floated="right" color="green" onClick={handleSubmit}>Guardar curso</Button>
                                </Card.Header>
                            </Card.Content>
                            <Card.Content>
                                <Form>
                                    <Form.Group>
                                        <Field name="code">
                                            {({input: codeInput}) => (
                                                <Form.Input disabled={loading || !hasPermissionToEdit} label="Código"{...codeInput}/>
                                            )}
                                        </Field>
                                        <Field name="name">
                                            {({input: nameInput}) => (
                                                <Form.Input disabled={loading || !hasPermissionToEdit} label="Nome"{...nameInput}/>
                                            )}
                                        </Field>
                                        <Field name="initials">
                                            {({input: initialsInput}) => (
                                                <Form.Input disabled={loading || !hasPermissionToEdit} label="Sigla"{...initialsInput}/>
                                            )}
                                        </Field>
                                        <Field name="level">
                                            {({input: levelInput}) => (
                                                <Form.Dropdown
                                                    disabled={loading || !hasPermissionToEdit}
                                                    label="Grau de Ensino"
                                                    selection
                                                    search
                                                    options={[
                                                        {
                                                            key: null,
                                                            value: null,
                                                            text: 'Selecione o grau de ensino',
                                                        },
                                                        {
                                                            key: 5,
                                                            value: 5,
                                                            text: 'TeSP',
                                                        },
                                                        {
                                                            key: 6,
                                                            value: 6,
                                                            text: 'Licenciatura',
                                                        },
                                                        {
                                                            key: 7,
                                                            value: 7,
                                                            text: 'Mestrado',
                                                        },
                                                        {
                                                            key: 8,
                                                            value: 8,
                                                            text: 'Doutoramento',
                                                        },
                                                    ]}
                                                    {...levelInput}
                                                    onChange={(e, {value}) => levelInput.onChange(value)}
                                                />
                                            )}

                                        </Field>
                                        <Field name="duration">
                                            {({input: durationInput}) => (
                                                <Form.Input disabled={loading || !hasPermissionToEdit} label="Número de anos"{...durationInput}/>
                                            )}
                                        </Field>
                                    </Form.Group>
                                    <Form.Group widths="2">
                                        <Field name="coordinator">
                                            {({input: coordinatorInput}) => (
                                                <Form.Dropdown
                                                    disabled={loading || !hasPermissionToDefineCoordinator}
                                                    label="Coordenador do Curso"
                                                    options={teachers}
                                                    selection
                                                    search
                                                    placeholder="Pesquise o coordenador de curso..."
                                                    {...coordinatorInput}
                                                    onSearchChange={_.debounce(handleSearchCoordinator, 400)}
                                                    onChange={(e, {value, options}) => {
                                                        setCoordinatorUser(
                                                            {
                                                                email: value,
                                                                name: options.find((x) => x.value === value).name
                                                            },
                                                        );
                                                        coordinatorInput.onChange(value);
                                                    }}

                                                />
                                            )}
                                        </Field>
                                        <Form.Button disabled={loading || !hasPermissionToDefineCoordinator}
                                                     label="Guardar?" onClick={setCoordinator} color="green" icon
                                                     labelPosition="left">
                                            <Icon name="save"/>
                                            Guardar coordenador
                                        </Form.Button>
                                    </Form.Group>
                                </Form>
                            </Card.Content>
                            <Card.Content extra>
                                <Grid padded="vertically">
                                    <Grid.Column width="8">
                                        <Grid.Row>
                                            <Header>Ramos</Header>
                                            <Button color="green" onClick={() => setAdditionalBranches((current) => [...current, {order: current.length}])}>
                                                Adicionar ramo
                                            </Button>
                                        </Grid.Row>
                                        <br/>
                                        <Grid.Row>
                                            <List>
                                                {courseDetail.branches?.map((branch) => (
                                                    <List.Item key={branch.id}>
                                                        <List.Content floated="right">
                                                            <Button color="red" onClick={() => removeBranch(branch.id)}>
                                                                Remover
                                                            </Button>
                                                        </List.Content>
                                                        <Image avatar src={IplLogo}/>
                                                        <List.Content>
                                                            {branch.name}
                                                        </List.Content>
                                                    </List.Item>
                                                ))}
                                                {additionalBranches.map((branch) => (
                                                    <List.Item key={branch.id}>
                                                        <List.Content floated="right">
                                                            <Button color="red"
                                                                    onClick={() => setAdditionalBranches(
                                                                        (current) => [...current.filter((x) => x.order !== branch.order)],
                                                                    )}>
                                                                Remover
                                                            </Button>
                                                        </List.Content>
                                                        <Image avatar src={IplLogo}/>
                                                        <List.Content>
                                                            <Form.Input placeholder="Nome do novo ramo"
                                                                onChange={(e, {value}) => setAdditionalBranches((current) => [...current.filter((x) => x.order !== branch.order), {
                                                                    order: branch.order,
                                                                    name: value
                                                                }])}
                                                            />
                                                        </List.Content>
                                                    </List.Item>
                                                ))}
                                            </List>
                                        </Grid.Row>
                                    </Grid.Column>
                                </Grid>
                            </Card.Content>
                            <Card.Content extra>
                                <Header>
                                    <Icon name="user"/>
                                    {' '}
                                    Alunos
                                </Header>
                                <Button color="green" onClick={() => setOpenModal(true)}>Adicionar aluno</Button>
                                <Table striped color="green">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Email</Table.HeaderCell>
                                            <Table.HeaderCell>Nome</Table.HeaderCell>
                                            <Table.HeaderCell>Ações</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {students.map((student) => (
                                            <Table.Row>
                                                <Table.Cell>{student.email}</Table.Cell>
                                                <Table.Cell>{student.name}</Table.Cell>
                                                <Table.Cell width="3">
                                                    <Button color="red" onClick={() => removeStudent(student.id)}>
                                                        <Icon name="trash"/>
                                                        Remover aluno
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </Card.Content>
                            <Card.Content extra>
                                <div>
                                    <Icon name="book"/>
                                    {' '}
                                    Unidades Curriculares
                                </div>
                                {Object.keys(courseUnits).map((year) => (
                                    <Table striped color="green">
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell rowSpan="1" colSpan="4">
                                                    Ano{' '}{year}
                                                </Table.HeaderCell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.HeaderCell>Codigo</Table.HeaderCell>
                                                <Table.HeaderCell>Nome</Table.HeaderCell>
                                                <Table.HeaderCell>Sigla</Table.HeaderCell>
                                                <Table.HeaderCell>Ramo</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>

                                        <Table.Body>
                                            {courseUnits[year].map((unit) => (
                                                <Table.Row>
                                                    <Table.Cell>{unit.code}</Table.Cell>
                                                    <Table.Cell>{unit.name}</Table.Cell>
                                                    <Table.Cell>{unit.initials}</Table.Cell>
                                                    <Table.Cell>{unit.branch?.name}</Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                ))}
                            </Card.Content>
                        </>
                    )}
                />
            </Card>
            {openModal && (
                <Modal dimmer="blurring" open={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>Adicionar aluno</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Dropdown
                                placeholder="Procurar pelo email do aluno"
                                label="Aluno a adicionar"
                                search
                                selection
                                options={listOfStudents}
                                onChange={(e, {value}) => setStudentToAdd(
                                    listOfStudents.find((x) => x.value === value),
                                )}
                                onSearchChange={_.debounce(searchStudents, 400)}
                            />
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative
                            onClick={() => {
                                setStudentToAdd(undefined);
                                setOpenModal(false);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button positive onClick={addStudent}>
                            Adicionar
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        </Container>
    );
};

export default Detail;
