import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Field, Form as FinalForm} from 'react-final-form';
import {DateInput, TimeInput} from 'semantic-ui-calendar-react-yz';
import {Button, Divider, Form, Grid, GridColumn, Header, Icon, Modal, TextArea, Message} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const PopupScheduleEvaluation = ( {scheduleInformation, isOpen, onClose} ) => {
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
    // const [openExamModal, setOpenExamModal] = useState(false);
    const [loadRemainingCourseUnits, setLoadRemainingCourseUnits] = useState(false);
    const [selectedEpoch, setSelectedEpoch] = useState();
    const [courseUnits, setCourseUnits] = useState(undefined);
    const [methodList, setMethodList] = useState(undefined);

    const [calendarPhase, setCalendarPhase] = useState(true);
    const [changeData, setChangeData] = useState(false);
    const [savingExam, setSavingExam] = useState(false);
    const [noMethods, setNoMethods] = useState(false);

    useEffect(() => {
        if (loadRemainingCourseUnits) {
            axios.get(`/available-methods/${calendarId}/?epoch_id=${selectedEpoch}&year=${scheduleInformation.scholarYear}`,)
                .then((response) => {
                    if (response.status === 200) {
                        const branches = scheduleInformation.hasExamsOnDate?.filter((x) => x.academic_year === scheduleInformation.scholarYear)
                            ?.map((y) => y?.course_unit?.branch?.id);
                        const beforeSetCourseUnits = response.data.data?.filter(
                            (x) => !(branches.length ? branches?.includes(x?.branch?.id) : false),
                        );
                        const mapped = beforeSetCourseUnits?.map(
                            ({id, name, methods, branch}) => ({
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
    }, [loadRemainingCourseUnits, scheduleInformation]);

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
        // axios.get(`/calendar/${calId}`)
        //     .then((response) => {
        //         if (response?.status >= 200 && response?.status < 300) {
        //             const {
        //                 data: {
        //                     data: {
        //                         phase,
        //                         published,
        //                         interruptions,
        //                         epochs,
        //                         general_info,
        //                         differences,
        //                         previous_from_definitive,
        //                     },
        //                 },
        //             } = response;
        //             setIsTemporary(!!general_info?.temporary);
        //             setCalendarPhase(general_info?.phase?.id);
        //             setIsPublished(!!published);
        //             setInterruptions(interruptions);
        //             setEpochs(epochs);
        //             epochs.forEach((epoch) => {
        //                 setExamList((current) => [...current, ...epoch.exams]);
        //             });
        //             setGeneralInfo(general_info);
        //             setDifferences(differences);
        //             setIsLoading(false);
        //             setPreviousFromDefinitive(previous_from_definitive);
        //         } else {
        //             history('/calendario');
        //         }
        //     })
        //     .catch((r) => alert(r));
    };
    
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
                    // setOpenExamModal(false);
                    onClose();
                    toast(`Avaliação ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
                    // loadCalendar(calendarId);
                } else {
                    toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a avaliação!`, errorConfig);
                }
            });
    };

    useEffect(() => {
        if (!isOpen) {
            // setExamInfoModal(undefined);
            setNoMethods(false);
            setSelectedEpoch(undefined);
            setCourseUnits([]);
            setMethodList([]);
        }
    }, [isOpen]);

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

    // useEffect(() => {
    //     loadCalendar(calendarId);
    // }, [calendarId]);

    return (
        <FinalForm onSubmit={onSubmitExam}
            initialValues={{
                id: scheduleInformation?.id || undefined,
                date: moment(scheduleInformation?.date).format('DD MMMM YYYY'),
                room: scheduleInformation?.id ? scheduleInformation?.room : null,
                durationMinutes: scheduleInformation?.id ? scheduleInformation?.duration_minutes : null,
                hour: scheduleInformation?.id ? scheduleInformation?.hour : null,
                observations: scheduleInformation?.id ? scheduleInformation?.observations : null,
            }}
            render={({handleSubmit}) => (
                <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
                    <Modal.Header>
                        {scheduleInformation?.id ? 'Editar' : 'Marcar'}
                        {' '}
                        avaliação
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Header as="h4">Detalhes da avaliação</Header>
                            
                            <Grid columns={3}>
                                <GridColumn>
                                    <p>
                                        <b>Calendário de: </b>
                                        {scheduleInformation?.courseName}
                                    </p>
                                </GridColumn>
                                <GridColumn>
                                    <p>
                                        <b>Ano Curricular: </b>
                                        {scheduleInformation?.scholarYear}
                                        º Ano
                                    </p>
                                </GridColumn>
                                <GridColumn>
                                    <p>
                                        <b>Data: </b>
                                        {changeData ? (
                                            <DateInput value={moment(scheduleInformation?.date).format('DD MMMM YYYY')}
                                                onChange={(evt, {value}) => {
                                                    scheduleInformation.date = moment(value, 'DD-MM-YYYY');
                                                    console.log(scheduleInformation);
                                                    setChangeData(false);
                                                }}
                                            />
                                        ) : moment(scheduleInformation?.date).format('DD MMMM YYYY')}
                                    </p>
                                    <p>
                                        <Button color="yellow" icon labelPosition="left" onClick={() => setChangeData(true)}>
                                            <Icon name="calendar alternate"/>
                                            Alterar data
                                        </Button>
                                    </p>
                                </GridColumn>
                            </Grid>
                            <Divider/>
                            <Grid columns={2}>
                                <GridColumn>
                            {!scheduleInformation?.id
                                    && (
                                        <>
                                            <Field name="epoch">
                                                {({input: epochInput}) => (
                                                    <Form.Dropdown
                                                        options={epochsList.filter((epoch) => moment(scheduleInformation?.date).isBetween(moment(epoch.start_date), moment(epoch.end_date), undefined, '[]',))
                                                            ?.map((epoch) => ({
                                                                key: epoch.id,
                                                                value: epoch.id,
                                                                text: epoch.name,
                                                            }))}
                                                        selection search label="Época"
                                                        onChange={(e, {value}) => {
                                                            setCourseUnits([]);
                                                            setSelectedEpoch(value);
                                                            setLoadRemainingCourseUnits(true);
                                                            epochInput.onChange(value);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            {noMethods
                                                && (
                                                    <Message negative>
                                                        <Message.Header>Não foram encontradas unidades curriculares</Message.Header>
                                                        <p>Não foram encontradas unidades curriculares com métodos de avaliação atríbuidos para esta época de avaliação.</p>
                                                    </Message>
                                                )}
                                            <Field name="courseUnit">
                                                {({input: courseUnitInput}) => (
                                                    <Form.Dropdown options={courseUnits} selection search disabled={!courseUnits?.length}
                                                        loading={courseUnits !== undefined ? !courseUnits.length : false}
                                                        label="Unidade Curricular"
                                                        onChange={(e, {value, options}) => {
                                                            setMethodList(
                                                                options.find((courseUnit) => courseUnit.value === value).methods.map(({id, name, minimum, weight}) => ({
                                                                        key: id,
                                                                        value: id,
                                                                        text: `${name} / Min. ${minimum} / Peso: ${parseInt(weight, 10)}%`,
                                                                    }),
                                                                ),
                                                            );
                                                            courseUnitInput.onChange(value);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            <Field name="method">
                                                {({input: methodInput}) => (
                                                    <Form.Dropdown options={methodList} selection search disabled={!methodList?.length}
                                                        loading={methodList !== undefined ? !methodList.length : false}
                                                        label="Método de Avaliação"
                                                        onChange={(e, {value}) => methodInput.onChange(value)}
                                                    />
                                                )}
                                            </Field>
                                        </>
                                    )}
                                </GridColumn>
                                <GridColumn>
                                    <>
                                        <Field name="room" defaultValue={scheduleInformation?.id ? scheduleInformation?.room : null}>
                                            {({input: roomInput}) => (
                                                <Form.Input label="Sala" placeholder="Sala da avaliação (opcional)"{...roomInput} initialValue={scheduleInformation?.room}/>
                                            )}
                                        </Field>
                                        <Field name="durationMinutes">
                                            {({input: durationMinutesInput}) => (
                                                <Form.Input label="Duração" placeholder="Duração em minutos (opcional)" type="number" step="1"{...durationMinutesInput}/>
                                            )}
                                        </Field>
                                        <Field name="hour">
                                            {({input: hourInput}) => (
                                                <Form.Field>
                                                    <TimeInput name="hour" iconPosition="left" label="Hora de ínicio" placeholder="Hora de ínicio" timeFormat="24" value={hourInput.value}
                                                                onChange={(evt, {value}) => {
                                                                    hourInput.onChange(value);
                                                                }}/>
                                                </Form.Field>
                                            )}
                                        </Field>
                                        <Field name="observations">
                                            {({input: observationsInput}) => (
                                                <Form.Input control={TextArea} label="Observações"{...observationsInput}/>
                                            )}
                                        </Field>
                                    </>
                                </GridColumn>
                            </Grid>                            
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={onClose} negative>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} positive loading={savingExam}>
                            {!scheduleInformation?.id ? 'Marcar Avaliação' : 'Gravar alterações'}
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        />
    );
};
export default PopupScheduleEvaluation;