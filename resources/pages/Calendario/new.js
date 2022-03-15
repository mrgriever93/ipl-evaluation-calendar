import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Button, Card, Container, Form, Icon, Step,
} from 'semantic-ui-react';
import {Form as FinalForm, useField} from 'react-final-form';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
import Step1 from './partials/Step1';
import Step2 from './partials/Step2';
import Step3 from './partials/Step3';
import Step4 from './partials/Step4';
import {SEMESTER} from '../../components/utils/constants';

const SweetAlertComponent = withReactContent(Swal);

const stepsData = [
    {
        number: 1,
        icon: 'calendar alternate outline',
        title: 'Época',
        description:
            'Selecione o semestre do calendário a criar, assim como as datas das épocas.',
    },
    {
        number: 2,
        icon: 'pause',
        title: 'Interrupções Letivas',
        description: 'Insira todas as informações das Interrupções letivas.',
    },
    {
        number: 3,
        icon: 'book',
        title: 'Cursos',
        description:
            'Insira os cursos para os quais deseja criar o calendário.',
    },
    {
        number: 4,
        icon: 'settings',
        title: 'Extras',
        description: 'Configurações adicionais.',
    },
];

const formInitialValues = {
    step1: {
        semester: SEMESTER.FIRST,
    },
    step2: {
        interruptions: {},
    },
    step3: {
        allCourses: true,
    },
    step4: {
        importHolidays: true,
    },
};

