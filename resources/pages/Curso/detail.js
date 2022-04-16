import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Container, Card, Icon, Form, Button, Dimmer, Loader} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import {Field, Form as FinalForm} from 'react-final-form';

import {useComponentIfAuthorized} from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import CourseTabs from "./Tabs";
import Degree from "../../components/Filters/Degree";
import {useTranslation} from "react-i18next";

const Detail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    const [courseDetail, setCourseDetail] = useState({});
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [coordinatorUser, setCoordinatorUser] = useState(undefined);
    const [searchCoordinator, setSearchCoordinator] = useState(false);


    const hasPermissionToEdit = useComponentIfAuthorized([SCOPES.EDIT_COURSES]);
    const hasPermissionToDefineCoordinator = useComponentIfAuthorized(
        [SCOPES.DEFINE_COURSE_COORDINATOR],
    );

    const loadCourseDetail = () => {
        setLoading(true);
        axios.get(`/courses/${paramsId}`).then((res) => {
            setLoading(false);
            const {coordinator} = res.data.data;
            setTeachers((current) => {
                current.push({key: coordinator?.id, value: coordinator?.id, text: coordinator?.name});
                return current;
            });
            setCourseDetail(res.data.data);
        });
    };

    const handleSearchCoordinator = (e, {searchQuery}) => {
        setSearchCoordinator(true);
        axios.get(`/search/users?q=${searchQuery}`).then((res) => {
            setSearchCoordinator(false);
            if (res.status === 200) {
                setTeachers(res.data?.map(({mail, name}) => ({
                    key: mail,
                    value: mail,
                    name,
                    text: `${name} - ${mail}`,
                })));
            }
        });
    };

    const setCoordinator = () => {
        axios.patch(`/courses/${paramsId}/coordinator`, {
            coordinator_user_name: coordinatorUser.name,
            coordinator_user_email: coordinatorUser.email,
        }).then((res) => {
            if (res.status === 200) {
                toast('Guardou o coordenador de curso com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao guardar o coordenador de curso!', errorConfig);
            }
        });
    };

    useEffect(() => {
        if(/\d+/.test(paramsId)){
            loadCourseDetail();
        } else {
            navigate('/curso');
            toast('Ocorreu um erro ao carregar a informacao pretendida', errorConfig);
        }
    }, [paramsId]);

    const onSaveCourse = ({code, name, initials, level, duration}) => {
        axios.patch(`/courses/${paramsId}`, {
            code,
            name,
            initials,
            degree: level,
            num_years: duration
        }).then((res) => {
            if (res.status === 200) {
                loadCourseDetail();
                toast('Curso atualizado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao gravar o curso!', errorConfig);
            }
        });
    };

    const initialValues = useMemo(() => {
        const {code, name_pt, name_en, initials, degree_id, duration, coordinator} = courseDetail || {};
        return {code, name_pt, name_en, initials, degree_id, duration, coordinator: coordinator?.id};
    }, [courseDetail]);

    return (
        <Container>
            <div className="margin-bottom-base">
                <Link to="/curso"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm initialValues={initialValues} onSubmit={onSaveCourse} render={({handleSubmit}) => (
                <Card fluid>
                    { loading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>{t('A carregar o grupo')}</Loader>
                        </Dimmer>
                    )}
                    <Card.Content>
                        <Card.Header>
                            Curso: { courseDetail && courseDetail?.display_name }
                            <Button floated="right" color="green" onClick={handleSubmit} icon labelPosition="left"><Icon name="save"/>Guardar curso</Button>
                        </Card.Header>
                    </Card.Content>
                    <Card.Content>
                        <Form>
                            <Form.Group widths="4">
                                <Field name="code">
                                    {({input: codeInput}) => (
                                        <Form.Input disabled={loading || !hasPermissionToEdit} label="Código" {...codeInput}/>
                                    )}
                                </Field>
                                <Field name="initials">
                                    {({input: initialsInput}) => (
                                        <Form.Input disabled={loading || !hasPermissionToEdit} label="Sigla" {...initialsInput}/>
                                    )}
                                </Field>
                                <Field name="degree_id">
                                    {({input: degreeIdInput}) => (
                                        <Degree disabled={loading || !hasPermissionToEdit} widthSize={6} eventHandler={(value) => degreeIdInput.onChange(value)} value={degreeIdInput.value} isSearch={false}/>
                                    )}
                                </Field>
                                <Field name="duration">
                                    {({input: durationInput}) => (
                                        <Form.Input disabled={loading || !hasPermissionToEdit} label="Número de anos" {...durationInput}/>
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="3">
                                <Field name="name_pt">
                                    {({input: namePtInput}) => (
                                        <Form.Input disabled={loading || !hasPermissionToEdit} label="Nome PT" {...namePtInput}/>
                                    )}
                                </Field>
                                <Field name="name_en">
                                    {({input: nameEnInput}) => (
                                        <Form.Input disabled={loading || !hasPermissionToEdit} label="Nome EN" {...nameEnInput}/>
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="2">
                                <Field name="coordinator">
                                    {({input: coordinatorInput}) => (
                                        <Form.Dropdown
                                            disabled={loading || !hasPermissionToDefineCoordinator}
                                            label="Coordenador do Curso"
                                            selectOnBlur={false}
                                            options={teachers}
                                            selection
                                            search
                                            loading={searchCoordinator}
                                            placeholder="Pesquise o coordenador de curso..."
                                            {...coordinatorInput}
                                            onSearchChange={_.debounce(handleSearchCoordinator, 400)}
                                            onChange={(e, {value, options}) => {
                                                setCoordinatorUser(
                                                    {
                                                        email: value,
                                                        name: options.find((x) => x.value === value).name
                                                    },
                                                );
                                                coordinatorInput.onChange(value);
                                            }}

                                        />
                                    )}
                                </Field>
                                <Form.Button disabled={loading || !hasPermissionToDefineCoordinator}
                                             label="Guardar?" onClick={setCoordinator} color="green" icon
                                             labelPosition="left">
                                    <Icon name="save"/>
                                    Guardar coordenador
                                </Form.Button>
                            </Form.Group>
                        </Form>
                    </Card.Content>
                </Card>
            )} />
            { paramsId && <CourseTabs courseId={paramsId}/> }
        </Container>
    );
};

export default Detail;
