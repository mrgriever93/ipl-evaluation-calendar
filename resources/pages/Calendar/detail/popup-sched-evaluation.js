import axios from 'axios';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Field, Form as FinalForm} from 'react-final-form';
import {DateInput, DatesRangeInput, TimeInput} from 'semantic-ui-calendar-react-yz';
import {Button, Divider, Form, Grid, GridColumn, Header, Icon, Modal, Checkbox, TextArea, Message} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
// import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const PopupScheduleEvaluation = ( {scheduleInformation, isOpen, onClose, addedExam, deletedExam, calendarDates} ) => {
    const history = useNavigate();
    const { t } = useTranslation();
    // get URL params
    let { id } = useParams();
    const calendarId = id;

    const [epochsList, setEpochsList] = useState([]);
    const [calendarPermissions, setCalendarPermissions] = useState(JSON.parse(localStorage.getItem('calendarPermissions')) || []);
    const [differences, setDifferences] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [loadRemainingCourseUnits, setLoadRemainingCourseUnits] = useState(false);
    const [selectedEpoch, setSelectedEpoch] = useState();
    const [courseUnits, setCourseUnits] = useState([]);
    const [methodList, setMethodList] = useState([]);

    const [calendarPhase, setCalendarPhase] = useState(true);
    const [changeData, setChangeData] = useState(false);
    const [savingExam, setSavingExam] = useState(false);
    const [showMissingMethodsLink, setShowMissingMethodsLink] = useState(false);

    useEffect( () => {
        console.log(scheduleInformation);
        if(!!scheduleInformation.epochs) {
            let availableEpochs = scheduleInformation.epochs.filter((epoch) => {
                return moment(scheduleInformation.date_start).isBetween(moment(epoch.start_date), moment(epoch.end_date), undefined, '[]' );
            });

            setEpochsList(availableEpochs);
            if(scheduleInformation.epoch_id > 0 ) {
                setSelectedEpoch(scheduleInformation.epoch_id);
                setLoadRemainingCourseUnits(true);
            }
            else if(availableEpochs.length == 1) {
                setSelectedEpoch(availableEpochs[0].id);
                setLoadRemainingCourseUnits(true);
            }
        }
    }, [scheduleInformation])

    useEffect(() => {
        if (loadRemainingCourseUnits) {
            axios.get(`/available-methods/${calendarId}/?epoch_id=${selectedEpoch}&year=${scheduleInformation.scholarYear}`)
                .then((response) => {
                    if (response.status === 200) {
                        let beforeSetCourseUnits = [];
                        /*
                        if(scheduleInformation.hasExamsOnDate) {
                            const branches = scheduleInformation.hasExamsOnDate?.filter((x) => x.academic_year === scheduleInformation.scholarYear)?.map((y) => y?.course_unit?.branch?.id);
                            beforeSetCourseUnits = response.data.data?.filter((x) => !(branches.length ? branches?.includes(x?.branch?.id) : false));
                        } else {
                            beforeSetCourseUnits = response.data.data;
                        }*/
                        beforeSetCourseUnits = response.data.data;

                        const mapped = beforeSetCourseUnits?.map(
                            ({id, name, methods, branch, is_complete, has_methods}) => ({
                                key: id,
                                value: id,
                                text: name,
                                methods,
                                branch,
                                icon: ((!has_methods ? {color: 'yellow', name:'warning circle'} : is_complete ? {color: 'green', name:'check circle'} : undefined)),
                                description: (!has_methods ? t("Métodos em falta") : undefined),
                                disabled: !has_methods,
                            }),
                        );
                        setCourseUnits(mapped);
                        // has curricular unit with missing methods?
                        //setShowMissingMethodsLink(response.data.data?.length === 0 || beforeSetCourseUnits?.length === 0);
                        setShowMissingMethodsLink(beforeSetCourseUnits.filter((item) => item.has_methods).length >= 0);
                    }
                });
            setLoadRemainingCourseUnits(false);
        }
    }, [loadRemainingCourseUnits, scheduleInformation]);

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

    const epochDropdownOnChange = (event, value) => {
        setCourseUnits([]);
        setSelectedEpoch(value);
        setLoadRemainingCourseUnits(true);
    };

    const methodListFilterHandler = (course_unit_id) => {
        if(courseUnits?.length > 0 ) {
            setMethodList(
                courseUnits.find((courseUnit) => courseUnit.value === course_unit_id)?.methods.map(({id, name, minimum, weight, is_done}) => ({
                        key: id,
                        value: id,
                        text: `${name} / Min. ${minimum} / Peso: ${parseInt(weight, 10)}%`,
                        icon: (is_done ? {color: 'green', name:'check circle'} : undefined),
                    })
                )
            );
        }
    };

    useEffect(() => {
        if(courseUnits?.length > 0 ) {
            if( !!scheduleInformation?.exam_id ) {
                methodListFilterHandler(scheduleInformation.course_unit_id);
            }
        }
    }, [courseUnits]);

    const onSubmitExam = (values) => {
        setSavingExam(true);
        const dateStart = moment(values.date_start).format('YYYY-MM-DD');
        const dateEnd = values.date_end ? moment(values.date_end).format('YYYY-MM-DD') : undefined;

        const examScheduleObj = {
            calendar_id: parseInt(calendarId, 10),
            course_id: parseInt(scheduleInformation?.courseId),
            course_unit_id: values.courseUnit,
            date_start: dateStart,
            date_end: (dateEnd ? dateEnd : dateStart),
            duration_minutes: values.durationMinutes || undefined,
            epoch_id: selectedEpoch,
            in_class: values.inClass || false,
            hour: values.hour || undefined,
            method_id: values.method,
            observations_pt: values.observationsPT || undefined,
            observations_en: values.observationsEN || undefined,
            room: values.room || undefined,
        };

        const axiosFn = values?.exam_id ? axios.patch : axios.post;
        axiosFn(`/exams/${values?.exam_id ? values?.exam_id : ''}`, examScheduleObj)
            .then((res) => {
                setSavingExam(false);
                if (res.status === 200) {
                    toast(t('Avaliação atualizado com sucesso'), successConfig);
                } else if (res.status === 201) {
                    toast(t('Avaliação marcada com sucesso'), successConfig);
                    addedExam(res.data);
                } else {
                    toast(`Ocorreu um erro ao gravar a avaliação!`, errorConfig);
                    toast(res.response.data, errorConfig);
                }
                onClose();  // close modal
            });
    };

    useEffect(() => {
        if (!isOpen) {
            setShowMissingMethodsLink(false);
            setSelectedEpoch(undefined);
            setCourseUnits([]);
            setMethodList([]);
        }
    }, [isOpen]);

    const removeExam = (examId) => {
        const sweetAlertConfigs = {
            title: t('Atenção!'),
            html: 'Ao eliminar este exame, terá de adicioná-lo novamente em outra data a escolher!<br/><br/><strong>Tem a certeza que deseja eliminar este exame, em vez de editar?</strong>',
            denyButtonText: t('Não'),
            confirmButtonText: t('Sim'),
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        };

        SweetAlertComponent.fire(sweetAlertConfigs).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/exams/${examId}`).then((res) => {
                    if (res.status === 200) {
                        toast('Exame eliminado com sucesso deste calendário!', successConfig);
                        deletedExam(examId);
                    } else {
                        toast('Ocorreu um problema ao eliminar o exame deste calendário! ' +  res.response.data, errorConfig);
                    }
                    onClose();
                });
            }
        });
    };

    return (
        <FinalForm onSubmit={onSubmitExam}
            initialValues={{
                exam_id:         scheduleInformation?.exam_id ? scheduleInformation?.exam_id           : null,
                date_start:      moment(scheduleInformation?.date_start).format('DD MMMM YYYY'),
                date_end:        moment(scheduleInformation?.date_end).format('DD MMMM YYYY'),
                durationMinutes: scheduleInformation?.exam_id ? scheduleInformation?.duration_minutes  : null,
                observationsPT:  scheduleInformation?.exam_id ? scheduleInformation?.observations_pt   : null,
                observationsEN:  scheduleInformation?.exam_id ? scheduleInformation?.observations_en   : null,
                inClass:         scheduleInformation?.exam_id ? scheduleInformation?.in_class          : null,
                hour:            scheduleInformation?.exam_id ? scheduleInformation?.hour              : null,
                room:            scheduleInformation?.exam_id ? scheduleInformation?.room              : null,
                courseUnit:      scheduleInformation?.exam_id ? scheduleInformation?.course_unit_id    : -1,
                method:          scheduleInformation?.exam_id ? scheduleInformation?.method_id         : -1,
            }}
            render={({handleSubmit}) => (
                <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
                    <Modal.Header>
                        { scheduleInformation?.exam_id ? t("Editar Avaliação")  :  t("Marcar Avaliação") }
                    </Modal.Header>
                    <Modal.Content scrolling>
                        <Form warning>
                            <Header as="h4">{ t("Detalhes da avaliação") } </Header>
                            <Grid columns={2}>
                                <GridColumn>
                                    <p>
                                        <b>{ t("Curso") }: </b>
                                        {scheduleInformation?.courseName}
                                    </p>
                                    <p>
                                        <b>{ t("Ano Curricular") }: </b>
                                        { t("Ano") + " " + scheduleInformation?.scholarYear}
                                    </p>
                                </GridColumn>
                                <GridColumn>
                                    <div>
                                        <b>Data: </b>
                                        { changeData ?
                                            (
                                                <div>
                                                    <DatesRangeInput allowSameEndDate name="datesRange" placeholder={ t("Inserir datas") } iconPosition="left" closable  markColor={"blue"}
                                                        value={(scheduleInformation?.date_start && scheduleInformation?.date_end ?
                                                            moment(scheduleInformation?.date_start).isSame(moment(scheduleInformation?.date_end)) ?
                                                            moment(scheduleInformation?.date_start).format('DD MMMM YYYY') :
                                                            moment(scheduleInformation?.date_start).format('DD MMMM YYYY') + ` ${t("até")} ` + moment(scheduleInformation?.date_end).format('DD MMMM YYYY')
                                                             : "")}
                                                        onChange={(event, {value}) => {
                                                            let splitDates = value.split(" - ");
                                                            if(splitDates.length === 2 && splitDates[1]) {
                                                                scheduleInformation.date_start = moment(splitDates[0], 'DD-MM-YYYY');
                                                                scheduleInformation.date_end = moment(splitDates[1], 'DD-MM-YYYY');
                                                                setChangeData(false);
                                                            }
                                                        }} minDate={calendarDates.minDate} maxDate={calendarDates.maxDate} />

                                                     {/* <DateInput value={moment(scheduleInformation?.date_start).format('DD MMMM YYYY')}
                                                               onChange={(evt, {value}) => {
                                                                   scheduleInformation.date_start = moment(value, 'DD-MM-YYYY');
                                                                   setChangeData(false);
                                                               }}
                                                    />
                                                    <DateInput value={moment(scheduleInformation?.date_end).format('DD MMMM YYYY')}
                                                               onChange={(evt, {value}) => {
                                                                   scheduleInformation.date_end = moment(value, 'DD-MM-YYYY');
                                                                   setChangeData(false);
                                                               }}
                                                    /> */}
                                                </div>
                                            ) : (
                                                <div>
                                                    { moment(scheduleInformation?.date_start).isSame(moment(scheduleInformation?.date_end)) ?
                                                            moment(scheduleInformation?.date_start).format('DD MMMM YYYY') :
                                                            moment(scheduleInformation?.date_start).format('DD MMMM YYYY') + ` ${t("até")} ` + moment(scheduleInformation?.date_end).format('DD MMMM YYYY')
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>
                                    <p className="margin-top-s">
                                        <Button color="yellow" icon labelPosition="left" onClick={() => setChangeData(true)}>
                                            <Icon name="calendar alternate"/>
                                            { t("Alterar data") }
                                        </Button>
                                    </p>
                                </GridColumn>
                            </Grid>
                            <Divider/>
                            <Grid columns={2}>
                                <GridColumn>
                                    {!scheduleInformation?.id && (
                                        <>
                                            <Field name="epoch">
                                                {({input: epochInput}) => (
                                                    <Form.Dropdown
                                                        options={epochsList.map((epoch) => ({ key: epoch.id, value: epoch.id, text: epoch.name }))}
                                                        value={selectedEpoch || -1}
                                                        selection search
                                                        label={ t("Época")}
                                                        onChange={(e, {value}) => epochDropdownOnChange(e, value)}
                                                    />
                                                )}
                                            </Field>
                                            <Field name="courseUnit">
                                                {({input: courseUnitInput}) => (
                                                    <Form.Dropdown
                                                        options={courseUnits}
                                                        label={ t("Unidade Curricular")}
                                                        {...courseUnitInput}
                                                        selection search
                                                        disabled={!courseUnits?.length}
                                                        loading={courseUnits !== undefined ? !courseUnits.length : false}
                                                        onChange={(e, {value, options}) => {
                                                            methodListFilterHandler(value);
                                                            courseUnitInput.onChange(value);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                            { showMissingMethodsLink && (
                                                    <Message size='tiny' warning={true}>
                                                        <div>{ t("Existem Unidades Curriculares sem métodos definidos.")}</div>
                                                        <div className='margin-top-xs'>
                                                            <a href={ "/unidade-curricular?curso="+scheduleInformation?.courseId} target="_blank">{ t("Preencha aqui")} <Icon name="external alternate" /></a>
                                                        </div>
                                                    </Message>
                                                )}
                                            <Field name="method">
                                                {({input: methodInput}) => (
                                                    <Form.Dropdown
                                                        label={ t("Método de Avaliação")}
                                                        options={ methodList }
                                                        {...methodInput}
                                                        selection search
                                                        disabled={ !methodList?.length}
                                                        loading={ methodList !== undefined ? !methodList.length : false }
                                                        onChange={(e, {value}) => methodInput.onChange(value)}
                                                    />
                                                )}
                                            </Field>
                                        </>
                                    )}
                                </GridColumn>
                                <GridColumn>
                                    <>
                                        <Field name="inClass" type="checkbox">
                                            {({input: inClassInput}) => (
                                                <>
                                                    {/* <Grid columns={2} verticalAlign="middle">
                                                        <GridColumn className='margin-bottom-s'> */}
                                                            <Form.Field>
                                                                <Checkbox toggle label={ t("Na aula")} name="inClass" checked={inClassInput.checked}
                                                                    onChange={(evt, {checked}) => { inClassInput.onChange(checked) }}/>
                                                            </Form.Field>
                                                        {/* </GridColumn> */}

                                                        { ! inClassInput.checked && (
                                                            // <GridColumn>
                                                                <Field name="hour">
                                                                    {({input: hourInput}) => (
                                                                        <Form.Field>
                                                                            <TimeInput label={ t("Hora de ínicio")} name="hour" iconPosition="left" placeholder={ t("Hora de ínicio (opcional)")} timeFormat="24" value={hourInput.value}
                                                                                        onChange={(evt, {value}) => { hourInput.onChange(value); }}/>
                                                                        </Form.Field>
                                                                    )}
                                                                </Field>
                                                            // </GridColumn>
                                                        )}
                                                    {/* </Grid> */}
                                                    { ! inClassInput.checked && (
                                                        <Field name="room" defaultValue={scheduleInformation?.id ? scheduleInformation?.room : null}>
                                                            {({input: roomInput}) => (
                                                                <Form.Input label={ t("Sala")} placeholder={ t("Sala da avaliação (opcional)")} {...roomInput} />
                                                            )}
                                                        </Field>
                                                    )}
                                                </>
                                            )}
                                        </Field>
                                        <Field name="durationMinutes">
                                            {({input: durationMinutesInput}) => (
                                                <Form.Input label={ t("Duração")} placeholder={ t("Duração em minutos (opcional)")}  type="number" step="1"{...durationMinutesInput}/>
                                            )}
                                        </Field>
                                        <Field name="observationsPT">
                                            {({input: observationsPTInput}) => (
                                                <Form.Input label={ t("Observações PT")} control={TextArea} rows={2} {...observationsPTInput}/>
                                            )}
                                        </Field>
                                        <Field name="observationsEN">
                                            {({input: observationsENInput}) => (
                                                <Form.Input label={ t("Observações EN")} control={TextArea} rows={2} {...observationsENInput}/>
                                            )}
                                        </Field>
                                    </>
                                </GridColumn>
                            </Grid>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        { scheduleInformation.exam_id && (
                            <Button floated='left' negative icon labelPosition='left' onClick={() => removeExam(scheduleInformation?.exam_id)}>
                                <Icon name="trash alternate outline" />
                                { t("Remover exame") }
                            </Button>
                        )}
                        <Button onClick={onClose} >{ t("Cancelar") }</Button>
                        <Button onClick={handleSubmit} positive loading={savingExam}>
                            { scheduleInformation?.exam_id ? t("Gravar alterações") : t("Marcar Avaliação") }
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        />
    );
};
export default PopupScheduleEvaluation;
