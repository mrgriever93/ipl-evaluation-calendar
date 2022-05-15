import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Field, Form as FinalForm} from 'react-final-form';
import {DateInput, TimeInput} from 'semantic-ui-calendar-react-yz';
import {Accordion, Button, Card, Container, Divider, Form, Grid, Header, Icon, List, Modal, Segment, Table, TextArea, Popup, Dropdown, Comment, Message} from 'semantic-ui-react';
import styled, {css} from 'styled-components';
import {AnimatePresence} from 'framer-motion';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import PageLoader from '../../components/PageLoader';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../utils/toastConfig';

import InfosAndActions from './detail/infos-and-actions';
import PopupScheduleInterruption from './detail/popup-sched-interruption';
import PopupScheduleEvaluation from './detail/popup-sched-evaluation';
// import PopupEvaluationDetail from './detail/popup-evaluation-detail';

const SweetAlertComponent = withReactContent(Swal);

const CellButton = styled.div`
    width: 100%;
    height: ${({height}) => (height || '40px')};
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
    color: ${({color}) => color || 'transparent'};
    ${({backgroundColor}) => (backgroundColor ? css`background-color: ${backgroundColor};` : null)}
    ${({fontSize}) => (fontSize ? css`font-size: ${fontSize};` : css`line-height: 40px;`)}
    ${({margin}) => (margin ? css`margin: ${margin};` : null)}
    ${({isModified}) => (isModified ? css`background-color: rgb(237, 170, 0);` : null)}
    &:hover {
        background-color: #dee2e6;
        color: black;
    }`;

const LegendBox = styled.div`
    user-select: none;
    border-radius: 0.28571429rem;
    border: 1px solid rgba(34, 36, 38, 0.1);
    width: 140px;
    height: 50px;
    background-color: ${({backgroundColor}) => backgroundColor};
    margin: 0 20px 20px 0;
    color: black;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
`;

const EditExamButton = styled.div`
    position: absolute;
    left: 5px;
    &:hover {
        color: #edaa00;
    }
`;

const RemoveExamButton = styled.div`
    position: absolute;
    right: 0;
    &:hover {
      color: #db2828;
    }
`;

