import React, {useEffect, useState} from 'react';
import {DateInput} from 'semantic-ui-calendar-react-yz';
import {Container, Card, Form, Button, Icon, Table} from 'semantic-ui-react';
import {Field} from 'react-final-form';
import axios from "axios";
import {useTranslation} from "react-i18next";

const Step2 = ({isActive, initialDate, finalDate, additionalInterruptions, setAdditionalInterruptions, holidays}) => {
    const { t } = useTranslation();

    const [interruptionTypes, setInterruptionTypes] = useState([]);
    const [holidaysList, setHolidaysList] = useState([]);
    const [firstYear, setFirstYear] = useState(0);
    const [lastYear, setLastYear] = useState(0);

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

    const removeInterruption = (index) => {
        setAdditionalInterruptions((current) => {
            console.log(current);
            const copy = [...current];
            copy.splice(index, 1);
            return copy;
        });
    }

    // First it will get the years -> 1
    useEffect(() => {
        if(initialDate !== 0 && finalDate !== 0) {
            setFirstYear(initialDate.getFullYear());
            setLastYear(finalDate.getFullYear());
        }
    }, [initialDate, finalDate]);

    // Secondly will get the holidays -> 2
    useEffect(() => {
        if(isActive && additionalInterruptions.length === 0) {
            // making sure the values are not empty to then call the action with the dates
            if(firstYear !== 0 && lastYear !== 0) {
                importHolidays();
            }
        }
    }, [firstYear, lastYear, isActive]);

    // This will update the PARENT component that
    // the holidays where updated
    useEffect(() => {
        holidays(holidaysList);
    }, [holidaysList]);

    // This will get the type of interruptions
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

    // Options to create the date on the list
    // -> new Date(item.date).toLocaleDateString(lang, options) <-
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const lang = (localStorage.getItem('language') === "en" ? "en-US" : "pt-PT");

    return (
        <Container>
            <Card.Content>
                <Table compact celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={6}>{t("Feriado")}</Table.HeaderCell>
                            <Table.HeaderCell width={9} textAlign={"center"} >{t("Data do Feriado")}</Table.HeaderCell>
                            <Table.HeaderCell width={1} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { holidaysList.map((item, index) => (
                            <Table.Row key={index} active>
                                <Table.Cell>{ item.name }</Table.Cell>
                                <Table.Cell textAlign={"center"}>{ new Date(item.date).toLocaleDateString(lang, options) }</Table.Cell>
                                <Table.Cell textAlign={"center"}>
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
                    </Table.Body>

                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='4'>
                                <Button icon labelPosition='right' color={"green"} size='small' onClick={importHolidays}>
                                    <Icon name='calendar' /> {t("Importar Feriados")}
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>

                <Table compact celled className={"definition-last"}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={5}>{t("Tipo de Interrupção")}</Table.HeaderCell>
                            <Table.HeaderCell width={5}>{t("Data de Início")}</Table.HeaderCell>
                            <Table.HeaderCell width={5}>{t("Data de Fim")}</Table.HeaderCell>
                            <Table.HeaderCell width={1} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
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
                                                            <Form.Dropdown value={_.interruption_type_id} selectOnBlur={false} clearable={true} placeholder={t("Tipo de Interrupção")} selection search options={interruptionTypes} onChange={(e, {value}) => interruptionTypeInput.onChange(value)}/>
                                                        </Table.Cell>
                                                        <Table.Cell width={5}>
                                                            <Form.Field>
                                                                <DateInput name="date" value={startDateInput.value} iconPosition="left" closable placeholder={t("Data de Início")} onChange={(evt, {value}) => {startDateInput.onChange(value);}}/>
                                                            </Form.Field>
                                                        </Table.Cell>
                                                        <Table.Cell width={5}>
                                                            <Form.Field>
                                                                <DateInput name="date" value={endDateInput.value} iconPosition="left" closable placeholder={t("Data de Fim")} minDate={startDateInput.value} {...endDateInput} onChange={(evt, {value}) => {endDateInput.onChange(value);}}/>
                                                            </Form.Field>
                                                        </Table.Cell>
                                                        <Table.Cell width={5}>
                                                            <Button onClick={() => removeInterruption(index)} icon color="red">
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
                </Table>
            </Card.Content>
        </Container>
    );
}
export default Step2;
