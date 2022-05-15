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

const PopupScheduleInterruption = () => {
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
        <FinalForm onSubmit={onSubmitInterruption} initialValues={{
                id: modalInfo?.id || null,
                startDate: moment(modalInfo?.start_date).format('DD MMMM, YYYY'),
                endDate: modalInfo?.id ? moment(modalInfo?.end_date).format('DD MMMM, YYYY') : null,
                description: modalInfo?.id ? modalInfo?.description : null,
                interruptionType: modalInfo?.id ? modalInfo?.interruption_type_id : null,
            }}
            render={({handleSubmit}) => (
                <Modal closeOnEscape closeOnDimmerClick open={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>
                        {modalInfo?.id ? 'Editar' : 'Adicionar'}{' '}interrupção
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <p>Detalhes da interrupção</p>
                            <Field name="description">
                                {({input: descriptionInput}) => (
                                    <Form.Input label="Descrição" placeholder="Descrição (opcional)"{...descriptionInput}/>
                                )}
                            </Field>
                            <Field name="interruptionType">
                                {({input: interruptionTypeInput}) => (
                                    <Form.Dropdown options={interruptionTypes} selection search loading={!interruptionTypes.length}
                                        label="Tipo de interrupção" value={interruptionTypeInput.value}
                                        onChange={(e, {value}) => interruptionTypeInput.onChange(value,)}
                                    />
                                )}
                            </Field>
                            <Field name="startDate">
                                {({input: startDateInput}) => (
                                    <Form.Field>
                                        <DateInput name="date" iconPosition="left" label="Data de Ínicio" placeholder="Data de Ínicio"
                                            dateFormat="DD MMMM, YYYY" value={startDateInput.value}
                                            onChange={(evt, {value}) => {startDateInput.onChange(value);}}
                                        />
                                    </Form.Field>
                                )}
                            </Field>
                            <Field name="endDate">
                                {({input: endDateInput}) => (
                                    <Form.Field>
                                        <DateInput name="date" iconPosition="left" label="Data de Fim" placeholder="Data de Fim"
                                            dateFormat="DD MMMM, YYYY" value={endDateInput.value}
                                            onChange={(evt, {value}) => {endDateInput.onChange(value);}}
                                        />
                                    </Form.Field>
                                )}
                            </Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={() => setOpenModal(false)} negative>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} positive icon={!!modalInfo?.id}{...(modalInfo?.id && ({labelPosition: 'left'}))}>
                            {modalInfo?.id && <Icon name="save"/>}
                            {modalInfo?.id ? 'Gravar alterações' : 'Adicionar'}
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        />
    );
};
export default PopupScheduleInterruption;
