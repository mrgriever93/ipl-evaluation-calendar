import _ from "lodash";
import React, { useEffect, useMemo } from "react";
import { Field, Form as FinalForm } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Checkbox,
  Container,
  Form,
  Icon,
} from "semantic-ui-react";
import {
  clearLanguageDetail,
  loadLanguage,
  saveLanguage,
} from "../../redux/languages/actions";

const New = ({ match }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const languageDetail = useSelector((state) => state.languages.detail);
  const loading = useSelector((state) => state.languages.loading);
  const isEditMode = !_.isEmpty(languageDetail);

  useEffect(() => {
    if (match.params?.id) {
      dispatch(loadLanguage(match.params?.id));
    }
  }, [match.params, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearLanguageDetail());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && match.params?.id && !languageDetail) {
      history.push("/idioma");
    }
  }, [match.params, loading, languageDetail, history]);

  const initialValues = useMemo(() => {
    const { id, abreviatura, nome, por_omissao } = languageDetail;
    return {
      id,
      abreviatura,
      descricao: nome,
      isDefault: por_omissao,
    };
  }, [languageDetail]);

  const onSubmit = (values) => {
    dispatch(saveLanguage(values));
  };

  return (
    <Container style={{ marginTop: "2em" }}>
      <FinalForm
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit }) => (
          <Form>
            <Card fluid>
              <Card.Content
                header={`${isEditMode ? "Editar" : "Novo"} Idioma`}
              />
              <Card.Content>
                <Form.Group widths="equal">
                  <Field name="abreviatura">
                    {({ input: abreviaturaInput }) => (
                      <Form.Input label="Abreviatura" {...abreviaturaInput} />
                    )}
                  </Field>
                  <Field name="descricao">
                    {({ input: descricaoInput }) => (
                      <Form.Input label="Descrição" {...descricaoInput} />
                    )}
                  </Field>
                </Form.Group>
                <Field name="isDefault" type="checkbox">
                  {({ input: isDefaultInput }) => (
                    <Checkbox
                      label="Idioma principal?"
                      toggle
                      onClick={() =>
                        isDefaultInput.onChange(!isDefaultInput.checked)
                      }
                      checked={isDefaultInput.checked}
                    />
                  )}
                </Field>
              </Card.Content>
              <Card.Content>
                <Link to={`/idioma`}>
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
                >
                  <Icon name={isEditMode ? "save" : "plus"} />
                  {isEditMode ? "Guardar" : "Criar"}
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
