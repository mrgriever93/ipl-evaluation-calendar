import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {Link, useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Button, Container, Divider, Grid, Header, Icon, Table} from 'semantic-ui-react';
import {AnimatePresence} from 'framer-motion';
import {toast} from 'react-toastify';

import PageLoader from '../../components/PageLoader';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../utils/toastConfig';

import EmptyTable from "../../components/EmptyTable";
import InfosAndActions from './detail/infos-and-actions';
import PopupScheduleInterruption from './detail/popup-sched-interruption';
import PopupScheduleEvaluation from './detail/popup-sched-evaluation';
import PopupEvaluationDetail from './detail/popup-evaluation-detail';
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

const SweetAlertComponent = withReactContent(Swal);

const Calendar = () => {
    const history = useNavigate();
    const { t } = useTranslation();
    // get URL params
    let { id } = useParams();
    let calendarId = id;

    const [scheduleExamInfo, setScheduleExamInfo] = useState({});
    const [calendarPermissions, setCalendarPermissions] = useState(JSON.parse(localStorage.getItem('calendarPermissions')) || []);
    const [interruptionsList, setInterruptions] = useState([]);
    const [epochsList, setEpochsList] = useState([]);
    const [generalInfo, setGeneralInfo] = useState();
    const [differences, setDifferences] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isCalendarInfoLoading, setIsCalendarInfoLoading] = useState(true);

    const [openScheduleExamModal, setOpenScheduleExamModal] = useState(false);
    const [openExamDetailModal, setOpenExamDetailModal] = useState(false);
    const [viewExamId, setViewExamId] = useState(undefined);
    const [examList, setExamList] = useState([]);

    const [calendarStartDate, setCalendarStartDate] = useState();
    const [calendarEndDate, setCalendarEndDate] = useState();

    const [isTemporary, setIsTemporary] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [calendarPhase, setCalendarPhase] = useState(true);
    const [updatingCalendarPhase, setUpdatingCalendarPhase] = useState(false);
    const [previousFromDefinitive, setPreviousFromDefinitive] = useState(false);

    const [weekTen, setWeekTen] = useState(0);

    const [openInterruptionModal, setOpenInterruptionModal] = useState(false);
    const [interruptionModalInfo, setInterruptionModalInfo] = useState({});

    const [calendarWarnings, setCalendarWarnings] = useState([]);
    const [showingEpochs, setShowingEpochs] = useState([]);


    useEffect(() => {
        // check if URL params are just numbers or else redirects to previous page
        if(!/\d+/.test(calendarId)){
            history(-1);
            toast(t('calendar.Ocorreu um erro ao carregar a informacao pretendida'), errorConfig);
        }
        // validate if calendar Permissions already exists on the local storage
        const permissionsLocal = localStorage.getItem('calendarPermissions');
        if(!permissionsLocal) {
            axios.get('/permissions/calendar').then((res) => {
                if (res.status === 200) {
                    let localPermissions = res.data.data;
                    localPermissions.forEach((item) => {
                        item.phases = item.phases.split(",").map(Number);
                        return item;
                    });
                    localStorage.setItem('calendarPermissions', JSON.stringify(localPermissions));
                    setCalendarPermissions(JSON.stringify(res.data.data));
                }
            });
        }
    }, []);


    /*
     * Create / Edit Exams
     */
    const scheduleExamHandler = (scholarYear, epoch, date, existingExamsAtThisDate) => {
        setScheduleExamInfo({
            calendarId: parseInt(calendarId, 10),
            courseId: generalInfo?.course?.id,
            courseName: generalInfo?.course?.display_name,
            scholarYear: scholarYear,
            group_id: undefined,
            date_start: date,
            date_end: date,
            in_class: false,
            hasExamsOnDate: existingExamsAtThisDate,
            epochs: epochsList,
            selected_epoch: epoch,
        });
        setOpenScheduleExamModal(true);
    }

    const editExamHandler = (event, scholarYear, epoch, exam) => {
        event.stopPropagation();
        setScheduleExamInfo({
            calendarId: parseInt(calendarId, 10),
            courseId: generalInfo?.course?.id,
            courseName: generalInfo?.course?.display_name,
            scholarYear: scholarYear,
            epochs: epochsList,
            selected_epoch: epoch,
            course_unit_id: exam.course_unit_id,
            group_id: exam.group_id,
            date_start: exam.date_start,
            date_end: exam.date_end,
            duration_minutes: exam.duration_minutes,
            exam_id: exam.id,
            epoch_id: exam.epoch_id,
            in_class: exam.in_class,
            hour: exam.hour,
            method_id: exam.method?.id,
            observations: exam.observations,
            observations_pt: exam.observations_pt,
            observations_en: exam.observations_en,
            room: exam.room,
        });
        setOpenScheduleExamModal(true);
    }

    const closeScheduleExamModal = () => {
        setOpenScheduleExamModal(false);
        setScheduleExamInfo({});
        getWarnings();
    };

    const addExamToList = (exam) => {
        setExamList((current) => [...current, exam]);
    }
    const updateExamInList = (exam) => {
        setExamList((current) => {
            const copy = [...current];
            const oldExamIndex = copy.findIndex((item) => item.id === exam.id);
            if(oldExamIndex > -1) {
                copy[oldExamIndex] = exam;
            }
            return copy;
        });
    }
    const removeExamFromList = (examId) => {
        setExamList((current) => current.filter((item) => item.id !== examId));
    }

    /*
     * Interruptions
     */
    // Force interruption when has some exams
    const interruptionForceHandler = (date) => {
        const sweetAlertConfigs = {
            title: t('Atenção!'),
            html: 'Ao adicionar uma interrupcao, ira eliminar exames nesta data, e terá de adicioná-los novamente em outra data a escolher!<br/><br/><strong>Tem a certeza que deseja eliminar os exames, e adicionar uma nova interrupcao?</strong>',
            denyButtonText: t('Não'),
            confirmButtonText: t('Sim'),
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        };

        SweetAlertComponent.fire(sweetAlertConfigs).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/exams/date/${calendarId}/${moment(date).format( 'YYYY-MM-DD')}`).then((res) => {
                    if (res.status === 200) {
                        toast('Exames eliminados com sucesso deste calendário!', successConfig);
                        interruptionHandler(undefined, date);
                    } else {
                        toast('Ocorreu um problema ao eliminar os exames deste calendário! ' +  res.response.data, errorConfig);
                    }
                });
            }
        });
    };

    const interruptionHandler = (interruption, date) => {
        setInterruptionModalInfo((interruption ? interruption : {
            calendarId: parseInt(calendarId, 10),
            start_date: date,
            end_date: date
        }));
        setOpenInterruptionModal(true);
    }
    const closeInterruptionModal = (newInterruption) => {
        setOpenInterruptionModal(false);
    };

    const onEditInterruptionClick = (interruption) => {
        setInterruptionModalInfo({
            id: interruption.id
        });
        setOpenInterruptionModal(true);
    };

    const addInterruptionToList = (interruption, isNew) => {
        if(isNew){
            setInterruptions((current) => [...current, interruption]);
        } else {
            setInterruptions((existingItems) => {
                return existingItems.map(item => {
                    return item.id === interruption.id ? interruption : item
                });
            });
        }
    }
    const removeInterruptionFromList = (interruptionId) => {
        setInterruptions((current) => current.filter((item) => item.id !== interruptionId));
    }

    /*
     * View Exam Details
     */
    const openExamDetailHandler = (scholarYear, exam) => {
        setViewExamId(exam.id);
        setOpenExamDetailModal(true);
    }

    const closeExamDetailHandler = () => {
        setViewExamId(null);
        setOpenExamDetailModal(false);
    }

    useEffect(() => {
        if (typeof calendarPhase === 'number') {
            // filter permissions by phase of calendar
            const localPermissions = JSON.parse(localStorage.getItem('calendarPermissions'));
            setCalendarPermissions(localPermissions?.filter((item) => item.phases.includes(calendarPhase)) || []);
        }
    }, [calendarPhase]);

    // const patchCalendar = (fieldToUpdate, value) => axios.patch(`/calendar/${calendarId}`, {
    //     [fieldToUpdate]: value,
    // });

    // const updateCalendarStatus = (newTemporaryStatus) => {
    //     patchCalendar('temporary', newTemporaryStatus).then((response) => {
    //         if (response.status === 200) {
    //             setIsTemporary(newTemporaryStatus);
    //             toast(t('calendar.Estado do calendário atualizado!'), successConfig);
    //         }
    //     });
    // };

    // const updateCalendarPhase = (newCalendarPhase) => {
    //     setUpdatingCalendarPhase(true);
    //     patchCalendar('calendar_phase_id', newCalendarPhase).then(
    //         (response) => {
    //             setUpdatingCalendarPhase(false);
    //             if (response.status === 200) {
    //                 setCalendarPhase(newCalendarPhase);
    //                 toast(t('calendar.Fase do calendário atualizada!'), successConfig);
    //             }
    //         },
    //     );
    // };


    const loadCalendar = (calId) => {
        setIsLoading(true);
        setIsCalendarInfoLoading(true);
        setExamList([]);
        console.log('loadCalendar');

        axios.get(`/calendar/${calId}`)
            .then((response) => {
                console.log('loadCalendar - response');
                if (response?.status >= 200 && response?.status < 300) {
                    const {
                        data: {
                            data: {
                                phase,
                                published,
                                interruptions,
                                epochs,
                                general_info,
                                differences,
                                previous_from_definitive,
                                week_ten,
                            },
                        },
                    } = response;
                    setIsTemporary(!!general_info?.temporary);
                    setCalendarPhase(general_info?.phase?.id);
                    setIsPublished(!!published);
                    setInterruptions(interruptions);
                    setEpochsList(epochs);

                    let startDate = epochs.length > 0 ? epochs[0].start_date : undefined;
                    let endDate = epochs.length > 0 ? epochs[0].end_date : undefined;
                    let initialEpochs = [];
                    epochs.forEach((epoch) => {
                        if(startDate > moment(epoch.start_date)){
                            startDate = moment(epoch.start_date);
                        }
                        if(endDate < moment(epoch.end_date)){
                            endDate = moment(epoch.end_date);
                        }
                        setExamList((current) => [...current, ...epoch.exams]);
                        initialEpochs.push(epoch.id);
                    });
                    //set epochs showing
                    setShowingEpochs(initialEpochs);
                    // set calendar start and end dates
                    setCalendarStartDate(moment(startDate).format("DD-MM-YYYY"));
                    setCalendarEndDate(moment(endDate).format("DD-MM-YYYY"));

                    setGeneralInfo(general_info);
                    setDifferences(differences);
                    setIsLoading(false);
                    setPreviousFromDefinitive(previous_from_definitive);
                    setWeekTen(moment(week_ten).week());

                    setIsCalendarInfoLoading(false);
                } else {
                    history('/calendario');
                }
            }).catch((r) => alert(r));
    };

    const weekData = useMemo(() => {
        if(epochsList.length > 0 && !isCalendarInfoLoading) {
            console.log('weekData');
            return _.orderBy(
                epochsList.filter((item) => showingEpochs.includes(item.id)).reduce((acc, curr) => {
                    const start_date = moment(curr.start_date);
                    const end_date = moment(curr.end_date);
                    while (start_date <= end_date) {
                        if (start_date.day() !== 0) {
                            if (!acc.filter(({week}) => week === start_date.isoWeek()).length) {
                                acc.push({
                                    week: start_date.isoWeek(),
                                    year: start_date.year(),
                                    days: [],
                                });
                            }

                            const currentInterruption = interruptionsList.find(
                                (interruption) => {
                                    const interruptionStartDate = moment(interruption.start_date, 'YYYY-MM-DD');
                                    const interruptionEndDate = moment(interruption.end_date, 'YYYY-MM-DD');
                                    return (
                                        (start_date.isAfter(interruptionStartDate) && start_date.isBefore(interruptionEndDate))
                                        || start_date.isSame(interruptionStartDate, 'day')
                                        || start_date.isSame(interruptionEndDate, 'day')
                                    );
                                },
                            );

                            const week = acc.find(({week}) => week === start_date.isoWeek());
                            if (!week.days.find((day) => day.weekDay === start_date.day())) {
                                week.days.push({
                                    weekDay: start_date.day(),
                                    date: start_date.format(),
                                    interruption: currentInterruption,
                                    interruptionDays: 1,
                                });
                            }

                            const multiDaysSameInterruption = acc.find(({week}) => week === start_date.isoWeek())
                                .days.filter((x) => x.interruption?.id === currentInterruption?.id);

                            if (multiDaysSameInterruption?.length) {
                                multiDaysSameInterruption[0].interruptionDays = multiDaysSameInterruption.length;
                            }

                            if(week.epochs){
                                // prevent duplicated epochs, when passing in all days
                                const prevEpochs = week.epochs.filter((item) => item.code === curr.code);
                                if( prevEpochs.length === 0 ) {
                                    week.epochs.push({
                                        id: curr.id,
                                        name: curr.name,
                                        code: curr.code
                                    });
                                }
                            } else {
                                week.epochs = [{
                                    id: curr.id,
                                    name: curr.name,
                                    code: curr.code
                                }];
                            }
                        }
                        start_date.add(1, 'days');
                    }
                    return acc;
                }, []), ['year', 'week']);
        }
    }, [epochsList, interruptionsList, isCalendarInfoLoading, showingEpochs]);

    useEffect(() => {
        loadCalendar(calendarId);
        getWarnings();
    }, [calendarId]);

    const getWarnings = () => {
        axios.get(`/calendar/${calendarId}/warnings`).then((response) => {
            if (response.status === 200) {
                setCalendarWarnings(response.data.data);
            }
        });
    }

    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }

    const courseYears = generalInfo?.course?.duration ? range(1, generalInfo?.course?.duration) : [];
    const weekDays = [1, 2, 3, 4, 5, 6];
    let alreadyAddedColSpan = false;
    let alreadyAddedRowSpan = false;
    let interruptionDays = 0;

    /*
     * Option to drag and drop exams bewteen days
     * TODO - maybe future work
     */
    const allowDrop = (ev) => {
        ev.preventDefault();
    }

    const drag = (ev) => {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    const drop = (ev) => {
        ev.preventDefault();
        //let data = ev.dataTransfer.getData("text");
        //ev.target.appendChild(document.getElementById(data));
    }

    /*
     * Header of week table
     */
    const weekDayHeaderCell = (days, weekDay, index) => {
        const day = days.find((day) => day.weekDay === weekDay);
        const firstDayAvailable = moment(days[0].date);
        const lastDayAvailable = moment(days[days.length - 1].date);
        if (!day?.date) {
            if (weekDay === 1 || (lastDayAvailable.day() < 6 && !alreadyAddedColSpan)) {
                alreadyAddedColSpan = true;
                return (<Table.HeaderCell key={index} colSpan={lastDayAvailable.day() < 6 ? 6 - lastDayAvailable.day() : firstDayAvailable.day() - 1}/>);
            }
            if (!alreadyAddedColSpan) {
                return (<Table.HeaderCell key={index} />);
            }
        } else if (day?.date) {
            // TODO check date_start/date_end
            const existingExamsAtThisDate = examList.filter((exam) => moment(exam.date_start).isSame(moment(day.date), 'day'));
            return (
                <Table.HeaderCell key={index} textAlign="center">
                    {moment(day.date).format('DD-MM-YYYY')}
                    { (!isPublished && existingExamsAtThisDate?.length === 0 && calendarPermissions.filter((x) => x.name === SCOPES.ADD_INTERRUPTION).length > 0) && (
                        ( existingExamsAtThisDate.length > 0 ? (
                                <Button color={"orange"} className='btn-add-interruption' title={t('Adicionar Interrupção')}
                                        onClick={() => interruptionForceHandler(day.date)}>
                                    <Icon name="calendar times outline" />
                                    {t('Adicionar Interrupção')}
                                </Button>
                            ) : (
                                !day.interruption ? (
                                    <Button className='btn-add-interruption' title={t('Adicionar Interrupção')}
                                            onClick={() => interruptionHandler(undefined, day.date)}>
                                        <Icon name="calendar times outline" />
                                        {t('Adicionar Interrupção')}
                                    </Button>
                                ) : (
                                    <Button color="yellow" className='btn-add-interruption' title={t('Editar Interrupção')}
                                            onClick={() => interruptionHandler(day.interruption, day.date)}>
                                        <Icon name="calendar times outline" />
                                        {t('Editar Interrupção')}
                                    </Button>
                                )
                            )
                        )
                    )}

                </Table.HeaderCell>
            );
        }
        return null;
    }

    /*
     * Content of week table
     */
    const weekDayContentCell = (epoch, days, courseIndex, year, weekDay, weekDayIndex, epochsLength) => {
        // TODO add exam to the dates (by single cols or colspan)
        const day = days.find((day) => day.weekDay === weekDay);
        const firstDayAvailable = moment(days[0].date);
        const lastDayAvailable = moment(days[days.length - 1].date);
        const {interruption} = day || {};
        const isInterruption = !!interruption;
        // check has interruptions
        if (!alreadyAddedRowSpan && isInterruption && courseIndex === 0 && interruption.id !== days.find((day) => day.weekDay === weekDay - 1)?.interruption?.id) {
            interruptionDays = 0;
            alreadyAddedRowSpan = false;
        }
        // check interruption already marked
        if ((isInterruption && alreadyAddedRowSpan && courseIndex > 0) || (isInterruption && interruptionDays++ >= day?.interruptionDays)) {
            return null;
        }
        // check if is 1 year and not a date OR if is an interruption
        if ((year === 1 && !day?.date) || isInterruption) {
            // is an interruption and for multiple days
            if (!isInterruption && (weekDay === 1 || (lastDayAvailable.day() < 6 && !alreadyAddedColSpan))) {
                alreadyAddedColSpan = true;
                return (<Table.Cell
                    key={weekDayIndex}
                    colSpan={isInterruption && lastDayAvailable.day() < 6 ? 6 - lastDayAvailable.day() : firstDayAvailable.day() - 1}
                    rowSpan={courseYears.length}/>);
            }
            // interruption already marked and is for multiple days
            if (!alreadyAddedColSpan || (isInterruption && courseIndex === 0)) {
                if(epochsLength > 1 && alreadyAddedRowSpan) {
                    return null;
                }
                alreadyAddedRowSpan = true;
                return (
                    <Table.Cell key={weekDayIndex} textAlign="center" className={isInterruption ? "calendar-day-interruption" : null  }
                                rowSpan={courseYears.length * epochsLength} colSpan={isInterruption ? day?.interruptionDays : null} >
                        <div>
                            {isInterruption ? interruption.description : null}
                        </div>
                    </Table.Cell>
                );
            }
        // check if is a day
        } else if (day?.date) {
            const currentDate = moment(day.date);
            // get exams for this date
            const existingExamsAtThisDate = examList.filter((exam) => {
                return  exam.academic_year === year &&
                        currentDate.isBetween(exam.date_start, exam.date_end, 'date','[]');
            });
            let examsComponents = null;
            // this date has any exams?
            if (existingExamsAtThisDate?.length) {
                // show a button per exam in this day
                examsComponents = existingExamsAtThisDate.map((exam) => {
                    return exam.epoch_id === epoch.id && (
                        // <Button key={exam.id} onClick={() => openExamDetailHandler(year, exam)} isModified={differences?.includes(exam.id)} >
                        // For the Future (drag and drop
                        // draggable="false" onDragStart={drag}
                        <Button className={"btn-exam-details" + (exam.in_class ? " exam-in-class" : "" )}
                            title={ (exam.in_class ? t('Aula') + " - " : "" ) + exam.course_unit + " - " + (exam.method?.description || exam.method?.name) }
                            color="blue" key={exam.id}
                            onClick={() => openExamDetailHandler(year, exam)}>
                            { !isPublished  && (calendarPermissions.filter((x) => x.name === SCOPES.EDIT_EXAMS).length > 0) && (
                                <div className="btn-action-wrapper">
                                    {calendarPermissions.filter((x) => x.name === SCOPES.EDIT_EXAMS).length > 0 && (
                                        <div className='btn-action-edit' onClick={(event) => editExamHandler(event, year, epoch, exam)}>
                                            <Icon name="edit"/>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="btn-exam-content">
                                <div className="btn-exam-label">{ (exam.hour ? exam.hour + ' ' : (exam.in_class ? t('Aula') + " - " : "" ) ) + (exam.course_unit_initials || exam.course_unit) }</div>
                                <div className="btn-exam-type">{ (exam.method?.description || exam.method?.name) }</div>
                            </div>
                        </Button>
                    );
                });
            }
            // create a button to add exams for this date
            // For the Future (drag and drop
            // onDrop={drop} onDragOver={allowDrop}
            return (
                <Table.Cell key={weekDayIndex} className={ 'calendar-day-' + epoch.code } textAlign="center">
                    {examsComponents}
                    {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.ADD_EXAMS).length > 0 && (
                        <Button className="btn-schedule-exam" onClick={() => scheduleExamHandler(year, epoch, day.date, existingExamsAtThisDate)}>
                            { t('Marcar') }
                        </Button>
                    )}
                </Table.Cell>
            );
        }
        return null;
    }

    const pageLoaderAnimate = {
        opacity: 1,
        transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }
    };
    const pageLoaderExit = {
        opacity: 0,
        transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }
    };
    /*
     * Calendar
     */
    return (
        <Container>
            <div className="margin-bottom-s">
                <Link to="/"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <InfosAndActions epochs={epochsList} calendarInfo={generalInfo} updatePhase={setCalendarPhase} warnings={calendarWarnings} showingEpochs={showingEpochs} epochsViewHandler={setShowingEpochs}/>
            <AnimatePresence>
                {isLoading && (<PageLoader animate={pageLoaderAnimate} exit={pageLoaderExit}/>)}
            </AnimatePresence>
            <div className='margin-top-l'>
                {console.log(showingEpochs) }
                { showingEpochs.length === 0 ? (
                    <EmptyTable isLoading={false} label={t('Todas as épocas ficaram escondidas')}/>
                ) : (
                    <Grid stackable className='calendar-tables'>
                        <Grid.Row>
                            <Grid.Column width="16">
                                {epochsList.length > 0 && weekData && weekData.map(({week, year, days, epochs}, tableIndex) => {
                                    interruptionDays = 0;
                                    alreadyAddedColSpan = false;
                                    return (
                                        <div key={tableIndex} className={"table-week"}>
                                            {weekTen === week && (
                                                <Divider horizontal style={{marginTop: "var(--space-l)"}}>
                                                    <Header as='h4' style={{textTransform: "uppercase"}}>
                                                        <Icon name='calendar alternate outline' />
                                                        { t("10ª semana") }
                                                    </Header>
                                                </Divider>
                                            )}
                                            <Table celled>
                                                <Table.Header>
                                                    <Table.Row textAlign="center">
                                                        <Table.HeaderCell width="2">#{week}</Table.HeaderCell>
                                                        <Table.HeaderCell width="2">{t('calendar.2ª Feira')}</Table.HeaderCell>
                                                        <Table.HeaderCell width="2">{t('calendar.3ª Feira')}</Table.HeaderCell>
                                                        <Table.HeaderCell width="2">{t('calendar.4ª Feira')}</Table.HeaderCell>
                                                        <Table.HeaderCell width="2">{t('calendar.5ª Feira')}</Table.HeaderCell>
                                                        <Table.HeaderCell width="2">{t('calendar.6ª Feira')}</Table.HeaderCell>
                                                        <Table.HeaderCell width="2">{t('calendar.Sábado')}</Table.HeaderCell>
                                                    </Table.Row>
                                                    <Table.Row>
                                                        <Table.HeaderCell textAlign="center">{year}</Table.HeaderCell>
                                                        {weekDays.map((weekDay, index) => weekDayHeaderCell(days, weekDay, index) )}
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    { courseYears.map((year, courseIndex) => {
                                                        alreadyAddedColSpan = false;
                                                        alreadyAddedRowSpan = false;
    
                                                        return epochs.map((epoch, epochIndex) => (
                                                            <Table.Row key={courseIndex + "-" + epochIndex} >
                                                                {epochIndex === 0 && (
                                                                    <Table.Cell textAlign="center" rowSpan={epochs.length}>{ t("Ano") + " " + year }</Table.Cell>
                                                                )}
                                                                {weekDays.map((weekDay, weekDayIndex) => weekDayContentCell(epoch, days, courseIndex, year, weekDay, weekDayIndex, epochs.length))}
                                                            </Table.Row>
                                                        ));
                                                    })}
                                                </Table.Body>
                                            </Table>
                                        </div>
                                    );
                                })}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )}
            </div>
            { /* TODO pass min and max dates */ }
            <PopupScheduleInterruption
                isOpen={openInterruptionModal}
                onClose={closeInterruptionModal}
                addedInterruption={addInterruptionToList}
                deletedInterruption={removeInterruptionFromList}
                info={interruptionModalInfo} />

            <PopupEvaluationDetail
                isOpen={openExamDetailModal}
                onClose={closeExamDetailHandler}
                examId={viewExamId} />

            <PopupScheduleEvaluation
                isOpen={openScheduleExamModal}
                onClose={closeScheduleExamModal}
                scheduleInformation={scheduleExamInfo}
                addedExam={addExamToList}
                updatedExam={updateExamInList}
                deletedExam={removeExamFromList}
                calendarDates={{minDate: calendarStartDate, maxDate: calendarEndDate}}/>
        </Container>
    );
};
export default Calendar;
