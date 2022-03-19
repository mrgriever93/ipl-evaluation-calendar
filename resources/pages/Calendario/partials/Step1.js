import React from 'react';
import {Field, useField} from 'react-final-form';
import {DateInput} from 'semantic-ui-calendar-react-yz';
import {Grid, Button, Card, Form} from 'semantic-ui-react';

const Step1 = ({semesterList, setActiveSemester, activeSemester}) => {
    const { input: seasons } = useField('step1.seasons');
    const clearSeasons = () => seasons.onChange(null);

    return (
        <Grid padded>
            <Grid.Row>
                <Field name="step1.semester" key={'step1_field_btn'}>
                    {({input: semesterInput}) => (
                        <Button.Group>
                            {semesterList.map((semester, index) => (
                                <>
                                    <Button positive={activeSemester === index} key={'step1_button_' + index}
                                        onClick={() => {
                                            clearSeasons();
                                            semesterInput.onChange(
                                                index + 1,
                                            );
                                            setActiveSemester(index);
                                        }}>
                                        {semester.name}
                                    </Button>
                                    {index + 1 < semesterList.length && (<Button.Or/>)}
                                </>
                            ))}
                        </Button.Group>
                    )}
                </Field>
            </Grid.Row>
            <Grid.Row>
                <Card.Content>
                    <Card.Group itemsPerRow={semesterList[activeSemester]?.length}>
                        {semesterList[activeSemester]?.epochs?.map((epoch, index) => (
                            <Field name={`step1.seasons.${epoch?.name}_${epoch?.id}.start_date`} key={'step1_field_start' + index}>
                                {({input: startDateInput}) => (
                                    <Field name={`step1.seasons.${epoch?.name}_${epoch?.id}.end_date`} key={'step1_field_end' + index}>
                                        {({input: endDateInput}) => (
                                            <Card raised>
                                                <Card.Content header={epoch.name}/>
                                                <Card.Content>
                                                    <Form.Field>
                                                        <DateInput name="date" iconPosition="left" label="Data de Ínicio"
                                                                   placeholder="Data de Ínicio" value={ startDateInput.value }
                                                                   {...startDateInput} closable
                                                                    onChange={(evt, {value},) => {
                                                                        startDateInput.onChange(
                                                                            value,
                                                                        );
                                                                    }}
                                                        />
                                                    </Form.Field>
                                                </Card.Content>
                                                <Card.Content>
                                                    <Form.Field>
                                                        <DateInput name="date" placeholder="Data de Fim"
                                                            iconPosition="left" label="Data de Fim" closable
                                                            {...endDateInput}
                                                            value={
                                                                endDateInput.value
                                                            }
                                                            onChange={(evt, {value},) => {
                                                                endDateInput.onChange(
                                                                    value,
                                                                );
                                                            }}
                                                        />
                                                    </Form.Field>
                                                </Card.Content>
                                            </Card>
                                        )}
                                    </Field>
                                )}
                            </Field>
                        ))}
                    </Card.Group>
                </Card.Content>
            </Grid.Row>
        </Grid>
    );
};

export default Step1;
