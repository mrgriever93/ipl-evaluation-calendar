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
  Icon,
} from 'semantic-ui-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { successConfig, errorConfig } from '../../utils/toastConfig';

const New = ({ match }) => {
  const history = useHistory();
  const [interruptionDetail, setInterruptionDetail] = useState({});
  const [loading, setLoading] = useState(!!match.params?.id);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !_.isEmpty(interruptionDetail);

  useEffect(() => {
    if (match.params?.id) {
      axios.get(`/interruption-types/${match.params.id}`).then((res) => {
        setLoading(false);
        setInterruptionDetail(res?.data?.data);
      });
    }
  }, [match.params]);

  useEffect(() => {
    if (!loading && match.params?.id && !interruptionDetail) {
      history.push('/interrupcao');
    }
  }, [match.params, loading, interruptionDetail, history]);

  const initialValues = useMemo(() => {
    const {
      id, description, name, enabled = true,
    } = interruptionDetail;
    return {
      id,
      description,
      name,
      enabled,
    };
  }, [interruptionDetail]);

  const onSubmit = ({
    id, name, description, enabled,
  }) => {
    setIsSaving(true);
    const isNew = !id;
    const axiosFn = isNew ? axios.post : axios.patch;

    axiosFn(`/interruption-types/${!isNew ? id : ''}`, {
      name,
      description,
      enabled,
    }).then((res) => {
      setIsSaving(false);
      if (res.status >= 200 && res.status < 300) {
        toast(`O tipo de interrupção foi ${isEditMode ? 'editado' : 'criado'} com sucesso!`, successConfig);
      } else {
        toast('Existiu um problema ao gravar as alterações!', errorConfig);
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
                header={`${isEditMode ? 'Editar' : 'Novo'} Tipo de Interrupção`}
              />
              <Card.Content>
                <Form.Group widths="equal">
                  <Field name="name">
                    {({ input: nameInput }) => (
                      <Form.Input label="Nome" {...nameInput} />
                    )}
                  </Field>
                  <Field name="description">
                    {({ input: descriptionInput }) => (
                      <Form.Input label="Descrição" {...descriptionInput} />
                    )}
                  </Field>
                </Form.Group>
                <Field name="enabled" type="checkbox">
                  {({ input: enabledInput }) => (
                    <Checkbox
                      label="Interrupção Inativa?"
                      toggle
                      onClick={() => enabledInput.onChange(!enabledInput.checked)}
                      checked={!enabledInput.checked}
                    />
                  )}
                </Field>
              </Card.Content>
              <Card.Content>
                <Link to="/interrupcao">
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
