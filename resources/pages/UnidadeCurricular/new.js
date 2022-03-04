import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Checkbox,
  Container,
  Form,
  Header,
  Icon,
  Image,
  List,
  Tab,
  Table,
} from 'semantic-ui-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import IplLogo from '../../../public/images/ipl.png';
import { successConfig, errorConfig } from '../../utils/toastConfig';
import { useComponentIfAuthorized } from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';

const New = ({ match }) => {
  const history = useHistory();
  const [courseUnitDetail, setCourseUnitDetail] = useState({});
  const [loading, setLoading] = useState(!!match.params?.id);
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

  const handleSearchResponsible = (e, { searchQuery }) => {
    setLoadingResponsibles(true);
    axios.get(`/search/users?q=${searchQuery}`).then((res) => {
      setLoadingResponsibles(false);
      if (res.status === 200) {
        setTeachers(res.data?.map(({ mail, name }) => ({
          key: mail,
          value: mail,
          name,
          text: `${name} - ${mail}`,
        })));
      }
    });
  };

  const handleSearchTeachers = (e, { searchQuery }) => {
    axios.get(`/search/users?q=${searchQuery}`).then((res) => {
      if (res.status === 200) {
        setTeacherList(res.data?.map(({ mail, name }) => ({
          key: mail,
          value: mail,
          name,
          text: `${name} - ${mail}`,
        })));
      }
    });
  };

  const fetchDetail = () => {
    axios.get(`/course-units/${match.params.id}/branches`).then((res) => {
      if (res.status === 200) {
        setBranchesList(res?.data?.map(({ id, name }) => ({
          key: id,
          value: id,
          text: name,
        })));
      }
      axios.get(`/course-units/${match.params.id}`).then((resTeachers) => {
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
    if (match.params?.id) {
      fetchDetail();
    }
  }, [match.params]);

  useEffect(() => {
    if (!loading && match.params?.id && !courseUnitDetail) {
      history.push('/unidade-curricular');
    }
  }, [match.params, loading, courseUnitDetail, history]);

  const initialValues = useMemo(() => {
    const {
      id, code, initials, curricularYear, responsible_id, semester, description, name, branch,
    } = courseUnitDetail;
    return {
      id,
      code,
      description,
      name,
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

  const onSubmit = ({
    id, name, code, initials, curricularYear, responsible, semester, branch,
  }) => {
    setIsSaving(true);
    const isNew = !id;
    const axiosFn = isNew ? axios.post : axios.patch;
    axiosFn(`/course-units/${!isNew ? id : ''}`, {
      name,
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
    axios.patch(`/course-units/${match.params.id}/responsible`, {
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
    <Container style={{ marginTop: '2em' }}>
      <FinalForm
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit }) => (
          <Form>
            <Card fluid>
              <Card.Content
                header={`${isEditMode ? 'Editar' : 'Nova'} Unidade Curricular`}
              />
              <Card.Content>
                <Form.Group widths="equal">
                  <Field name="code">
                    {({ input: codeInput }) => (
                      <Form.Input label="Código" {...codeInput} />
                    )}
                  </Field>
                  <Field name="name">
                    {({ input: nameInput }) => (
                      <Form.Input label="Nome" {...nameInput} />
                    )}
                  </Field>
                  <Field name="initials">
                    {({ input: initialsInput }) => (
                      <Form.Input required label="Iniciais" {...initialsInput} />
                    )}
                  </Field>
                </Form.Group>
                <Form.Group widths="equal">
                  <Field name="curricularYear">
                    {({ input: curricularYearInput }) => (
                      <Form.Input label="Ano curricular" {...curricularYearInput} />
                    )}
                  </Field>
                  <Field name="semester">
                    {({ input: semesterInput }) => (
                      <Form.Dropdown
                        selection
                        options={[{ key: '1', value: '1', text: '1º Semestre' }, { key: '2', value: '2', text: '2º Semestre' }]}
                        label="Semestre"
                        onChange={(e, { value }) => {
                          semesterInput.onChange(value);
                        }}
                        value={semesterInput.value}
                      />

                    )}
                  </Field>
                  <Field name="branch">
                    {({ input: branchInput }) => (
                      <Form.Dropdown
                        options={branchesList}
                        label="Ramo"
                        selection
                        search
                        {...branchInput}
                        onChange={(e, { value }) => branchInput.onChange(value)}
                      />
                    )}
                  </Field>
                </Form.Group>
                <Form.Group widths="2">
                  <Field name="responsible">
                    {({ input: responsibleInput }) => (
                      <Form.Dropdown
                        search
                        options={teachers}
                        disabled={loading || !hasPermissionToDefineResponsible}
                        onChange={(e, { value, options }) => {
                          setResponsibleUser(
                            { email: value, name: options.find((x) => x.value === value).name },
                          );
                          responsibleInput.onChange(value);
                        }}
                        onSearchChange={_.debounce(handleSearchResponsible, 400)}
                        label="Responsável UC"
                        selection
                        placeholder="Pesquisar nome do responsável da UC"
                        value={responsibleInput.value}
                        loading={loadingResponsibles}
                      />
                    )}

                  </Field>
                  <Form.Button disabled={loading || !hasPermissionToDefineResponsible} onClick={setResponsible} color="green" label="Guardar?" icon labelPosition="left">
                    <Icon name="save" />
                    Guardar responsável UC
                  </Form.Button>
                </Form.Group>
                <Header>Professores da UC</Header>
                <Form.Group widths="2">
                  <Field name="teacherList">
                    {({ input: teacherListInput }) => (
                      <Form.Dropdown
                        disabled={loading || !hasPermissionToDefineTeachers}
                        selection
                        options={teacherList}
                        onChange={(e, { value, key, options }) => {
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
                    {({ input: teacherListInput }) => (
                      <List divided verticalAlign="middle">
                        {courseUnitTeachers?.map(({
                          name, email, id,
                        }, index) => (
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
                            <Image avatar src={IplLogo} />
                            <List.Content>
                              {name}
                              {' '}
                              -
                              {' '}
                              {email}
                            </List.Content>
                          </List.Item>
                        ))}
                      </List>
                    )}
                  </Field>
                )}
              </Card.Content>
              <Card.Content extra>
                <div>
                  <Icon name="book" />
                  {' '}
                  Métodos de avaliação
                </div>

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

              <Card.Content>
                <Link to="/unidade-curricular">
                  <Button icon labelPosition="left" color="teal">
                    <Icon name="left arrow" />
                    Voltar à lista
                  </Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  color="green"
                  icon
                  labelPosition="left"
                  floated="right"
                  loading={isSaving}
                >
                  <Icon name={isEditMode ? 'save' : 'plus'} />
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

export default New;
