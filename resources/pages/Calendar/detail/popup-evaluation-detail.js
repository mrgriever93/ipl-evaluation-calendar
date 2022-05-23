import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Field, Form as FinalForm} from 'react-final-form';
import {DateInput, TimeInput} from 'semantic-ui-calendar-react-yz';
import {Accordion, Button, Card, Container, Divider, Form, Grid, Header, Icon, List, Modal, Segment, Table, TextArea, Popup, Dropdown, Comment, Message} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const PopupEvaluationDetail = ( {isOpen, onClose, examId} ) => {
    const history = useNavigate();
    const { t } = useTranslation();
    // get URL params
    let { id } = useParams();
    let paramsId = id;
    const calendarId = paramsId;

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
        }).then((res) => {
            if (res.status === 200 || res.status === 201) {
                toast(`Interrupção ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
                // loadCalendar(calendarId);
            } else {
                toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a interrupção! ${res.response.data}`, errorConfig);
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
                    // loadCalendar(calendarId);
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
                        // loadCalendar(calendarId);
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
                        // loadCalendar(calendarId);
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
                            color: curr.code === "periodic_season" ? '#ecfff0' : curr.code === "normal_season" ? '#f5e6da' : '#f9dddd',
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

    // useEffect(() => {
    //     loadCalendar(calendarId);
    // }, [calendarId]);

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
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>Detalhes da avaliação</Modal.Header>
            <Modal.Content>
                <Grid divided="vertically">
                    <Grid.Row columns="2">
                        <Grid.Column>
                            <p>
                                <b>Ano Curricular: </b>
                                {examInfoModal?.year}
                                º Ano
                            </p>
                            <p>
                                <b>Data: </b>
                                {moment(examInfoModal?.date).format('DD MMMM, YYYY')}
                            </p>
                            <p>
                                <b>Sala da avaliação: </b>
                                {examInfoModal?.room}
                            </p>
                            {examInfoModal?.duration_minutes && (
                                <p>
                                    <b>Duração: </b>
                                    {examInfoModal?.duration_minutes}
                                    {' '} minutos
                                </p>
                            )}
                            <p>
                                <b>Hora de ínicio: </b>
                                {examInfoModal?.hour}
                            </p>
                            <p>
                                <b>Observações: </b>
                                {examInfoModal?.observations}
                            </p>
                        </Grid.Column>
                        <Grid.Column>
                            <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS, SCOPES.ADD_COMMENTS]}>
                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>
                                    <Button icon color={!showIgnoredComments ? 'green' : 'red'} labelPosition="left" onClick={() => setShowIgnoredComments((cur) => !cur)}>
                                        <Icon name={'eye' + (showIgnoredComments ? ' slash' : '') }/>
                                        {!showIgnoredComments ? 'Mostrar' : 'Esconder'}
                                        {' '}
                                        ignorados
                                    </Button>
                                </ShowComponentIfAuthorized>
                                <Comment.Group>
                                    <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>
                                        <Header as="h3" dividing>Comentários</Header>
                                        {examInfoModal?.comments?.filter((x) => (showIgnoredComments ? true : !x.ignored))?.map((comment, commentIndex) => (
                                            <Comment key={commentIndex}>
                                                <Comment.Avatar src={`https://avatars.dicebear.com/api/human/${comment.user.id}.svg?w=50&h=50&mood[]=sad&mood[]=happy`}/>
                                                <Comment.Content style={comment.ignored ? {backgroundColor: 'lightgrey'} : {}}>
                                                    <Comment.Author as="a">{comment.user.name}</Comment.Author>
                                                    <Comment.Metadata>
                                                        <div>{comment.date}</div>
                                                    </Comment.Metadata>
                                                    <Comment.Text>
                                                        {comment.comment}
                                                        {comment.ignored ? (
                                                            <div style={{position: 'absolute', top: '5px', right: '5px', userSelect: 'none'}}>
                                                                Comentário ignorado
                                                            </div>
                                                        ) : ''}
                                                    </Comment.Text>
                                                    <Comment.Actions>
                                                        {!comment.ignored && (
                                                            <Comment.Action onClick={() => ignoreComment(comment.id)}>
                                                                Ignorar
                                                            </Comment.Action>
                                                        )}
                                                    </Comment.Actions>
                                                </Comment.Content>
                                            </Comment>
                                        ))}
                                    </ShowComponentIfAuthorized>
                                    {!isPublished && (
                                        <ShowComponentIfAuthorized permission={[SCOPES.ADD_COMMENTS]}>
                                            <Form reply>
                                                <Form.TextArea onChange={(ev, {value}) => setCommentText(value)}/>
                                                <Button onClick={() => addComment(examInfoModal?.id)} content="Adicionar comentário" labelPosition="left" icon="edit" primary/>
                                            </Form>
                                        </ShowComponentIfAuthorized>
                                    )}
                                </Comment.Group>
                            </ShowComponentIfAuthorized>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose} negative>
                    Fechar
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupEvaluationDetail;
