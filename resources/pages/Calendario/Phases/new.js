import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {useNavigate} from 'react-router';
import {Link, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {
    Button,
    Card,
    Checkbox,
    Container,
    Form,
    Icon,
} from 'semantic-ui-react';
import {errorConfig, successConfig} from '../../../utils/toastConfig';

const NewPhases = () => {
    const history = useNavigate();

    let { id } = useParams();
    let paramsId = id;

    const [phaseDetail, setPhaseDetail] = useState({});
    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !_.isEmpty(phaseDetail);
    const [isRemovable, setIsRemovable] = useState(true);
    useEffect(() => {
        // check if URL params are just numbers or else redirects to previous page
        if(!/\d+/.test(paramsId)){
            history(-1);
            toast('Ocorreu um erro ao carregar a informacao pretendida', errorConfig);
        }
        if (paramsId) {
            axios.get(`/calendar-phases/${paramsId}`).then((res) => {
                if (res.status === 200) {
                    setLoading(false);
                    setPhaseDetail(res?.data?.data);
                    setIsRemovable(res?.data?.data?.removable);
                }
            });
        }
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !phaseDetail) {
            history('/fases');
        }
    }, [paramsId, loading, phaseDetail, history]);

    const initialValues = useMemo(() => {
        const {
            id, description, name, enabled = true,
        } = phaseDetail;
        return {
            id,
            description,
            name,
            isDisabled: !enabled,
        };
    }, [phaseDetail]);

    const onSubmit = ({
                          id, name, description, isDisabled,
                      }) => {
        setIsSaving(true);
        const isNew = !id;
        axios[isNew ? 'post' : 'patch'](
            `/calendar-phases/${!isNew ? id : ''}`,
            {
                ...(isRemovable ? name : null),
                description,
                enabled: !isDisabled,
            },
        ).then((res) => {
            setIsSaving(false);
            if (res.status === 200) {
                toast('Fase de calendário atualizada com sucesso', successConfig);
            } else if (res.status === 201) {
                toast('Fase de calendário criada com sucesso', successConfig);
            }
        });
    };

    return (
        <Container style={{marginTop: '2em'}}>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues}
                render={({handleSubmit}) => (
                    <Form>
                        <Card fluid>
                            <Card.Content header={`${isEditMode ? 'Editar' : 'Nova'} Fase`}/>
                            <Card.Content>
                                <Form.Group widths="equal">
                                    <Field name="name">
                                        {({input: nameInput}) => (
                                            <Form.Input label="Nome"{...nameInput} disabled={!isRemovable}/>
                                        )}
                                    </Field>
                                    <Field name="description">
                                        {({input: descriptionInput}) => (
                                            <Form.Input label="Descrição"{...descriptionInput}/>
                                        )}
                                    </Field>
                                </Form.Group>
                                <Field name="isDisabled" type="checkbox">
                                    {({input: isDisabledInput}) => (
                                        <Checkbox label="Fase Inativa?" toggle checked={isDisabledInput.checked}
                                            onClick={() => isDisabledInput.onChange(
                                                !isDisabledInput.checked,
                                            )}
                                        />
                                    )}
                                </Field>
                            </Card.Content>
                            <Card.Content>
                                <Link to="/calendario/fases">
                                    <Button icon labelPosition="left" color="teal">
                                        <Icon name="left arrow"/>
                                        Voltar à lista
                                    </Button>
                                </Link>
                                <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving}>
                                    <Icon name={isEditMode ? 'save' : 'plus'}/>
                                    {isEditMode ? 'Guardar' : 'Criar'}
                                </Button>
                            </Card.Content>
                        </Card>
                    </Form>
                )}
            />
        </Container>
    );
};

export default NewPhases;
