import axios from 'axios';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Field, Form as FinalForm} from 'react-final-form';
import {DateInput, TimeInput} from 'semantic-ui-calendar-react-yz';
import {Button, Form, Icon, Modal, Message} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {errorConfig, successConfig} from '../../../utils/toastConfig';
const SweetAlertComponent = withReactContent(Swal);

const PopupScheduleInterruption = ( {info, isOpen, onClose, addedInterruption, deletedInterruption} ) => {
    const history = useNavigate();
    const { t } = useTranslation();
    // get URL params
    let { id } = useParams();
    const calendarId = id;

    const [interruptionTypes, setInterruptionTypesList] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);
    const [modalInfo, setModalInfo] = useState({});

    useEffect(() => {
        setModalInfo(info);
    }, [info]);

    const onSubmitInterruption = (values) => {
        const axiosFn = values?.id ? axios.patch : axios.post;
        axiosFn(`/interruptions/${values?.id ? values.id : ''}`, {
            calendar_id: parseInt(calendarId, 10),
            interruption_type_id: values.interruptionType,
            description_pt: values.description_pt,
            description_en: values.description_en,
            start_date: moment(values.startDate).format('YYYY-MM-DD'),
            end_date: moment(values.endDate).format('YYYY-MM-DD'),
        }).then((res) => {
            if (res.status === 200 || res.status === 201) {
                toast(`Interrupção ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
                addedInterruption(res.data.data);
                onClose();
            } else {
                let errorsArray = [];
                if(typeof res.response.data.errors === 'object' && res.response.data.errors !== null){
                    errorsArray = Object.values(res.response.data.errors);
                } else {
                    if(Array.isArray(res.response.data.errors)){
                        errorsArray = res.response.data.errors;
                    }
                }
                setErrorMessages(errorsArray);
                toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a interrupção!`, errorConfig);
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
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/interruptions/${interruptionId}`).then((res) => {
                    // loadCalendar(calendarId);
                    if (res.status === 200) {
                        toast(t('calendar.Interrupção eliminada com sucesso deste calendário!'), successConfig);
                        deletedInterruption(interruptionId);
                    } else {
                        toast(t('calendar.Ocorreu um problema ao eliminar a interrupção deste calendário!'), errorConfig);
                    }
                    onClose();
                });
            }
        });
    };

    useEffect(() => {
        if (isOpen && !interruptionTypes?.length) {
            axios.get('/interruption-types').then((response) => {
                if (response.status === 200) {
                    setInterruptionTypesList(
                        response.data.data?.map(({id, label}) => ({
                            key: id,
                            value: id,
                            text: label,
                        })),
                    );
                }
            });
        }
        if(!isOpen){
            setModalInfo({});
        }
    }, [isOpen]);

    return (
        <FinalForm onSubmit={onSubmitInterruption}
                    initialValues={{
                        id: modalInfo?.id || null,
                        startDate: moment(modalInfo?.start_date).format('DD MMMM, YYYY'),
                        endDate: modalInfo?.id ? moment(modalInfo?.end_date).format('DD MMMM, YYYY') : moment(modalInfo?.start_date).format('DD MMMM, YYYY'),
                        description_pt: modalInfo?.id ? modalInfo?.description_pt : null,
                        description_en: modalInfo?.id ? modalInfo?.description_en : null,
                        interruptionType: modalInfo?.id ? modalInfo?.interruption_type_id : undefined,
                    }}
                    render={({handleSubmit}) => (
                        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
                            <Modal.Header>
                                {modalInfo?.id ? 'Editar' : 'Adicionar'}{' '}interrupção
                            </Modal.Header>
                            { errorMessages.length > 0 && (
                                <Modal.Content>
                                    <Message warning>
                                        <Message.Header>{ t('Os seguintes detalhes do Curso precisam da sua atenção:') }</Message.Header>
                                        <Message.List>
                                            { errorMessages.map((message, index) => (
                                                <Message.Item key={index}>
                                                    { message }
                                                </Message.Item>
                                            ))}
                                        </Message.List>
                                    </Message>
                                </Modal.Content>
                            )}
                            <Modal.Content>
                                <Form>
                                    <Form.Group widths={"equal"}>
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
                                    </Form.Group>
                                    <Form.Group widths={"equal"}>
                                        <Field name="description_pt">
                                            {({input: descriptionPtInput}) => (
                                                <Form.Input label="Descrição" placeholder="Descrição PT (opcional)"{...descriptionPtInput}/>
                                            )}
                                        </Field>
                                        <Field name="description_en">
                                            {({input: descriptionEnInput}) => (
                                                <Form.Input label="Descrição" placeholder="Descrição EN (opcional)"{...descriptionEnInput}/>
                                            )}
                                        </Field>
                                    </Form.Group>
                                    <Form.Group widths={"2"}>
                                        <Field name="interruptionType">
                                            {({input: interruptionTypeInput}) => (
                                                <Form.Dropdown options={interruptionTypes} selection search loading={!interruptionTypes.length}
                                                    label="Tipo de interrupção" placeholder="Tipo de interrupção" value={interruptionTypeInput.value} selectOnBlur={false}
                                                    onChange={(e, {value}) => interruptionTypeInput.onChange(value,)}
                                                />
                                            )}
                                        </Field>
                                    </Form.Group>
                                </Form>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button onClick={onClose} negative>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} positive icon={!!modalInfo?.id}{...(modalInfo?.id && ({labelPosition: 'left'}))}>
                                    {modalInfo?.id && <Icon name="save"/>}
                                    {modalInfo?.id ? 'Gravar alterações' : 'Adicionar'}
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    )} />
    );
};
export default PopupScheduleInterruption;
