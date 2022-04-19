import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {Table, Tab, Modal, Form, Button, Icon, Segment, Grid, Divider, Header, Search} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../../utils/toastConfig';

const CourseTabsUnits = ({ courseId, isLoading }) => {
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [unitToAdd, setUnitToAdd] = useState([]);
    const [courseUnits, setCourseUnits] = useState({});
    const [listOfUnits, setListOfUnits] = useState([]);
    const [searchCurricularUnit, setSearchCurricularUnit] = useState(false);

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

    const addCourseUnit = (year) => {
        setOpenModal(false);
        axios.post(`/courses/${courseId}/unit`, {unit_id: unitToAdd})
            .then((res) => {
                if (res.status === 200) {
                    loadCourseDetailUnits();
                    toast('Aluno adicionado com sucesso!', successConfig);
                } else {
                    toast('Ocorreu um erro ao adicionar o aluno!', errorConfig);
                }
            });
    };

    const searchUnits = (e, {searchQuery}) => {
        setSearchCurricularUnit(true);
        axios.get(`/search/students?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setListOfUnits(res.data?.map((unit) => ({
                    key: unit.id,
                    value: unit.id,
                    text: `(${unit.code}) - ${unit.label}`
                })));
                setSearchCurricularUnit(false);
            }
        });
    };

    return (
        <Tab.Pane loading={loading} key='tab_units_content'>
            <Button floated='right' icon labelPosition='left' positive size='small' onClick={() => setOpenModal(true)}>
                <Icon name='add' /> Add Unit
            </Button>
            {Object.keys(courseUnitsGrouped).map((year, index) => (
                <Table striped color="green" key={index}>
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
                                <Table.Cell>{unit.branch_label}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            ))}

            {openModal && (
                <Modal dimmer="blurring" open={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>Adicionar Unidade curricular</Modal.Header>
                    <div>
                        <Segment placeholder>
                            <Grid columns={2} stackable textAlign='center'>
                                <Divider vertical>Or</Divider>
                                <Grid.Row verticalAlign='middle'>
                                    <Grid.Column>
                                        <Header icon>
                                            <Icon name='search' />
                                            Procurar unidades curriculares existentes
                                        </Header>
                                        <Form.Dropdown width={16} search selection
                                            placeholder="Procurar por unidade curricular"
                                            loading={searchCurricularUnit}
                                            options={listOfUnits}
                                            onChange={(e, {value}) => setUnitToAdd(
                                                listOfUnits.find((x) => x.value === value),
                                            )}
                                            onSearchChange={_.debounce(searchUnits, 400)}
                                        />
                                        <Button positive onClick={addCourseUnit} disabled={!!unitToAdd}>
                                            Adicionar
                                        </Button>
                                    </Grid.Column>

                                    <Grid.Column>
                                        <Header icon>
                                            <Icon name='book' />
                                            Adicionar Nova unidade curricular
                                        </Header>
                                        <Button positive>Nova</Button>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    </div>
                    <Modal.Actions>
                        <Button negative onClick={() => { setUnitToAdd(undefined);setOpenModal(false); }}>
                            Cancelar
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        </Tab.Pane>
    );
};

export default CourseTabsUnits;
