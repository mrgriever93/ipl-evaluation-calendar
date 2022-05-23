import axios from 'axios';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import { useParams, useNavigate} from "react-router-dom";
import { useTranslation} from "react-i18next";
import {Card, Button, Sticky, Grid, Header, List, GridColumn, Icon, Popup, Label} from 'semantic-ui-react';
import { toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const InfosAndActions = () => {
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
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(undefined);
    const [calendarPhases, setCalendarPhases] = useState([]);
    const [examList, setExamList] = useState([]);
    const [publishLoading, setPublishLoading] = useState(false);
    const [creatingCopy, setCreatingCopy] = useState(false);

    const [isTemporary, setIsTemporary] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [calendarPhase, setCalendarPhase] = useState(true);
    const [updatingCalendarPhase, setUpdatingCalendarPhase] = useState(false);
    const [previousFromDefinitive, setPreviousFromDefinitive] = useState(false);


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


    useEffect(() => {
        if (typeof calendarPhase === 'number') {
            setCalendarPermissions(JSON.parse(localStorage.getItem('calendarPermissions'))?.filter((perm) => perm.phase_id === calendarPhase) || []);
        }
    }, [calendarPhase]);


    const handleFaqClick = (e, titleProps) => {
        const {index} = titleProps;
        const newIndex = activeIndex === index ? -1 : index;
        setActiveIndex(newIndex);
    };

    useEffect(() => {
        loadCalendar(calendarId);
    }, [calendarId, history]);

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

    const submitToNextPhase = () => {
        // setPublishLoading(true);
        // axios.post(`/calendar/${calendarId}/publish`).then((res) => {
        //     setPublishLoading(false);
        //     loadCalendar(calendarId);
        //     if (res.status === 200) {
        //         toast('Calendário publicado com sucesso!', successConfig);
        //     } else {
        //         toast('Ocorreu um erro ao tentar publicar o calendário!', errorConfig);
        //     }
        // });
        alert("submitted! (not)")
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
        }).then((result) => {
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



    return (
        <>
            <div className='main-content-title-section'>
                <div className='main-content-title'>
                    <Header as="h3">
                        Calendário de Avaliação
                        <span className='heading-description'>{ generalInfo?.course?.name_pt ? " (" + generalInfo.course.name_pt + ")": '' }</span>
                    </Header>
                </div>
                <div className='main-content-actions'>
                    {!isPublished ? (
                        <>
                            <ShowComponentIfAuthorized permission={[SCOPES.PUBLISH_CALENDAR]}>
                                <Button color="teal" loading={publishLoading} onClick={publishCalendar}>Publicar esta versão</Button>
                            </ShowComponentIfAuthorized>
                            { calendarPermissions.filter((x) => x.name === SCOPES.CHANGE_CALENDAR_PHASE).length > 0 && (
                                    <ShowComponentIfAuthorized permission={[SCOPES.CHANGE_CALENDAR_PHASE]}>
                                        <Button color="teal" loading={publishLoading} onClick={submitToNextPhase}>Submeter</Button>
                                    </ShowComponentIfAuthorized>
                                )
                            }
                        </>
                    ) : (
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_COPY]}>
                            <Button color="teal" loading={creatingCopy} onClick={createCopy}>Criar um cópia desta versão</Button>
                        </ShowComponentIfAuthorized>
                    )}
                </div>
            </div>
            <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]}>
                <Sticky offset={24} >
                    <Card fluid >
                        <Card.Content>
                            <Grid columns={4} divided>
                                <GridColumn>
                                    <Header as="h4">Legenda</Header>
                                    <List divided relaxed>
                                        {epochsList.map((epoch, index) => (
                                            <div className='legend-list-item' key={index}>
                                                <div className='legend-list-item-square' style={ { backgroundColor: epoch.code === "periodic_season" ? '#ecfff0' : epoch.code === "normal_season" ? '#f5e6da' : '#f9dddd' } }></div>
                                                <Popup trigger={
                                                    <div className='legend-list-item-content'>
                                                        <Icon name="calendar alternate outline" />
                                                        <span className={"padding-left-xs"}>{epoch.name}</span>
                                                    </div>
                                                } position='bottom center'>
                                                    <Popup.Content>
                                                        <b>{t("Ínicio")}:</b>{' '}{moment(epoch.start_date).format('DD MMMM, YYYY')}
                                                        <br/>
                                                        <b>{t("Fim")}:</b>{' '}{moment(epoch.end_date).format('DD MMMM, YYYY')}
                                                    </Popup.Content>
                                                </Popup>
                                            </div>
                                        ))}
                                    </List>
                                </GridColumn>
                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_ACTUAL_PHASE]}>
                                    <GridColumn>
                                        {/* {!isPublished && calendarPermissions.filter((x) => x.name === SCOPES.CHANGE_CALENDAR_PHASE).length > 0 ?
                                            (
                                                <div>
                                                    <span>
                                                        <Header as="h5">Fase:</Header>
                                                        <Dropdown
                                                            options={calendarPhases.filter((x) => x.name !== 'system' && x.name !== 'published')}
                                                            selection
                                                            search
                                                            label="Fase do Calendário"
                                                            loading={!calendarPhases.length || updatingCalendarPhase}
                                                            onChange={(e, {value}) => {updateCalendarPhase(value);}}
                                                            value={calendarPhase}
                                                        />
                                                    </span>
                                                </div>
                                            ) : (
                                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_ACTUAL_PHASE]}>
                                                    <Header as="h5">Fase:</Header>
                                                    <span>{calendarPhases.find((x) => x.key === calendarPhase)?.text || generalInfo?.phase?.description}</span>
                                                </ShowComponentIfAuthorized>
                                            )
                                        } */}
                                        <Header as="h5">Fase:</Header>
                                        <span>{calendarPhases.find((x) => x.key === calendarPhase)?.text || generalInfo?.phase?.description}</span>
                                    </GridColumn>
                                </ShowComponentIfAuthorized>
                                <GridColumn>
                                    <div>
                                        <span>
                                            <Header as="h5">Estado:</Header>
                                            {/*
                                            <Button.Group>
                                                <Button compact onClick={() => updateCalendarStatus(true)} positive={isTemporary} disabled={isPublished || previousFromDefinitive}>
                                                    Temporário
                                                </Button>
                                                <Button compact onClick={() => updateCalendarStatus(false)} positive={!isTemporary} disabled={isPublished || previousFromDefinitive}>
                                                    Definitivo
                                                </Button>
                                            </Button.Group>
                                            */}
                                            { !isPublished ? (
                                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]}>
                                                    <Label color={"blue"}>Nao Publicado</Label>
                                                </ShowComponentIfAuthorized>
                                            ) : (
                                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]} renderIfNotAllowed={() => (
                                                    <>{isPublished ? <Label color={isTemporary ? undefined : 'blue' }>{isTemporary ? 'Provisório' : 'Definitivo'}</Label> : undefined}</>
                                                )}>
                                                    <Label color={isTemporary ? undefined : 'blue' }>{isTemporary ? 'Provisório' : 'Definitivo'}</Label>
                                                </ShowComponentIfAuthorized>
                                            )}
                                        </span>
                                    </div>
                                </GridColumn>
                                <GridColumn>
                                    {/* <div>
                                        <span>
                                            <Header as="h5">Ano Letivo:</Header>
                                            2019-20
                                        </span>
                                    </div>
                                    <div>
                                        <span>
                                            <Header as="h5">Curso: </Header>
                                            {generalInfo?.course?.name_pt}
                                        </span>
                                    </div> */}
                                    <div>
                                        <span>
                                            <Header as="h5">Última alteração:</Header>
                                            {moment(generalInfo?.calendar_last_update,).format('DD MMMM, YYYY HH:mm')}
                                        </span>
                                    </div>
                                </GridColumn>
                            </Grid>
                        </Card.Content>
                    </Card>
                </Sticky>
            </ShowComponentIfAuthorized>
        </>
    );
};

export default InfosAndActions;
