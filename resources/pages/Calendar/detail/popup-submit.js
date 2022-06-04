import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import { Button, Modal, Header, Dropdown, Card, Icon } from 'semantic-ui-react';
import {toast} from 'react-toastify';

import {errorConfig, successConfig} from '../../../utils/toastConfig';

const PopupEvaluationDetail = ( {isOpen, onClose, calendarId, currentPhaseId, updatePhase} ) => {
    // const history = useNavigate();
    const { t } = useTranslation();

    const [calendarPhases, setCalendarPhases] = useState([]);
    const [calendarPhase, setCalendarPhase] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublished, setIsPublished] = useState(false);

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

    const updateCalendarPhase = (newCalendarPhase) => {
        // setUpdatingCalendarPhase(true);
        axios.patch(`/calendar/${calendarId}`, { 'calendar_phase_id': newCalendarPhase }).then((response) => {
                // setUpdatingCalendarPhase(false);
                if (response.status === 200) {
                    setCalendarPhase(newCalendarPhase);
                    toast(t('calendar.Fase do calendário atualizada!'), successConfig);
                }
        });
        updatePhase(newCalendarPhase);
        onClose();
    };


    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>Submeter calendário para a próxima fase</Modal.Header>
            <Modal.Content>
                <div>Selecionar próxima fase:</div>
                <div className='margin-y-base'>
                    <Card.Group itemsPerRow={3} >
                        {calendarPhases.filter((x) => x.name !== 'system').map((phase) => {
                                return (
                                    <Card color='green' key={phase.key} onClick={(e) => updateCalendarPhase(phase.value) } >
                                        <Card.Content textAlign='center'>
                                            { phase.value == currentPhaseId && (
                                                <Icon className={"active-phase"} color="green" size={"large"} name="check circle outline" />
                                            )}
                                            <div>
                                                { phase.text.includes('Em edição') ? (
                                                    <Icon color="grey" size="big" name="edit" />
                                                ) : (
                                                    phase.text.includes('Em avaliação') ? (
                                                        <Icon color="grey" size="big" name="eye" />
                                                    ) : (
                                                        phase.text.includes('Publicado') ? (
                                                            <Icon color="grey" size="big" name="check circle outline" />
                                                        ) : ""
                                                    )
                                                )}
                                            </div>
                                            <Header as="h5" style={{marginTop: 'var(--space-s)' }}>{phase.text}</Header>
                                        </Card.Content>
                                    </Card>
                                );
                            },
                        )}
                    </Card.Group>
                </div>
                {/* <Dropdown
                    options={calendarPhases.filter((x) => x.name !== 'system' && x.name !== 'published')}
                    selection fluid
                    label="Fase do Calendário"
                    loading={!calendarPhases.length}
                    onChange={(e, {value}) => {updateCalendarPhase(value);}}
                    value={calendarPhase}
                /> */}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>{t('Fechar')}</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupEvaluationDetail;