const Calendar = () => {
    const history = useNavigate();
    const { t } = useTranslation();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [calendarPermissions, setCalendarPermissions] = useState(JSON.parse(localStorage.getItem('calendarPermissions')) || []);
    const [interruptionsList, setInterruptions] = useState([]);
    const [epochsList, setEpochs] = useState([]);
    const [generalInfo, setGeneralInfo] = useState();
    const [differences, setDifferences] = useState();
    const [openModal, setOpenModal] = useState(false);
    const [interruptionTypes, setInterruptionTypesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalInfo, setModalInfo] = useState({});
    const [activeIndex, setActiveIndex] = useState(undefined);
    const [loadInterruptionTypes, setLoadInterruptionTypes] = useState(false);
    const [examInfoModal, setExamInfoModal] = useState({});
    const [openExamModal, setOpenExamModal] = useState(false);
    const [loadRemainingCourseUnits, setLoadRemainingCourseUnits] = useState(false);
    const [selectedEpoch, setSelectedEpoch] = useState();
    const [courseUnits, setCourseUnits] = useState(undefined);
    const [methodList, setMethodList] = useState(undefined);
    const [calendarPhases, setCalendarPhases] = useState([]);
    const [examList, setExamList] = useState([]);
    const [publishLoading, setPublishLoading] = useState(false);
    const [creatingCopy, setCreatingCopy] = useState(false);

    const [isTemporary, setIsTemporary] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [calendarPhase, setCalendarPhase] = useState(true);
    const [updatingCalendarPhase, setUpdatingCalendarPhase] = useState(false);
    const [removingExam, setRemovingExam] = useState(undefined);
    const [changeData, setChangeData] = useState(false);
    const [savingExam, setSavingExam] = useState(false);
    const [viewExamInformation, setViewExamInformation] = useState(false);
    const [showIgnoredComments, setShowIgnoredComments] = useState(false);
    const [commentText, setCommentText] = useState(undefined);
    const [previousFromDefinitive, setPreviousFromDefinitive] = useState(false);
    const [noMethods, setNoMethods] = useState(false);

    const addComment = (examId) => {
        axios.post('/comment/', {
            exam_id: examId,
            comment: commentText,
        }).then((res) => {
            if (res.status === 201) {
                toast(t('calendar.O comentário foi adicionado com sucesso!'), successConfig);
            } else {
                toast(t('calendar.Ocorreu um erro ao adicionar o comentário!'), errorConfig);
            }
        });
    };

    const calendarId = paramsId;

    const patchCalendar = (fieldToUpdate, value) => axios.patch(`/calendar/${calendarId}`, {
        [fieldToUpdate]: value,
    });

    const updateCalendarStatus = (newTemporaryStatus) => {
        patchCalendar('temporary', newTemporaryStatus).then((response) => {
            if (response.status === 200) {
                setIsTemporary(newTemporaryStatus);
                toast(t('calendar.Estado do calendário atualizado!'), successConfig);
            }
        });
    };

    const updateCalendarPhase = (newCalendarPhase) => {
        setUpdatingCalendarPhase(true);
        patchCalendar('calendar_phase_id', newCalendarPhase).then(
            (response) => {
                setUpdatingCalendarPhase(false);
                if (response.status === 200) {
                    setCalendarPhase(newCalendarPhase);
                    toast(t('calendar.Fase do calendário atualizada!'), successConfig);
                }
            },
        );
    };

    const ignoreComment = (commentId) => {
        axios.post(`/comment/${commentId}/ignore`).then((res) => {
            if (res.status === 200) {
                toast(t('calendar.Comentário ignorado com sucesso!'), successConfig);
            } else {
                toast(t('calendar.Ocorreu um erro ao ignorar o comentário!'), successConfig);
            }
        });
    };

    useEffect(() => {
        // check if URL params are just numbers or else redirects to previous page
        if(!/\d+/.test(paramsId)){
            history(-1);
            toast(t('calendar.Ocorreu um erro ao carregar a informacao pretendida'), errorConfig);
        }
        axios.get('/permissions/calendar').then((res) => {
            if (res.status === 200) {
                localStorage.setItem('calendarPermissions', JSON.stringify(res.data.data));
            }
        });
    }, []);

    const loadCalendar = (calId) => {
        setIsLoading(true);
        setExamList([]);
        axios
            .get(`/calendar/${calId}`)
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
                            },
                        },
                    } = response;
                    setIsTemporary(!!general_info?.temporary);
                    setCalendarPhase(general_info?.phase?.id);
                    setIsPublished(!!published);
                    setInterruptions(interruptions);
                    setEpochs(epochs);
                    epochs.forEach((epoch) => {
                        setExamList((current) => [...current, ...epoch.exams]);
                    });
                    setGeneralInfo(general_info);
                    setDifferences(differences);
                    setIsLoading(false);
                    setPreviousFromDefinitive(previous_from_definitive);
                } else {
                    history('/calendario');
                }
            })
            .catch((r) => alert(r));
    };

    const onSubmitInterruption = (values) => {
        const axiosFn = values?.id ? axios.patch : axios.post;
        axiosFn(`/interruptions/${values?.id ? values.id : ''}`, {
            calendar_id: parseInt(calendarId, 10),
            interruption_type_id: values.interruptionType,
            description: values.description,
            start_date: moment(values.startDate).format('YYYY-MM-DD'),
            end_date: moment(values.endDate).format('YYYY-MM-DD'),
        })
            .then((res) => {
                if (res.status === 200 || res.status === 201) {
                    toast(`Interrupção ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
                    loadCalendar(calendarId);
                } else {
                    toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a interrupção!`, errorConfig);
                }
            });
        setOpenModal(false);
        setIsLoading(true);
    };

    useEffect(() => {
        if (typeof calendarPhase === 'number') {
            setCalendarPermissions(JSON.parse(localStorage.getItem('calendarPermissions'))?.filter((perm) => perm.phase_id === calendarPhase) || []);
        }
    }, [calendarPhase]);

    const onSubmitExam = (values) => {
        setSavingExam(true);
        const axiosFn = values?.id ? axios.patch : axios.post;
        axiosFn(`/exams/${values?.id ? values?.id : ''}`, {
            calendar_id: parseInt(calendarId, 10),
            course_id: generalInfo?.course?.id,
            room: values.room || undefined,
            date: moment(values.date).format('YYYY-MM-DD'),
            hour: values.hour,
            duration_minutes: values.durationMinutes || undefined,
            observations: values.observations,
            epoch_id: values.epoch,
            method_id: values.method,
            course_unit_id: values.courseUnit,
        })
            .then((res) => {
                setSavingExam(false);
                if (res.status === 200 || res.status === 201) {
                    setOpenExamModal(false);
                    toast(`Avaliação ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
                    loadCalendar(calendarId);
                } else {
                    toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a avaliação!`, errorConfig);
                }
            });
    };

    const removeInterruption = (interruptionId) => {
        SweetAlertComponent.fire({
            title: t('Atenção!'),

            html: 'Ao eliminar a interrupção, todo o período compreendido entre o ínicio e o fim desta interrupção, ficará aberto para avaliações!<br/><strong>Tem a certeza que deseja eliminar esta interrupção, em vez de editar?</strong>',
            denyButtonText: t('Não'),
            confirmButtonText: t('Sim'),
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setRemovingExam(interruptionId);
                    axios.delete(`/interruptions/${interruptionId}`).then((res) => {
                        setRemovingExam(null);
                        loadCalendar(calendarId);
                        if (res.status === 200) {
                            toast(t('calendar.Interrupção eliminada com sucesso deste calendário!'), successConfig);
                        } else {
                            toast(t('calendar.Ocorreu um problema ao eliminar a interrupção deste calendário!'), errorConfig);
                        }
                    });
                }
            });
    };

    useEffect(() => {
        if (!openExamModal) {
            setExamInfoModal(undefined);
            setNoMethods(false);
            setSelectedEpoch(undefined);
            setCourseUnits([]);
            setMethodList([]);
        }
    }, [openExamModal]);

    const removeExam = (examId) => {
        SweetAlertComponent.fire({
            title: t('Atenção!'),

            html: 'Ao eliminar este exame, terá de adicioná-lo novamente em outra data a escolher!<br/><br/><strong>Tem a certeza que deseja eliminar este exame, em vez de editar?</strong>',
            denyButtonText: t('Não'),
            confirmButtonText: t('Sim'),
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setRemovingExam(examId);
                    axios.delete(`/exams/${examId}`).then((res) => {
                        setRemovingExam(null);
                        loadCalendar(calendarId);
                        if (res.status === 200) {
                            toast('Exame eliminado com sucesso deste calendário!', successConfig);
                        } else {
                            toast('Ocorreu um problema ao eliminar o exame deste calendário!', errorConfig);
                        }
                    });
                }
            });
    };

    const handleFaqClick = (e, titleProps) => {
        const {index} = titleProps;
        const newIndex = activeIndex === index ? -1 : index;
        setActiveIndex(newIndex);
    };

    const weekData = useMemo(
        () => _.orderBy(
            epochsList.reduce((acc, curr) => {
                const start_date = moment(curr.start_date);
                const end_date = moment(curr.end_date);
                while (start_date <= end_date) {
                    if (start_date.day() !== 0) {
                        if (
                            !acc.filter(
                                ({week}) => week === start_date.isoWeek(),
                            ).length
                        ) {
                            acc.push({
                                week: start_date.isoWeek(),
                                year: start_date.year(),
                                days: [],
                            });
                        }

                        const currentInterruption = interruptionsList.find(
                            (interruption) => {
                                const interruptionStartDate = moment(
                                    interruption.start_date,
                                    'YYYY-MM-DD',
                                );
                                const interruptionEndDate = moment(
                                    interruption.end_date,
                                    'YYYY-MM-DD',
                                );

                                return (
                                    (start_date.isAfter(
                                            interruptionStartDate,
                                        )
                                        && start_date.isBefore(
                                            interruptionEndDate,
                                        ))
                                    || start_date.isSame(
                                        interruptionStartDate,
                                        'day',
                                    )
                                    || start_date.isSame(
                                        interruptionEndDate,
                                        'day',
                                    )
                                );
                            },
                        );

                        const week = acc.find(
                            ({week}) => week === start_date.isoWeek(),
                        );
                        if (
                            !week.days.find(
                                (day) => day.weekDay === start_date.day(),
                            )
                        ) {
                            week.days.push({
                                weekDay: start_date.day(),
                                date: start_date.format(),
                                interruption: currentInterruption,
                                interruptionDays: 1,
                            });
                        }

                        const foundMultipleDaysWithSameInterruption = acc
                            .find(
                                ({week}) => week === start_date.isoWeek(),
                            )
                            .days.filter(
                                (x) => x.interruption?.id
                                    === currentInterruption?.id,
                            );

                        if (foundMultipleDaysWithSameInterruption?.length) {
                            foundMultipleDaysWithSameInterruption[0].interruptionDays = foundMultipleDaysWithSameInterruption.length;
                        }

                        week.epoch = {
                            name: curr.name,
                            color: curr.name === "Época Periódica" ? '#ecfff0' : curr.name === "Época Normal" ? '#f5e6da' : '#f9dddd',
                        };
                    }

                    start_date.add(1, 'days');
                }

                return acc;
            }, []),
            ['year', 'week'],
        ),
        [epochsList, interruptionsList],
    );

    useEffect(() => {
        if (loadRemainingCourseUnits) {
            axios
                .get(
                    `/available-methods/${calendarId}/?epoch_id=${selectedEpoch}&year=${examInfoModal.year}`,
                )
                .then((response) => {
                    if (response.status === 200) {
                        const branches = examInfoModal
                            .existingExamsAtThisDate?.filter((x) => x.academic_year === examInfoModal.year)
                            ?.map((y) => y?.course_unit?.branch?.id);
                        const beforeSetCourseUnits = response.data.data?.filter(
                            (x) => !(branches.length ? branches?.includes(x?.branch?.id) : false),
                        );

                        const mapped = beforeSetCourseUnits?.map(
                            ({
                                 id, name, methods, branch,
                             }) => ({
                                key: id,
                                value: id,
                                text: name,
                                methods,
                                branch,
                            }),
                        );

                        setCourseUnits(mapped);
                        setNoMethods(response.data.data?.length === 0 || beforeSetCourseUnits?.length === 0);
                    }
                });
            setLoadRemainingCourseUnits(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadRemainingCourseUnits, examInfoModal]);

    useEffect(() => {
        if (loadInterruptionTypes) {
            if (!interruptionTypes?.length) {
                axios.get('/interruption-types').then((response) => {
                    if (response.status === 200) {
                        setInterruptionTypesList(
                            response.data.data?.map(({id, description}) => ({
                                key: id,
                                value: id,
                                text: description,
                            })),
                        );
                    }
                });
            }
            setLoadInterruptionTypes(false);
        }
    }, [loadInterruptionTypes, interruptionTypes]);

    useEffect(() => {
        loadCalendar(calendarId);
    }, [calendarId]);

    useEffect(() => {
        axios.get('/calendar-phases').then((response) => {
            if (response.status === 200) {
                setCalendarPhases(
                    response.data.data?.map(({id, description, name}) => ({
                        key: id,
                        value: id,
                        text: description,
                        name,
                    })),
                );
            }
        });
    }, []);

    const publishCalendar = () => {
        setPublishLoading(true);
        axios.post(`/calendar/${calendarId}/publish`).then((res) => {
            setPublishLoading(false);
            loadCalendar(calendarId);
            if (res.status === 200) {
                toast('Calendário publicado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao tentar publicar o calendário!', errorConfig);
            }
        });
    };

    const onEditInterruptionClick = (interruption) => {
        setLoadInterruptionTypes(
            true,
        );
        setModalInfo({
            ...interruption,
        });
        setOpenModal(
            true,
        );
    };

    const createCopy = () => {
        SweetAlertComponent.fire({
            title: 'Atenção!',

            html: 'Ao criar uma cópia deste calendário, irá eliminar todas as cópias criadas anteriormente deste mesmo calendário!<br/><br/><strong>Tem a certeza que deseja criar uma cópia do calendário?</strong>',
            denyButtonText: 'Não',
            confirmButtonText: 'Sim',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setCreatingCopy(true);
                    axios.post(`/calendar/${calendarId}/publish`, {
                        createCopy: true,
                    }).then((res) => {
                        setCreatingCopy(false);
                        if (res.status === 200) {
                            toast('Cópia do calendário criada com sucesso!', successConfig);
                        } else {
                            toast('Ocorreu um erro ao tentar criar uma cópia do calendário!', errorConfig);
                        }
                    });
                }
            });
    };

    function range(start, end) {
        return Array(end - start + 1)
            .fill()
            .map((_, idx) => start + idx);
    }

    const courseYears = generalInfo?.course?.duration
        ? range(1, generalInfo?.course?.duration)
        : [];
    const weekDays = [1, 2, 3, 4, 5, 6];
    let alreadyAddedColSpan = false;
    let alreadyAddedRowSpan = false;
    let interruptionDays = 0;

    return (
        <Container>
            <InfosAndActions></InfosAndActions>
            <AnimatePresence>
                {isLoading && (
                    <PageLoader
                        animate={{
                            opacity: 1,
                            transition: {
                                duration: 0.5,
                                ease: [0.4, 0.0, 0.2, 1],
                            },
                        }}
                        exit={{
                            opacity: 0,
                            transition: {
                                duration: 0.5,
                                ease: [0.4, 0.0, 0.2, 1],
                            },
                        }}
                    />
                )}
            </AnimatePresence>
            {/* <br/>
            <Header as="h3">Calendário de Avaliação</Header>
            <Header as="h4">
                Curso:
                {' '}
                {generalInfo?.course?.name}
            </Header>
            <Header as="h5">Legenda:</Header>
            <div style={{display: 'flex'}}>
                <Popup
                    content="Toda a avaliação que possua esta legenda, foi modificada em relação à versão anterior do calendário."
                    trigger={(
                        <LegendBox backgroundColor="rgb(237, 170, 0)">
                            Modificado
                        </LegendBox>
                    )}
                />
                <LegendBox backgroundColor="#ddd9c1">Avaliação</LegendBox>
            </div> */}
            <div className='margin-top-l'>
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width="16">
                        {weekData.map(({week, year, days, epoch}, tableIndex) => {
                            interruptionDays = 0;
                            alreadyAddedColSpan = false;
                            return (
                                <Table key={tableIndex} celled style={{userSelect: 'none'}}>
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
                                            {weekDays.map((weekDay, index) => {
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
                                                    return ( 
                                                        <Table.HeaderCell key={index} textAlign="center">
                                                            {moment(day.date).format('DD-MM-YYYY')}
                                                        </Table.HeaderCell>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {courseYears.map((year, courseIndex) => {
                                                alreadyAddedColSpan = false;
                                                return (
                                                    <Table.Row key={courseIndex}>
                                                        <Table.Cell textAlign="center">{year} º Ano</Table.Cell>
                                                        {weekDays.map(
                                                            (weekDay, weekDayIndex) => {
                                                                const day = days.find((day) => day.weekDay === weekDay);
                                                                const firstDayAvailable = moment(days[0].date);
                                                                const lastDayAvailable = moment(days[days.length - 1].date);
                                                                const {interruption,} = day || {};
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
                                                                            <Table.Cell key={weekDayIndex} 
                                                                                textAlign="center"
                                                                                style={isInterruption ? {backgroundColor: '#c9c9c9', fontWeight: 'bold'} : null  }
                                                                                rowSpan={courseYears.length}
                                                                                colSpan={isInterruption ? day?.interruptionDays : null}
                                                                            >
                                                                                <div>
                                                                                    {isInterruption ? interruption.description : null}
                                                                                </div>
                                                                            </Table.Cell>
                                                                        );
                                                                    }
                                                                } else if (day?.date) {
                                                                    const existingExamsAtThisDate = examList.filter((exam) => moment(exam.date).isSame(moment(day.date), 'day'));
                                                                    let examsComponents = null;
                                                                    if (existingExamsAtThisDate?.length) {
                                                                        examsComponents = existingExamsAtThisDate.map((exam) => {
                                                                                if (exam.academic_year === year) {
                                                                                    return (
                                                                                        <CellButton
                                                                                            key={exam.id}
                                                                                            color="black"
                                                                                            backgroundColor="#ddd9c1"
                                                                                            height="auto"
                                                                                            fontSize="11px"
                                                                                            margin="0 0 10px 0"
                                                                                            onClick={() => {
                                                                                                setExamInfoModal({...exam, year});
                                                                                                setViewExamInformation(true);
                                                                                            }}
                                                                                            isModified={differences?.includes(exam.id)}
                                                                                        >
                                                                                            {removingExam === exam.id ? <Icon loading name="spinner"/> : !isPublished
                                                                                                && calendarPermissions.filter((x) => x.name === SCOPES.REMOVE_EXAMS || x.name === SCOPES.EDIT_EXAMS).length > 0
                                                                                                && (<div style={{position: 'relative', height: '20px'}}>
                                                                                                        {calendarPermissions.filter((x) => x.name === SCOPES.EDIT_EXAMS).length > 0 && (
                                                                                                            <EditExamButton onClick={() => {
                                                                                                                    setExamInfoModal({...exam, year},);
                                                                                                                    setOpenExamModal(true);
                                                                                                                }}>
                                                                                                                <Icon name="edit"/>
                                                                                                            </EditExamButton>
                                                                                                        )}
                                                                                                        {calendarPermissions.filter((x) => x.name === SCOPES.EDIT_EXAMS).length > 0 && (
                                                                                                            <RemoveExamButton onClick={() => removeExam(exam.id)}>
                                                                                                                <Icon name="trash"/>
                                                                                                            </RemoveExamButton>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            {exam.hour + ' ' +exam.course_unit.initials + ' ' +exam.method.name}
                                                                                        </CellButton>
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            },
                                                                        );
                                                                    }
                                                                    return (
                                                                        <Table.Cell 
                                                                            key={weekDayIndex}
                                                                            style={ {backgroundColor: epoch.color} }
                                                                            textAlign="center" 
                                                                            onContextMenu={(e,) => {
                                                                                e.preventDefault();
                                                                                if (!isPublished && existingExamsAtThisDate?.length === 0 && calendarPermissions.filter((x) => x.name === SCOPES.ADD_INTERRUPTION).length > 0) {
                                                                                    setModalInfo({start_date: day.date});
                                                                                    setOpenModal(true);
                                                                                    setLoadInterruptionTypes(true);
                                                                                }
                                                                            }}>
                                                                            {examsComponents}
                                                                            {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.ADD_EXAMS).length > 0 && (
                                                                                    <CellButton
                                                                                        onClick={() => {
                                                                                            setExamInfoModal({date: day.date, year, existingExamsAtThisDate});
                                                                                            setOpenExamModal(true);
                                                                                        }}>
                                                                                        Marcar
                                                                                    </CellButton>
                                                                                )}
                                                                        </Table.Cell>
                                                                    );
                                                                }
                                                                return null;
                                                            },
                                                        )}
                                                    </Table.Row>
                                                );
                                            },
                                        )}
                                    </Table.Body>
                                </Table>
                            );
                        })}
                    </Grid.Column>
                    {/* <ShowComponentIfAuthorized permission={[SCOPES]}> */}
                    {/* <Grid.Column width="4">
                        <Segment>
                            <Card>
                                <Card.Content>
                                    <Card.Header>Informações</Card.Header>
                                </Card.Content>
                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]}>
                                    <Card.Content>
                                        {!isPublished ? (
                                            <ShowComponentIfAuthorized permission={[SCOPES.PUBLISH_CALENDAR]}>
                                                <div>
                                                  <span>
                                                    <Header as="h5">Publicar</Header>
                                                    <Button color="teal" loading={publishLoading} onClick={publishCalendar}>Publicar esta versão</Button>
                                                  </span>
                                                </div>
                                            </ShowComponentIfAuthorized>
                                        ) : (
                                            <ShowComponentIfAuthorized permission={[SCOPES.CREATE_COPY]}>
                                                <p>
                                                  <span>
                                                    <Header as="h5">Criar cópia editável</Header>
                                                    <Button color="teal" loading={creatingCopy} onClick={createCopy}>Criar um cópia desta versão</Button>
                                                  </span>
                                                </p>
                                            </ShowComponentIfAuthorized>
                                        )}
                                        {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.CHANGE_CALENDAR_PHASE).length > 0 ?
                                            (
                                                <div>
                                                    <span>
                                                        <Header as="h5">Fase:</Header>
                                                        <Dropdown
                                                            options={calendarPhases.filter((x) => x.name !== 'system' && x.name !== 'published')}
                                                            selection
                                                            search
                                                            label="Fase do Calendário"
                                                            loading={!calendarPhases.length || updatingCalendarPhase}
                                                            onChange={(e, {value}) => {updateCalendarPhase(value);}}
                                                            value={calendarPhase}
                                                        />
                                                    </span>
                                                </div>
                                            ) : (
                                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_ACTUAL_PHASE]}>
                                                    <Header as="h5">Fase:</Header>
                                                    <span>{calendarPhases.find((x) => x.key === calendarPhase)?.text || generalInfo?.phase?.description}</span>
                                                </ShowComponentIfAuthorized>
                                            )
                                        }
                                        <div>
                                            <span>
                                                <Header as="h5">Estado:</Header>
                                                <Button.Group>
                                                    <Button compact onClick={() => updateCalendarStatus(true)} positive={isTemporary} disabled={isPublished || previousFromDefinitive}>
                                                        Temporário
                                                    </Button>
                                                    <Button compact onClick={() => updateCalendarStatus(false)} positive={!isTemporary} disabled={isPublished || previousFromDefinitive}>
                                                        Definitivo
                                                    </Button>
                                                </Button.Group>
                                            </span>
                                        </div>
                                        <div>
                                            <span>
                                                <Header as="h5">Ano Letivo:</Header>
                                                2019-20
                                            </span>
                                        </div>
                                        <div>
                                            <span>
                                                <Header as="h5">Curso: </Header>
                                                {generalInfo?.course?.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span>
                                                <Header as="h5">Última alteração:</Header>
                                                {moment(generalInfo?.calendar_last_update,).format('DD MMMM, YYYY HH:mm')}
                                            </span>
                                        </div>
                                    </Card.Content>
                                </ShowComponentIfAuthorized>
                                <Card.Content>
                                    <Header as="h4">Épocas</Header>
                                    <List divided relaxed>
                                        {epochsList.map((epoch, listIndex) => (
                                            <List.Item key={listIndex} >
                                                <List.Icon name="calendar alternate" size="large" verticalAlign="middle"/>
                                                <List.Content>
                                                    <List.Header>{epoch.name}</List.Header>
                                                    <List.Description>
                                                        <b>Ínicio:</b>
                                                        {' '}{moment(epoch.start_date).format('DD MMMM, YYYY')}
                                                    </List.Description>
                                                    <List.Description>
                                                        <b>Fim:</b>
                                                        {' '}{moment(epoch.end_date).format('DD MMMM, YYYY')}
                                                    </List.Description>
                                                </List.Content>
                                            </List.Item>
                                        ))}
                                    </List>
                                </Card.Content>
                                <Card.Content>
                                    <Header as="h4">Interrupções letivas</Header>
                                    <List divided relaxed>
                                        {interruptionsList.filter((x) => !x.isHoliday && x.start_date > _.min(epochsList.map((x) => x.start_date)) && x.end_date < _.max(epochsList.map((x) => x.end_date)))
                                            .map((interruption, interruptionIndex) => (
                                                <List.Item key={interruptionIndex}>
                                                    <List.Icon name="calendar alternate" size="large"/>
                                                    <List.Content>
                                                        <List.Header>{interruption.description}</List.Header>
                                                        {moment(interruption.start_date).isSame(moment(interruption.end_date)) ?
                                                            (
                                                            <>
                                                                <List.Description>
                                                                    <b>Dia:</b>
                                                                    {' '}{moment(interruption.start_date).format('DD MMMM, YYYY')}
                                                                </List.Description>
                                                                {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.EDIT_INTERRUPTION).length > 0 &&
                                                                    (
                                                                        <Button icon color="yellow" onClick={() => onEditInterruptionClick(interruption)}>
                                                                            <Icon name="edit"/>
                                                                        </Button>
                                                                    )}
                                                                {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.REMOVE_INTERRUPTION).length > 0 &&
                                                                    (
                                                                        <Button icon color="red" onClick={() => removeInterruption(interruption.id)}>
                                                                            <Icon name="trash"/>
                                                                        </Button>
                                                                    )
                                                                }
                                                            </>
                                                        ) : (
                                                            <>
                                                                <List.Description>
                                                                    <b>Ínicio:</b>
                                                                    {' '}{moment(interruption.start_date).format('DD MMMM, YYYY')}
                                                                </List.Description>
                                                                <List.Description>
                                                                    <b>Fim:</b>
                                                                    {' '}{moment(interruption.end_date).format('DD MMMM, YYYY')}
                                                                </List.Description>
                                                                {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.EDIT_INTERRUPTION).length > 0 &&
                                                                    (
                                                                        <Button icon color="yellow" onClick={() => onEditInterruptionClick(interruption)}>
                                                                            <Icon name="edit"/>
                                                                        </Button>
                                                                    )}
                                                                {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.REMOVE_INTERRUPTION).length > 0 &&
                                                                    (
                                                                        <Button icon color="red" onClick={() => removeInterruption(interruption.id)}>
                                                                            <Icon name="trash"/>
                                                                        </Button>
                                                                    )
                                                                }
                                                            </>
                                                        )}
                                                    </List.Content>
                                                </List.Item>
                                            ))}
                                    </List>
                                </Card.Content>
                            </Card>
                            <ShowComponentIfAuthorized permission={[SCOPES.ADD_EXAMS]}>
                                <Segment inverted>
                                    <Header as="h3">Ajuda</Header>
                                    <Accordion inverted>
                                        <Accordion.Title active={activeIndex === 0} index={0} onClick={handleFaqClick}>
                                            <Icon name="dropdown"/>
                                            Como marcar uma avaliação?
                                        </Accordion.Title>
                                        <Accordion.Content active={activeIndex === 0}>
                                            <p>
                                                Para marcar uma avaliação, deve
                                                procurar no calendário o dia
                                                apropriado e carregar na opção
                                                "Marcar" que aparecerá na célula
                                                correspondente. De seguida, deverá
                                                preencher todas as informações
                                                necessárias.
                                            </p>
                                        </Accordion.Content>
                                        <Accordion.Title active={activeIndex === 1} index={1} onClick={handleFaqClick}>
                                            <Icon name="dropdown"/>
                                            Como marcar uma nova interrupção?
                                        </Accordion.Title>
                                        <Accordion.Content active={activeIndex === 1}>
                                            <p>
                                                Para marcar uma nova interrupção,
                                                deve procurar no calendário o dia de
                                                ínicio da interrupção, e utilizar o
                                                clique direito do rato sobre essa
                                                célula. De seguida, deverá preencher
                                                todas as informações necessárias.
                                            </p>
                                        </Accordion.Content>
                                    </Accordion>
                                </Segment>
                            </ShowComponentIfAuthorized>
                        </Segment>
                    </Grid.Column> */}
                    {/* </ShowComponentIfAuthorized> */}
                </Grid.Row>
            </Grid>
            </div>
            {/* TODO: there's no button to call the interruption popup yet. maybe was lost in the old stuff */}
            <PopupScheduleInterruption />
            {/* TODO: to clean up yet */}
            {/* <PopupEvaluationDetail /> */}
            <PopupScheduleEvaluation isOpen={openExamModal} onClose={() => {setOpenExamModal(false);}}/>
        </Container>
    );
};
export default Calendar;
