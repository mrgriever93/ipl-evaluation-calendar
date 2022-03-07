import React, { useEffect, useState } from 'react';
import { Field, useField } from 'react-final-form';
import { DateInput } from 'semantic-ui-calendar-react-yz';
import {
  Grid, Button, Card, Form,
} from 'semantic-ui-react';
import axios from 'axios';

const Step1 = ({ semesterList, setActiveSemester, activeSemester }) => {
  const {
    input: seasons,
  } = useField('step1.seasons');
  const clearSeasons = () => seasons.onChange(null);

  return (
    <Grid padded>
      <Grid.Row>
        <Field name="step1.semester">
          {({ input: semesterInput }) => (
            <Button.Group>
              {semesterList.map((semester, index) => (
                <>
                  <Button
                    onClick={() => {
                      clearSeasons();
                      semesterInput.onChange(
                        index + 1,
                      );
                      setActiveSemester(index);
                    }}
                    positive={activeSemester === index}
                  >
                    {semester.name}
                  </Button>
                  {index + 1 < semesterList.length && (
                  <Button.Or />
                  )}
                </>
              ))}
            </Button.Group>
          )}
        </Field>
      </Grid.Row>
      <Grid.Row>
        <Card.Content>
          <Card.Group
            itemsPerRow={semesterList[activeSemester]?.length}
          >
            {semesterList[activeSemester]?.epochs?.map((epoch) => (
              <Field
                name={`step1.seasons.${epoch?.name}_${epoch?.id}.start_date`}
              >
                {({ input: startDateInput }) => (
                  <Field
                    name={`step1.seasons.${epoch?.name}_${epoch?.id}.end_date`}
                  >
                    {({ input: endDateInput }) => (
                      <Card raised>
                        <Card.Content
                          header={epoch.name}
                        />
                        <Card.Content>
                          <Form.Field>
                            <DateInput
                              name="date"
                              value={
                                  startDateInput.value
                              }
                              iconPosition="left"
                              label="Data de Ínicio"
                              placeholder="Data de Ínicio"
                              {...startDateInput}
                              onChange={(
                                evt,
                                { value },
                              ) => {
                                startDateInput.onChange(
                                  value,
                                );
                              }}
                              closable
                            />
                          </Form.Field>
                        </Card.Content>
                        <Card.Content>
                          <Form.Field>
                            <DateInput
                              name="date"
                              value={
                                  endDateInput.value
                              }
                              iconPosition="left"
                              label="Data de Fim"
                              placeholder="Data de Fim"
                              {...endDateInput}
                              onChange={(
                                evt,
                                { value },
                              ) => {
                                endDateInput.onChange(
                                  value,
                                );
                              }}
                              closable
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
