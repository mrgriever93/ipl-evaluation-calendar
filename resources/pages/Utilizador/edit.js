import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router';
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
import { successConfig } from '../../utils/toastConfig';

const New = ({ match }) => {
  const history = useHistory();
  const [userDetail, setUserDetail] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(!!match.params?.id);
  const [isSaving, setIsSaving] = useState(false);
  const [userGroupsLoading, setUserGroupsLoading] = useState(true);

  useEffect(() => {
    axios.get('/user-group').then((response) => {
      if (response.status === 200) {
        setUserGroupsLoading(false);
        setUserGroups(
          response?.data?.data
            ?.map(({ id, description }) => ({ key: id, value: id, text: description })),
        );
      }
    });
  }, []);

  useEffect(() => {
    axios.get(`/users/${match.params.id}`).then((res) => {
      if (res.status === 200) {
        setLoading(false);
        setUserDetail(res?.data?.data);
      }
    });
  }, [match.params]);

  useEffect(() => {
    if (!loading && match.params?.id && !userDetail) {
      history.push('/utilizador');
    }
  }, [match.params, loading, userDetail, history]);

  const initialValues = useMemo(() => {
    const {
      id, email, name, groups, enabled = true,
    } = userDetail;
    return {
      id,
      email,
      name,
      enabled,
      groups: groups?.map(({ id }) => id),
    };
  }, [userDetail]);

  const onSubmit = ({
    id, groups, enabled,
  }) => {
    setIsSaving(true);
    axios.patch(
      `/user/${id}`,
      {
        groups,
        enabled,
      },
    ).then((res) => {
      if (res.status === 200) {
        setIsSaving(false);
        toast('Utilizador atualizado com sucesso', successConfig);
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
                header="Editar Utilizador"
              />
              <Card.Content>
                <Form.Group widths="equal">
                  <Form.Input
                    label="Nome"
                    value={initialValues.name}
                    disabled
                  />
                  <Form.Input
                    label="Email"
                    value={initialValues.email}
                    disabled
                  />
                </Form.Group>
                <Field name="groups">
                  {({ input: groupsInput }) => (
                    <Form.Dropdown
                      label="Grupos de utilizador"
                      placeholder="Selecione os grupos"
                      multiple
                      search
                      selection
                      options={userGroups}
                      loading={userGroupsLoading}
                      {...groupsInput}
                      onChange={(e, { value }) => {
                        groupsInput.onChange(
                          value,
                        );
                      }}

                    />
                  )}
                </Field>
                <Field name="enabled" type="checkbox">
                  {({ input: enabledUserInput }) => (
                    <Checkbox
                      label="Utilizador ativo?"
                      toggle
                      onClick={() => enabledUserInput.onChange(
                        !enabledUserInput.checked,
                      )}
                      checked={enabledUserInput.checked}
                    />
                  )}
                </Field>
              </Card.Content>
              <Card.Content>
                <Link to="/utilizador">
                  <Button
                    icon
                    labelPosition="left"
                    color="teal"
                  >
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
                  <Icon name="save" />
                  Guardar
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
