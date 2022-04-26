import React, {useEffect, useState} from 'react';
import {DateInput} from 'semantic-ui-calendar-react-yz';
import {Container, Card, Form, Button, Icon, Checkbox,} from 'semantic-ui-react';
import {Field} from 'react-final-form';
import axios from "axios";

const Step2 = ({additionalInterruptions, setAdditionalInterruptions}) => {
    const [interruptionTypes, setInterruptionTypes] = useState([]);

    useEffect(() => {
        axios.get('/interruption-types').then((response) => {
            if (response.status === 200) {
                response.data.data.unshift({id: '', label: "Tipo de interrupção"});
                setInterruptionTypes(response.data.data?.map(({id, label}) => ({
                    key: id,
                    value: id,
                    text: label,
                })));
            }
        });
    }, []);

    return (
        <Container>
            <Card.Content>
                <Card.Group itemsPerRow={3}>
                    {additionalInterruptions.map((_, index) => (
                        <Field name={`step2.additional_interruptions.${index}.start_date`} key={'step2_field_' + index}>
                            {({input: startDateInput}) => (
                                <Field name={`step2.additional_interruptions.${index}.end_date`}>
                                    {({input: endDateInput}) => (
                                        <Field name={`step2.additional_interruptions.${index}.interruption_type_id`}>
                                            {({input: interruptionTypeInput}) => (
                                                <Card raised>
                                                    <Card.Content>
                                                        <Card.Header>
                                                            {'Interrupção ' + (index + 1)}
                                                        </Card.Header>
                                                    </Card.Content>
                                                    <Card.Content>
                                                        <Form.Dropdown selectOnBlur={false} clearable={true} placeholder="Tipo de interrupção" label="Tipo de interrupção" selection search value={interruptionTypeInput.value} options={interruptionTypes} onChange={(e, {value}) => interruptionTypeInput.onChange(value)}/>
                                                        <Form.Field>
                                                            <DateInput name="date" value={null} iconPosition="left" closable label="Data de Ínicio" placeholder="Data de Ínicio" {...startDateInput} onChange={(evt, {value}) => {startDateInput.onChange(value);}}/>
                                                        </Form.Field>
                                                    </Card.Content>
                                                    <Card.Content>
                                                        <Form.Field>
                                                            <DateInput name="date" value={null} iconPosition="left" closable label="Data de Fim" placeholder="Data de Fim" {...endDateInput} onChange={(evt, {value}) => {endDateInput.onChange(value);}}/>
                                                        </Form.Field>
                                                    </Card.Content>
                                                    <Card.Content extra>
                                                        <Button onClick={() => setAdditionalInterruptions((current) => {
                                                                    const copy = [...current];
                                                                    copy.splice(index, 1);
                                                                    return copy;
                                                                })} icon labelPosition="left" color="red">
                                                            Remover
                                                            <Icon name="trash"/>
                                                        </Button>
                                                    </Card.Content>
                                                </Card>
                                            )}
                                        </Field>
                                    )}
                                </Field>
                            )}
                        </Field>
                    ))}
                </Card.Group>
                <Card.Group>
                    <Field type="checkbox" name="step4.importHolidays">
                        {({input: importHolidaysField}) => (
                            <Form.Field>
                                <label>Importar feriados automaticamente? (Fonte: SAPO)</label>
                                <Checkbox toggle checked={importHolidaysField.checked}{...importHolidaysField}
                                          onChange={() => {
                                              importHolidaysField.onChange(!importHolidaysField.checked);
                                              importHolidaysField.onBlur(!importHolidaysField.checked);
                                          }}
                                />
                            </Form.Field>
                        )}
                    </Field>
                </Card.Group>
            </Card.Content>
        </Container>
    );
}
export default Step2;
