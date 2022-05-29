import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Button, Container, Divider, Grid, Header, Icon, Table} from 'semantic-ui-react';
import {AnimatePresence} from 'framer-motion';
import {toast} from 'react-toastify';

import PageLoader from '../../components/PageLoader';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../utils/toastConfig';

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
    const [openScheduleExamModal, setOpenScheduleExamModal] = useState(false);
    const [openExamDetailModal, setOpenExamDetailModal] = useState(false);
    const [viewExamId, setViewExamId] = useState(undefined);
    const [examList, setExamList] = useState([]);

    const [isTemporary, setIsTemporary] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [calendarPhase, setCalendarPhase] = useState(true);
    const [updatingCalendarPhase, setUpdatingCalendarPhase] = useState(false);
    const [previousFromDefinitive, setPreviousFromDefinitive] = useState(false);

    const [weekTen, setWeekTen] = useState(0);

    const [openInterruptionModal, setOpenInterruptionModal] = useState(false);
    const [interruptionModalInfo, setInterruptionModalInfo] = useState({});

    /*
     * Create / Edit Exams
     */
    const scheduleExamHandler = (scholarYear, date, existingExamsAtThisDate) => {
        setScheduleExamInfo({
            calendarId: parseInt(calendarId, 10),
            courseId: generalInfo?.course?.id,
            courseName: generalInfo?.course?.display_name,
            scholarYear: scholarYear,
            date_start: date,
            date_end: date,
            hasExamsOnDate: existingExamsAtThisDate,
            epochs: epochsList,
        });
        setOpenScheduleExamModal(true);
    }

    const editExamHandler = (event, scholarYear, exam) => {
        event.stopPropagation();
        setScheduleExamInfo({
            calendarId: parseInt(calendarId, 10),
            courseId: generalInfo?.course?.id,
            courseName: generalInfo?.course?.display_name,
            scholarYear: scholarYear,
            epochs: epochsList,
            course_unit_id: exam.course_unit_id,
            date_start: exam.date_start,
            date_end: exam.date_end,
            duration_minutes: exam.duration_minutes,
            exam_id: exam.id,
            epoch_id: exam.epoch_id,
            hour: exam.hour,
            method_id: exam.method_id,
            observations: exam.observations,
            room: exam.room,
        });
        setOpenScheduleExamModal(true);
    }

    const closeScheduleExamModal = () => {
        setOpenScheduleExamModal(false);
        setScheduleExamInfo({});
    };

    const addExamToList = (exam) => {
        console.log(exam);
        setExamList((current) => [...current, exam]);
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
        setOpenExamDetailModal(false);
    }

    useEffect(() => {
        // check if URL params are just numbers or else redirects to previous page
        if(!/\d+/.test(calendarId)){
            history(-1);
            toast(t('calendar.Ocorreu um erro ao carregar a informacao pretendida'), errorConfig);
        }
        axios.get('/permissions/calendar').then((res) => {
            if (res.status === 200) {
                localStorage.setItem('calendarPermissions', JSON.stringify(res.data.data));
            }
        });
    }, []);

    // useEffect(() => {
    //     if (typeof calendarPhase === 'number') {
    //         setCalendarPermissions(JSON.parse(localStorage.getItem('calendarPermissions'))?.filter((perm) => perm.phase_id === calendarPhase) || []);
    //     }
    // }, [calendarPhase]);

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

    const ignoreComment = (commentId) => {
        axios.post(`/comment/${commentId}/ignore`).then((res) => {
            if (res.status === 200) {
                toast(t('calendar.Comentário ignorado com sucesso!'), successConfig);
            } else {
                toast(t('calendar.Ocorreu um erro ao ignorar o comentário!'), successConfig);
            }
        });
    };

    const loadCalendar = (calId) => {
        setIsLoading(true);
        setExamList([]);
        axios.get(`/calendar/${calId}`)
            .then((response) => {
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
                    epochs.forEach((epoch) => {
                        setExamList((current) => [...current, ...epoch.exams]);
                    });
                    setGeneralInfo(general_info);
                    setDifferences(differences);
                    setIsLoading(false);
                    setPreviousFromDefinitive(previous_from_definitive);
                    setWeekTen(moment(week_ten).week());
                } else {
                    history('/calendario');
                }
            }).catch((r) => alert(r));
    };

    const weekData = useMemo(() => _.orderBy(
            epochsList.reduce((acc, curr) => {
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

                        const foundMultipleDaysWithSameInterruption = acc.find(({week}) => week === start_date.isoWeek())
                            .days.filter((x) => x.interruption?.id === currentInterruption?.id);

                        if (foundMultipleDaysWithSameInterruption?.length) {
                            foundMultipleDaysWithSameInterruption[0].interruptionDays = foundMultipleDaysWithSameInterruption.length;
                        }

                        week.epoch = {
                            name: curr.name,
                            code: curr.code
                        };
                    }
                    start_date.add(1, 'days');
                }
                return acc;
            }, []),
            ['year', 'week'],
        ), [epochsList, interruptionsList]);

    useEffect(() => {
        loadCalendar(calendarId);
    }, [calendarId]);

    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }

    const courseYears = generalInfo?.course?.duration ? range(1, generalInfo?.course?.duration) : [];
    const weekDays = [1, 2, 3, 4, 5, 6];
    let alreadyAddedColSpan = false;
    let alreadyAddedRowSpan = false;
    let interruptionDays = 0;

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
                    { ( existingExamsAtThisDate.length > 0 ? (
                            <Button color={"orange"} className='btn-add-interruption' title="Adicionar Interrupção"
                                    onClick={() => interruptionForceHandler(day.date)}>
                                <Icon name="calendar times outline" />
                                Adicionar Interrupção
                            </Button>
                        ) : (
                            !day.interruption ? (
                                <Button className='btn-add-interruption' title="Adicionar Interrupção"
                                        onClick={() => interruptionHandler(undefined, day.date)}>
                                    <Icon name="calendar times outline" />
                                    Adicionar Interrupção
                                </Button>
                            ) : (
                                <Button color="yellow" className='btn-add-interruption' title="Editar Interrupção"
                                        onClick={() => interruptionHandler(day.interruption, day.date)}>
                                    <Icon name="calendar times outline" />
                                    Editar Interrupção
                                </Button>
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
    const weekDayContentCell = (epoch, days, courseIndex, year, weekDay, weekDayIndex) => {
        // TODO add exam to the dates (by single cols or colspan)
        const day = days.find((day) => day.weekDay === weekDay);
        const firstDayAvailable = moment(days[0].date);
        const lastDayAvailable = moment(days[days.length - 1].date);
        const {interruption} = day || {};
        const isInterruption = !!interruption;
        if (isInterruption && courseIndex === 0 && interruption.id !== days.find((day) => day.weekDay === weekDay - 1)?.interruption?.id) {
            interruptionDays = 0;
            alreadyAddedRowSpan = false;
        }
        if ((isInterruption && alreadyAddedRowSpan && courseIndex > 0) || (isInterruption && interruptionDays++ >= day?.interruptionDays)) {
            return null;
        }
        if ((year === 1 && !day?.date) || isInterruption) {
            if (!isInterruption && (weekDay === 1 || (lastDayAvailable.day() < 6 && !alreadyAddedColSpan))) {
                alreadyAddedColSpan = true;
                return (<Table.Cell
                    key={weekDayIndex}
                    colSpan={isInterruption && lastDayAvailable.day() < 6 ? 6 - lastDayAvailable.day() : firstDayAvailable.day() - 1}
                    rowSpan={courseYears.length}/>);
            }
            if (!alreadyAddedColSpan || (isInterruption && courseIndex === 0)) {
                alreadyAddedRowSpan = true;
                return (
                    <Table.Cell key={weekDayIndex} textAlign="center" className={isInterruption ? "calendar-day-interruption" : null  }
                                rowSpan={courseYears.length}
                                colSpan={isInterruption ? day?.interruptionDays : null} >
                        <div>
                            {isInterruption ? interruption.description : null}
                        </div>
                    </Table.Cell>
                );
            }
        } else if (day?.date) {
            const currentDate = moment(day.date);
            const existingExamsAtThisDate = examList.filter((exam) => {
                return  exam.academic_year === year &&
                        currentDate.isBetween(exam.date_start, exam.date_end, 'date','[]');
            });
            let examsComponents = null;
            if (existingExamsAtThisDate?.length) {
                examsComponents = existingExamsAtThisDate.map((exam) => {
                    return (
                        // <Button key={exam.id} onClick={() => openExamDetailHandler(year, exam)} isModified={differences?.includes(exam.id)} >
                        <Button className="btn-exam-details" color="blue" key={exam.id} onClick={() => openExamDetailHandler(year, exam)} >
                            { !isPublished  && (calendarPermissions.filter((x) => x.name === SCOPES.EDIT_EXAMS).length > 0) && (
                                <div className="btn-action-wrapper">
                                    {calendarPermissions.filter((x) => x.name === SCOPES.EDIT_EXAMS).length > 0 && (
                                        <div className='btn-action-edit' onClick={(event) => editExamHandler(event, year, exam)}>
                                            <Icon name="edit"/>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="btn-exam-content">
                                <div className="btn-exam-label">{ (exam.hour ? exam.hour + ' ' : '') + exam.course_unit_initials }</div>
                                <div className="btn-exam-type">{ exam.method_name }</div>
                            </div>
                        </Button>
                    );
                });
            }
            return (
                <Table.Cell key={weekDayIndex} className={ 'calendar-day-' + epoch.code } textAlign="center">
                    {examsComponents}
                    {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.ADD_EXAMS).length > 0 && (
                        <Button className="btn-schedule-exam" onClick={() => scheduleExamHandler(year, day.date, existingExamsAtThisDate)}>
                            Marcar
                        </Button>
                    )}
                </Table.Cell>
            );
        }
        return null;
    }

    /*
     * Calendar
     */
    return (
        <Container>
            <InfosAndActions epochs={epochsList} calendarInfo={generalInfo}></InfosAndActions>
            <AnimatePresence>
                {isLoading && (
                    <PageLoader
                        animate={{
                            opacity: 1,
                            transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
                        }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
                        }}
                    />
                )}
            </AnimatePresence>
            <div className='margin-top-l'>
                <Grid stackable className='calendar-tables'>
                    <Grid.Row>
                        <Grid.Column width="16">
                            {weekData.map(({week, year, days, epoch}, tableIndex) => {
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
                                                    <Table.HeaderCell width="2">Week #{week}</Table.HeaderCell>
                                                    <Table.HeaderCell width="2">{t('calendar.2ª Feira')}</Table.HeaderCell>
                                                    <Table.HeaderCell width="2">{t('calendar.3ª Feira')}</Table.HeaderCell>
                                                    <Table.HeaderCell width="2">{t('calendar.4ª Feira')}</Table.HeaderCell>
                                                    <Table.HeaderCell width="2">{t('calendar.5ª Feira')}</Table.HeaderCell>
                                                    <Table.HeaderCell width="2">{t('calendar.6ª Feira')}</Table.HeaderCell>
                                                    <Table.HeaderCell width="2">{t('calendar.Sábado')}</Table.HeaderCell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.HeaderCell textAlign="center">
                                                        {year}
                                                    </Table.HeaderCell>
                                                    {weekDays.map((weekDay, index) => weekDayHeaderCell(days, weekDay, index) )}
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {courseYears.map((year, courseIndex) => {
                                                        alreadyAddedColSpan = false;
                                                        return (
                                                            <Table.Row key={courseIndex}>
                                                                <Table.Cell textAlign="center">{ t("Ano") + " " + year }</Table.Cell>
                                                                {weekDays.map((weekDay, weekDayIndex) => weekDayContentCell(epoch, days, courseIndex, year, weekDay, weekDayIndex))}
                                                            </Table.Row>
                                                        );
                                                    },
                                                )}
                                            </Table.Body>
                                        </Table>
                                    </div>
                                );
                            })}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
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
                deletedExam={removeExamFromList} />
        </Container>
    );
};
export default Calendar;
