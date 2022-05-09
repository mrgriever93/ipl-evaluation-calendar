import React, {useEffect, useState} from 'react';
import {Button, Form, Header, Icon, Label, Message, Segment, Table} from 'semantic-ui-react';
import axios from "axios";
import {toast} from "react-toastify";
import {errorConfig, successConfig} from "../../../utils/toastConfig";
import Slider from "../../../components/Slider";
import EmptyTable from "../../../components/EmptyTable";
import {useTranslation} from "react-i18next";

const UnitTabMethods = ({ unitId, warningsHandler }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formValid, setFormValid] = useState(false);
    // Warnings
    const [hasWarnings, setHasWarnings] = useState(false);
    const [hasOverWeight, setHasOverWeight] = useState(false);
    const [isUncomplete, setIsUncomplete] = useState(false);
    const [missingTypes, setMissingTypes] = useState(false);
    const [emptyWeight, setEmptyWeight] = useState(false);

    const [epochs, setEpochs] = useState([]);
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [removedMethods, setRemovedMethods] = useState([]);

    const isFormValid = (methodList) => {
        let isValid = true;
        let hasOverValue = false;
        let HasUncompleteData = false;
        let hasMissingTypes = false;
        let hasEmptyWeight = false;
        if(methodList?.length > 0 ) {
            methodList.forEach((item) => {
                if (!item.methods?.length) {
                    isValid = false;
                    HasUncompleteData = true;
                }
                if (item.methods.reduce((acc, curr) => curr.weight + acc, 0) > 100) {
                    hasOverValue = true;
                }
                item.methods?.forEach((method) => {
                    if (!method.evaluation_type_id) {
                        hasMissingTypes = true;
                    }
                    if (!method.weight) {
                        hasEmptyWeight = true;
                    }
                    if (!(method.weight && method.evaluation_type_id && method.minimum >= 0 && method.minimum <= 20)) {
                        isValid = false;
                    }
                });
            });
        }
        setHasWarnings(HasUncompleteData || hasMissingTypes || hasOverValue || hasEmptyWeight);
        setEmptyWeight(hasEmptyWeight);
        setIsUncomplete(HasUncompleteData);
        setMissingTypes(hasMissingTypes);
        setHasOverWeight(hasOverValue);
        setFormValid(isValid);
    };

    useEffect(() => {
        axios.get('/evaluation-types').then((res) => {
            if (res.status === 200) {
                res.data.data.unshift({id: '', name: "Selecionar Tipo de avaliação", enabled: true});
                setEvaluationTypes(res.data.data);
            }
        });
    }, []);

    useEffect(() => {
        loadMethods();
    }, [unitId]);

    useEffect(() => {
        warningsHandler(hasWarnings);
    }, [hasWarnings]);

    useEffect(() => {
        isFormValid(epochs);
    }, [epochs]);

    const loadMethods = () => {
        setIsLoading(true);
        setEpochs([]);
        axios.get(`/course-units/${unitId}/methods`).then((res) => {
            if (res.status === 200) {
                setEpochs(res.data);
                setIsLoading(false);
            }
        });
    };

    const onSubmit = () => {
        if (!isSaving) {
            setIsSaving(true);
            let methods = [];
            epochs.map((item) =>{
                item.methods.map((method) => {
                    methods.push({
                        id: method.id || undefined,
                        course_unit_id: unitId,
                        epoch_type_id: item.id,
                        evaluation_type_id: method.evaluation_type_id,
                        minimum: method.minimum,
                        weight: method.weight
                    })
                });
            });
            axios.post('/methods', {methods: [...methods], removed: [...removedMethods]}).then((res) => {
                setIsSaving(false);
                //loadMethods();
                if (res.status === 200) {
                    toast('Métodos de avaliação criados com sucesso!', successConfig);
                } else {
                    toast('Não foi possível criar os métodos de avaliação!', errorConfig);
                }
            });
        }
    };
    // Get Epoch Type Total Value
    const getEpochValue = (index) => {
        return (epochs[index].methods || [])?.reduce((a, b) => a + (b?.weight || 0), 0);
    }

    //Remove method from epoch type record
    const removeMethod = (epochIndex, methodIndex) => {
        const removedId = epochs[epochIndex].methods[methodIndex]?.id;
        if (removedId) {
            setRemovedMethods((current) => [...current, removedId]);
        }
        setEpochs((current) => {
            const copy = [...current];
            copy[epochIndex].methods.splice(methodIndex, 1);
            return copy;
        });
    };

    //Remove method to epoch type record
    const addNewMethod = (index, epoch_id) => {
        setEpochs((prevEpochs) => {
            const copy = [...prevEpochs];
            if (!copy[index].methods?.length) {
                copy[index].methods = [];
            }
            copy[index].methods.push({
                epoch_type_id: epoch_id,
                weight: 100 - copy[index].methods.reduce((a, b) => a + (b?.weight || 0), 0,),
                minimum: 9.5,
                evaluation_type_id: undefined,
            });
            return copy;
        });
    }
    const updateMethodMinimum = (index, methodIndex, value) => {
        setEpochs((current) => {
            const copy = [...current];
            copy[index].methods[methodIndex].minimum = parseFloat(value);
            return copy;
        })
    }
    const updateMethodWeight = (index, methodIndex, value) => {
        setEpochs((current) => {
            const copy = [...current];
            copy[index].methods[methodIndex].weight = parseFloat(value);
            return copy;
        })
    }

    return (
        <div>
            { epochs?.length < 1 || isLoading ? (
                <EmptyTable isLoading={isLoading} label={t("Ohh! Não foi possível encontrar metodos para esta Unidade Curricular!")}/>
            ) : (
                <div>
                    { hasWarnings && (
                        <Message warning>
                            <Message.Header>{ t('Os seguintes detalhes do Curso precisam da sua atenção:') }</Message.Header>
                            <Message.List>
                                { hasOverWeight && (
                                    <Message.Item>{ t('Existem métodos com mais de 100% na avaliacao') }</Message.Item>
                                )}
                                { isUncomplete && (
                                    <Message.Item>{ t('É necessário configurar os métodos para todas as épocas') }</Message.Item>
                                )}
                                { missingTypes && (
                                    <Message.Item>{ t('É necessário configurar o todos os tipos de avaliação nos métodos') }</Message.Item>
                                )}
                                { emptyWeight && (
                                    <Message.Item>{ t('É necessário ter o peso de avaliação em todos os métodos') }</Message.Item>
                                )}
                            </Message.List>
                        </Message>
                    )}
                    <Segment basic>
                        <Button onClick={onSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} disabled={!formValid}>
                            <Icon name="save"/>
                            Guardar
                        </Button>
                    </Segment>
                    {epochs?.map((item, index) => (
                        <div className={"margin-top-base"} key={index}>
                            <Header as="span">{item.name}</Header>
                            <Table compact celled className={"definition-last"}>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell width={5}>Tipo de avaliação</Table.HeaderCell>
                                        <Table.HeaderCell width={5}>Nota mínima</Table.HeaderCell>
                                        <Table.HeaderCell width={5}>Peso da avaliação (%)</Table.HeaderCell>
                                        <Table.HeaderCell width={1} />
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {item.methods?.map((method, methodIndex) => (
                                        <Table.Row key={methodIndex}>
                                            <Table.Cell width={5}>
                                                <Form.Dropdown placeholder={"Selecionar Tipo de avaliação"} value={method.evaluation_type_id} selection search
                                                    options={evaluationTypes.map(({id, name, enabled}) => (enabled ? ({
                                                        key: id,
                                                        value: id,
                                                        text: name,
                                                    }) : undefined))}
                                                    onChange={
                                                        (ev, {value}) => setEpochs((current) => {
                                                            const copy = [...current];
                                                            copy[index].methods[methodIndex].evaluation_type_id = value;
                                                            return copy;
                                                        })
                                                    }
                                                />
                                            </Table.Cell>
                                            <Table.Cell width={5}>
                                                <Slider step="0.5" min="0" max="20" value={method.minimum} inputSide={"left"} eventHandler={(value) => updateMethodMinimum(index, methodIndex, value)} />
                                            </Table.Cell>
                                            <Table.Cell width={5}>
                                                <Slider step="5" min="0" max="100" value={method.weight} inputSide={"left"} valuePrefix={"%"} eventHandler={(value) => updateMethodWeight(index, methodIndex, value)}/>
                                            </Table.Cell>
                                            <Table.Cell collapsing width={1}>
                                                <Icon name={"trash"} onClick={() => removeMethod(index, methodIndex)}/>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>

                                <Table.Footer fullWidth>
                                    <Table.Row>
                                        <Table.HeaderCell colSpan='4'>
                                            Total pesos avaliacao: <Label color={(getEpochValue(index) > 100 ? "red" : (getEpochValue(index) === 100 ? "green" : "yellow"))}>{ (epochs[index].methods || [])?.reduce((a, b) => a + (b?.weight || 0), 0)  }%</Label>
                                            <Button floated='right' icon labelPosition='left' color={"green"} size='small' onClick={() => {addNewMethod(index, item.id);}}>
                                                <Icon name='plus' /> Adicionar novo método
                                            </Button>
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Footer>
                            </Table>
                        </div>
                    ))}
                </div>
            )
            }
        </div>
    )
};
//<!-- disabled={!((methods[index] || [])?.reduce((a, b) => a + (b?.weight || 0), 0) < 100)} -->
export default UnitTabMethods;
