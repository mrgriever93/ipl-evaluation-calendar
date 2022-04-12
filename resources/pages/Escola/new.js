import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Container, Dimmer, Form, Icon, Loader, Tab, Message } from 'semantic-ui-react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useParams, useNavigate} from "react-router-dom";
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
    const [school, setSchool] = useState({});
    const isEditMode = !_.isEmpty(school);

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (paramsId) {
            axios.get(`/schools/${paramsId}`).then((response) => {
                setSchool(response?.data?.data);
                setLoading(false);
            });

            axios.get('/user-group').then((res) => {
                if (res.status === 200) {
                    let groupsMap = res.data.data.map((group) => ({
                        key: group.id,
                        value: group.id,
                        text: group.description,
                    }));
                    setGroups(groupsMap);
                }
            });
        }
    }, [paramsId]);

    useEffect(() => {
        if (!loading && paramsId && !school) {
            navigate('/escola');
        }
    }, [paramsId, loading, school, navigate]);

    const initialValues = useMemo(() => {
        const {
            id,
            code,
            name_pt,
            name_en,
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
            name_pt,
            name_en,
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
        };
    }, [school]);

    const onSubmit = ({ id, code, name_pt, name_en,
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
            pedagogic_group_id }
            ) => {
        setIsSaving(true);
        axios.patch(`/schools/${id}`, {
            code,
            name_pt,
            name_en,
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
            pedagogic_group_id }).then((res) => {
                
            setIsSaving(false);
            if (res.status === 200) {
                toast(t('Escola atualizada com sucesso'), successConfig);
            }
            else if (res.status === 201) {
                toast(t('Escola criada com sucesso'), successConfig);
            }
            else {
                toast(t('Existiu um problema ao gravar as alterações!'), errorConfig);
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
                                    <Field name="index_course_code">
                                        {({input: index_course_codeInput}) => (
                                            <Form.Input label="Index coluna Código Curso" {...index_course_codeInput}/>
                                        )}
                                    </Field>
                                    <Field name="index_course_name">
                                        {({input: index_course_nameInput}) => (
                                            <Form.Input label="Index coluna Nome Curso" {...index_course_nameInput}/>
                                        )}
                                    </Field>
                                    <Field name="index_course_unit_code">
                                        {({input: index_course_unit_codeInput}) => (
                                            <Form.Input label="Index coluna Código Unidade Curricular" {...index_course_unit_codeInput}/>
                                        )}
                                    </Field>
                                </Form.Group>
                                <Form.Group widths="equal">
                                    <Field name="index_course_unit_name">
                                        {({input: index_course_unit_nameInput}) => (
                                            <Form.Input label="Index coluna Nome Unidade Curricular" {...index_course_unit_nameInput}/>
                                        )}
                                    </Field>
                                    <Field name="index_course_unit_teachers">
                                        {({input: index_course_unit_teachersInput}) => (
                                            <Form.Input label="Index coluna Professores do curso" {...index_course_unit_teachersInput}/>
                                        )}
                                    </Field>
                                    <Field name="index_course_unit_curricular_year">
                                        {({input: index_course_unit_curricular_yearInput}) => (
                                            <Form.Input label="Index coluna Ano curricular da Unidade Curricular" {...index_course_unit_curricular_yearInput}/>
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
                                    <Field name="query_param_academic_year">
                                        {({input: query_param_academic_yearInput}) => (
                                            <Form.Input label="Nome do parâmetro para o ano letivo" {...query_param_academic_yearInput}/>
                                        )}
                                    </Field>
                                    <Field name="query_param_semester">
                                        {({input: query_param_semesterInput}) => (
                                            <Form.Input label="Nome do parâmetro para o semestre" {...query_param_semesterInput}/>
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
        <Container>
            <div className="margin-bottom-s">
                <Link to="/escola"> <Icon name="angle left" /> {t('Voltar à lista')}</Link>
            </div>
            <FinalForm onSubmit={onSubmit} initialValues={initialValues} render={({ handleSubmit }) => (
                <Form>
                    <Card fluid>
                        { loading && (
                            <Dimmer active inverted>
                                <Loader indeterminate>{t('A carregar dados')}</Loader>
                            </Dimmer>
                        )}
                        <Card.Content header={`${ isEditMode ? t('Editar Escola') : t('Nova Escola') }`} />
                        <Card.Content>
                            <Form.Group widths="equal">
                                <Field name="code">
                                    {( { input: codeInput }) => (
                                        <Form.Input label={t('Nome')} {...codeInput} />
                                    )}
                                </Field>
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
                            <Form.Group widths="equal" style={{ marginTop: 'var(--space-m)' }}>
                                <Field name="gop_group_id">
                                    {({input: gop_group_idInput}) => (
                                        <Form.Dropdown options={groups} selection clearable search
                                        {...gop_group_idInput}
                                        onChange={(e, {value}) => gop_group_idInput.onChange(value)}
                                        label="Grupo GOP da escola" />
                                    )}
                                </Field>
                                <Field name="board_group_id">
                                    {({input: board_group_idInput}) => (
                                        <Form.Dropdown options={groups} selection clearable search
                                            {...board_group_idInput}
                                            onChange={(e, {value}) => board_group_idInput.onChange(value)}
                                            label="Grupo Direção da escola" />
                                    )}
                                </Field>
                                <Field name="pedagogic_group_id">
                                    {({input: pedagogic_group_idInput}) => (
                                        <Form.Dropdown options={groups} selection clearable search
                                            {...pedagogic_group_idInput}
                                            onChange={(e, {value}) => pedagogic_group_idInput.onChange(value)}
                                            label="Grupo Pedagógico da escola" />
                                    )}
                                </Field>
                            </Form.Group>
                            <Form.Group widths="equal" style={{ marginTop: 'var(--space-m)' }}>
                                <Field name="base_link">
                                    {({input: base_linkInput}) => (
                                        <Form.Input placeholder="Exemplo: http://www.dei.estg.ipleiria.pt/intranet/horarios/ws/inscricoes/cursos_ucs.php"
                                            {...base_linkInput}
                                            label="Link do Webservice dos Cursos" />
                                    )}
                                </Field>
                            </Form.Group>
                        </Card.Content>
                        <Card.Content>
                            <Button onClick={handleSubmit} color="green" icon labelPosition="left" floated="right" loading={isSaving} >
                                <Icon name={isEditMode ? 'save' : 'plus'} /> {isEditMode ? t('Guardar') : t('Criar')}
                            </Button> 
                        </Card.Content>
                    </Card>
                    { !loading && (
                        <Tab panes={panes} renderActiveOnly/>
                    )}                    
                </Form>
            )} />
        </Container>
    );
};

export default New;