import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {Button, Modal, Header, Dropdown, Card, Icon, Divider, Checkbox, Form} from 'semantic-ui-react';
import {toast} from 'react-toastify';

import {errorConfig, successConfig} from '../../../utils/toastConfig';

const PopupEvaluationDetail = ( {isOpen, onClose, calendarId, currentPhaseId, updatePhase} ) => {
    // const history = useNavigate();
    const { t } = useTranslation();

    const [calendarPhases, setCalendarPhases] = useState([]);
    const [calendarGroups, setCalendarGroups] = useState([]);
    const [calendarPhase, setCalendarPhase] = useState(currentPhaseId);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [isTemporary, setIsTemporary] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        axios.get('/calendar-phases-full').then((response) => {
            if (response.status === 200) {
                setCalendarPhases(
                    response.data?.phases.map(({id, description, name}) => ({
                        key: id,
                        value: id,
                        text: description,
                        name,
                    })),
                );
                setCalendarGroups(response.data?.groups);
                setIsLoading(false);
            }
        });
    }, []);

    const onSave = () => {
        const viewGroups = calendarGroups.filter((item) => item.selected).map((item) => item.id);
        console.log(viewGroups);
        // setUpdatingCalendarPhase(true);
        axios.patch(`/calendar/${calendarId}`, {
            'calendar_phase_id': calendarPhase,
            'temporary': isTemporary,
            'published': isPublished,
            'groups': viewGroups
        }).then((response) => {
            if (response.status === 200) {
                toast(t('calendar.Fase do calendário atualizada!'), successConfig);
            }
        });
        //updatePhase(calendarPhase);
        //onClose();
    }

    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>
                <Icon name={"list ul"} size={"small"} color={"grey"}/>
                { t("Submeter calendário para a próxima fase") }
            </Modal.Header>
            <Modal.Content>
                <div>{ t("Selecionar próxima fase:") }</div>
                <div className='margin-y-base'>
                    <Card.Group itemsPerRow={3} >
                        {calendarPhases.filter((x) => x.name !== 'system').map((phase) => {
                                return (
                                    <Card color='green' key={phase.key} onClick={(e) => setCalendarPhase(phase.value) } >
                                        <Card.Content textAlign='center'>
                                            { phase.value == currentPhaseId && (
                                                <Icon className={"active-phase"} color="green" size={"large"} name="check circle" />
                                            )}
                                            { phase.value == calendarPhase && (
                                                <Icon className={"selected-phase"} color="yellow" size={"large"} name="check circle outline" />
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
                <Divider />
                <Header as={"h3"}>
                    <Icon name={"cog"} size={"big"} color={"grey"}/>
                    { t("Definicoes do Calendario") }
                </Header>
                <Form>
                    <Form.Field>
                        <Checkbox toggle label={ t("Provisorio") } checked={isTemporary}
                                  onChange={(e, {checked}) => {
                                      if(checked) {
                                          setIsPublished(false);
                                      }
                                      setIsTemporary(checked);
                                  }}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox toggle label={ t("Definitivo") } checked={isPublished}
                            onChange={(e, {checked}) => {
                                if(checked){
                                    setIsTemporary(false);
                                }
                                setIsPublished(checked);
                            }}
                        />
                    </Form.Field>
                    <Form.Group grouped>
                        <Header as={"h4"} className={"margin-top-l"}>
                            <Icon name={"users"} size={"big"} color={"grey"}/>
                            { t("Grupos que podem visualizar o calendario") }
                        </Header>
                        { isPublished ? (
                            <div>{ t("Todos os grupos vao ver este calendario") }</div>
                        ) : (
                            <>
                                { calendarGroups && calendarGroups.map((item, indexGroup) => (
                                    <Form.Field key={indexGroup}>
                                        <Checkbox label={item.name}
                                            onChange={(e, {checked}) => {
                                                setCalendarGroups((current) => {
                                                    current[indexGroup].selected = checked;
                                                    return current;
                                                });
                                            }}/>
                                    </Form.Field>
                                ))}
                            </>
                        )}
                    </Form.Group>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>{t('Fechar')}</Button>
                <Button onClick={onSave} color={"green"}>{t('Guardar')}</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupEvaluationDetail;
