import React, {useEffect, useState} from 'react';
import {DateInput} from 'semantic-ui-calendar-react-yz';
import {Container, Card, Form, Button, Icon, Table} from 'semantic-ui-react';
import {Field} from 'react-final-form';
import axios from "axios";
import {useTranslation} from "react-i18next";
import EmptyTable from "../../../components/EmptyTable";
import moment from "moment";

const Step2 = ({isActive, initialDate, finalDate, additionalInterruptions, setAdditionalInterruptions, holidays}) => {
    const { t } = useTranslation();

    const [interruptionTypes, setInterruptionTypes] = useState([]);
    const [holidaysList, setHolidaysList] = useState([]);
    const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
    const [firstYear, setFirstYear] = useState(0);
    const [lastYear, setLastYear] = useState(0);
    const [tenWeekDate, setTenWeekDate] = useState('');


    const importHolidays = () => {
        setIsLoadingHolidays(true);
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
            setIsLoadingHolidays(false);
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
        if(initialDate !== 0 && initialDate !== undefined && finalDate !== 0 && finalDate !== undefined) {
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
                get10Week();
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
                setInterruptionTypes(response.data.data?.map(({id, label, mandatory}) => ({
                    key: id,
                    value: id,
                    text: label,
                    icon: (mandatory ? {color: 'red', name:'attention'} : undefined),
                    //description: '1st semester'
                    //label: (mandatory ? { color: 'red', empty: true, circular: true } : { empty: true, circular: true }),
                })));
            }
        });
    }, []);

    // Options to create the date on the list
    // -> new Date(item.date).toLocaleDateString(lang, options) <-
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const lang = (localStorage.getItem('language') === "en" ? "en-US" : "pt-PT");


    useEffect(() => {
        if(initialDate !== undefined && finalDate !== undefined) {
            get10Week();
        }
    }, [initialDate, finalDate, additionalInterruptions]);

    // TODO get value of interruptions and set value of 10 week input
    const get10Week = () => {
        const firstDate = moment(initialDate);
        const lastDate = moment(finalDate);
        const numberOfWeeks = lastDate.diff(firstDate, 'weeks');
        let weeksToAdd = 0;
        if(numberOfWeeks >= 10){
            //additionalInterruptions.forEach((item) => {
            //    const diffDays = item.start_date.diff(item.end_date, 'days');
            //    const diffWeeks = item.start_date.diff(item.end_date, 'weeks');
            //    console.log(diffDays);
            //    console.log(diffWeeks);
            //    if(diffDays >= 5 ){
            //        weeksToAdd++;
            //        if(diffWeeks === 2){
            //            weeksToAdd++;
            //        }
            //    }
            //});
            // first week does not count, so, it will be:
            // first week + 10 weeks + number of full weeks without school
            const tenthWeek = moment(initialDate).add(11 + weeksToAdd, 'weeks').format('YYYY-MM-DD');
            setTenWeekDate(tenthWeek);
        }
    }

    return (
        <Container>
            <Card.Content>
                { isLoadingHolidays ?
                    (
                        <EmptyTable isLoading={isLoadingHolidays} label={t("Não existem feriados neste intervalo de datas")}/>
                    ) : (
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
                    )
                }
            </Card.Content>
            <Card.Content>
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
                                                            <Form.Dropdown value={_.interruption_type_id} selectOnBlur={false} clearable={true} placeholder={t("Tipo de Interrupção")} selection search
                                                                           options={interruptionTypes}
                                                                           onChange={(e, {value}) => interruptionTypeInput.onChange(value)}/>
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
            <Card.Content className={"margin-top-base"}>
                <Field name={`step2.week_ten`}>
                    {({input: weekTenInput}) => (
                        <Form.Field width={5}>
                            <DateInput name="date" iconPosition="left" label="Data 10 semana" placeholder="Data 10 semana" value={weekTenInput.value} {...weekTenInput} closable onChange={(evt, {value}) => {weekTenInput.onChange(value);}}/>
                        </Form.Field>
                    )}
                </Field>
                <div>
                    { tenWeekDate }
                </div>
            </Card.Content>
        </Container>
    );
}
export default Step2;
