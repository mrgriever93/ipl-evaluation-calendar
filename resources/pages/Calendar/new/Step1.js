import React, {useEffect, useState} from 'react';
import {Field, useField} from 'react-final-form';
import {DateInput, DatesRangeInput} from 'semantic-ui-calendar-react-yz';
import {Grid, Button, Card, Form, Header} from 'semantic-ui-react';
import axios from "axios";
import {useTranslation} from "react-i18next";

const Step1 = ({setActiveSemester, activeSemester}) => {
    const { t } = useTranslation();
    const [semesterList, setSemesterList] = useState([]);
    const [minDate, setMinDate]  = useState();
    const [maxDate, setMaxDate]  = useState();

    const { input: seasons } = useField('step1.seasons');
    const clearSeasons = () => seasons.onChange(null);

    useEffect(() => {
        const currYear = localStorage.getItem('academicYear'); // 2021-2022
        if(currYear && currYear != 0) {
            setMinDate(new Date(currYear.split("-")[0], 8, 1)); // 2021-09-01
            setMaxDate(new Date(currYear.split("-")[1], 11, 31)); // 2021-09-01
        }
        axios.get('/new-calendar/semesters').then((response) => {
            if (response.status >= 200 && response.status < 300) {
                setSemesterList(response.data.data);
            }
        });
    }, []);

    const getPreviousDates = (code) => {
        let indexCode = semesterList.indexOf((item) => {
            console.log(item);
        });
    }

    const getMinDate = (semester, code) => {
        //const { input: startDate } = useField('step1.seasons.' + semester + '.' + code + '.start_date');
        //const { input: endDate } = useField('step1.seasons.' + semester + '.' + code + '.end_date');
        //getPreviousDates(code);
        //if(startDate.value  && startDate.value < minDate){
        //    return startDate.value;
        //}
        return minDate;
    }
    const getMaxDate = (semester, code = undefined) => {
        //if(code) {
        //    const { input: startDate } = useField('step1.seasons.' + semester + '.' + code + '.start_date');
        //    const { input: endDate } = useField('step1.seasons.' + semester + '.' + code + '.end_date');
        //    if(endDate.value  && endDate.value > maxDate){
        //        return endDate.value;
        //    }
        //}
        return maxDate;
    }
    return (
        <React.Fragment>
            <Card.Content className={"margin-top-s"}>
                <Header as={"h3"}>{ t("Época do calendário") }</Header>
                <Field name="step1.semester" key={'step1_field_btn'}>
                    {({input: semesterInput}) => (
                        <Button.Group>
                            {semesterList.map((semester, index) => (
                                <React.Fragment key={index}>
                                    <Button positive={activeSemester === index} key={'step1_button_' + index}
                                        onClick={() => {
                                            //clearSeasons();
                                            semesterInput.onChange(semester.code);
                                            setActiveSemester(index);
                                        }}>
                                        {semester.name}
                                    </Button>
                                    {index + 1 < semesterList.length && (<Button.Or text={ t("Ou") }/>)}
                                </React.Fragment>
                            ))}
                        </Button.Group>
                    )}
                </Field>
            </Card.Content>
            <Card.Content className={"margin-top-l margin-bottom-base"}>
                <Header as={"h3"}>{ t("Datas do calendário") }</Header>
                <Card.Group itemsPerRow={3} >
                    {semesterList[activeSemester]?.epochs?.map((epoch, index) => (
                        <Field name={`step1.seasons.${semesterList[activeSemester].code}.${epoch?.code}.start_date`} key={'step1_field_start' + index}>
                            {({input: startDateInput, valuesStart}) => (
                                <Field name={`step1.seasons.${semesterList[activeSemester].code}.${epoch?.code}.end_date`} key={'step1_field_end' + index}>
                                    {({input: endDateInput, valuesEnd}) => (
                                        <Card>
                                            <Card.Content>
                                                <Header as={"h4"}>{epoch.name}</Header>
                                            </Card.Content>
                                            <Card.Content>
                                                <Form.Field>
                                                    <DatesRangeInput name="datesRange" placeholder={ t("Inserir datas") } iconPosition="left" closable  markColor={"blue"}
                                                                     value={(startDateInput.value && endDateInput.value ? startDateInput.value + ` ${t("até")} ` + endDateInput.value : "")}
                                                                     onChange={(event, {value}) => {
                                                                         let splitDates = value.split(" - ");
                                                                         if(splitDates.length === 2 && splitDates[1]) {
                                                                             startDateInput.onChange(splitDates[0]);
                                                                             endDateInput.onChange(splitDates[1]);
                                                                         }
                                                                     }} minDate={getMinDate(activeSemester, epoch?.code)} maxDate={getMaxDate(activeSemester, epoch?.code)} />
                                                </Form.Field>
                                            </Card.Content>
                                        </Card>
                                    )}
                                </Field>
                            )}
                        </Field>
                    ))}
                </Card.Group>
            </Card.Content>
        </React.Fragment>
    );
};

export default Step1;
