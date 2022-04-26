import React, {useEffect, useState} from 'react';
import {Button, Card, Dimmer, Form, Header, Icon, Label, List, Loader, Progress, Table} from 'semantic-ui-react';
import axios from "axios";
import {toast} from "react-toastify";
import {errorConfig, successConfig} from "../../../utils/toastConfig";
import Slider from "../../../components/Slider";

const UnitTabMethods = ({ unitId }) => {
    const [epochs, setEpochs] = useState([]);
    const [noCalendarCreated, setNoCalendarCreated] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [methods, setMethods] = useState([]);
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [removedMethods, setRemovedMethods] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [formValid, setFormValid] = useState(false);

    const isFormValid = (methodList) => {
        let isValid = methodList.length > 0 && methodList.filter((x) => x).length === epochs.length;

        methodList.forEach((epochMethods) => {
            if (!epochMethods?.length) {
                isValid = false;
            }
            epochMethods?.forEach((method) => {
                if (epochMethods.reduce((acc, curr) => curr.weight + acc, 0) !== 100) {
                    isValid = false;
                    return;
                }
                if (!(method.weight && method.evaluation_type_id && method.minimum >= 0 && method.minimum <= 20)) {
                    isValid = false;
                }
            });
        });

        return isValid;
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
        if (epochs.length > 0) {
            loadMethods();
        }
    }, [epochs]);

    useEffect(() => {
        axios.get(`/course-units/${unitId}/epochs`).then((res) => {
            setIsLoading(false);
            if (res.status === 200) {
                console.log(res.data);
                if (res.data?.length) {
                    setNoCalendarCreated(false);
                    setEpochs(res.data);
                }
            }
        });
    }, [unitId]);

    useEffect(() => {
        setFormValid(isFormValid(methods));
    }, [methods]);

    const loadMethods = () => {
        setLoadingMethods(true);
        setMethods([]);
        axios.get(`/course-units/${unitId}/methods`).then((res) => {
            setLoadingMethods(false);
            if (res.status === 200) {
                res.data.forEach((method) => {
                    const index = epochs.findIndex((x) => x.epoch_type_id === method.epoch_type_id);
                    setMethods((current) => {
                        const copy = [...current];
                        if (!copy[index]?.length) {
                            copy[index] = [];
                        }
                        copy[index].push({
                            id: method.id,
                            epoch_type_id: method.epoch_type_id,
                            weight: parseInt(method.weight, 10),
                            minimum: parseFloat(method.minimum),
                            evaluation_type_id: method.evaluation_type_id,
                        });
                        return copy;
                    });
                });
            }
        });
    };

    const onSubmit = () => {
        if (!isSaving) {
            setIsSaving(true);

            const body = methods.reduce((acc, curr, epochIndex) => [...acc, ...curr.map((x) => ({
                            id: x.id || undefined,
                            course_unit_id: unitId,
                            epoch_type_id: epochs[epochIndex].epoch_type_id,
                            evaluation_type_id: x.evaluation_type_id,
                            minimum: x.minimum,
                            weight: x.weight
                        }))],
                    []
                );

            axios.post('/methods', {methods: [...body], removed: [...removedMethods]}).then((res) => {
                setIsSaving(false);
                loadMethods();
                if (res.status === 200) {
                    toast('Métodos de avaliação criados com sucesso!', successConfig);
                } else {
                    toast('Não foi possível criar os métodos de avaliação!', errorConfig);
                }
            });
        }
    };

    const removeMethod = (epochIndex, methodIndex) => {
        const removedId = methods[epochIndex][methodIndex]?.id;
        if (removedId) {
            setRemovedMethods((current) => [...current, removedId]);
        }
        setMethods((current) => {
            const copy = [...current];
            copy[epochIndex].splice(methodIndex, 1);
            return copy;
        });
    };
    const getEpochValue = (index) => {
        return (methods[index] || [])?.reduce((a, b) => a + (b?.weight || 0), 0);
    }

    const addNewMethod = (index, epoch_id) => {
        setMethods((prevMethods) => {
            const copy = [...prevMethods];
            if (!copy[index]?.length) {
                copy[index] = [];
            }
            copy[index].push({
                epoch_type_id: epoch_id,
                weight: 100 - copy[index].reduce((a, b) => a + (b?.weight || 0), 0,),
                minimum: 9.5,
                evaluation_type_id: undefined,
            });
            return copy;
        });
    }
    const updateMethodMinimum = (index, methodIndex, value) => {
        setMethods((current) => {
            const copy = [...current];
            copy[index][methodIndex].minimum = parseFloat(value);
            return copy;
        })
    }
    const updateMethodWeight = (index, methodIndex, value) => {
        setMethods((current) => {
            const copy = [...current];
            copy[index][methodIndex].weight = parseFloat(value);
            return copy;
        })
    }

    return (
        <div>
            {isLoading && (
                <Dimmer active inverted>
                    <Loader indeterminate>A carregar os métodos</Loader>
                </Dimmer>
            )}
            { isLoading ? null : noCalendarCreated ? (
                <div> Não existem calendários criados que incluam esta unidade curricular! </div>
            ) : (
                <div>
                    <Header as="span">Métodos de Avaliação</Header>
                    <Button onClick={onSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} disabled={!formValid}>
                        <Icon name="save"/>
                        Guardar
                    </Button>
                    {epochs.map((x, index) => (
                        <div className={"margin-top-base"} key={index}>
                            <Header as="span">{x.name}</Header>
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
                                    {methods[index]?.map((method, methodIndex) => (
                                        <Table.Row key={methodIndex}>
                                            <Table.Cell width={5}>
                                                <Form.Dropdown placeholder={"Selecionar Tipo de avaliação"} value={method.evaluation_type_id} selection search
                                                    options={evaluationTypes.map(({id, name, enabled}) => (enabled ? ({
                                                        key: id,
                                                        value: id,
                                                        text: name,
                                                    }) : undefined))}
                                                    onChange={
                                                        (ev, {value}) => setMethods((current) => {
                                                            const copy = [...current];
                                                            copy[index][methodIndex].evaluation_type_id = value;
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
                                            Total pesos avaliacao: <Label color={(getEpochValue(index) > 100 ? "red" : (getEpochValue(index) === 100 ? "green" : "yellow"))}>{ (methods[index] || [])?.reduce((a, b) => a + (b?.weight || 0), 0)  }%</Label>
                                            <Button floated='right' icon labelPosition='left' color={"green"} size='small' onClick={() => {addNewMethod(index, x.epoch_type_id);}}>
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
