import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Container,
  Form,
  Icon,
} from 'semantic-ui-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { successConfig, errorConfig } from '../../utils/toastConfig';

const New = ({ match }) => {
  const history = useNavigate();
  const [courseUnitGroupDetail, setCourseUnitGroupDetail] = useState({});
  const [loading, setLoading] = useState(!!match.params?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [courseUnits, setCourseUnitsList] = useState(false);
  const isEditMode = !_.isEmpty(courseUnitGroupDetail);

  const loadCourseUnits = (includingIdsString) => {
    axios.get(`/course-units?all=true&withoutGroup=true${includingIdsString ? `&including=[${includingIdsString}]` : ''}`).then((res) => {
      setCourseUnitsList(res?.data?.data?.map((x) => ({
        key: x.id,
        value: x.id,
        text: `${x.name} - ${x.course_description}`,
      })));
    });
  };

  useEffect(() => {
    if (match.params?.id) {
      axios.get(`/course-unit-groups/${match.params.id}`).then((res) => {
        loadCourseUnits(res?.data?.data?.course_units?.map((x) => x.id).join(','));
        setLoading(false);
        setCourseUnitGroupDetail(res?.data?.data);
      });
    } else {
      loadCourseUnits();
    }
  }, [match.params]);

  useEffect(() => {
    if (!loading && match.params?.id && !courseUnitGroupDetail) {
      history('/agrupamento-unidade-curricular');
    }
  }, [match.params, loading, courseUnitGroupDetail, history]);

  const initialValues = useMemo(() => {
    const {
      id, description, course_units,
    } = courseUnitGroupDetail;
    return {
      id,
      description,
      courseUnits: course_units?.map((x) => x.id),
    };
  }, [courseUnitGroupDetail]);

  const onSubmit = ({
    id, description, courseUnits,
  }) => {
    setIsSaving(true);
    const isNew = !id;
    const axiosFn = isNew ? axios.post : axios.patch;

    axiosFn(`/course-unit-groups/${!isNew ? id : ''}`, {
      description,
      course_units: courseUnits,
    }).then((res) => {
      setIsSaving(false);
      if (res.status >= 200 && res.status < 300) {
        toast(`O agrupamento de unidade curricular foi ${isEditMode ? 'editado' : 'criado'} com sucesso!`, successConfig);
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
                header={`${isEditMode ? 'Editar' : 'Novo'} Agrupamento de Unidades Curriculares`}
              />
              <Card.Content>
                <Form.Group widths="equal">
                  <Field name="description">
                    {({ input: descriptionInput }) => (
                      <Form.Input label="Descrição" {...descriptionInput} />
                    )}
                  </Field>
                  <Field name="courseUnits">
                    {({ input: courseUnitsInput }) => (
                      <Form.Dropdown
                        options={courseUnits}
                        selection
                        multiple
                        search
                        label="Unidades Curriculares"
                        {...courseUnitsInput}
                        onChange={(e, { value }) => courseUnitsInput.onChange(
                          value,
                        )}
                      />
                    )}
                  </Field>
                </Form.Group>
              </Card.Content>
              <Card.Content>
                <Link to="/agrupamento-unidade-curricular">
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
