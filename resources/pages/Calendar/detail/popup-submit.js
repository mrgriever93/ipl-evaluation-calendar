import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import { Button, Modal, Header, Card, Icon, Divider, Checkbox, Form, Label, Loader, Dimmer, Grid, GridColumn } from 'semantic-ui-react';
import {toast} from 'react-toastify';

import {errorConfig, successConfig} from '../../../utils/toastConfig';
import SCOPES from "../../../utils/scopesConstants";
import ShowComponentIfAuthorized from "../../../components/ShowComponentIfAuthorized";

const PopupEvaluationDetail = ( {isOpen, onClose, calendarId, currentPhaseId, updatePhase} ) => {
    // const history = useNavigate();
    const { t } = useTranslation();

    const [calendarPhases, setCalendarPhases] = useState([]);
    const [calendarGroups, setCalendarGroups] = useState([]);
    const [calendarPhase, setCalendarPhase] = useState(currentPhaseId);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [isTemporary, setIsTemporary] = useState(false);
    const [groupViewersLoading, setGroupViewersLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const [isEditingPhase, setIsEditingPhase] = useState(1);
    const [isEvaluationPhase, setIsEvaluationPhase] = useState(4);

    useEffect(() => {
        setIsLoading(true);
        setGroupViewersLoading(true);
        axios.get('/calendar-phases-full?phase-id=' + currentPhaseId).then((response) => {
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
                setGroupViewersLoading(false);
                setIsLoading(false);
            }
        });
    }, []);

    useEffect(() => {
        if(!isLoading) {
            let currentPhase = calendarPhases.filter((phase) => phase.value === currentPhaseId)[0];

            if( currentPhase.text.indexOf('Em edição')  === 0) {
                setIsEditing(true);
                setIsEditingPhase(currentPhase.value);
            } else {
                setIsEditing(false);
                setIsEvaluationPhase(currentPhase.value);
            }
        }
    }, [currentPhaseId]);

    

    useEffect(() => {
        if(!isLoading) {
            setGroupViewersLoading(true);
            axios.get('/calendar-phases-full/groups?phase-id=' + calendarPhase).then((response) => {
                if (response.status === 200) {
                    setCalendarGroups(response.data?.data);
                    setGroupViewersLoading(false);
                }
            });
        }
    }, [calendarPhase]);

    const onSavePublish = () => {
        setIsPublished(true);
        setIsTemporary(true);
        onSave();
    }

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
        updatePhase(calendarPhase);
        onClose();
    }

    const handleGroupChange = (groupId, checked) => {
        setCalendarGroups((current) => {
            const oldList = [...current];
            oldList.forEach((item) => item.selected = (item.id === groupId ? checked : item.selected));
            return oldList;
        });
    }

    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>{ t("Submeter calendário para a próxima fase") }</Modal.Header>
            <Modal.Content>
                <Grid>
                    <GridColumn width={2}>
                        <div>{ t("Fase atual:") }</div>
                    </GridColumn>
                    <GridColumn width={14}>
                        <Label color="blue">{ calendarPhases.filter((phase) => phase.value === currentPhaseId)[0]?.text }</Label>
                    </GridColumn>
                </Grid>
                
                <div className='margin-top-base'>
                    { t("Selecionar próxima fase:") }
                </div>
                <div className='margin-top-s'>                    
                    <Button.Group>
                        <Button positive={isEditing} onClick={(e) => setIsEditing(true)}>
                            <Icon name="edit" />{ t("Em edição") }
                        </Button>
                        <Button positive={!isEditing} onClick={(e) => setIsEditing(false)}>
                            <Icon name="eye" />{ t("Em avaliação") }
                        </Button>
                    </Button.Group>
                </div>

                { isEditing ? (
                    <>
                        <div className='margin-top-m'>                    
                            <Button.Group>
                                {calendarPhases.filter((x) => x.text.indexOf('Em edição')  === 0)?.map((phase) => {
                                    return (
                                        <Button positive={isEditingPhase === phase.value} onClick={(e) => {
                                                setIsEditingPhase(phase.value);
                                                setCalendarPhase(phase.value);
                                            }} key={phase.value}>
                                            { phase.text.substr(phase.text.indexOf('(')+1, phase.text.length).replace(')', '') }
                                        </Button>
                                    );
                                })}
                            </Button.Group>
                        </div>
                    </>
                ) : (
                    <>
                        <div className='margin-top-m'>                    
                            <Button.Group>
                                {calendarPhases.filter((x) => x.text.indexOf('Em avaliação')  === 0)?.map((phase) => {
                                    return (
                                        <Button positive={isEvaluationPhase === phase.value} onClick={(e) => {
                                                setIsEvaluationPhase(phase.value);
                                                setCalendarPhase(phase.value);
                                            }} key={phase.value}>
                                            { phase.text.substring(phase.text.indexOf('(')+1, phase.text.length).replace(')', '') }
                                        </Button>
                                    );
                                })}
                            </Button.Group>
                        </div>
                    </>
                ) }
                {/* <div className='margin-y-base'>
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
                </div> */}
                {/* <Dropdown
                    options={calendarPhases.filter((x) => x.name !== 'system' && x.name !== 'published')}
                    selection fluid
                    label="Fase do Calendário"
                    loading={!calendarPhases.length}
                    onChange={(e, {value}) => {updateCalendarPhase(value);}}
                    value={calendarPhase}
                /> */}
                <Divider />
                <Form>
                    <Grid columns={2} divided>
                        <Grid.Row>
                            <Grid.Column>
                                <Header as={"h4"}>
                                    <Icon name={"users"} size={"big"} color={"grey"}/>
                                    { t("Grupos que podem visualizar o calendario") }
                                </Header>
                                <Form.Group grouped>
                                    { isPublished ? (
                                        <div>{ t("Todos os grupos vao ver este calendario") }</div>
                                    ) : (
                                        <>
                                            { calendarGroups && calendarGroups.map((item, indexGroup) => (
                                                <Form.Field key={indexGroup}>
                                                    <Checkbox label={item.name} checked={item.selected}
                                                              onChange={(e, {checked}) => handleGroupChange(item.id, checked)} />
                                                </Form.Field>
                                            ))}
                                        </>
                                    )}
                                    { groupViewersLoading && (
                                        <Dimmer active inverted>
                                            <Loader indeterminate>{t('A carregar grupos')}</Loader>
                                        </Dimmer>
                                    )}
                                </Form.Group>
                            </Grid.Column>
                            <Grid.Column>
                                <Header as={"h4"}>
                                    <Icon name={"users"} size={"big"} color={"grey"}/>
                                    { t("UCs a serem preenchidas") }
                                </Header>
                                <Form.Group grouped>
                                    { isPublished ? (
                                        <div>{ t("Todos os grupos vao ver este calendario") }</div>
                                    ) : (
                                        <>
                                            { calendarGroups && calendarGroups.map((item, indexGroup) => (
                                                <Form.Field key={indexGroup}>
                                                    <Checkbox label={item.name} checked={item.selected}
                                                              onChange={(e, {checked}) => handleGroupChange(item.id, checked)} />
                                                </Form.Field>
                                            ))}
                                        </>
                                    )}
                                    { groupViewersLoading && (
                                        <Dimmer active inverted>
                                            <Loader indeterminate>{t('A carregar grupos')}</Loader>
                                        </Dimmer>
                                    )}
                                </Form.Group>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onSavePublish} color={"blue"} floated={"left"} icon labelPosition={"right"}>{t('Publicar esta versão do calendário')} <Icon name={"calendar check outline"}/></Button>
                <Button onClick={onClose}>{t('Fechar')}</Button>
                <Button onClick={onSave} color={"green"}>{t('Guardar')}</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupEvaluationDetail;
