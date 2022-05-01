import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Container, Form, Icon, Step} from 'semantic-ui-react';
import {Form as FinalForm} from 'react-final-form';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
import Step1 from './partials/Step1';
import Step2 from './partials/Step2';
import Step3 from './partials/Step3';

const SEMESTER = {
    FIRST: "1",
    SECOND: "2",
    SPECIAL: "3",
};

const SweetAlertComponent = withReactContent(Swal);

const stepsData = [
    {
        number: 1,
        icon: 'calendar alternate outline',
        title: 'Época',
        description: 'Selecione o semestre do calendário a criar, assim como as datas das épocas.'
    },
    {
        number: 2,
        icon: 'pause',
        title: 'Interrupções Letivas',
        description: 'Insira todas as informações das Interrupções letivas.'
    },
    {
        number: 3,
        icon: 'book',
        title: 'Cursos',
        description: 'Insira os cursos para os quais deseja criar o calendário.'
    }
];

const formInitialValues = {
    step1: {
        semester: SEMESTER.FIRST,
    },
    step2: {
        interruptions: {},
        importHolidays: true,
    },
    step3: {
        allCourses: true,
        paginationInfo: {
            current_page: 1,
            last_page: 1,
        }
    },
};

const NewCalendar = () => {
    const history = useNavigate();
    const [activeSemester, setActiveSemester] = useState(0);
    const [additionalInterruptions, setAdditionalInterruptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allCourses, setAllCourses] = useState(true);
    const [courses, setCourses] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [maxStep, setMaxStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    const addCourse = (course) => {
        setCourses([...courses, {...course}]);
    };

    const removeCourse = (id) => {
        setCourses([...courses.filter((course) => course.id !== id)]);
    };
    const validateStep = (step, values) => {
        if(step === 1){
            console.log( values.step1);
            const step1 = values.step1;
            return step1.hasOwnProperty("seasons") && Object.keys(step1.seasons).length > 0 && step1.semester !== "";
        }
        if(step === 2){
            console.log(values.step2);
            // TODO check if interruptions are valid
            return false;
        }
        if(step === 3){
            console.log(values.step3);
            // TODO check if courses are valid
            return true;
        }
    }
    const stepHeader = (step) => {
        if(step <= maxStep){
            setCurrentStep(step);
        }
    }
    const previousStep = (step) => {
        setCurrentStep(step);
    }

    const nextStep = (stepNumber, values) => {
        if(validateStep(stepNumber - 1, values)){
            setCurrentStep(stepNumber);
            if(stepNumber > maxStep) {
                setMaxStep(stepNumber);
                setCompletedSteps([...completedSteps, stepNumber - 1]);
            }
        }
    };

    const onSubmit = (values) => {
        setIsSaving(true);
        const body = {
            semester: values.step1.semester,
            is_all_courses: values.step3.allCourses,
            ...(values.step3.allCourses ? null : {courses: [...values.step3.courses.map((x) => x.id)]}),
            epochs: [
                ...Object.keys(values.step1.seasons).map((key) => ({
                    name: key.split('_')[0],
                    start_date: moment(values.step1.seasons[key].start_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    end_date: moment(values.step1.seasons[key].end_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    type: parseInt(key.split('_')[1]),
                })),
            ],
            interruptions: [
                ...(values.step2.additional_interruptions?.map(({interruption_type_id, start_date, end_date}) => ({
                        interruption_type_id,
                        start_date: moment(start_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                        end_date: moment(end_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    }),
                ) || []),
            ],
            import_holidays: values.step2.importHolidays,
        };

        axios.post('/calendar', body).then((response) => {
            setIsSaving(false);
            const pluralOrSingularForm = values.step3.allCourses || values.step3.courses?.length > 1 ? 's' : '';
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

    return (
        <Container>
            <FinalForm onSubmit={onSubmit} initialValues={formInitialValues}  key={'form_new_calendar'} render={({handleSubmit, values}) => (
                <div>
                    <Step.Group widths={stepsData.length}>
                        {stepsData.map((step) => (
                            <Step link active={currentStep === step.number} disabled={maxStep < step.number} key={'step_' + step.number} completed={completedSteps.includes(step.number)} onClick={() => stepHeader(step.number)}>
                                <Icon name={step.icon}/>
                                <Step.Content>
                                    <Step.Title>{step.title}</Step.Title>
                                    <Step.Description>{step.description}</Step.Description>
                                </Step.Content>
                            </Step>
                        ))}
                    </Step.Group>
                    <Card fluid>
                        <Card.Content header="Novo Calendário"/>
                        <Card.Content>
                            <Card.Content>
                                <Form autoComplete="off">
                                    <div className={currentStep === 1 ? "display-block" : "display-none"}>
                                        <Step1 activeSemester={activeSemester} setActiveSemester={setActiveSemester} />
                                    </div>
                                    <div className={currentStep === 2 ? "display-block" : "display-none"}>
                                        <Step2 additionalInterruptions={additionalInterruptions} setAdditionalInterruptions={setAdditionalInterruptions} />
                                    </div>
                                    <div className={currentStep === 3 ? "display-block" : "display-none"}>
                                        <Step3 allCourses={allCourses} setAllCourses={setAllCourses} courses={courses} removeCourse={removeCourse} addCourse={addCourse} loading={loading} setLoading={setLoading}/>
                                    </div>
                                </Form>
                            </Card.Content>
                        </Card.Content>
                        <Card.Content extra>
                            {currentStep === 2 && (
                                <Button icon labelPosition="left" color="teal" floated="left" onClick={() => {setAdditionalInterruptions((current) => [...current, current.length]);}}>
                                    Adicionar interrupção
                                    <Icon name="plus"/>
                                </Button>
                            )}
                            {currentStep === 3 && (
                                <Button icon labelPosition="left" color="blue" floated="right" loading={isSaving} onClick={handleSubmit}>
                                    Criar Calendário
                                    <Icon name="send"/>
                                </Button>
                            )}
                            {currentStep < 3 && (
                                <Button icon labelPosition="right" color="green" floated="right" onClick={() => nextStep(currentStep + 1, values)}>
                                    Seguinte <Icon name="right arrow"/>
                                </Button>
                            )}
                            {currentStep > 1 && (
                                <Button icon labelPosition="left" color="green" floated="right" onClick={() => previousStep(currentStep - 1)}>
                                    Anterior
                                    <Icon name="left arrow"/>
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                </div>
            )} />
        </Container>
    );
};

export default NewCalendar;
