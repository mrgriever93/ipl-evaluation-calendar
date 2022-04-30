import React, {useEffect, useState} from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Table, Modal, Form, Button, Icon, Segment, Grid, Divider, Header, Dimmer, Loader} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {useTranslation} from "react-i18next";
import {successConfig, errorConfig} from '../../../utils/toastConfig';

const CourseTabsUnits = ({ courseId, isLoading }) => {
    const { t } = useTranslation();
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
                toast(t('Unidade curricular removida com sucesso do curso!'), successConfig);
            } else {
                toast(t('Ocorreu um problema ao remover a unidade curricular do curso!'), errorConfig);
            }
        });
    };
    // TODO
    const addCourseUnit = () => {
        setOpenModal(false);
        axios.post(`/courses/${courseId}/unit`, {unit_id: unitToAdd.value})
            .then((res) => {
                if (res.status === 200) {
                    loadCourseDetailUnits();
                    toast(t('Unidade curricular adicionada com sucesso!'), successConfig);
                } else {
                    toast(t('Ocorreu um erro ao adicionar a unidade curricular!'), errorConfig);
                }
            });
    };

    const searchUnits = (e, {searchQuery}) => {
        setSearchCurricularUnit(true);
        axios.get(`/course-units/search?search=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setListOfUnits(res.data.data);
                setSearchCurricularUnit(false);
            }
        });
    };

    return (
        <div>
            { loading && (
                <div style={{height: "80px"}}>
                    <Dimmer active inverted>
                        <Loader indeterminate>{t('A carregar as unidades curriculares')}</Loader>
                    </Dimmer>
                </div>
            )}
            {!loading && (
                <>
                    {/* TODO - Maybe future work, add course unit from here
                    <Segment clearing basic className={"padding-none"}>
                        <Button floated='right' icon labelPosition='left' positive size='small' onClick={() => setOpenModal(true)}>
                            <Icon name='add' /> { t("Adicionar Unidade Curricular") }
                        </Button>
                    </Segment>
                    */}
                    { Object.keys(courseUnitsGrouped).map((year, index) => (
                        <Table striped color="green" key={index}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell rowSpan="1" colSpan="4">{ t("Ano") } {year}</Table.HeaderCell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.HeaderCell style={{width: '10%'}}>{ t("Código") }</Table.HeaderCell>
                                    <Table.HeaderCell style={{width: '55%'}}>{ t("Nome") }</Table.HeaderCell>
                                    <Table.HeaderCell style={{width: '15%'}}>{ t("Sigla") }</Table.HeaderCell>
                                    <Table.HeaderCell style={{width: '20%'}}>{ t("Ramo") }</Table.HeaderCell>
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
                </>
            )}

            {openModal && (
                <Modal dimmer="blurring" open={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>{ t("Adicionar Unidade Curricular") }</Modal.Header>
                    <div>
                        <Segment placeholder>
                            <Grid columns={2} stackable textAlign='center'>
                                <Divider vertical>{ t("Ou") }</Divider>
                                <Grid.Row verticalAlign='middle'>
                                    <Grid.Column>
                                        <Header icon><Icon name='search' />{ t("Procurar unidades curriculares existentes") }</Header>
                                        <Form.Dropdown width={16} search fluid selection placeholder={ t("Procurar por unidade curricular") }
                                            loading={searchCurricularUnit} options={listOfUnits} onSearchChange={_.debounce(searchUnits, 400)}
                                            onChange={(e, {value}) => setUnitToAdd(
                                                listOfUnits.find((x) => x.value === value),
                                            )}
                                        />
                                        <div className={"margin-top-base"}>
                                            <Button positive onClick={addCourseUnit} disabled={!unitToAdd}>{ t("Adicionar") }</Button>
                                        </div>
                                    </Grid.Column>

                                    <Grid.Column>
                                        <Header icon><Icon name='book' /> { t("Adicionar Nova unidade curricular") }</Header>
                                        <Button positive>{ t("Nova") }</Button>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    </div>
                    <Modal.Actions>
                        <Button negative onClick={() => { setUnitToAdd(undefined);setOpenModal(false); }}>{ t("Cancelar") }</Button>
                    </Modal.Actions>
                </Modal>
            )}
        </div>
    );
};

export default CourseTabsUnits;
