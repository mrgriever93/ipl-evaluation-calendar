import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {Icon, Table, Header, Tab, Modal, Form, Button} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../../utils/toastConfig';

const CourseTabs = ({ courseId, isLoading }) => {
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [unitToAdd, setUnitToAdd] = useState([]);
    const [courseUnits, setCourseUnits] = useState({});
    const [listOfUnits, setListOfUnits] = useState([]);

    const loadCourseDetailUnits = () => {
        setLoading(true);
        isLoading = true;
        axios.get(`/courses/${courseId}/units`).then((res) => {
            setLoading(false);
            isLoading = false;
            setCourseUnits(res.data.data);
        });
    };

    useEffect(() => {
        loadCourseDetailUnits();
    }, [courseId]);

    const courseUnitsGrouped = _.groupBy(courseUnits, (courseUnit) => courseUnit.curricularYear);

    const removeCourseUnit = (unitId) => {
        axios.delete(`/courses/${courseId}/unit/${unitId}`).then((res) => {
            if (res.status === 200) {
                toast('Estudante removido com sucesso do curso!', successConfig);
            } else {
                toast('Ocorreu um problema ao remover o estudante do curso!', errorConfig);
            }
        });
    };

    const addCourseUnit = () => {
        setOpenModal(false);
        axios.patch(`/courses/${courseId}/unit`, {
            unit_id: unitToAdd
        }).then((res) => {
            if (res.status === 200) {
                loadCourseDetailUnits();
                toast('Aluno adicionado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao adicionar o aluno!', errorConfig);
            }
        });
    };

    const searchUnits = (e, {searchQuery}) => {
        axios.get(`/search/students?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setListOfUnits(res.data?.map((unit) => ({
                    key: unit.id,
                    value: unit.id,
                    text: `(${unit.code}) - ${unit.label}`
                })));
            }
        });
    };

    return (
        <Tab.Pane loading={loading} key='tab_units'>
            {Object.keys(courseUnitsGrouped).map((year) => (
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
                        {courseUnitsGrouped[year].map((unit, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>{unit.code}</Table.Cell>
                                <Table.Cell>{unit.name}</Table.Cell>
                                <Table.Cell>{unit.initials}</Table.Cell>
                                <Table.Cell>{unit.branch?.name}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            ))}

            {openModal && (
                <Modal dimmer="blurring" open={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>Adicionar Unidade curricular</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Dropdown
                                placeholder="Procurar pelo email do aluno"
                                label="Aluno a adicionar"
                                search
                                selection
                                options={listOfUnits}
                                onChange={(e, {value}) => setUnitToAdd(
                                    listOfUnits.find((x) => x.value === value),
                                )}
                                onSearchChange={_.debounce(searchUnits, 400)}
                            />
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={() => { setUnitToAdd(undefined);setOpenModal(false); }}>
                            Cancelar
                        </Button>
                        <Button positive onClick={addCourseUnit}>
                            Adicionar
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        </Tab.Pane>
    );
};

export default CourseTabs;
