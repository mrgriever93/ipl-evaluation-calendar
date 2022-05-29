import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import { Button, Modal, Dropdown } from 'semantic-ui-react';
import {toast} from 'react-toastify';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const PopupEvaluationDetail = ( {isOpen, onClose, calendarId} ) => {
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
    };


    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>Submeter calendário para a próxima fase</Modal.Header>
            <Modal.Content>
                <div>Selecionar próxima fase:</div>
                <Dropdown 
                    options={calendarPhases.filter((x) => x.name !== 'system' && x.name !== 'published')}
                    selection fluid
                    label="Fase do Calendário"
                    loading={!calendarPhases.length}
                    onChange={(e, {value}) => {updateCalendarPhase(value);}}
                    value={calendarPhase}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>Fechar</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupEvaluationDetail;
