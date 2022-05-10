import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Container, Form, Icon, Message, Step} from 'semantic-ui-react';
import {Form as FinalForm} from 'react-final-form';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
import Step1 from './new/Step1';
import Step2 from './new/Step2';
import Step3 from './new/Step3';
import {useTranslation} from "react-i18next";

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
        semester: "first_semester",
    },
    step2: {
        interruptions: {},
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
    const { t } = useTranslation();
    const [activeSemester, setActiveSemester] = useState(0);
    const [additionalInterruptions, setAdditionalInterruptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allCourses, setAllCourses] = useState(true);
    const [courses, setCourses] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [maxStep, setMaxStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);
    // step 2
    const [firstYear, setFirstYear] = useState(0);
    const [lastYear, setLastYear] = useState(0);
    const [initialDate, setInitialDate] = useState(0);
    const [finalDate, setFinalDate] = useState(0);
    const [holidaysList, setHolidaysList] = useState([]);


    const addCourse = (course) => {
        setCourses([...courses, {...course}]);
    };

    const removeCourse = (id) => {
        setCourses([...courses.filter((course) => course.id !== id)]);
    };

    const validateStep1 = (values) => {
        let isValid = false;
        // Check for the semester
        const hasSemester = values.semester !== "";
        // Check for every type of dates and if has start and end
        const hasEpochs = values.hasOwnProperty("seasons") && values.seasons && Object.keys(values.seasons).length > 0;
        let hasAllDates = true;
        if(hasEpochs) {
            const keys = Object.keys(values.seasons);
            let initialYear = 0;
            let finalYear = 0;
            let initialDate = 0;
            let finalDate = 0;
            keys.forEach((key, index) => {
                if(!values.seasons[key].hasOwnProperty("start_date") || !values.seasons[key].hasOwnProperty("end_date")){
                    hasAllDates = false;
                } else {
                    let startDate = (values.seasons[key].start_date).split("-");
                    let compStartDate = new Date(startDate[2], startDate[1], startDate[0]);
                    if(initialYear > compStartDate.getFullYear() || initialYear === 0) {
                        initialYear = compStartDate.getFullYear();
                        initialDate = compStartDate;
                    }
                    let endDate = (values.seasons[key].end_date).split("-");
                    let compEndDate = new Date(endDate[2], endDate[1], endDate[0]);
                    if(finalYear < compEndDate.getFullYear() || finalYear === 0) {
                        finalYear = compEndDate.getFullYear();
                        finalDate = compEndDate;
                    }
                }
            });
            setFirstYear(initialYear);
            setLastYear(finalYear);
            setInitialDate(initialDate);
            setFinalDate(finalDate);
        }
        let errorTexts = [];
        if(!hasSemester){
            errorTexts.push("Tem de selecionar pelo menos um semestre!");
        }
        if(!hasEpochs){
            errorTexts.push("Tem de adicionar as datas para o calendario");
        }
        if(!hasAllDates){
            errorTexts.push("Tem de preencher todas as datas de inicio e fim dos periodos");
        }
        isValid = hasSemester && hasEpochs && hasAllDates;
        setErrorMessages(errorTexts);
        if(!isValid){
            // clear next steps because of changes
            setCompletedSteps([...completedSteps.filter((step) => step < 1)]);
            setMaxStep(1);
        }

        return isValid;
    }

    const validateStep2 = (values) => {
        let isValid = false;
        const hasInterruptions = values.hasOwnProperty("additional_interruptions") && values.additional_interruptions && values.additional_interruptions.length > 0;
        let hasAllDates = true;
        let hasAllInterruptionsTypes = true;
        let hasAllMandatoryInterruptions = true;
        if(hasInterruptions) {
            const keys = Object.keys(values.additional_interruptions);
            keys.forEach((key, index) => {
                if(!values.additional_interruptions[key].hasOwnProperty("start_date") || !values.additional_interruptions[key].hasOwnProperty("end_date")){
                    hasAllDates = false;
                }
                if(!values.additional_interruptions[key].hasOwnProperty("interruption_type_id")){
                    hasAllInterruptionsTypes = false;
                }
                // TODO finalize all mandatory interruptions
                //if(values.additional_interruptions[key].hasOwnProperty("interruption_type_id") || values.additional_interruptions[key].interruption_type_id.includes(mandatoryInterruptions)){
                //    hasAllMandatoryInterruptions = false;
                //}
            });
        }

        let errorTexts = [];
        if(!hasInterruptions || !hasAllMandatoryInterruptions){
            errorTexts.push("Tem de selecionar as interrupcoes mandatorias pelo menos!");
        }
        if(!hasAllDates){
            errorTexts.push("Tem de preencher todas as datas de inicio e fim das interrupcoes");
        }
        if(!hasAllInterruptionsTypes){
            errorTexts.push("Tem de selecionar os tipos das interrupcoes!");
        }
        isValid = hasInterruptions && hasAllDates && hasAllInterruptionsTypes && hasAllMandatoryInterruptions;
        setErrorMessages(errorTexts);
        if(!isValid){
            // clear next steps because of changes
            setCompletedSteps([...completedSteps.filter((step) => step < 2)]);
            setMaxStep(2);
        }

        return isValid;
    }

    const validateStep3 = (values) => {
        let isValid = false;
        // Check for the semester
        const hasAllCourses = values.allCourses;
        // Check if there is any course
        const hasAnyCourse = values.courses && values.courses.length > 0;

        let errorTexts = [];
        if(!hasAllCourses && !hasAnyCourse){
            errorTexts.push("Tem de adicionar pelo menos 1 curso");
        }
        isValid = hasAllCourses || hasAnyCourse;
        setErrorMessages(errorTexts);
        return isValid;
    }

    const nextStep = (stepNumber, values) => {
        let stepValid = false;

        if(stepNumber - 1 === 1){
            stepValid = validateStep1(values.step1);
        } else if(stepNumber - 1 === 2){
            stepValid = validateStep2(values.step2);
        } else if(stepNumber - 1 === 3){
            stepValid = validateStep3(values.step3);
        }
        if(stepValid){
            setCurrentStep(stepNumber);
            if(stepNumber > maxStep) {
                setMaxStep(stepNumber);
                setCompletedSteps([...completedSteps, stepNumber - 1]);
            }
        }
    };

    const stepHeader = (step) => {
        if(step <= maxStep){
            setCurrentStep(step);
        }
    }

    const onSubmit = (values) => {
        if(validateStep3(values.step3)) {
            setIsSaving(true);
            const body = {
                semester: values.step1.semester,
                is_all_courses: values.step3.allCourses,
                ...(values.step3.allCourses ? null : {courses: [...values.step3.courses.map((x) => x.id)]}),
                epochs: [
                    ...Object.keys(values.step1.seasons).map((key) => ({
                        code: key.split('__')[0],
                        start_date: moment(values.step1.seasons[key].start_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                        end_date: moment(values.step1.seasons[key].end_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                    })),
                ],
                holidays: holidaysList,
                interruptions: [
                    ...(values.step2.additional_interruptions?.map(({interruption_type_id, start_date, end_date}) => ({
                            interruption_type_id,
                            start_date: moment(start_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                            end_date: moment(end_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                        }),
                    ) || []),
                ],
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
                    let errors = [];
                    Object.keys(response.response.data.errors).map((key) => errors.push(...response.response.data.errors[key]));
                    setErrorMessages(errors);
                    SweetAlertComponent.fire({
                        title: 'Erro!',
                        text: `Ocorreu um erro ao tentar criar o${pluralOrSingularForm} calendário${pluralOrSingularForm} de avaliação`,
                        icon: 'error',
                        confirmButtonColor: 'red',
                    });
                }
            });
        }
    };

    const addNewInterruption = () => {
        setAdditionalInterruptions((current) => [...current, current.length]);
    }
    const getHolidays = (holidays) => {
        setHolidaysList(holidays);
    }

    return (
        <Container>
            <FinalForm onSubmit={onSubmit} initialValues={formInitialValues} key={'form_new_calendar'} render={({handleSubmit, values}) => (
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
                        { errorMessages.length > 0 && (
                            <Card.Content>
                                <Message warning>
                                    <Message.Header>{ t('Os seguintes detalhes do Curso precisam da sua atenção:') }</Message.Header>
                                    <Message.List>
                                        { errorMessages.map((message, index) => (
                                            <Message.Item key={index}>{ t(message) }</Message.Item>
                                        ))}
                                    </Message.List>
                                </Message>
                            </Card.Content>
                        )}
                        <Card.Content>
                            <Form autoComplete="off">
                                <div className={currentStep === 1 ? "display-block" : "display-none"}>
                                    <Step1 activeSemester={activeSemester} setActiveSemester={setActiveSemester} />
                                </div>
                                <div className={currentStep === 2 ? "display-block" : "display-none"}>
                                    <Step2 holidays={getHolidays} firstYear={firstYear} lastYear={lastYear} finalDate={finalDate} initialDate={initialDate} isActive={currentStep === 2} additionalInterruptions={additionalInterruptions} setAdditionalInterruptions={setAdditionalInterruptions} />
                                </div>
                                <div className={currentStep === 3 ? "display-block" : "display-none"}>
                                    <Step3 allCourses={allCourses} setAllCourses={setAllCourses} courses={courses} removeCourse={removeCourse} addCourse={addCourse} loading={loading} setLoading={setLoading}/>
                                </div>
                            </Form>
                        </Card.Content>
                        <Card.Content extra>
                            {currentStep === 2 && (
                                <Button icon labelPosition="left" color="teal" floated="left" onClick={addNewInterruption}>
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
                                <Button icon labelPosition="left" color="green" floated="right" onClick={() => setCurrentStep(currentStep - 1)}>
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