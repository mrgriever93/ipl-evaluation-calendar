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
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const PopupScheduleInterruption = () => {
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

    // const loadCalendar = (calId) => {
    //     setIsLoading(true);
    //     setExamList([]);
    //     axios.get(`/calendar/${calId}`)
    //         .then((response) => {
    //             if (response?.status >= 200 && response?.status < 300) {
    //                 const {
    //                     data: {
    //                         data: {
    //                             phase,
    //                             published,
    //                             interruptions,
    //                             epochs,
    //                             general_info,
    //                             differences,
    //                             previous_from_definitive,
    //                         },
    //                     },
    //                 } = response;
    //                 setIsTemporary(!!general_info?.temporary);
    //                 setCalendarPhase(general_info?.phase?.id);
    //                 setIsPublished(!!published);
    //                 setInterruptions(interruptions);
    //                 setEpochs(epochs);
    //                 epochs.forEach((epoch) => {
    //                     setExamList((current) => [...current, ...epoch.exams]);
    //                 });
    //                 setGeneralInfo(general_info);
    //                 setDifferences(differences);
    //                 setIsLoading(false);
    //                 setPreviousFromDefinitive(previous_from_definitive);
    //             } else {
    //                 history('/calendario');
    //             }
    //         })
    //         .catch((r) => alert(r));
    // };

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
                    // loadCalendar(calendarId);
                } else {
                    toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a interrupção!`, errorConfig);
                }
            });
        setOpenModal(false);
        setIsLoading(true);
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
            setSelectedEpoch(undefined);
        }
    }, [openExamModal]);

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

    // const onEditInterruptionClick = (interruption) => {
    //     setLoadInterruptionTypes(
    //         true,
    //     );
    //     setModalInfo({
    //         ...interruption,
    //     });
    //     setOpenModal(
    //         true,
    //     );
    // };

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