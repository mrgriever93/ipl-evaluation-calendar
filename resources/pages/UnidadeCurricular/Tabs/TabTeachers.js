import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {Table, Form, Button, Tab, Card, List} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../../utils/toastConfig';
import {useComponentIfAuthorized} from "../../../components/ShowComponentIfAuthorized";
import SCOPES from "../../../utils/scopesConstants";
import Teachers from "../../../components/Filters/Teachers";
import {useTranslation} from "react-i18next";

const UnitTabTeacher = ({ unitId, isLoading }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [teacherToAdd, setTeacherToAdd] = useState();
    const [responsibleUser, setResponsibleUser] = useState();
    const [courseUnitTeachers, setCourseUnitTeachers] = useState([]);

    const loadCourseUnitTeachers = () => {
        setLoading(true);
        isLoading = true;
        axios.get(`/course-units/${unitId}/teachers`).then((res) => {
            setLoading(false);
            isLoading = false;
            setCourseUnitTeachers(res.data.data);
        });
    };

    const addTeacher = () => {
        axios.patch(`/course-units/${unitId}/teacher`, {
            teacher: teacherToAdd
        }).then((res) => {
            if (res.status === 200) {
                loadCourseStudents();
                toast('Aluno adicionado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao adicionar o aluno!', errorConfig);
            }
        });
    };

    const removeTeacher = (teacherId) => {
        axios.delete(`/course-units/${unitId}/teacher/${teacherId}`).then((res) => {
            if (res.status === 200) {
                toast('Professor removido com sucesso da unidade curricular!', successConfig);
            } else {
                toast('Ocorreu um problema ao remover o professor da unidade curricular!', errorConfig);
            }
        });
    };

    const setResponsible = () => {
        axios.patch(`/course-units/${unitId}/responsible`, {
            responsible_teacher: responsibleUser
        }).then((res) => {
            if (res.status === 200) {
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

    const handleSearchTeachers = (teacher) => {
        setTeacherToAdd(teacher);
    }

    useEffect(() => {
        loadCourseUnitTeachers();
    }, [unitId]);

    return (
        <Card fluid>
            <Card.Content>
                <Form>
                    <Form.Group widths="2">
                        <Teachers isSearch={false} eventHandler={(value) => handleSearchTeachers(value)} isDisabled={loading || !hasPermissionToDefineTeachers}/>
                        <Button onClick={addTeacher} color={"green"}>Add Teacher</Button>
                    </Form.Group>
                </Form>
            </Card.Content>
            <Card.Content>
            <Table striped color="green">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Nome</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                        <Table.HeaderCell>Responsavel</Table.HeaderCell>
                        <Table.HeaderCell>Acoes</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {courseUnitTeachers?.map((teacher) => (
                        <Table.Row>
                            <Table.Cell>{teacher.name}</Table.Cell>
                            <Table.Cell>{teacher.email}</Table.Cell>
                            <Table.Cell>{teacher.isResponsable}</Table.Cell>
                            <Table.Cell>
                                <Button disabled={!hasPermissionToDefineTeachers} onClick={() => removeTeacher(teacher.id)} color="red">Remover</Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            </Card.Content>
        </Card>
    );
};

export default UnitTabTeacher;
