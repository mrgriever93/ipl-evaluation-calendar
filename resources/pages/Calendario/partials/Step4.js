import React from "react";
import {Field} from "react-final-form";
import {Checkbox, Container, Form} from "semantic-ui-react";

const Step4 = () => {
    return (
        <Container>
            <Field type="checkbox" name="step4.importHolidays">
                {({input: importHolidaysField}) => (
                    <Form.Field>
                        <label>Importar feriados automaticamente? (Fonte: SAPO)</label>
                        <Checkbox toggle checked={importHolidaysField.checked}{...importHolidaysField}
                            onChange={() => {
                                importHolidaysField.onChange(!importHolidaysField.checked);
                                importHolidaysField.onBlur(!importHolidaysField.checked);
                            }}
                        />
                    </Form.Field>
                )}
            </Field>
        </Container>
    );
};

export default Step4;
