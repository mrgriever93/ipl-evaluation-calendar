import React, { useEffect, useState } from 'react';
import {
  Card,
  Container,
  Table,
  Form,
  Icon,
  Button,
  Header,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import { errorConfig, successConfig } from '../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const List = ({ match }) => {
  const [courseUnitGroups, setCourseUnitGrous] = useState([]);
  const [courseUnitList, setCourseUnitList] = useState([]);
  const [isCourseUnitsLoading, setIsCourseUnitsLoading] = useState(true);
  const [removingCourseUnitGroup, setRemovingCourseUnitGroup] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const loadCourseUnitGroups = () => {
    setIsLoading(true);
    axios.get('/course-unit-groups').then((response) => {
      setIsLoading(false);
      if (response.status >= 200 && response.status < 300) {
        setCourseUnitGrous(response.data.data);
      }
    });
  };

  useEffect(() => {
    loadCourseUnitGroups();
    axios.get('/course-units').then((response) => {
      if (response.status >= 200 && response.status < 300) {
        setIsCourseUnitsLoading(false);
        setCourseUnitList(response.data.data);
      }
    });
  }, []);

  const remove = (courseUnitGroupId) => {
    SweetAlertComponent.fire({
      title: 'Atenção!',
      html: 'Ao eliminar o agrupamento, as avaliações e métodos já adicionados continuarão a estar acessiveis, no entanto não conseguirá utilizar este agrupamento para novas avaliações/métodos!<br/><strong>Tem a certeza que deseja eliminar este agrupamento de unidades curriculares, em vez de editar?</strong>',
      denyButtonText: 'Não',
      confirmButtonText: 'Sim',
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonColor: '#21ba45',
      denyButtonColor: '#db2828',
    })
      .then((result) => {
        if (result.isConfirmed) {
          setRemovingCourseUnitGroup(courseUnitGroupId);
          axios.delete(`/course-unit-groups/${courseUnitGroupId}`).then((res) => {
            setRemovingCourseUnitGroup(null);
            loadCourseUnitGroups();
            if (res.status === 200) {
              toast('Agrupamento eliminado com sucesso!', successConfig);
            } else {
              toast('Ocorreu um problema ao eliminar este agrupamento!', errorConfig);
            }
          });
        }
      });
  };

  const columns = [
    { name: 'Nome' },
    { name: 'Unidades Curriculares' },
    { name: "Número de UC's" },
    { name: 'Ações' },
  ];

  return (
    <Container>
      <Card fluid>
        <Card.Content>
          {isLoading && (
          <Dimmer active inverted>
            <Loader indeterminate>A carregar os agrupamentos de unidades curriculares</Loader>
          </Dimmer>
          )}
          <Wrapper>
            <Header as="span">Agrupamento de Unidades Curriculares</Header>
            <ShowComponentIfAuthorized
              permission={[SCOPES.CREATE_COURSE_UNITS]}
            >
              <Link to="/agrupamento-unidade-curricular/novo">
                <Button floated="right" color="green">
                  Novo
                </Button>
              </Link>
            </ShowComponentIfAuthorized>
          </Wrapper>
        </Card.Content>
        <Card.Content>
          <Form>
            <Form.Group widths="4">
              <Form.Input
                selection
                search
                label="Nome"
                icon="search"
              />
              <Form.Dropdown
                options={courseUnitList.map(({ id, name }) => ({
                  key: id,
                  value: id,
                  text: name,
                }))}
                selection
                multiple
                search
                loading={isCourseUnitsLoading}
                label="Unidade Curricular"
              />
            </Form.Group>
          </Form>
        </Card.Content>
        <Card.Content>
          <Table celled>
            <Table.Header>
              <Table.Row>
                {columns.map(({ name, textAlign }) => (
                  <Table.HeaderCell textAlign={textAlign}>
                    {name}
                  </Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {courseUnitGroups.map(
                (
                  {
                    id, description, course_units, num_course_units,
                  },
                ) => (
                  <Table.Row key={id}>
                    <Table.Cell width="3">{description}</Table.Cell>
                    <Table.Cell width="7">
                      <ul>
                        {course_units?.map((uc) => (
                          <li>
                            {uc.name}
                            {' '}
                            -
                            {' '}
                            {uc.course_description}
                          </li>
                        ))}
                      </ul>
                    </Table.Cell>
                    <Table.Cell width="2">{num_course_units}</Table.Cell>
                    <Table.Cell width="4">
                      <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS]}>
                        <Link to={`/escola/edit/${id}`}>
                          <Button color="yellow" icon>
                            <Icon name="edit" />
                          </Button>
                        </Link>
                      </ShowComponentIfAuthorized>
                      <ShowComponentIfAuthorized permission={[SCOPES.DELETE_COURSE_UNITS]}>
                        <Button
                          onClick={() => remove(
                            id,
                          )}
                          color="red"
                          icon
                          loading={removingCourseUnitGroup === id}
                        >
                          <Icon name="trash" />
                        </Button>

                      </ShowComponentIfAuthorized>
                      <ShowComponentIfAuthorized
                        permission={[SCOPES.MANAGE_EVALUATION_METHODS]}
                      >
                        <Link to={`agrupamento-unidade-curricular/${course_units[0]?.id}/metodos`}>
                          <Button
                            color="olive"
                            icon
                            labelPosition="left"
                          >
                            <Icon name="file alternate" />
                            Métodos
                          </Button>
                        </Link>
                      </ShowComponentIfAuthorized>
                    </Table.Cell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
    </Container>
  );
};

export default List;