const New = () => {
    const history = useNavigate();
    const [activeSemester, setActiveSemester] = useState(0);
    const [semesterList, setSemesterList] = useState([]);
    const [additionalInterruptions, setAdditionalInterruptions] = useState([]);
    const [interruptionTypes, setInterruptionTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allCourses, setAllCourses] = useState(true);
    const [courses, setCourses] = useState([]);
    const [courseList, setCourseList] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [visitedSteps, setVisitedSteps] = useState([1]);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [courseSearch, setCourseSearch] = useState();

    useEffect(() => {
        axios.get('/semesters').then((response) => {
            if (response.status >= 200 && response.status < 300) {
                setSemesterList(response.data.data);
            }
        });

        axios.get('/interruption-types').then((response) => {
            if (response.status === 200) {
                setInterruptionTypes(response.data.data?.map(({id, description}) => ({
                    key: id,
                    value: id,
                    text: description,
                })));
            }
        });
    }, []);

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseSearch]);

    const fetchCourses = (page = 1) => {
        setLoading(true);
        axios.get(`/courses?page=${page}${courseSearch ? `&search=${courseSearch}` : ''}`).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                setCourseList(response.data.data);
                setPaginationInfo(response.data.meta);
            }
            setLoading(false);
        });
    };

    const loadCourses = (evt, {activePage}) => fetchCourses(activePage);

    const addCourse = (course) => {
        setCourses([...courses, {...course}]);
    };

    const removeCourse = (id) => {
        setCourses([...courses.filter((course) => course.id !== id)]);
    };

    const handleStepChange = (stepNumber) => {
        setVisitedSteps([...visitedSteps, stepNumber]);
        setCurrentStep(stepNumber);
    };

    const onSubmit = (values) => {
        setIsSaving(true);
        const body = {
            import_holidays: values.step4.importHolidays,
            semester: values.step1.semester,
            is_all_courses: values.step3.allCourses,
            ...(values.step3.allCourses
                ? null
                : {courses: [...values.step3.courses.map((x) => x.id)]}),
            epochs: [
                ...Object.keys(values.step1.seasons).map((key) => ({
                    name: key.split('_')[0],
                    start_date: moment(values.step1.seasons[key].start_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    end_date: moment(values.step1.seasons[key].end_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    type: parseInt(key.split('_')[1]),
                })),
            ],
            interruptions: [
                ...(values.step2.additional_interruptions?.map(
                    ({interruption_type_id, start_date, end_date}) => ({
                        interruption_type_id,
                        start_date: moment(start_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                        end_date: moment(end_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    }),
                ) || []),
            ],
        };
        axios.post('/calendar', body).then((response) => {
            setIsSaving(false);
            const pluralOrSingularForm = values.step3.allCourses || values.step3.courses?.length > 1
                ? 's'
                : '';
            if (response.status === 201) {
                SweetAlertComponent.fire({
                    title: 'Sucesso!',
                    text: `Calendário${pluralOrSingularForm} criado${pluralOrSingularForm} com sucesso!`,
                    icon: 'success',
                    confirmButtonColor: '#21ba45',
                });
                history('/calendario');
            } else {
                SweetAlertComponent.fire({
                    title: 'Erro!',
                    text: `Ocorreu um erro ao tentar criar o${pluralOrSingularForm} calendário${pluralOrSingularForm} de avaliação`,
                    icon: 'error',
                    confirmButtonColor: 'red',
                });
            }
        });
    };

    const onCourseSearch = (value) => {
        setCourseSearch(value);
    };

    return (
        <Container style={{marginTop: '2em'}}>
            <FinalForm
                onSubmit={onSubmit}
                initialValues={formInitialValues}
                render={({handleSubmit}) => (
                    <Card fluid>
                        <Card.Content header="Novo Calendário"/>
                        <Card.Content>
                            <Step.Group widths={stepsData.length}>
                                {stepsData.map((step) => (
                                    <Step
                                        link
                                        active={currentStep === step.number}
                                        completed={completedSteps.includes(
                                            step.number,
                                        )}
                                        onClick={() => setCurrentStep(step.number)}
                                    >
                                        <Icon name={step.icon}/>
                                        <Step.Content>
                                            <Step.Title>
                                                {step.title}
                                            </Step.Title>
                                            <Step.Description>
                                                {step.description}
                                            </Step.Description>
                                        </Step.Content>
                                    </Step>
                                ))}
                            </Step.Group>
                            <Card.Content>
                                <Form autocomplete="off">
                                    {currentStep === 1 ? (
                                        <Step1
                                            activeSemester={activeSemester}
                                            setActiveSemester={setActiveSemester}
                                            semesterList={semesterList}
                                        />
                                    ) : currentStep === 2 ? (
                                        <Step2
                                            additionalInterruptions={additionalInterruptions}
                                            setAdditionalInterruptions={setAdditionalInterruptions}
                                            interruptionTypes={interruptionTypes}
                                        />
                                    ) : currentStep === 3 ? (
                                        <Step3
                                            allCourses={allCourses}
                                            setCourseList={setCourseList}
                                            setAllCourses={setAllCourses}
                                            courses={courses}
                                            removeCourse={removeCourse}
                                            courseList={courseList}
                                            addCourse={addCourse}
                                            loadCourses={loadCourses}
                                            loading={loading}
                                            setLoading={setLoading}
                                            paginationInfo={paginationInfo}
                                            setPaginationInfo={setPaginationInfo}
                                            onCourseSearch={onCourseSearch}
                                        />
                                    ) : (
                                        <Step4/>
                                    )}
                                </Form>
                            </Card.Content>
                        </Card.Content>
                        <Card.Content extra>
                            {currentStep === 2 && (
                                <Button
                                    onClick={() => {
                                        setAdditionalInterruptions((current) => [...current, current.length]);
                                    }}
                                    icon
                                    labelPosition="left"
                                    color="teal"
                                    floated="left"
                                >
                                    Adicionar interrupção
                                    <Icon name="plus"/>
                                </Button>
                            )}
                            {currentStep === 4 && (
                                <Button
                                    onClick={handleSubmit}
                                    icon
                                    labelPosition="left"
                                    color="blue"
                                    floated="right"
                                    loading={isSaving}
                                >
                                    Criar Calendário
                                    <Icon name="send"/>
                                </Button>
                            )}
                            {currentStep < 4 && (
                                <Button
                                    onClick={() => handleStepChange(currentStep + 1)}
                                    icon
                                    labelPosition="right"
                                    color="green"
                                    floated="right"
                                >
                                    Seguinte
                                    <Icon name="right arrow"/>
                                </Button>
                            )}
                            {currentStep > 1 && (
                                <Button
                                    onClick={() => handleStepChange(currentStep - 1)}
                                    icon
                                    labelPosition="left"
                                    color="green"
                                    floated="right"
                                >
                                    Anterior
                                    <Icon name="left arrow"/>
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                )}
            />
        </Container>
    );
};

export default New;
