import React, {useEffect, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {Button, Form, Header, Icon, Label, Message, Grid, GridColumn, Modal, Sticky, Table} from 'semantic-ui-react';
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
    const [hasNoMethods, setHasNoMethods] = useState(false);
    const [hasOverWeight, setHasOverWeight] = useState(false);
    const [isUncomplete, setIsUncomplete] = useState(false);
    const [missingTypes, setMissingTypes] = useState(false);
    const [emptyWeight, setEmptyWeight] = useState(false);
    const [underWeight, setUnderWeight] = useState(false);

    const [epochs, setEpochs] = useState([]);
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [removedMethods, setRemovedMethods] = useState([]);
    const [openClone, setOpenClone] = React.useState(false)
    const [selectedEpochFrom, setSelectedEpochFrom] = useState(-1);
    const [selectedEpochTo, setSelectedEpochTo] = useState([]);

    const isFormValid = (methodList) => {
        let isValid = true;
        let hasOverValue = false;
        let HasUncompleteData = false;
        let noMethods = true;
        let hasMissingTypes = false;
        let hasEmptyWeight = false;
        let hasUnderWeight = false;

        if(methodList?.length > 0 ) {
            methodList.forEach((item) => {
                /*
                //check if it has methods
                if (!item.methods?.length) {
                    isValid = false;
                    HasUncompleteData = true;
                }
                 */
                // check if it has more than 100%
                let methodWeight = item.methods.reduce((acc, curr) => curr.weight + acc, 0);
                if (methodWeight > 100) {
                    hasOverValue = true;
                }
                if (item.methods.length > 0 && methodWeight < 100) {
                    hasUnderWeight = true;
                    isValid = false;
                }
                //check if the existing methods have all fields filled
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
                if(item.methods.length > 0){
                    noMethods = false;
                }
            });
        }
        if(noMethods){
            isValid = false;
        }

        setHasWarnings(HasUncompleteData || hasMissingTypes || hasOverValue || hasEmptyWeight || hasUnderWeight || noMethods);
        setEmptyWeight(hasEmptyWeight);
        setIsUncomplete(HasUncompleteData);
        setMissingTypes(hasMissingTypes);
        setHasOverWeight(hasOverValue);
        setUnderWeight(hasUnderWeight);
        setHasNoMethods(noMethods);
        setFormValid(isValid);
    };

    useEffect(() => {
        axios.get('/evaluation-types').then((res) => {
            if (res.status === 200) {
                res.data.data.unshift({id: '', name: t("Selecionar Tipo de avaliação"), enabled: true});
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
                        weight: method.weight,
                        description_pt: method.description_pt,
                        description_en: method.description_en,
                    })
                });
            });
            setIsLoading(true);
            axios.post('/methods', {methods: [...methods], removed: [...removedMethods]}).then((res) => {
                setIsSaving(false);
                loadMethods();
                if (res.status === 200) {
                    toast(t('Métodos de avaliação criados com sucesso!'), successConfig);
                    setRemovedMethods([]);
                } else {
                    toast(t('Não foi possível criar os métodos de avaliação!'), errorConfig);
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
                description_pt: '',
                description_en: '',
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
    const cloneMethods = () => {
        if( selectedEpochFrom === -1 || selectedEpochTo.length === 0 ) {
            toast(t('Tens de selecionar as duas épocas que pretendes copiar! De onde para onde.'), errorConfig);
            return false;
        }

        if( selectedEpochTo.includes(selectedEpochFrom) ) {
            toast(t('As épocas selecionadas têm de ser diferentes!'), errorConfig);
            return false;
        }
        
        let methodsToClone = JSON.parse(JSON.stringify(epochs.find((epoch) => epoch.id === selectedEpochFrom).methods));
        selectedEpochTo.forEach((item) => {
            let currEpochIndex = epochs.findIndex((epoch) => epoch.id === item);
            if(epochs[currEpochIndex].methods.length > 0){
                epochs[currEpochIndex].methods.forEach((meth) => {
                    setRemovedMethods((current) => [...current, meth.id]);
                })
            }
            epochs[currEpochIndex].methods = methodsToClone;
            epochs[currEpochIndex].methods.forEach((item) => delete item.id);
        });

        toast(t('Success!'), successConfig);
        isFormValid(epochs);
        closeModal();
    }

    const epochFromDropdownOnChange = (event, value) => {
        setSelectedEpochFrom(value);
    };

    const epochToDropdownOnChange = (event, value) => {
        setSelectedEpochTo(value);
    };

    const closeModal = () => {
        setSelectedEpochFrom(-1);
        setSelectedEpochTo([]);
        setOpenClone(false);
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
                                { hasNoMethods && (
                                    <Message.Item>{ t('É necessário no minimo configurar algum dos métodos.') }</Message.Item>
                                )}
                                { missingTypes && (
                                    <Message.Item>{ t('É necessário configurar o todos os tipos de avaliação nos métodos') }</Message.Item>
                                )}
                                { emptyWeight && (
                                    <Message.Item>{ t('É necessário ter o peso de avaliação em todos os métodos') }</Message.Item>
                                )}
                                { underWeight && (
                                    <Message.Item>{ t('É necessário ter no minimo 100% nos métodos') }</Message.Item>
                                )}
                            </Message.List>
                        </Message>
                    )}
                    <Sticky offset={50}>
                        <div className='sticky-methods-header'>
                            <Button onClick={() => setOpenClone(true)} icon labelPosition="left" color="yellow">
                                <Icon name={"clone outline"}/>{ t("Duplicar metodos") }
                            </Button>
                            <Button onClick={onSubmit} color="green" icon labelPosition="left" loading={isSaving} disabled={!formValid}>
                                <Icon name="save"/>{ t("Guardar") }
                            </Button>
                        </div>
                    </Sticky>
                    {epochs?.map((item, index) => (
                        <div className={ index > 0 ? "margin-top-m" : ""} key={index}>
                            <Header as="span">{item.name}</Header>
                            <Table compact celled className={"definition-last"}>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>{ t("Tipo de avaliação") }</Table.HeaderCell>
                                        <Table.HeaderCell>{ t("Descrição") }</Table.HeaderCell>
                                        <Table.HeaderCell>{ t("Nota mínima") }</Table.HeaderCell>
                                        <Table.HeaderCell>{ t("Peso da avaliação") } (%)</Table.HeaderCell>
                                        <Table.HeaderCell/>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {item.methods?.map((method, methodIndex) => (
                                        <Table.Row key={methodIndex}>
                                            <Table.Cell width={3}>
                                                <Form.Dropdown placeholder={t("Selecionar Tipo de avaliação")} fluid value={method.evaluation_type_id} selection search
                                                    options={evaluationTypes.map(({id, name, enabled}) => (enabled ? ({
                                                        key: id,
                                                        value: id,
                                                        text: name,
                                                    }) : undefined))}
                                                    onChange={
                                                        (ev, {value}) => setEpochs((current) => {
                                                            const copy = [...current];
                                                            copy[index].methods[methodIndex].evaluation_type_id = value;
                                                            if(value == "" || !value) {
                                                                copy[index].methods[methodIndex].description_pt = "";
                                                                copy[index].methods[methodIndex].description_en = "";
                                                            } else {
                                                                copy[index].methods[methodIndex].description_pt = evaluationTypes.filter((x) => x.id === value)[0].name_pt+" "+(methodIndex+1);
                                                                copy[index].methods[methodIndex].description_en = evaluationTypes.filter((x) => x.id === value)[0].name_en+" "+(methodIndex+1);
                                                            }
                                                            return copy;
                                                        })
                                                    }
                                                />
                                            </Table.Cell>
                                            <Table.Cell width={3}>
                                                <Form.Input placeholder={t("Descrição PT")} fluid value={method.description_pt} 
                                                    onChange={
                                                        (ev, {value}) => setEpochs((current) => {
                                                            const copy = [...current];
                                                            copy[index].methods[methodIndex].description_pt = value;
                                                            return copy;
                                                        })
                                                    } />
                                                
                                                <Form.Input placeholder={t("Descrição EN")} fluid value={method.description_en} className="margin-top-base"  
                                                    onChange={
                                                        (ev, {value}) => setEpochs((current) => {
                                                            const copy = [...current];
                                                            copy[index].methods[methodIndex].description_en = value;
                                                            return copy;
                                                        })
                                                    } />
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
                                        <Table.HeaderCell colSpan='8'>
                                            { t("Total pesos avaliacao:") } <Label color={(getEpochValue(index) > 100 ? "red" : (getEpochValue(index) === 100 ? "green" : "yellow"))}>{ (epochs[index].methods || [])?.reduce((a, b) => a + (b?.weight || 0), 0)  }%</Label>
                                            <Button floated='right' icon labelPosition='left' color={"green"} size='small' onClick={() => {addNewMethod(index, item.id);}}>
                                                <Icon name='plus' /> { t("Adicionar novo método") }
                                            </Button>
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Footer>
                            </Table>
                        </div>
                    ))}
                </div>
            )}

            <FinalForm onSubmit={cloneMethods}
                // initialValues={{
                //     epochFromInput: -1,
                //     epochToInput: -1,
                // }}
                render={({handleSubmit}) => (
                    <Modal onClose={closeModal} onOpen={() => setOpenClone(true)} open={openClone}>
                        <Modal.Header>{t("Duplicar Métodos")}</Modal.Header>
                        <Modal.Content>
                            <Form>
                                <Header as="h4">{t("Seleciona que épocas pretendes duplicar")}</Header>
                                <Grid columns={2}>
                                    <GridColumn>
                                        <Field name="epoch">
                                            {({input: epochFromInput}) => (
                                                <Form.Dropdown
                                                    options={epochs.map((epoch) => ({ key: epoch.id, value: epoch.id, text: epoch.name, disabled: selectedEpochTo.includes(epoch.id) || epoch.methods.length === 0 }))}
                                                    value={selectedEpochFrom || -1} placeholder={t("Época a copiar")} selectOnBlur={false} selection search label={ t("De") }
                                                    onChange={(e, {value}) => epochFromDropdownOnChange(e, value)}
                                                />
                                            )}
                                        </Field>
                                    </GridColumn>
                                    <GridColumn>
                                        <Field name="epoch">
                                            {({input: epochToInput}) => (
                                                <Form.Dropdown
                                                    options={epochs.map((epoch) => ({ key: epoch.id, value: epoch.id, text: epoch.name, disabled: epoch.id === selectedEpochFrom}))}
                                                    value={selectedEpochTo || []} selectOnBlur={false} placeholder={t("Épocas a receber")} multiple selection search label={ t("Para") }
                                                    onChange={(e, {value}) => epochToDropdownOnChange(e, value)}
                                                />
                                            )}
                                        </Field>
                                    </GridColumn>
                                </Grid>
                            </Form>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button negative onClick={closeModal}>{ t("Cancel") }</Button>
                            <Button positive onClick={handleSubmit}>{ t("Duplicar") }</Button>
                        </Modal.Actions>
                    </Modal>
                )}
            />
        </div>
    )
};
//<!-- disabled={!((methods[index] || [])?.reduce((a, b) => a + (b?.weight || 0), 0) < 100)} -->
export default UnitTabMethods;
