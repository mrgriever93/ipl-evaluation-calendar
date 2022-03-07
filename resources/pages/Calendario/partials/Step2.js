import React from 'react';
import { DateInput } from 'semantic-ui-calendar-react-yz';
import {
  Container, Card, Form, Button, Icon,
} from 'semantic-ui-react';
import { Field, useField } from 'react-final-form';

const Step2 = ({ additionalInterruptions, setAdditionalInterruptions, interruptionTypes }) => (
  <Container>
    <Card.Content>
      <Card.Group itemsPerRow={3}>
        {additionalInterruptions.map((_, index) => (
          <Field name={`step2.additional_interruptions.${index}.start_date`}>
            {({ input: startDateInput }) => (
              <Field name={`step2.additional_interruptions.${index}.end_date`}>
                {({ input: endDateInput }) => (
                  <Field name={`step2.additional_interruptions.${index}.interruption_type_id`}>
                    {({ input: interruptionTypeInput }) => (
                        <Card raised>
                          <Card.Content>
                            <Card.Header>
                              Interrupção
                              {' '}
                              {index + 1}
                            </Card.Header>
                          </Card.Content>
                          <Card.Content>
                            <Form.Dropdown
                              value={interruptionTypeInput.value}
                              label="Tipo de interrupção"
                              selection
                              options={interruptionTypes}
                              search
                              onChange={(e, { value }) => interruptionTypeInput.onChange(value)}
                            />
                            <Form.Field>
                              <DateInput
                                name="date"
                                value={null}
                                iconPosition="left"
                                label="Data de Ínicio"
                                placeholder="Data de Ínicio"
                                {...startDateInput}
                                onChange={(evt, { value }) => {
                                  startDateInput.onChange(value);
                                }}
                                closable
                              />
                            </Form.Field>
                          </Card.Content>
                          <Card.Content>
                            <Form.Field>
                              <DateInput
                                name="date"
                                value={null}
                                iconPosition="left"
                                label="Data de Fim"
                                placeholder="Data de Fim"
                                {...endDateInput}
                                onChange={(evt, { value }) => {
                                  endDateInput.onChange(value);
                                }}
                                closable
                              />
                            </Form.Field>
                          </Card.Content>
                          <Card.Content extra>
                            <Button
                              onClick={() => setAdditionalInterruptions((current) => {
                                const copy = [...current];
                                copy.splice(index, 1);
                                return copy;
                              })}
                              icon
                              labelPosition="left"
                              color="red"
                            >
                              Remover
                              <Icon name="trash" />
                            </Button>
                          </Card.Content>
                        </Card>
                      )}

                  </Field>

                )}
              </Field>
            )}
          </Field>

        ))}
      </Card.Group>
    </Card.Content>
  </Container>

);

export default Step2;
