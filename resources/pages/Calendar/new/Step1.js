import React, {useEffect, useState} from 'react';
import {Field, useField, useFormState} from 'react-final-form';
import { DateInput, DatesRangeInput} from 'semantic-ui-calendar-react-yz';
import {Button, Card, Form, Header} from 'semantic-ui-react';
import axios from "axios";
import {useTranslation} from "react-i18next";
import moment from "moment";

const Step1 = ({setActiveSemester, activeSemester}) => {
    const { t } = useTranslation();
    const [semesterList, setSemesterList] = useState([]);
    const [minDate, setMinDate]  = useState();
    const [maxDate, setMaxDate]  = useState();

    const { input: seasons } = useField('step1.seasons');
    const clearSeasons = () => seasons.onChange(null);

    const formState = useFormState();
    let seasonsDates = formState.values.step1.seasons;

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

    const getMinDate = (semester, code) => {
        //console.log("getMinDate > [semester: " + semester + "] / {code: " + code + "}");
        let startDate = minDate;
        if(seasonsDates && seasonsDates[semester]) {
            if (code !== "periodic_season") {
                if (semester === "first_semester" || semester === "second_semester") {
                    if (code === "normal_season" && seasonsDates[semester].periodic_season) {
                        startDate = seasonsDates[semester].periodic_season.end_date;
                        if(startDate){
                            let sixWeeksEarly = moment(startDate, "DD-MM-YYYY").subtract(6, "w").format("DD-MM-YYYY");
                            let semesterInit = moment(seasonsDates[semester].periodic_season.start_date, "DD-MM-YYYY");

                            if(moment(sixWeeksEarly, "DD-MM-YYYY").isBefore(semesterInit)) {
                                startDate = semesterInit;
                            } else {
                                startDate = sixWeeksEarly;
                            }
                        }
                    }
                    if (code === "resource_season" && seasonsDates[semester].normal_season) {
                        startDate = moment(seasonsDates[semester].normal_season.end_date, "DD-MM-YYYY").add(1, "d").format("DD-MM-YYYY");
                    }
                }
            }
        }
        return startDate;
    }
    const getMaxDate = (semester, code = undefined) => {
        //let endDate = maxDate;
        //if(code !== "normal_season") {
        //    if (semester === "first_semester" || semester === "second_semester") {
        //        if (code === "periodic_season") {
        //            endDate = seasonsDates[semester].normal_season.end_date;
        //        }
        //        if (code === "resource_season") {
        //            endDate = seasonsDates[semester].periodic_season.end_date;
        //        }
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
                            {({input: startDateInput}) => (
                                <Field name={`step1.seasons.${semesterList[activeSemester].code}.${epoch?.code}.end_date`} key={'step1_field_end' + index} >
                                    {({input: endDateInput}, data) => (
                                        <Card>
                                            <Card.Content>
                                                <Header as={"h4"}>{epoch.name}</Header>
                                            </Card.Content>
                                            <Card.Content>
                                                {data}
                                                <Form.Field>
                                                    {/* <DatesRangeInput name="datesRange" placeholder={ t("Inserir datas") } iconPosition="left" closable
                                                                     value={(startDateInput.value && endDateInput.value ? startDateInput.value + ` ${t("até")} ` + endDateInput.value : "")}
                                                                     onChange={(event, {value}) => {
                                                                         let splitDates = value.split(" - ");
                                                                         if(splitDates.length === 2 && splitDates[1]) {
                                                                             startDateInput.onChange(splitDates[0]);
                                                                             endDateInput.onChange(splitDates[1]);
                                                                         }
                                                                     }}
                                                                     minDate={ getMinDate(semesterList[activeSemester].code, epoch?.code) }
                                                                     maxDate={ getMaxDate(semesterList[activeSemester].code, epoch?.code) } /> */}
                                                                     
                                                    <DateInput name="datesStart" placeholder={ t("Inserir datas") } label={ t("Data de Início") } closable
                                                            iconPosition="left"
                                                            value={startDateInput.value}
                                                            onChange={(event, {value}) => {
                                                                startDateInput.onChange(value);
                                                            }}
                                                            initialDate={ getMinDate(semesterList[activeSemester].code, epoch?.code) }
                                                            minDate={ getMinDate(semesterList[activeSemester].code, epoch?.code) }
                                                            maxDate={ getMaxDate(semesterList[activeSemester].code, epoch?.code) } />
                                                                     
                                                                     
                                                    <DateInput name="datesEnd" placeholder={ t("Inserir datas") } label={ t("Data de Fim") } closable
                                                            iconPosition="left" 
                                                            value={endDateInput.value}
                                                            onChange={(event, {value}) => {
                                                                endDateInput.onChange(value);
                                                            }}
                                                            initialDate={ startDateInput.value || getMinDate(semesterList[activeSemester].code, epoch?.code) }
                                                            minDate={ startDateInput.value || getMinDate(semesterList[activeSemester].code, epoch?.code) }
                                                            maxDate={ getMaxDate(semesterList[activeSemester].code, epoch?.code) } />
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
