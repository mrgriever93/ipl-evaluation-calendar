import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {useNavigate} from 'react-router';
import {Link, useParams} from 'react-router-dom';
import {Button, Card, Container, Form, Header, Icon, Image, List, Table,} from 'semantic-ui-react';
import axios from 'axios';
import {toast} from 'react-toastify';
import IplLogo from '../../../public/images/ipl.png';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import {useComponentIfAuthorized} from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {useTranslation} from "react-i18next";
import Semesters from "../../components/Filters/Semesters";
import Teachers from "../../components/Filters/Teachers";

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
    const [teachers, setTeachers] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [methods, setMethods] = useState([]);
    const [responsibleUser, setResponsibleUser] = useState(undefined);
    const [loadingResponsibles, setLoadingResponsibles] = useState(false);
    const [courseUnitTeachers, setCourseUnitTeachers] = useState([]);
    const [branchesList, setBranchesList] = useState([]);

    const hasPermissionToDefineResponsible = useComponentIfAuthorized(
        [SCOPES.DEFINE_COURSE_UNIT_RESPONSIBLE],
    );
    const hasPermissionToDefineTeachers = useComponentIfAuthorized(
        [SCOPES.DEFINE_COURSE_UNIT_TEACHERS],
    );

    const handleSearchResponsible = (e, {searchQuery}) => {
        setLoadingResponsibles(true);
        axios.get(`/search/users?q=${searchQuery}`).then((res) => {
            setLoadingResponsibles(false);
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

    const handleSearchTeachers = (e, {searchQuery}) => {
        axios.get(`/search/users?q=${searchQuery}`).then((res) => {
            if (res.status === 200) {
                setTeacherList(res.data?.map(({mail, name}) => ({
                    key: mail,
                    value: mail,
                    name,
                    text: `${name} - ${mail}`,
                })));
            }
        });
    };

    const fetchDetail = () => {
        axios.get(`/course-units/${paramsId}/branches`).then((res) => {
            if (res.status === 200) {
                setBranchesList(res?.data?.map(({id, name}) => ({
                    key: id,
                    value: id,
                    text: name,
                })));
            }
            axios.get(`/course-units/${paramsId}`).then((resTeachers) => {
                setLoading(false);
                setCourseUnitDetail(resTeachers?.data?.data);
                setTeachers([
                    {
                        key: resTeachers?.data?.data?.responsible_id,
                        value: resTeachers?.data?.data?.responsible_id,
                        text: `${resTeachers?.data?.data?.responsible_name} - ${resTeachers?.data?.data?.responsible_email}`,
                    },
                ]);
                setResponsibleUser(
                    {
                        email: resTeachers?.data?.data?.responsible_email,
                        name: resTeachers?.data?.data?.responsible_name,
                    },
                );

                setCourseUnitTeachers(resTeachers?.data?.data?.teachers?.map((x) => ({
                    name: x.name,
                    email: x.email,
                    id: x.id,
                })));
                setMethods(resTeachers?.data?.data?.methods);
            });
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
        const {
            id, code, initials, curricularYear, responsible_id, semester, description, name_pt, name_en, branch,
        } = courseUnitDetail;
        return {
            id,
            code,
            description,
            name_pt,
            name_en,
            initials,
            curricularYear,
            semester,
            responsible: responsible_id,
            teacherList: [...(courseUnitDetail?.teachers?.map((x) => ({
                key: x.email,
                value: x.email,
                text: `${x.email} - ${x.name}`,
            })) || [])],
            branch: branch?.id,
        };
    }, [courseUnitDetail]);

    const onSubmit = ({id, name_pt, name_en, code, initials, curricularYear, responsible, semester, branch}) => {
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
            responsible_user_id: responsible || undefined,
            teachers: courseUnitTeachers,
            branch_id: branch,
        }).then((res) => {
            setIsSaving(false);
            if (res.status >= 200 && res.status < 300) {
                toast(`A Unidade curricular foi ${isEditMode ? 'editada' : 'criada'} com sucesso!`, successConfig);
            } else {
                toast('Existiu um problema ao gravar as alterações!', errorConfig);
            }
        });
    };

    const setResponsible = () => {
        axios.patch(`/course-units/${paramsId}/responsible`, {
            responsible_user_name: responsibleUser?.name,
            responsible_user_email: responsibleUser?.email,
        }).then((res) => {
            if (res.status === 200) {
                fetchDetail();
                toast('Guardou o responsável da UC com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao guardar o responsável da UC!', errorConfig);
            }
        });
    };

    return (
        <Container>
            <div className="margin-bottom-s margin-top-base">
                <Link to="/unidade-curricular"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({handleSubmit}) => (
                    <Form>
                        <Card fluid>
                            <Card.Content>
                                <div className='card-header-alignment'>
                                    <Header as="span">{(isEditMode ? 'Editar' : 'Nova') + t("Unidades Curriculares")}</Header>
                                    <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving}>
                                        <Icon name={isEditMode ? 'save' : 'plus'}/>
                                        {isEditMode ? 'Guardar' : 'Criar'}
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
                                            <Semesters eventHandler={(e, {value}) => {semesterInput.onChange(value);}} value={semesterInput.value} isSearch={false}/>
                                        )}
                                    </Field>
                                </Form.Group>
                                <Form.Group widths="3">
                                    <Field name="branch">
                                        {({input: branchInput}) => (
                                            <Form.Dropdown options={branchesList} label="Ramo" selection search {...branchInput} onChange={(e, {value}) => branchInput.onChange(value)}/>
                                        )}
                                    </Field>
                                </Form.Group>
                                <Form.Group widths="2">
                                    <Field name="responsible">
                                        {({input: responsibleInput}) => (
                                            <Teachers isSearch={false} eventHandler={(e, {value, options}) => {
                                                setResponsibleUser(
                                                    {
                                                        email: value,
                                                        name: options.find((x) => x.value === value).name
                                                    },
                                                );
                                                responsibleInput.onChange(value);
                                            }} value={responsibleInput.value} isDisabled={loading || !hasPermissionToDefineResponsible}/>
                                        )}
                                    </Field>
                                    <Form.Button disabled={loading || !hasPermissionToDefineResponsible}
                                                 onClick={setResponsible} color="green" label="Guardar?" icon
                                                 labelPosition="left">
                                        <Icon name="save"/>
                                        Guardar responsável UC
                                    </Form.Button>
                                </Form.Group>
                            </Card.Content>
                        </Card>
                        <Card fluid>
                            <Card.Content header={'Professores da UC'}/>
                            <Card.Content>
                                <Form.Group widths="2">
                                    <Field name="teacherList">
                                        {({input: teacherListInput}) => (
                                            <Form.Dropdown
                                                disabled={loading || !hasPermissionToDefineTeachers}
                                                selection
                                                options={teacherList}
                                                onChange={(e, {value, key, options}) => {
                                                    teacherListInput.onChange(value);
                                                    setCourseUnitTeachers((current) => [
                                                        ...current,
                                                        {
                                                            id: key,
                                                            name: options.find((x) => x.value === value).name,
                                                            email: value,
                                                        },
                                                    ]);
                                                }}
                                                onSearchChange={_.debounce(handleSearchTeachers, 400)}
                                                label="Professores"
                                                value={teacherListInput.value}
                                                loading={loadingResponsibles}
                                                search
                                                placeholder="Procurar professores"
                                            />
                                        )}
                                    </Field>
                                </Form.Group>
                                {courseUnitTeachers?.length > 0 && (
                                    <Field name="teacherList">
                                        {({input: teacherListInput}) => (
                                            <List divided verticalAlign="middle">
                                                {courseUnitTeachers?.map(({name, email, id}, index) => (
                                                    <List.Item key={id}>
                                                        <List.Content floated="right">
                                                            <Button
                                                                disabled={!hasPermissionToDefineTeachers}
                                                                onClick={() => setCourseUnitTeachers((current) => {
                                                                    const copy = [...current];
                                                                    copy.splice(index, 1);
                                                                    return copy;
                                                                })}
                                                                color="red"
                                                            >
                                                                Remover
                                                            </Button>
                                                        </List.Content>
                                                        <Image avatar src={IplLogo}/>
                                                        <List.Content>{name + ' - ' + email}</List.Content>
                                                    </List.Item>
                                                ))}
                                            </List>
                                        )}
                                    </Field>
                                )}
                            </Card.Content>
                        </Card>
                        <Card fluid>
                            <Card.Content header={'Métodos de avaliação'}/>
                            <Card.Content>
                                <Table striped color="green">
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Época</Table.HeaderCell>
                                            <Table.HeaderCell>Tipo de Avaliação</Table.HeaderCell>
                                            <Table.HeaderCell>Nota mínima</Table.HeaderCell>
                                            <Table.HeaderCell>Peso</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        {methods?.map((method) => (
                                            <Table.Row>
                                                <Table.Cell>{method.epoch[0].name}</Table.Cell>
                                                <Table.Cell>{method.name}</Table.Cell>
                                                <Table.Cell>{method.minimum}</Table.Cell>
                                                <Table.Cell>{method.weight}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </Card.Content>
                        </Card>
                    </Form>
                )}
            />
        </Container>
    );
};
export default New;
