import React, {useEffect, useState} from 'react';
import {Button, Card, Dimmer, Form, Header, Icon, List, Loader, Menu, Progress, Tab, Table} from 'semantic-ui-react';
import axios from "axios";
import {toast} from "react-toastify";
import {errorConfig, successConfig} from "../../../utils/toastConfig";

const UnitTabMethods = ({ unitId }) => {
    const [epochs, setEpochs] = useState([]);
    const [courseUnit, setCourseUnit] = useState();
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
                if (!(
                    method.weight
                    && method.evaluation_type_id
                    && method.minimum >= 0
                    && method.minimum <= 20)) {
                    isValid = false;
                }
            });
        });

        return isValid;
    };

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

            const body = methods
                .reduce(
                    (acc, curr, epochIndex) => [...acc, ...curr.map((x) => (
                        {
                            id: x.id || undefined,
                            course_unit_id: unitId,
                            epoch_type_id: epochs[epochIndex].epoch_type_id,
                            evaluation_type_id: x.evaluation_type_id,
                            minimum: x.minimum,
                            weight: x.weight,
                        }))],
                    [],
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

    useEffect(() => {
        axios.get('/evaluation-types').then((res) => {
            if (res.status === 200) {
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
                setCourseUnit(res.data.courseUnit);
                if (res.data.epochs?.length) {
                    setNoCalendarCreated(false);
                    setEpochs(res.data.epochs);
                }
            }
        });
    }, [unitId]);

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

    return (
        <Tab.Pane loading={false} key='tab_students'>


            <Card fluid>
                <Card.Content header={`Métodos de avaliação para a Unidade Curricular: ${courseUnit || ''}`}/>
                {isLoading && (
                    <Dimmer active inverted>
                        <Loader indeterminate>A carregar os métodos</Loader>
                    </Dimmer>
                )}
                { isLoading ? null : noCalendarCreated ? (
                    <Card.Content header="Não existem calendários criados que incluam esta unidade curricular!" />
                ) : (
                    <>
                        <Card.Content>
                            {epochs.map((x, index) => (
                                <Card fluid key={x.name}>
                                    <Card.Content>
                                        <Wrapper>
                                            <Header as="span">{x.name}</Header>
                                            {((methods[index] || [])?.reduce(
                                                (a, b) => a + (b?.weight || 0), 0,
                                            ) < 100) && (
                                                <Button
                                                    floated="right"
                                                    color="green"
                                                    onClick={() => {
                                                        setMethods((current) => {
                                                            const copy = [...current];
                                                            if (!copy[index]?.length) {
                                                                copy[index] = [];
                                                            }
                                                            copy[index].push({
                                                                epoch_type_id: x.epoch_type_id,
                                                                weight: 100 - copy[index].reduce(
                                                                    (a, b) => a + (b?.weight || 0), 0,
                                                                ),
                                                                minimum: 9.5,
                                                                evaluation_type_id: undefined,
                                                            });
                                                            return copy;
                                                        });
                                                    }}
                                                >
                                                    Adicionar novo método
                                                </Button>
                                            )}
                                        </Wrapper>

                                    </Card.Content>
                                    <Card.Content>
                                        <Progress indicating percent={methods[index]?.reduce((a, b) => a + (b?.weight || 0), 0)} progress>
                                            Ajuste os pesos dos métodos de avaliação até resultar em 100%
                                        </Progress>
                                        {loadingMethods ? (
                                            <Dimmer active inverted>
                                                <Loader indeterminate>A carregar os métodos</Loader>
                                            </Dimmer>
                                        ) : (
                                            <List>
                                                <List.Item>
                                                    <List.Content>
                                                        <Card.Group itemsPerRow={3}>
                                                            {methods[index]?.map((method, methodIndex) => (
                                                                <Card>
                                                                    <Card.Content>
                                                                        <Form>
                                                                            <Form.Dropdown
                                                                                label="Tipo de avaliação"
                                                                                options={evaluationTypes.map(({id, description, enabled}) => (enabled ? ({
                                                                                    key: id,
                                                                                    value: id,
                                                                                    text: description,
                                                                                }) : undefined))}
                                                                                onChange={
                                                                                    (ev, {value}) => setMethods((current) => {
                                                                                        const copy = [...current];
                                                                                        copy[index][methodIndex].evaluation_type_id = value;
                                                                                        return copy;
                                                                                    })
                                                                                }
                                                                                value={method.evaluation_type_id}
                                                                                selection
                                                                                search
                                                                            />
                                                                            <Form.Field
                                                                                label="Nota mínima"
                                                                                type="number"
                                                                                control="input"
                                                                                step="0.5"
                                                                                min="0"
                                                                                max="20"
                                                                                value={method.minimum}
                                                                                onChange={(ev) => setMethods((current) => {
                                                                                    const copy = [...current];
                                                                                    copy[index][methodIndex].minimum = parseFloat(
                                                                                        ev.target.value,
                                                                                    );
                                                                                    return copy;
                                                                                })}
                                                                            />
                                                                            <Form.Field label="Peso da avaliação (%)" type="number" control="input" step="10" min="0" max="100" value={method.weight}
                                                                                        onChange={(ev) => setMethods((current) => {
                                                                                            const copy = [...current];
                                                                                            copy[index][methodIndex].weight = parseInt(
                                                                                                ev.target.value, 10,
                                                                                            );
                                                                                            return copy;
                                                                                        })}
                                                                            />
                                                                        </Form>
                                                                    </Card.Content>
                                                                    <Card.Content extra>
                                                                        <Button icon labelPosition="left" color="red" onClick={() => removeMethod(index, methodIndex)}>
                                                                            <Icon name="trash"/>
                                                                            Remover método
                                                                        </Button>
                                                                    </Card.Content>
                                                                </Card>
                                                            ))}
                                                        </Card.Group>
                                                    </List.Content>
                                                </List.Item>
                                            </List>
                                        )}
                                    </Card.Content>
                                </Card>
                            ))}
                        </Card.Content>
                        <Card.Content extra>
                            <Button onClick={onSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} disabled={!formValid}>
                                <Icon name="save"/>
                                Guardar
                            </Button>
                        </Card.Content>
                    </>
                )
                }
            </Card>

        </Tab.Pane>
    )
};

export default UnitTabMethods;
