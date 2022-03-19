import axios from 'axios';
import _ from 'lodash';
import React, {useEffect, useMemo, useState} from 'react';
import {Field, Form as FinalForm} from 'react-final-form';
import {useNavigate, useParams, Link} from 'react-router-dom';
import {toast} from 'react-toastify';
import {Button, Card, Container, Dimmer, Form, Icon, Loader, Message, Tab} from 'semantic-ui-react';
import {errorConfig, successConfig} from '../../utils/toastConfig';

const NewEscola = () => {
    let { id } = useParams();
    let paramsId = id;

    const history = useNavigate();
    const [loading, setLoading] = useState(!!paramsId);
    const [isSaving, setIsSaving] = useState(false);
    const [school, setSchool] = useState({});
    const isEditMode = !_.isEmpty(school);

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if(!/\d+/.test(paramsId)){
            history(-1);
            toast('Ocorreu um erro ao carregar a informacao pretendida', errorConfig);
        }
        axios.get('/user-group').then((res) => {
            if (res.status === 200) {
                setGroups(res.data.data.map((group) => ({
                    key: group.id,
                    value: group.id,
                    text: group.description,
                })));
                if (paramsId) {
                    axios
                        .get(`/schools/${paramsId}`)
                        .then((response) => {
                            setSchool(response?.data?.data);
                            setLoading(false);
                        });
                }
            }
        });
    }, [paramsId]);

    useEffect(() => () => {
            setSchool(null);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    useEffect(() => {
        if (!loading && paramsId && !school) {
            history('/escola');
        }
    }, [paramsId, loading, school, history]);

    const initialValues = useMemo(() => {
        const {
            id,
            code,
            name,
            base_link,
            index_course_code,
            index_course_name,
            index_course_unit_name,
            index_course_unit_curricular_year,
            index_course_unit_code,
            index_course_unit_teachers,
            query_param_academic_year,
            query_param_semester,
            gop_group_id,
            board_group_id,
            pedagogic_group_id,
        } = school || {};
        return {
            id,
            code,
            name,
            linkWS: base_link,
            indexCode: index_course_code,
            indexName: index_course_name,
            indexNameUC: index_course_unit_name,
            indexYear: index_course_unit_curricular_year,
            indexCodeUC: index_course_unit_code,
            indexTeachers: index_course_unit_teachers,
            academicYearQueryParam: query_param_academic_year,
            semesterQueryParam: query_param_semester,
            gop: gop_group_id,
            board: board_group_id,
            pedagogic: pedagogic_group_id,
        };
    }, [school]);

    const onSubmit = ({
                          id, code,
                          name,
                          linkWS,
                          indexCode,
                          indexName,
                          indexNameUC,
                          indexYear,
                          indexCodeUC,
                          indexTeachers,
                          academicYearQueryParam,
                          semesterQueryParam,
                          gop,
                          board,
                          pedagogic,
                      }) => {
        setIsSaving(true);
        axios.patch(
            `/schools/${id}`, {
                code,
                name,
                base_link: linkWS,
                index_course_code: indexCode,
                index_course_name: indexName,
                index_course_unit_name: indexNameUC,
                index_course_unit_curricular_year: indexYear,
                index_course_unit_code: indexCodeUC,
                index_course_unit_teachers: indexTeachers,
                query_param_academic_year: academicYearQueryParam,
                query_param_semester: semesterQueryParam,
                gop_group_id: gop,
                board_group_id: board,
                pedagogic_group_id: pedagogic,
            },
        ).then((res) => {
            setIsSaving(false);
            if (res.status === 200) {
                toast('Escola atualizada com sucesso', successConfig);
            } else {
                toast('Ocorreu um erro ao gravar as alterações da escola!', errorConfig);
            }
        });
    };

    const panes = [
        {
            menuItem: 'Configuração das colunas',
            render: () => (
                <Tab.Pane>
                    <Message>
                        <Message.Header>Dicas de implementação</Message.Header>
                        <Message.Content>
                            Apenas o formato CSV é aceite pelo importador, por
                            isso, deverá seguir as normas de construção de um
                            CSV.
                        </Message.Content>
                        <br/>
                        <Message.Content>
                            O caracter utilizado para separação de colunas, é:
                            <strong>
                                <code>;</code>
                            </strong>
                        </Message.Content>
                        <br/>
                        <Message.Content>
                            Os índices (index) começam no número 0, por isso,
                            tenha em atenção este facto e faça a "conversão"
                            para o index correto.
                            <br/>
                            <strong>Exemplo:</strong>
                            {' '}
                            O nome da unidade
                            curricular é a segunda (2ª) coluna, então deveremos
                            converter para o index = 1, pois retiramos sempre 1
                            unidade ao número da ordem da coluna.
                        </Message.Content>
                    </Message>
                    <Form>
                        <Card fluid>
                            <Card.Content>
                                <Form.Group widths="equal">
                                    <Field name="indexCode">
                                        {({input: indexCodeInput}) => (
                                            <Form.Input label="Index coluna Código Curso"{...indexCodeInput}/>
                                        )}
                                    </Field>
                                    <Field name="indexName">
                                        {({input: indexNameInput}) => (
                                            <Form.Input label="Index coluna Nome Curso"{...indexNameInput}/>
                                        )}
                                    </Field>
                                    <Field name="indexCodeUC">
                                        {({input: indexCodeUCInput}) => (
                                            <Form.Input label="Index coluna Código Unidade Curricular"{...indexCodeUCInput}/>
                                        )}
                                    </Field>
                                </Form.Group>
                                <Form.Group widths="equal">
                                    <Field name="indexNameUC">
                                        {({input: indexNameUCInput}) => (
                                            <Form.Input label="Index coluna Nome Unidade Curricular"{...indexNameUCInput}/>
                                        )}
                                    </Field>
                                    <Field name="indexTeachers">
                                        {({input: indexTeachersInput}) => (
                                            <Form.Input label="Index coluna Professores do curso"{...indexTeachersInput}/>
                                        )}
                                    </Field>
                                    <Field name="indexYear">
                                        {({input: indexYearInput}) => (
                                            <Form.Input label="Index coluna Ano curricular da Unidade Curricular"{...indexYearInput}/>
                                        )}
                                    </Field>
                                </Form.Group>
                            </Card.Content>
                        </Card>
                    </Form>
                </Tab.Pane>
            ),
        },
        {
            menuItem: 'Configuração da queryString',
            render: () => (
                <Tab.Pane>
                    <Message>
                        <Message.Header>Dicas de implementação</Message.Header>
                        <Message.Content>
                            Sugere-se que as variáveis que recebem os dados
                            relativos ao ano letivo e ao semestre, sejam de
                            acordo com a lista seguinte:
                        </Message.Content>
                        <Message.List
                            items={[
                                'anoletivo -> Pronto a receber no formato: 202122',
                                'periodo -> Pronto a receber no formato (S1/S2)',
                            ]}
                        />
                        <Message.Content>
                            Ainda assim, poderá querer escolher outros nomes
                            para estes campos, no formulário abaixo.
                        </Message.Content>
                        <Message.Content>
                            <strong>
                                No final, o URL deverá ser semelhante ao
                                seguinte:
                                {' '}
                                <i>
                                    http://www.dei.estg.ipleiria.pt/intranet/horarios/ws/inscricoes/cursos_ucs.php?anoletivo=202122&periodo=S1
                                </i>
                            </strong>
                        </Message.Content>
                    </Message>
                    <Form>
                        <Card fluid>
                            <Card.Content>
                                <Form.Group widths="equal">
                                    <Field name="academicYearQueryParam">
                                        {({input: anoletivoInput}) => (
                                            <Form.Input label="Nome do parâmetro para o ano letivo"{...anoletivoInput}/>
                                        )}
                                    </Field>
                                    <Field name="semesterQueryParam">
                                        {({input: semestreInput}) => (
                                            <Form.Input label="Nome do parâmetro para o semestre"{...semestreInput}/>
                                        )}
                                    </Field>
                                </Form.Group>
                            </Card.Content>
                        </Card>
                    </Form>
                </Tab.Pane>
            ),
        },
    ];

    return (
        <Container style={{marginTop: '2em'}}>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues}
                render={({handleSubmit}) => (
                    <Form>
                        <Card fluid>
                            {loading && (
                                <Dimmer active inverted>
                                    <Loader indeterminate>
                                        A carregar a escola
                                    </Loader>
                                </Dimmer>
                            )}
                            <Card.Content header={`${isEditMode ? 'Editar' : 'Nova'} Escola`}/>
                            <Card.Content>
                                <Form.Group widths="equal">
                                    <Field name="code">
                                        {({input: codeInput}) => (
                                            <Form.Input label="Código"{...codeInput}/>
                                        )}
                                    </Field>
                                    <Field name="name">
                                        {({input: nameInput}) => (
                                            <Form.Input label="Nome"{...nameInput}/>
                                        )}
                                    </Field>
                                </Form.Group>
                                <Form.Group>
                                    <Field name="gop">
                                        {({input: gopGroup}) => (
                                            <Form.Dropdown
                                                options={groups}
                                                selection
                                                label="Grupo GOP da escola"
                                                {...gopGroup}
                                                onChange={(e, {value}) => gopGroup.onChange(value)}
                                                clearable
                                                search
                                            />
                                        )}
                                    </Field>
                                    <Field name="board">
                                        {({input: boardGroup}) => (
                                            <Form.Dropdown
                                                options={groups}
                                                selection
                                                label="Grupo Direção da escola"
                                                {...boardGroup}
                                                onChange={(e, {value}) => boardGroup.onChange(value)}
                                                clearable
                                                search
                                            />
                                        )}
                                    </Field>
                                    <Field name="pedagogic">
                                        {({input: pedagogicGroup}) => (
                                            <Form.Dropdown
                                                options={groups}
                                                selection
                                                label="Grupo Pedagógico da escola"
                                                {...pedagogicGroup}
                                                onChange={(e, {value}) => pedagogicGroup.onChange(value)}
                                                clearable
                                                search
                                            />
                                        )}
                                    </Field>
                                </Form.Group>
                                <Form.Group widths="equal">
                                    <Field name="linkWS">
                                        {({input: linkWSInput}) => (
                                            <Form.Input
                                                label="Link do Webservice dos Cursos"
                                                placeholder="Exemplo: http://www.dei.estg.ipleiria.pt/intranet/horarios/ws/inscricoes/cursos_ucs.php"
                                                {...linkWSInput}
                                            />
                                        )}
                                    </Field>
                                </Form.Group>
                                <Tab panes={panes} renderActiveOnly/>
                            </Card.Content>
                            <Card.Content>
                                <Link to="/escola">
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

export default NewEscola;
