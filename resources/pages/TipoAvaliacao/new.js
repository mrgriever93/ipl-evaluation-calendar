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

const New = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);
    const [evaluationTypeDetail, setEvaluationTypeDetail] = useState({});
    const isEditMode = !_.isEmpty(evaluationTypeDetail);

    useEffect(() => {
        if (paramsId) {
            axios.get(`/evaluation-types/${paramsId}`).then((response) => {
                setEvaluationTypeDetail(response?.data?.data);
                setLoading(false);
            });
        }
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !evaluationTypeDetail) {
            navigate('/tipo-avaliacao');
        }
    }, [paramsId, loading, evaluationTypeDetail, navigate]);
  
    const initialValues = useMemo(() => {        
        const { id, code, name_pt, name_en, enabled = true } = evaluationTypeDetail;

        return { id, code, name_pt, name_en, enabled };
    }, [evaluationTypeDetail]);

    const onSubmit = ({ id, code, name_pt, name_en, enabled }) => {
        setIsSaving(true);
        const isNew = !id;
        const axiosFn = isNew ? axios.post : axios.patch;
        
        axiosFn(`/evaluation-types/${!isNew ? id : ''}`, { code, name_pt, name_en, enabled }).then((res) => {
            setIsSaving(false);
            if (res.status === 200) {
                toast(t('Tipo de Avaliação atualizado com sucesso'), successConfig);
            }
            else if (res.status === 201) {
                toast(t('Tipo de Avaliação criado com sucesso'), successConfig);
            }
            else {
                toast(t('Existiu um problema ao gravar as alterações!'), errorConfig);
            }
        });
    };

    return (
        <Container>
            <div className="margin-bottom-s margin-top-base">
                <Link to="/tipo-avaliacao"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({ handleSubmit }) => (
                <Form>
                    <Card fluid>
                        { loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>{t('A carregar dados')}</Loader>
                            </Dimmer>
                        )}
                        <Card.Content header={`${ isEditMode ? t('Editar Tipo de Avaliação') : t('Novo Tipo de Avaliação') }`} />
                        <Card.Content>
                            <Form.Group widths="equal">
                                <Field name="code">
                                    {( { input: codeInput }) => (
                                        <Form.Input label={t('Nome')} {...codeInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="equal">
                                <Field name="name_pt">
                                    {( { input: namePtInput }) => (
                                        <Form.Input label={t('Descrição PT')} {...namePtInput} />
                                    )}
                                </Field>
                                <Field name="name_en">
                                    {( { input: nameEnInput }) => (
                                        <Form.Input label={t('Descrição EN')} {...nameEnInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Field name="enabled" type="checkbox">
                                {({ input: isEnabled }) => (
                                    <Checkbox label={t('Ativo?')} toggle defaultChecked={isEnabled.checked} onClick={() => isEnabled.onChange( !isEnabled.checked) } />
                                )}
                            </Field>
                        </Card.Content>
                        <Card.Content>
                            <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} >
                                <Icon name={isEditMode ? 'save' : 'plus'} /> {isEditMode ? t('Guardar') : t('Criar')}
                            </Button> 
                        </Card.Content>
                    </Card>
                </Form>
            )} />
        </Container>
    );
};

export default New;
