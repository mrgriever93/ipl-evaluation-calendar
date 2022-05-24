import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Field, Form as FinalForm} from 'react-final-form';
import {DateInput, TimeInput} from 'semantic-ui-calendar-react-yz';
import {Accordion, Button, Card, Container, Divider, Form, Grid, Header, Icon, List, Modal, Segment, Table, TextArea, Popup, Dropdown, Comment, Message} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const PopupEvaluationDetail = ( {isOpen, onClose, examId} ) => {
    const history = useNavigate();
    const { t } = useTranslation();

    const [examDetailObject, setExamDetailObject] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const [isPublished, setIsPublished] = useState(false);
    const [showIgnoredComments, setShowIgnoredComments] = useState(false);
    const [commentText, setCommentText] = useState(undefined);
    const [calendarPermissions, setCalendarPermissions] = useState(JSON.parse(localStorage.getItem('calendarPermissions')) || []);

    useEffect(() => {
        if(examId) {
            loadExamDetails(examId);
        }
    }, [examId]);

    const loadExamDetails = (examId) => {
        setIsLoading(true);
        axios.get(`/exams/${examId}`).then((response) => {
                if (response?.status >= 200) {
                    setExamDetailObject(response.data.data);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                toast(t('Ocorreu um erro no load da avaliação'), errorConfig);
                toast(error, errorConfig);
            });
    };

    useEffect(() => {
        console.log(examDetailObject);
    }, [examDetailObject]);

    const onSubmitExam = (values) => {
        console.log(values);
        toast('Feature não foi implementada', errorConfig);
        // setSavingExam(true);
        // const axiosFn = values?.id ? axios.patch : axios.post;
        // axiosFn(`/exams/${values?.id ? values?.id : ''}`, {
        //     calendar_id: parseInt(calendarId, 10),
        //     course_id: examDetailObject?.course_unit?.branch?.id,
        //     room: values.room || undefined,
        //     date: moment(values.date).format('YYYY-MM-DD'),
        //     hour: values.hour,
        //     duration_minutes: values.durationMinutes || undefined,
        //     observations: values.observations,
        //     epoch_id: values.epoch,
        //     method_id: values.method,
        //     course_unit_id: values.courseUnit,
        // })
        //     .then((res) => {
        //         setSavingExam(false);
        //         if (res.status === 200 || res.status === 201) {
        //             setOpenExamModal(false);
        //             toast(`Avaliação ${values?.id ? 'guardada' : 'marcada'} com sucesso!`, successConfig);
        //             // loadExamDetails(calendarId);
        //         } else {
        //             toast(`Ocorreu um erro ao ${values?.id ? 'guardar' : 'marcar'} a avaliação!`, errorConfig);
        //         }
        //     });
    };

    const addComment = (examId) => {
        toast('Feature não foi implementada', errorConfig);
        // axios.post('/comment/', {
        //     exam_id: examId,
        //     comment: commentText,
        // }).then((res) => {
        //     if (res.status === 201) {
        //         toast(t('calendar.O comentário foi adicionado com sucesso!'), successConfig);
        //     } else {
        //         toast(t('calendar.Ocorreu um erro ao adicionar o comentário!'), errorConfig);
        //     }
        // });
    };

    const ignoreComment = (commentId) => {
        toast('Feature não foi implementada', errorConfig);
        // axios.post(`/comment/${commentId}/ignore`).then((res) => {
        //     if (res.status === 200) {
        //         toast(t('calendar.Comentário ignorado com sucesso!'), successConfig);
        //     } else {
        //         toast(t('calendar.Ocorreu um erro ao ignorar o comentário!'), successConfig);
        //     }
        // });
    };

    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>Detalhes da avaliação</Modal.Header>
            <Modal.Content>
                <div className='exam-detail-modal'>
                    <div className='exam-detail-info'>
                        <p>
                            <b>Curso: </b>
                            {examDetailObject?.course_unit?.course?.name}
                        </p>
                        <p>
                            <b>Ramo: </b>
                            {examDetailObject?.course_unit?.branch?.name}
                        </p>
                        <p>
                            <b>Ano Curricular: </b>
                            { examDetailObject?.course_unit?.curricular_year ? (examDetailObject?.course_unit?.curricular_year + 'º Ano') : '-' }
                        </p>
                        <p>
                            <b>Unidade Curricular: </b>
                            {examDetailObject?.course_unit?.name}
                        </p>
                        <p>
                            <b>Responsável da UC: </b>
                            {examDetailObject?.course_unit?.responsible?.name}
                        </p>
                        <p>
                            <b>Data: </b>
                            {moment(examDetailObject?.date).format('DD MMMM, YYYY')}
                        </p>
                        <p>
                            <b>Hora de ínicio: </b>
                            {examDetailObject?.hour}
                        </p>
                        {examDetailObject?.duration_minutes && (
                            <p>
                                <b>Duração: </b>
                                {examDetailObject?.duration_minutes}
                                {' '} minutos
                            </p>
                        )}
                        <p>
                            <b>Salas de avaliação: </b>
                            {examDetailObject?.room}
                        </p>
                        <div>
                            <b>Observações: </b>
                            <p>{examDetailObject?.observations || '-'}</p>
                        </div>
                    </div>
                    <div className='exam-detail-content'>
                        <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS, SCOPES.ADD_COMMENTS]}>
                            <Comment.Group>
                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>
                                    <Header as="h3" dividing>Comentários</Header>
                                    {examDetailObject?.comments?.filter((x) => (showIgnoredComments ? true : !x.ignored))?.map((comment, commentIndex) => (
                                        <Comment key={commentIndex}>
                                            <Comment.Avatar src={`https://avatars.dicebear.com/api/human/${comment.user.id}.svg?w=50&h=50&mood[]=sad&mood[]=happy`}/>
                                            <Comment.Content style={comment.ignored ? {backgroundColor: 'lightgrey'} : {}}>
                                                <Comment.Author as="a">{comment.user.name}</Comment.Author>
                                                <Comment.Metadata>
                                                    <div>{comment.date}</div>
                                                </Comment.Metadata>
                                                <Comment.Text>
                                                    {comment.comment}
                                                    {comment.ignored ? (
                                                        <div style={{position: 'absolute', top: '5px', right: '5px', userSelect: 'none'}}>
                                                            Comentário ignorado
                                                        </div>
                                                    ) : ''}
                                                </Comment.Text>
                                                <Comment.Actions>
                                                    {!comment.ignored && (
                                                        <Comment.Action onClick={() => ignoreComment(comment.id)}>
                                                            Ignorar
                                                        </Comment.Action>
                                                    )}
                                                </Comment.Actions>
                                            </Comment.Content>
                                        </Comment>
                                    ))}
                                </ShowComponentIfAuthorized>
                                {!isPublished && (
                                    <ShowComponentIfAuthorized permission={[SCOPES.ADD_COMMENTS]}>
                                        <Form reply>
                                            <Form.TextArea onChange={(ev, {value}) => setCommentText(value)}/>
                                            <Button onClick={() => addComment(examDetailObject?.id)} content="Adicionar comentário" labelPosition="left" icon="edit" primary/>
                                        </Form>
                                    </ShowComponentIfAuthorized>
                                )}
                            </Comment.Group>
                        </ShowComponentIfAuthorized>
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>
                    <Button icon floated='left' color={!showIgnoredComments ? 'green' : 'red'} labelPosition="left" onClick={() => setShowIgnoredComments((cur) => !cur)}>
                        <Icon name={'eye' + (showIgnoredComments ? ' slash' : '') }/>
                        {!showIgnoredComments ? 'Mostrar' : 'Esconder'}
                        {' '}
                        ignorados
                    </Button>
                </ShowComponentIfAuthorized>
                <Button onClick={onClose}>
                    Fechar
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupEvaluationDetail;
