import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Container, Dimmer, Form, Icon, Loader } from 'semantic-ui-react';
import { Field, Form as FinalForm } from 'react-final-form';
import {useParams, useNavigate} from "react-router-dom";
import _ from 'lodash';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {useTranslation} from "react-i18next";
import { errorConfig, successConfig } from '../../utils/toastConfig';
import GroupPermissions from './groupPermissions';

const New = () => {
    const { t } = useTranslation();
    const history = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

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
        const { id, name, description_pt, description_en, enabled = true } = userGroup;

        return { id, name, description_pt, description_en, enabled };
    }, [userGroup]);

    const onSubmit = ({ id, name, description_pt, description_en, enabled }) => {
        setIsSaving(true);
        const isNew = !id;
        const axiosFn = isNew ? axios.post : axios.patch;

        axiosFn(`/user-group/${!isNew ? id : ''}`, { name, description_pt, description_en, enabled }).then( (res) => {
            setIsSaving(false);
            if (res.status === 200) {
                toast(t('Grupo atualizado com sucesso'), successConfig);
            }
            else if (res.status === 201) {
                toast(t('Grupo criado com sucesso'), successConfig);
            }
            else {
                toast(t('Existiu um problema ao gravar as alterações!'), errorConfig);
            }
        });
    };

    const handleCloneGroup = () => {
        toast(t('Grupo duplicado com sucesso'), successConfig);
    };


    return (
        <Container>
            <div className="margin-bottom-s margin-top-base">
                <Link to="/grupo-utilizador"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({ handleSubmit }) => (
                <Form>
                    <Card fluid>
                        { loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>{t('A carregar o grupo')}</Loader>
                            </Dimmer>
                        )}
                        <Card.Content header={`${ isEditMode ? t('Editar Grupo de Utilizador') : t('Novo Grupo de Utilizador') }`} />
                        <Card.Content>
                            <Form.Group widths="equal">
                                <Field name="name">
                                    {( { input: nameInput }) => (
                                        <Form.Input label={t('Nome')} {...nameInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="equal">
                                <Field name="description_pt">
                                    {( { input: descriptionPtInput }) => (
                                        <Form.Input label={t('Descrição PT')} {...descriptionPtInput} />
                                    )}
                                </Field>
                                <Field name="description_en">
                                    {( { input: descriptionEnInput }) => (
                                        <Form.Input label={t('Descrição EN')} {...descriptionEnInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Field name="enabled" type="checkbox">
                                {({ input: isEnabled }) => (
                                    <Checkbox label={t('Grupo de utilizador ativo?')} toggle defaultChecked={isEnabled.checked} onClick={() => isEnabled.onChange( !isEnabled.checked) } />
                                )}
                            </Field>
                        </Card.Content>
                        <Card.Content>
                            <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} >
                                <Icon name={isEditMode ? 'save' : 'plus'} /> {isEditMode ? t('Guardar') : t('Criar')}
                            </Button>
                            {isEditMode && (
                                <Button onClick={handleCloneGroup} color="yellow" icon labelPosition="left" floated="right" >
                                    <Icon name='clone outline'/> { t('Duplicar') }
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                </Form>
            )} />
            {  isEditMode && <GroupPermissions /> }
        </Container>
    );
};

export default New;
