import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {Icon, Table, Form, Button, Modal, Dimmer, Loader} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../../utils/toastConfig';
import {useTranslation} from "react-i18next";

const CourseTabsStudents = ({ courseId, isLoading }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [listOfStudents, setListOfStudents] = useState([]);
    const [studentToAdd, setStudentToAdd] = useState([]);
    const [searchStudent, setSearchStudent] = useState(false);

    const loadCourseStudents = () => {
        setLoading(true);
        isLoading = true;
        axios.get(`/courses/${courseId}/students`).then((res) => {
            setLoading(false);
            isLoading = false;
            setStudents(res.data.data);
        });
    };

    useEffect(() => {
        loadCourseStudents();
    }, [courseId]);


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

    return (
        <div>
            { loading && (                
                <div style={{height: "80px"}}>
                    <Dimmer active inverted>
                        <Loader indeterminate>{t('A carregar os estudantes')}</Loader>
                    </Dimmer>
                </div>
            )}
            {!loading && (
                <>
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
                            {students.map((student, index) => (
                                <Table.Row key={index}>
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
                </>
            )}

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
        </div>
    );
};

export default CourseTabsStudents;
