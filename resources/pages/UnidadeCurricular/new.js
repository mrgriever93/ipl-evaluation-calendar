import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {useNavigate} from 'react-router';
import {Link, useParams} from 'react-router-dom';
import {Button, Card, Container, Dimmer, Divider, Form, Header, Icon, Loader} from 'semantic-ui-react';
import axios from 'axios';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import {useTranslation} from "react-i18next";
import Semesters from "../../components/Filters/Semesters";
import UnitTabs from "./Tabs";

const New = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [courseUnitDetail, setCourseUnitDetail] = useState({});
    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !_.isEmpty(courseUnitDetail);
    const [branchesList, setBranchesList] = useState([]);

    const fetchDetail = () => {
        setLoading(true);
        axios.get(`/course-units/${paramsId}/branches`).then((res) => {
            if (res.status === 200) {
                setBranchesList(res?.data?.data);
                axios.get(`/course-units/${paramsId}`).then((resTeachers) => {
                    setLoading(false);
                    setCourseUnitDetail(resTeachers?.data?.data);
                });
            }
        });
    };

    useEffect(() => {
        if (paramsId) {
            fetchDetail();
        }
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !courseUnitDetail) {
            navigate('/unidade-curricular');
        }
    }, [paramsId, loading, courseUnitDetail]);

    const initialValues = useMemo(() => {
        const {id, code, description,  name_pt, name_en, initials, curricularYear, semester, branch} = courseUnitDetail;
        return {id, code, description, name_pt, name_en, initials, curricularYear, semester, branch};
    }, [courseUnitDetail]);

    const onSubmit = ({id, name_pt, name_en, code, initials, curricularYear, semester, branch}) => {
        setIsSaving(true);
        const isNew = !id;
        const axiosFn = isNew ? axios.post : axios.patch;
        axiosFn(`/course-units/${!isNew ? id : ''}`, {
            name_pt,
            name_en,
            code,
            initials,
            semester,
            curricular_year: curricularYear,
            branch_id: branch
        }).then((res) => {
            setIsSaving(false);
            if (res.status >= 200 && res.status < 300) {
                toast(`A Unidade curricular foi ${isEditMode ? 'editada' : 'criada'} com sucesso!`, successConfig);
            } else {
                toast('Existiu um problema ao gravar as alterações!', errorConfig);
            }
        });
    };

    return (
        <Container>
            <div className="margin-bottom-s">
                <Link to="/unidade-curricular"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({handleSubmit}) => (
                <Form>
                    <Card fluid>
                        { loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>{t('A carregar dados')}</Loader>
                            </Dimmer>
                        )}
                        <Card.Content>
                            <div className='card-header-alignment'>
                                <Header as="span">{(isEditMode ? t('Editar') : t('Nova')) + " " + t("Unidades Curriculares")}</Header>
                                <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving}>
                                    <Icon name={isEditMode ? 'save' : 'plus'}/>
                                    {isEditMode ? t('Guardar') : t('Criar')}
                                </Button>
                            </div>
                        </Card.Content>
                        <Card.Content>
                            <Form.Group widths="3">
                                <Field name="code">
                                    {({input: codeInput}) => (
                                        <Form.Input label="Código" {...codeInput} />
                                    )}
                                </Field>
                                <Field name="initials">
                                    {({input: initialsInput}) => (
                                        <Form.Input required label="Iniciais" {...initialsInput} />
                                    )}
                                </Field>
                            </Form.Group>

                            <Form.Group widths="equal">
                                <Field name="name_pt">
                                    {({input: namePtInput}) => (
                                        <Form.Input label="Nome PT" {...namePtInput} />
                                    )}
                                </Field>
                                <Field name="name_en">
                                    {({input: nameEnInput}) => (
                                        <Form.Input label="Nome EN" {...nameEnInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="3">
                                <Field name="curricularYear">
                                    {({input: curricularYearInput}) => (
                                        <Form.Input label="Ano curricular" {...curricularYearInput} />
                                    )}
                                </Field>
                                <Field name="semester">
                                    {({input: semesterInput}) => (
                                        <Semesters eventHandler={(value) => {semesterInput.onChange(value);}} value={semesterInput.value} isSearch={false}/>
                                    )}
                                </Field>
                                <Field name="branch">
                                    {({input: branchInput}) => (
                                        <Form.Dropdown options={branchesList} label="Ramo" selection search {...branchInput} onChange={(e, {value}) => branchInput.onChange(value)}/>
                                    )}
                                </Field>
                            </Form.Group>
                        </Card.Content>
                    </Card>
                </Form>
            )} />
            <div className={"margin-top-base"}>
                { paramsId && <UnitTabs unitId={paramsId}/> }
            </div>
        </Container>
    );
};
export default New;
