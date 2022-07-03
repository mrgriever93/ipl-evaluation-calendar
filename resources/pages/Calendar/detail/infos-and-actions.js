import axios from 'axios';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import { useParams} from "react-router-dom";
import { useTranslation} from "react-i18next";
import {Card, Button, Sticky, Grid, Header, List, GridColumn, Icon, Popup, Label} from 'semantic-ui-react';
import { toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

import PopupSubmitCalendar from './popup-submit';
import PopupRevisionDetail from "./popup-revision";

const SweetAlertComponent = withReactContent(Swal);

const InfosAndActions = ( {epochs, calendarInfo, warnings, isPublished, epochsViewHandler}) => {
    const { t } = useTranslation();
    // get URL params
    let { id } = useParams();
    const calendarId = id;

    const [calendarPermissions, setCalendarPermissions] = useState(JSON.parse(localStorage.getItem('calendarPermissions')) || []);
    const [openSubmitModal, setOpenSubmitModal] = useState(false);
    const [calendarPhases, setCalendarPhases] = useState([]);
    const [differences, setDifferences] = useState();
    // const [isLoading, setIsLoading] = useState(true);
    // const [examList, setExamList] = useState([]);
    // const [publishLoading, setPublishLoading] = useState(false);
    const [openRevisionModal, setOpenRevisionModal] = useState(false);

    const [isTemporary, setIsTemporary] = useState(true);
    const [calendarPhase, setCalendarPhase] = useState(true);
    // const [updatingCalendarPhase, setUpdatingCalendarPhase] = useState(false);
    // const [previousFromDefinitive, setPreviousFromDefinitive] = useState(false);

    const [methodsMissingCount, setMethodsMissingCount] = useState(0);
    const [methodsIncompleteCount, setMethodsIncompleteCount] = useState(0);
    const [methodsLoaded, setMethodsLoaded] = useState(false);
    const [activeEpochs, setActiveEpochs] = useState([]);

    const [creatingCopy, setCreatingCopy] = useState(false);

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


    useEffect(() => {
        setMethodsLoaded(false);
        const missing = warnings.filter((item) => !item.has_methods);
        setMethodsMissingCount(missing.length);

        let countIncomplete = 0;
        const incomplete = warnings.filter((item) => item.has_methods && !item.is_complete);
        incomplete.map((item) => {
            countIncomplete = countIncomplete + item.methods.filter((method) => !method.is_done).length;
        });
        setMethodsIncompleteCount(countIncomplete);
        setMethodsLoaded(true);
    }, [warnings]);

    // const patchCalendar = (fieldToUpdate, value) => axios.patch(`/calendar/${calendarId}`, {
    //     [fieldToUpdate]: value,
    // });

    // const updateCalendarStatus = (newTemporaryStatus) => {
    //     patchCalendar('temporary', newTemporaryStatus).then((response) => {
    //         if (response.status === 200) {
    //             setIsTemporary(newTemporaryStatus);
    //             toast(t('calendar.Estado do calendário atualizado!'), successConfig);
    //         }
    //     });
    // };

    // const updateCalendarPhase = (newCalendarPhase) => {
    //     setUpdatingCalendarPhase(true);
    //     patchCalendar('calendar_phase_id', newCalendarPhase).then(
    //         (response) => {
    //             setUpdatingCalendarPhase(false);
    //             if (response.status === 200) {
    //                 setCalendarPhase(newCalendarPhase);
    //                 toast(t('calendar.Fase do calendário atualizada!'), successConfig);
    //             }
    //         },
    //     );
    // };


    useEffect(() => {
        if (typeof calendarPhase === 'number') {
            setCalendarPermissions(JSON.parse(localStorage.getItem('calendarPermissions'))?.filter((perm) => perm.phase_id === calendarPhase) || []);
        }
    }, [calendarPhase]);


    // const handleFaqClick = (e, titleProps) => {
    //     const {index} = titleProps;
    //     const newIndex = activeIndex === index ? -1 : index;
    //     setActiveIndex(newIndex);
    // };

    useEffect(() => {
        setMethodsLoaded(false);
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

    const openRevisionModalHandler = () => {
        // setViewExamId(exam.id);
        setOpenRevisionModal(true);
    }
    const closeRevisionModalHandler = () => {
        // setViewExamId(exam.id);
        setOpenRevisionModal(false);
    }

    const openSubmitModalHandler = () => {
        // setViewExamId(exam.id);
        setOpenSubmitModal(true);
    }

    const closeSubmitModalHandler = () => {
        setOpenSubmitModal(false);
    }

    const updatePhaseHandler = (newPhase) => {
        setCalendarPhase(newPhase);
        calendarInfo.phase.id =  newPhase;
    }

    useEffect(() => {
        let initialEpochs = [];
        epochs.forEach((epoch) => {
            initialEpochs.push(epoch.id);
        });
        //set epochs showing
        setActiveEpochs(initialEpochs);
    }, [epochs]);

    const showingEpochsHandle = (epochId) => {
        if(activeEpochs.includes(epochId)) {
            setActiveEpochs(prev => prev.filter(item => item !== epochId));
        } else {
            setActiveEpochs(prev => [...prev, epochId])
        }
    }

    useEffect(() => {
        epochsViewHandler(activeEpochs);
    }, [activeEpochs]);

    return (
        <>
            <div className='main-content-title-section'>
                <div className='main-content-title'>
                    <Header as="h3">
                        Calendário de Avaliação
                        <div className='heading-description'>{ calendarInfo?.course?.name_pt ? " (" + calendarInfo.course.name_pt + ")": '' }</div>
                    </Header>
                </div>
                <div className='main-content-actions'>
                    {!isPublished ? (
                        <>
                            { (SCOPES.PUBLISH_CALENDAR || calendarPermissions.filter((x) => x.name === SCOPES.CHANGE_CALENDAR_PHASE).length > 0) && (
                                <ShowComponentIfAuthorized permission={[SCOPES.CHANGE_CALENDAR_PHASE]}>
                                    <Button color="teal" onClick={openSubmitModalHandler}>Submeter</Button>
                                </ShowComponentIfAuthorized>
                            )
                            }
                        </>
                    ) : (
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_COPY]}>
                            <Button color="orange" loading={creatingCopy} onClick={createCopy} labelPosition={"right"} icon>Criar um cópia desta versão <Icon name={"copy outline"} /></Button>
                        </ShowComponentIfAuthorized>
                    )}
                </div>
            </div>
            <ShowComponentIfAuthorized permission={[SCOPES.VIEW_CALENDAR_INFO]}>
                <Sticky offset={24} >
                    <Card fluid >
                        <Card.Content>
                            <Grid columns={'equal'} divided>
                                <GridColumn>
                                    <Header as="h4">Legenda</Header>
                                    <List divided relaxed>
                                        {epochs.map((epoch, index) => (
                                            <div className='legend-list-item' key={index}>
                                                <div className={'legend-list-item-square calendar-day-' + epoch.code}></div>
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
                                                <div className="legend-list-item-actions">
                                                    <Button icon size='mini'
                                                        onClick={() => showingEpochsHandle(epoch.id)}
                                                        title={ (activeEpochs.includes(epoch.id) ? t("Ocultar época") : t("Mostrar época") ) }>
                                                        <Icon name={(activeEpochs.includes(epoch.id) ? "eye slash" : "eye")} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </List>
                                </GridColumn>
                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_ACTUAL_PHASE]}>
                                    <GridColumn>
                                        <div>
                                            <span>
                                                <Header as="h5">Fase:</Header>
                                            </span>
                                            <div className='margin-top-xs'>
                                                {calendarPhases.find((x) => x.key === calendarPhase)?.text || calendarInfo?.phase?.description}
                                            </div>
                                        </div>
                                        <div className='margin-top-base'>
                                            <span>
                                                <Header as="h5">Estado:</Header>
                                            </span>
                                            <div className='margin-top-xs'>
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
                                            </div>
                                        </div>
                                    </GridColumn>
                                </ShowComponentIfAuthorized>
                                <GridColumn>
                                    <div>
                                        <span>
                                            <Header as="h5">Última alteração:</Header>
                                        </span>
                                        <div className='margin-top-xs'>
                                            {moment(calendarInfo?.calendar_last_update,).format('DD MMMM, YYYY HH:mm')}
                                        </div>
                                    </div>
                                    <div className='margin-top-base'>
                                        <span>
                                            <Header as="h5">Versão:</Header>
                                        </span>
                                        <div className='margin-top-xs'>
                                            { 'Versão ' + (calendarInfo?.version ? calendarInfo.version : '') }
                                        </div>
                                    </div>
                                </GridColumn>
                                <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS, SCOPES.ADD_EXAMS]}>
                                    <GridColumn width={5} className={ 'revision-column-wrapper' + (methodsLoaded ? ( (methodsIncompleteCount > 0 || methodsMissingCount > 0) ? " revision-warning" : " revision-success") : " revision-loading") }>

                                        <div>
                                            <Header as="h5">
                                                { t("Revisão") }:
                                            </Header>
                                            { methodsLoaded ? ( (methodsIncompleteCount > 0 || methodsMissingCount > 0) ? (
                                                <>
                                                    <div className="revision-column-icon">
                                                        <Icon name="warning sign" color="yellow"/>
                                                    </div>
                                                    <div className="revision-column-content">
                                                        <ul className="margin-top-base">
                                                            <li>Existem {methodsIncompleteCount} elementos de avaliação por submeter.</li>
                                                            <li>Existem {methodsMissingCount} UCs com <a href={ "/unidade-curricular?curso="+calendarInfo?.course?.id} target="_blank">métodos <Icon name="external alternate" /></a> por preencher.</li>
                                                        </ul>
                                                    </div>
                                                    <div className={"text-center"}>
                                                        <a href="#" onClick={openRevisionModalHandler} >ver detalhe</a>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="revision-column-icon">
                                                        <Icon name={"check circle outline"} color={"green"}/>
                                                    </div>
                                                    <div className="revision-column-content">
                                                        <div className="margin-top-l">
                                                            <div >{ t("Todas as avaliações marcadas!") }</div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) ) : (
                                                <>
                                                    <div className="revision-column-icon">
                                                        <Icon name={"download"} color={"blue"}/>
                                                    </div>
                                                    <div className="revision-column-content">
                                                        <div className="margin-top-l">
                                                            <div >{ t("A carregar detalhes!") }</div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </GridColumn>
                                </ShowComponentIfAuthorized>
                            </Grid>
                        </Card.Content>
                    </Card>
                </Sticky>
            </ShowComponentIfAuthorized>

            <ShowComponentIfAuthorized permission={[SCOPES.CHANGE_CALENDAR_PHASE, SCOPES.PUBLISH_CALENDAR]}>
                <PopupSubmitCalendar isOpen={openSubmitModal} onClose={closeSubmitModalHandler} calendarId={calendarId} currentPhaseId={calendarInfo?.phase?.id} updatePhase={updatePhaseHandler}/>
            </ShowComponentIfAuthorized>

            <ShowComponentIfAuthorized permission={[SCOPES.ADD_EXAMS, SCOPES.EDIT_EXAMS, SCOPES.REMOVE_EXAMS, SCOPES.EDIT_COURSE_UNITS]}>
                <PopupRevisionDetail isOpen={openRevisionModal} onClose={closeRevisionModalHandler} warnings={warnings}/>
            </ShowComponentIfAuthorized>
        </>
    );
};

export default InfosAndActions;
