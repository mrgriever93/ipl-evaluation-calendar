import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
// import {useParams, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
// import {Field, Form as FinalForm} from 'react-final-form';
import { Button, Form, Header, Icon, List, Modal, Comment, Divider } from 'semantic-ui-react';
import {toast} from 'react-toastify';
// import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';

import ShowComponentIfAuthorized from '../../../components/ShowComponentIfAuthorized';
import SCOPES from '../../../utils/scopesConstants';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

// const SweetAlertComponent = withReactContent(Swal);

const PopupEvaluationDetail = ( {isOpen, onClose, examId} ) => {
    // const history = useNavigate();
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
                    response.data.data.comments = [
                        {
                            comment: "Lorem ipsum dolor sit amet",
                            date: "28-02-2022",
                            ignored: false,
                            user: {
                                id: 2,
                                name: "Miguel",
                            },
                        },
                        {
                            comment: "Lorem ipsum dolor sit amet",
                            date: "26-02-2022",
                            ignored: false,
                            user: {
                                id: 3,
                                name: "Alexandre",
                            },
                        },
                        {
                            comment: "Lorem ipsum dolor sit amet",
                            date: "24-02-2022",
                            ignored: true,
                            user: {
                                id: 2,
                                name: "Miguel",
                            },
                        }
                    ];                        
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

    const addComment = (examId) => {
        axios.post('/comment/', {
            exam_id: examId,
            comment: commentText,
        }).then((res) => {
            if (res.status === 201) {
                setCommentText('');
                toast(t('calendar.O comentário foi adicionado com sucesso!'), successConfig);
            } else {
                toast(t('calendar.Ocorreu um erro ao adicionar o comentário!'), errorConfig);
            }
        });
    };

    const ignoreComment = (commentId) => {
        axios.post(`/comment/${commentId}/ignore`).then((res) => {
            if (res.status === 200) {
                toast(t('calendar.Comentário ignorado com sucesso!'), successConfig);
            } else {
                toast(t('calendar.Ocorreu um erro ao ignorar o comentário!'), successConfig);
            }
        });
    };

    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header>Detalhes da avaliação</Modal.Header>
            <Modal.Content>
                <div className='exam-detail-modal'>
                    <div className='exam-detail-info'>
                        <List divided verticalAlign='middle'>
                            <List.Item>
                                <List.Content><b>Curso: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.course_unit?.course?.name}</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Ramo: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.course_unit?.branch?.name}</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Ano Curricular: </b></List.Content>
                                <List.Content floated='right'>{ examDetailObject?.course_unit?.curricular_year ? (examDetailObject?.course_unit?.curricular_year + 'º Ano') : '-' }</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Unidade Curricular: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.course_unit?.name}</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Responsável da UC: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.course_unit?.responsible?.name}</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Data: </b></List.Content>
                                <List.Content floated='right'>{moment(examDetailObject?.date).format('DD MMMM, YYYY')}</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Hora de ínicio: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.hour}</List.Content>                            
                            </List.Item>
                            {examDetailObject?.duration_minutes && (
                                <List.Item>
                                    <List.Content><b>Duração: </b></List.Content>
                                    <List.Content floated='right'>{ (examDetailObject?.duration_minutes + ' ' + t('minutos')) }</List.Content>                            
                                </List.Item>
                            )}
                            <List.Item>
                                <List.Content><b>Salas de avaliação: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.room || '-'}</List.Content>                            
                            </List.Item>
                            <List.Item>
                                <List.Content><b>Observações: </b></List.Content>
                                <List.Content floated='right'>{examDetailObject?.observations || '-'}</List.Content>                            
                            </List.Item>
                        </List>
                    </div>
                    <div className='exam-detail-content'>
                        <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS, SCOPES.ADD_COMMENTS]}>
                            <Comment.Group>
                                <ShowComponentIfAuthorized permission={[SCOPES.VIEW_COMMENTS]}>
                                    <Header as="h3" dividing>Comentários</Header>
                                    {!isPublished && (
                                        <ShowComponentIfAuthorized permission={[SCOPES.ADD_COMMENTS]}>
                                            <Form reply className='focus--expander'>
                                                <Form.TextArea rows={2} placeholder={ t('Adiciona aqui o teu comentário') } value={commentText} onChange={(ev, {value}) => setCommentText(value)}/>
                                                <Button style={{marginBottom: 'var(--space-base)' }} onClick={() => addComment(examDetailObject?.id)} content="Adicionar comentário" labelPosition="right" icon="send" floated='right' primary />
                                            </Form>
                                            <Divider clearing />
                                        </ShowComponentIfAuthorized>
                                    )}
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
