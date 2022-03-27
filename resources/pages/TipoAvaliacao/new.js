import axios from 'axios';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Checkbox,
  Container,
  Form,
  Icon,
} from 'semantic-ui-react';
import { errorConfig, successConfig } from '../../utils/toastConfig';

const New = ({ match }) => {
  const history = useNavigate();
  const [evaluationTypeDetail, setEvaluationTypeDetail] = useState({});
  const [loading, setLoading] = useState(!!match.params?.id);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !_.isEmpty(evaluationTypeDetail);

  useEffect(() => {
    if (match.params?.id) {
      axios.get(`/evaluation-types/${match.params.id}`).then((res) => {
        setLoading(false);
        setEvaluationTypeDetail(res?.data?.data);
      });
    }
  }, [match.params]);

  useEffect(() => {
    if (!loading && match.params?.id && !evaluationTypeDetail) {
      history('/tipo-avaliacao');
    }
  }, [match.params, loading, evaluationTypeDetail, history]);

  const initialValues = useMemo(() => {
    const {
      id, description, code, enabled,
    } = evaluationTypeDetail;
    return {
      id,
      code,
      description,
      enabled,
    };
  }, [evaluationTypeDetail]);

  const onSubmit = ({
    id, code, description, enabled,
  }) => {
    setIsSaving(true);
    const isNew = !id;
    const axiosFn = isNew ? axios.post : axios.patch;

    axiosFn(`/evaluation-types/${!isNew ? id : ''}`, {
      code,
      description,
      enabled,
    }).then((res) => {
      setIsSaving(false);
      if (res.status >= 200 && res.status < 300) {
        toast(`O tipo de avaliação foi ${isEditMode ? 'editado' : 'criado'} com sucesso!`, successConfig);
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
                header={`${isEditMode ? 'Editar' : 'Novo'} Tipo de Avaliação`}
              />
              <Card.Content>
                <Form.Group widths="equal">
                  <Field name="code">
                    {({ input: codeInput }) => (
                      <Form.Input label="Código" {...codeInput} />
                    )}
                  </Field>
                  <Field name="description">
                    {({ input: descriptionInput }) => (
                      <Form.Input label="Descrição" {...descriptionInput} />
                    )}
                  </Field>
                </Form.Group>
                <Field name="enabled" type="checkbox">
                  {({ input: isEnabled }) => (
                    <Checkbox
                      label="Tipo de Avaliação Ativo?"
                      toggle
                      onClick={() => isEnabled.onChange(!isEnabled.checked)}
                      checked={isEnabled.checked}
                    />
                  )}
                </Field>
              </Card.Content>
              <Card.Content>
                <Link to="/tipo-avaliacao">
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
