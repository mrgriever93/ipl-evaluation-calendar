import React, {useEffect, useState} from 'react';
import {DateInput} from 'semantic-ui-calendar-react-yz';
import {Container, Card, Form, Button, Icon, Checkbox, Table} from 'semantic-ui-react';
import {Field} from 'react-final-form';
import axios from "axios";

const Step2 = ({isActive, firstYear, lastYear, initialDate, finalDate, additionalInterruptions, setAdditionalInterruptions, holidays}) => {
    const [interruptionTypes, setInterruptionTypes] = useState([]);
    const [holidaysList, setHolidaysList] = useState([]);

    const importHolidays = () => {
        axios.get('/new-calendar/interruptions?first_year=' + firstYear + "&last_year=" + lastYear).then((response) => {
            if (response.status === 200) {
                let holidays = [];
                response.data.forEach(item => {
                    let holidayDate = new Date(item.date);
                    if(holidayDate >= initialDate  && holidayDate <= finalDate) {
                        holidays.push(item);
                    }
                });
                setHolidaysList(holidays);
            }
        });
    }

    useEffect(() => {
        holidays(holidaysList);
    }, [holidaysList]);

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

    useEffect(() => {
        console.log(additionalInterruptions);
        if(isActive && additionalInterruptions.length === 0) {
            importHolidays();
        }
    }, [firstYear, lastYear, isActive]);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const lang = (localStorage.getItem('language') === "en" ? "en-US" : "pt-PT");

    return (
        <Container>
            <Card.Content>
                <Table compact celled className={"definition-last"}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={5}>Feriado</Table.HeaderCell>
                            <Table.HeaderCell width={5}>Data Inicio</Table.HeaderCell>
                            <Table.HeaderCell width={5}>Data Fim</Table.HeaderCell>
                            <Table.HeaderCell width={1} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { holidaysList.map((item, index) => (
                            <Table.Row key={index} active>
                                <Table.Cell width={5}>
                                    { item.name }
                                </Table.Cell>
                                <Table.Cell width={5} colSpan='2' textAlign={"center"}>
                                    { new Date(item.date).toLocaleDateString(lang, options) }
                                </Table.Cell>
                                <Table.Cell width={5}>
                                    <Button onClick={() => setHolidaysList((current) => {
                                        const copy = [...current];
                                        copy.splice(index, 1);
                                        return copy;
                                    })} icon color="red">
                                        <Icon name="trash"/>
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {additionalInterruptions.map((_, index) => (
                            <Field name={`step2.additional_interruptions.${index}.start_date`} key={'step2_field_' + index} >
                                {({input: startDateInput}) => (
                                    <Field name={`step2.additional_interruptions.${index}.end_date`}>
                                        {({input: endDateInput}) => (
                                            <Field name={`step2.additional_interruptions.${index}.interruption_type_id`}>
                                                {({input: interruptionTypeInput}) => (
                                                    <Table.Row key={index}>
                                                        <Table.Cell width={5}>
                                                            {_.name}
                                                            <Form.Dropdown value={_.interruption_type_id} selectOnBlur={false} clearable={true} placeholder="Tipo de interrupção" label="Tipo de interrupção" selection search options={interruptionTypes} onChange={(e, {value}) => interruptionTypeInput.onChange(value)}/>
                                                        </Table.Cell>
                                                        <Table.Cell width={5}>
                                                            <Form.Field>
                                                                <DateInput name="date" value={startDateInput.value} iconPosition="left" closable label="Data de Ínicio" placeholder="Data de Ínicio" onChange={(evt, {value}) => {startDateInput.onChange(value);}}/>
                                                            </Form.Field>
                                                        </Table.Cell>
                                                        <Table.Cell width={5}>
                                                            <Form.Field>
                                                                <DateInput name="date" value={endDateInput.value} iconPosition="left" closable label="Data de Fim" minDate={startDateInput.value}  placeholder="Data de Fim" {...endDateInput} onChange={(evt, {value}) => {endDateInput.onChange(value);}}/>
                                                            </Form.Field>
                                                        </Table.Cell>
                                                        <Table.Cell width={5}>
                                                            <Button onClick={() => setAdditionalInterruptions((current) => {
                                                                        const copy = [...current];
                                                                        copy.splice(index, 1);
                                                                        return copy;
                                                                    })} icon color="red">
                                                                <Icon name="trash"/>
                                                            </Button>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )}
                                            </Field>
                                        )}
                                    </Field>
                                )}
                            </Field>
                        ))}
                    </Table.Body>

                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='4'>
                                <Button icon labelPosition='right' color={"green"} size='small' onClick={importHolidays}>
                                    <Icon name='calendar' /> Importar Feriados
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Card.Content>
        </Container>
    );
}
export default Step2;
