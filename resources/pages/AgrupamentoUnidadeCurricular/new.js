import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {useNavigate} from 'react-router';
import {Link, useParams} from 'react-router-dom';
import {Button, Card, Container, Form, Icon, Message} from 'semantic-ui-react';
import axios from 'axios';
import {toast} from 'react-toastify';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import {useTranslation} from "react-i18next";

const New = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [courseUnitGroupDetail, setCourseUnitGroupDetail] = useState({});
    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);
    const [courseUnits, setCourseUnitsList] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);
    const isEditMode = !_.isEmpty(courseUnitGroupDetail);

    const loadCourseUnits = (includingIdsString) => {
        axios.get(`/course-units/search?all=true&withoutGroup=true${includingIdsString ? `&including=[${includingIdsString}]` : ''}`).then((res) => {
            setCourseUnitsList(res?.data?.data);
            //setCourseUnitsList(res?.data?.data?.map((x) => ({
            //    key: x.id,
            //    value: x.id,
            //    text: `${x.name} - ${x.course_description}`,
            //})));
        });
    };

    // Get grouped UCs
    useEffect(() => {
        if (paramsId) {
            axios.get(`/course-unit-groups/${paramsId}`).then((res) => {
                loadCourseUnits(res?.data?.data?.course_units?.map((x) => x.id).join(','));
                setLoading(false);
                setCourseUnitGroupDetail(res?.data?.data);
            });
        } else {
            loadCourseUnits();
        }
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !courseUnitGroupDetail) {
            navigate('/agrupamento-unidade-curricular');
        }
    }, [paramsId, loading, courseUnitGroupDetail, navigate]);

    const initialValues = useMemo(() => {
        const {id, description_pt, description_en, course_units} = courseUnitGroupDetail;
        return {id, description_pt, description_en, courseUnits: (course_units ? course_units.map((x) => x.id) : [])};
    }, [courseUnitGroupDetail]);

    const onSubmit = ({id, description_pt, description_en, courseUnits}) => {
        setIsSaving(true);
        const isNew = !id;
        const axiosFn = isNew ? axios.post : axios.patch;

        axiosFn(`/course-unit-groups/${!isNew ? id : ''}`, {
            description_pt,
            description_en,
            course_units: courseUnits,
        }).then((res) => {
            setIsSaving(false);
            if (res.status >= 200 && res.status < 300) {
                toast(`O agrupamento de unidade curricular foi ${isEditMode ? 'editado' : 'criado'} com sucesso!`, successConfig);
            } else {
                let errorsArray = [];
                if(typeof res.response.data.errors === 'object' && res.response.data.errors !== null){
                    errorsArray = Object.values(res.response.data.errors);
                } else {
                    if(Array.isArray(res.response.data.errors)){
                        errorsArray = res.response.data.errors;
                    }
                }
                setErrorMessages(errorsArray);
                toast('Existiu um problema ao gravar as alterações!', errorConfig);
            }
        });
    };

    return (
        <Container>
            <div className="margin-bottom-s">
                <Link to="/agrupamento-unidade-curricular"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({handleSubmit}) => (
                <Form warning={ errorMessages.length > 0 }>
                    <Card fluid>
                        <Card.Content header={`${isEditMode ? 'Editar' : 'Novo'} Agrupamento de Unidades Curriculares`} />
                        { errorMessages.length > 0 && (
                            <Card.Content>
                                <Message warning>
                                    <Message.Header>{ t('Os seguintes detalhes do Curso precisam da sua atenção:') }</Message.Header>
                                    <Message.List>
                                        { errorMessages.map((message, index) => (
                                            <Message.Item key={index}>
                                                { message }
                                            </Message.Item>
                                        ))}
                                    </Message.List>
                                </Message>
                            </Card.Content>
                        )}
                        <Card.Content>
                            <Form.Group widths="equal">
                                <Field name="description_pt">
                                    {({input: descriptionPtInput}) => (
                                        <Form.Input label="Descrição - PT" {...descriptionPtInput} />
                                    )}
                                </Field>
                                <Field name="description_en">
                                    {({input: descriptionEnInput}) => (
                                        <Form.Input label="Descrição - EN" {...descriptionEnInput} />
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="equal">
                                <Field name="courseUnits">
                                    {({input: courseUnitsInput}) => (
                                        <Form.Dropdown options={courseUnits} selection multiple search label="Unidades Curriculares" {...courseUnitsInput}
                                            onChange={(e, {value}) => courseUnitsInput.onChange(value)}
                                        />
                                    )}
                                </Field>
                            </Form.Group>
                        </Card.Content>
                        <Card.Content>
                            <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving}>
                                <Icon name={isEditMode ? 'save' : 'plus'}/>
                                {isEditMode ? 'Guardar' : 'Criar'}
                            </Button>
                        </Card.Content>
                    </Card>
                </Form>
            )} />
        </Container>
    );
};

export default New;
