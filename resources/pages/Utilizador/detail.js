import axios from 'axios';
import React, {useEffect, useMemo, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {useNavigate} from 'react-router';
import {Link, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {Button, Card, Checkbox, Container, Dimmer, Form, Icon, Loader} from 'semantic-ui-react';
import {successConfig} from '../../utils/toastConfig';
import {useTranslation} from "react-i18next";
import FilterOptionUserGroups from "../../components/Filters/UserGroups";

const UserDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [userDetail, setUserDetail] = useState({});
    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        axios.get(`/users/${paramsId}`).then((res) => {
            if (res.status === 200) {
                setLoading(false);
                setUserDetail(res?.data?.data);
            }
        });
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !userDetail) {
            navigate('/utilizador');
        }
    }, [paramsId, loading, userDetail]);

    const initialValues = useMemo(() => {
        const {id, email, name, groups, enabled = true} = userDetail;
        return {id, email, name, enabled, groups: groups?.map(({id}) => id)};//(groups ? Object.values(groups.id) : [])};
    }, [userDetail]);

    const onSubmit = ({id, groups, enabled,}) => {
        setIsSaving(true);
        axios.patch(`/user/${id}`, {groups, enabled}).then((res) => {
            if (res.status === 200) {
                setIsSaving(false);
                toast(t('Utilizador atualizado com sucesso'), successConfig);
            }
        });
    };

    return (
        <Container>
            <div className="margin-bottom-s">
                <Link to="/utilizador"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({handleSubmit}) => (
                    <Form>
                        <Card fluid>
                            { loading && (
                                <Dimmer active inverted>
                                    <Loader indeterminate>{t('A carregar dados')}</Loader>
                                </Dimmer>
                            )}
                            <Card.Content header={t("Editar Utilizador")} />
                            <Card.Content>
                                <Form.Group widths="equal">
                                    <Form.Input label={t("Nome")} value={initialValues.name} disabled/>
                                    <Form.Input label={t("Email")} value={initialValues.email} disabled/>
                                </Form.Group>
                                <Field name="groups">
                                    {({input: groupsInput}) => (
                                        <FilterOptionUserGroups widthSize={8} values={groupsInput.value} eventHandler={(value) => groupsInput.onChange(value)} />
                                    )}
                                </Field>
                                <Field name="enabled" type="checkbox">
                                    {({input: enabledUserInput}) => (
                                        <Checkbox label={t("Utilizador ativo?")} toggle
                                            checked={enabledUserInput.checked}
                                            onClick={() => enabledUserInput.onChange(!enabledUserInput.checked,)}
                                        />
                                    )}
                                </Field>
                            </Card.Content>
                            <Card.Content>
                                <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving}>
                                    <Icon name="save"/>
                                    { t('Guardar') }
                                </Button>
                            </Card.Content>
                        </Card>
                    </Form>
                )}
            />
        </Container>
    );
};

export default UserDetail;
