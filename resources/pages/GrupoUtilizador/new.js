import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Container, Dimmer, Form, Icon, Loader } from 'semantic-ui-react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useNavigate } from 'react-router';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { errorConfig, successConfig } from '../../utils/toastConfig';
import GroupPermissions from './groupPermissions';
import {useParams} from "react-router-dom";

const New = () => {
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const history = useNavigate();
    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);
    const [userGroup, setUserGroup] = useState({});
    const isEditMode = !_.isEmpty(userGroup);

    useEffect(() => {
        if (paramsId) {
            axios.get(`/user-group/${paramsId}`)
                .then((response) => {
                    setUserGroup(response?.data?.data);
                    setLoading(false);
                });
        }
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !userGroup) {
            history('/grupo-utilizador');
        }
    }, [paramsId, loading, userGroup, history]);
  
    const initialValues = useMemo(() => {
        const { id, name, description, enabled = true } = userGroup;
    
        return { id, name, description, enabled };
    }, [userGroup]);
  
    const onSubmit = ({ id, name, description, enabled }) => {
        setIsSaving(true);
        const isNew = !id;
        const axiosFn = isNew ? axios.post : axios.patch;
    
        axiosFn(`/user-group/${!isNew ? id : ''}`, { name, description, enabled }).then( (res) => {
            setIsSaving(false);
            if (res.status === 200) {
                toast('Grupo atualizado com sucesso', successConfig);
            }
            else if (res.status === 201) {
                toast('Grupo criado com sucesso', successConfig);
            }
            else {
                toast('Existiu um problema ao gravar as alterações!', errorConfig);
            }
        });
    };

    return (
        <Container style={{ marginTop: '2em' }}>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({ handleSubmit }) => (
                <Form>
                    <Card fluid>
                        { loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>A carregar o grupo</Loader>
                            </Dimmer>
                        )}
                        <Card.Content header={`${ isEditMode ? 'Editar' : 'Novo' } Grupo de Utilizador`} />
                        <Card.Content>
                            <Form.Group widths="equal">
                                <Field name="name">
                                    {( { input: nameInput }) => (
                                        <Form.Input label="Nome" {...nameInput} />
                                    )}
                                </Field>
                                <Field name="description">
                                    {( { input: descriptionInput }) => (
                                        <Form.Input label="Descrição" {...descriptionInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Field name="enabled" type="checkbox">
                                {({ input: isEnabled }) => (
                                    <Checkbox label="Grupo de utilizador desativado?" toggle checked={!isEnabled.checked} onClick={() => isEnabled.onChange( !isEnabled.checked) } />
                                )}
                            </Field>
                        </Card.Content>
                        <Card.Content>
                            <Link to="/grupo-utilizador">
                                <Button icon labelPosition="left" color="teal" >
                                    <Icon name="left arrow" /> Voltar à lista
                                </Button>
                            </Link>
                            <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} >
                                <Icon name={isEditMode ? 'save' : 'plus'} /> {isEditMode ? 'Guardar' : 'Criar'}
                            </Button>
                        </Card.Content>
                    </Card>
                </Form>
            )} />
            {  isEditMode && <GroupPermissions /> }
        </Container>
    );
};

export default New;