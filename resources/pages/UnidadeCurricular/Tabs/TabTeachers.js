import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {Icon, Table, Form, Button, Modal, Tab, Card, List} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../../utils/toastConfig';
import {useComponentIfAuthorized} from "../../../components/ShowComponentIfAuthorized";
import SCOPES from "../../../utils/scopesConstants";
import Teachers from "../../../components/Filters/Teachers";

const UnitTabTeacher = ({ courseId, isLoading }) => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [listOfStudents, setListOfStudents] = useState([]);
    const [studentToAdd, setStudentToAdd] = useState([]);
    const [searchStudent, setSearchStudent] = useState(false);


    const [teachers, setTeachers] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [methods, setMethods] = useState([]);
    const [responsibleUser, setResponsibleUser] = useState(undefined);
    const [loadingResponsibles, setLoadingResponsibles] = useState(false);
    const [courseUnitTeachers, setCourseUnitTeachers] = useState([]);

    const loadCourseStudents = () => {
        setLoading(true);
        isLoading = true;
        axios.get(`/courses/${courseId}/students`).then((res) => {
            setLoading(false);
            isLoading = false;
            setStudents(res.data.data);
        });
    };



    const removeStudent = (studentId) => {
        axios.delete(`/courses/${courseId}/student/${studentId}`).then((res) => {
            if (res.status === 200) {
                toast('Estudante removido com sucesso do curso!', successConfig);
            } else {
                toast('Ocorreu um problema ao remover o estudante do curso!', errorConfig);
            }
        });
    };

    const searchStudents = (e, {searchQuery}) => {
        setSearchStudent(true);
        axios.get(`/search/students?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setListOfStudents(res.data?.map((students) => ({
                    key: students.mail,
                    value: students.mail,
                    text: `${students.name} - ${students.mail}`,
                    email: students.mail,
                    name: students.name,
                })));
                setSearchStudent(false);
            }
        });
    };

    const addStudent = () => {
        setOpenModal(false);
        axios.patch(`/courses/${courseId}/student`, {
            user_email: studentToAdd.email,
            user_name: studentToAdd.name,
        }).then((res) => {
            if (res.status === 200) {
                loadCourseStudents();
                toast('Aluno adicionado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao adicionar o aluno!', errorConfig);
            }
        });
    };

    useEffect(() => {
        loadCourseStudents();
    }, [courseId]);

    const setResponsible = () => {
        axios.patch(`/course-units/${paramsId}/responsible`, {
            responsible_user_name: responsibleUser?.name,
            responsible_user_email: responsibleUser?.email,
        }).then((res) => {
            if (res.status === 200) {
                fetchDetail();
                toast('Guardou o responsável da UC com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao guardar o responsável da UC!', errorConfig);
            }
        });
    };

    const hasPermissionToDefineResponsible = useComponentIfAuthorized(
        [SCOPES.DEFINE_COURSE_UNIT_RESPONSIBLE],
    );
    const hasPermissionToDefineTeachers = useComponentIfAuthorized(
        [SCOPES.DEFINE_COURSE_UNIT_TEACHERS],
    );

    const handleSearchResponsible = (e, {searchQuery}) => {
        setLoadingResponsibles(true);
        axios.get(`/search/users?q=${searchQuery}`).then((res) => {
            setLoadingResponsibles(false);
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

    const handleSearchTeachers = (e, {searchQuery}) => {
        axios.get(`/search/users?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setTeacherList(res.data?.map(({mail, name}) => ({
                    key: mail,
                    value: mail,
                    name,
                    text: `${name} - ${mail}`,
                })));
            }
        });
    };

    return (
        <Tab.Pane loading={loading} key='tab_students'>
            <Card fluid>
                <Card.Content header={'Professores da UC'}/>
                <Card.Content>
                    <Form>
                        <Teachers isSearch={false} eventHandler={(e, {value, options}) => {
                            setResponsibleUser(
                                {
                                    email: value,
                                    name: options.find((x) => x.value === value).name
                                },
                            );
                        }} isDisabled={loading || !hasPermissionToDefineResponsible}/>
                        <Form.Group widths="2">
                            <Form.Field name="teacherList">
                                    <Form.Dropdown
                                        disabled={loading || !hasPermissionToDefineTeachers}
                                        selection
                                        options={teacherList}
                                        onChange={(e, {value, key, options}) => {
                                            setCourseUnitTeachers((current) => [
                                                ...current,
                                                {
                                                    id: key,
                                                    name: options.find((x) => x.value === value).name,
                                                    email: value,
                                                },
                                            ]);
                                        }}
                                        onSearchChange={_.debounce(handleSearchTeachers, 400)}
                                        label="Professores"
                                        loading={loadingResponsibles}
                                        search
                                        placeholder="Procurar professores"
                                    />
                            </Form.Field>
                        </Form.Group>
                        {courseUnitTeachers?.length > 0 && (
                            <Form.Field name="teacherList">
                                <List divided verticalAlign="middle">
                                    {courseUnitTeachers?.map(({name, email, id}, index) => (
                                        <List.Item key={id}>
                                            <List.Content floated="right">
                                                <Button
                                                    disabled={!hasPermissionToDefineTeachers}
                                                    onClick={() => setCourseUnitTeachers((current) => {
                                                        const copy = [...current];
                                                        copy.splice(index, 1);
                                                        return copy;
                                                    })}
                                                    color="red"
                                                >
                                                    Remover
                                                </Button>
                                            </List.Content>
                                            <List.Content>{name + ' - ' + email}</List.Content>
                                        </List.Item>
                                    ))}
                                </List>
                            </Form.Field>
                        )}
                    </Form>
                </Card.Content>
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
                                loading={searchStudent}
                                options={listOfStudents}
                                onChange={(e, {value}) => setStudentToAdd(
                                    listOfStudents.find((x) => x.value === value),
                                )}
                                onSearchChange={_.debounce(searchStudents, 400)}
                            />
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={() => { setStudentToAdd(undefined);setOpenModal(false); }}>
                            Cancelar
                        </Button>
                        <Button positive onClick={addStudent}>
                            Adicionar
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        </Tab.Pane>
    );
};

export default UnitTabTeacher;
