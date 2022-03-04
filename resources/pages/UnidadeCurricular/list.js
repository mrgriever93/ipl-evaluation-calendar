import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Container,
  Table,
  Form,
  Icon,
  Modal,
  Button,
  Header,
  Message,
  Pagination,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import _ from 'lodash';
import { toast } from 'react-toastify';
import SCOPES from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import { successConfig, errorConfig } from '../../utils/toastConfig';

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const MessageFading = styled(Message)`
    @keyframes flickerAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.05;
        }
        100% {
            opacity: 1;
        }
    }
    animation: flickerAnimation 1s infinite;
`;

const List = ({ match }) => {
  const [courseUnits, setCourseUnits] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState();
  const [semesterFilter, setSemesterFilter] = useState();
  const [searchFilter, setSearchFilter] = useState();

  useEffect(() => {
    loadCourses();
  }, []);

  const fetchCourseUnits = (page = 1) => {
    setIsLoading(true);
    axios.get(`/course-units?page=${page}${semesterFilter ? `&semester=${semesterFilter}` : ''}${courseFilter ? `&course=${courseFilter}` : ''}${searchFilter ? `&search=${searchFilter}` : ''}`).then((response) => {
      setIsLoading(false);
      if (response.status >= 200 && response.status < 300) {
        setCourseUnits(response.data.data);
        setPaginationInfo(response.data.meta);
      }
    });
  };

  useEffect(() => {
    fetchCourseUnits();
  }, [semesterFilter, courseFilter, searchFilter]);

  const loadCourses = (search = '') => {
    axios.get(`/courses?search=${search}`).then((res) => {
      if (res.status === 200) {
        setCourses(res.data.data?.map((course) => ({
          key: course.id,
          value: course.id,
          text: course.display_name,
        })));
      }
    });
  };

  const filterByCourse = (course) => {
    setCourseFilter(course);
  };

  const remove = (courseUnit) => {
    setModalInfo(courseUnit);
    setModalOpen(true);
  };

  const handleModalClose = () => setModalOpen(false);

  const handleRemoval = () => {
    handleModalClose();
    axios.delete(`/course-units/${modalInfo.id}`).then((res) => {
      if (res.status === 200) {
        fetchCourseUnits();
        toast('Unidade curricular eliminada com sucesso!', successConfig);
      } else {
        toast('Ocorreu um erro ao eliminar a unidade curricular!', errorConfig);
      }
    });
  };

  const loadCourseUnits = (evt, { activePage }) => fetchCourseUnits(activePage);

  const handleSearchCourses = (evt, { searchQuery }) => {
    loadCourses(searchQuery);
  };

  const handleSearchCourseUnits = (evt, { value }) => {
    setSearchFilter(value);
  };

  const filterBySemester = (evt, { value }) => {
    setSemesterFilter(value);
  };

  const columns = [
    { name: 'Nome' },
    { name: 'Curso ' },
    { name: 'Ramo', width: 2 },
    { name: 'Métodos definidos?' },
    { name: 'Agrupamento', width: 4 },
    { name: 'Ações' },
  ];

  return (
    <Container style={{ marginTop: '2em' }}>
      <Card fluid>
        <Card.Content>
          {isLoading && (
          <Dimmer active inverted>
            <Loader indeterminate>A carregar as unidades curriculares</Loader>
          </Dimmer>
          )}
          <Wrapper>
            <Header as="span">Unidades Curriculares</Header>
            <ShowComponentIfAuthorized
              permission={[SCOPES.CREATE_COURSE_UNITS]}
            >
              <Link to="/unidade-curricular/novo">
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
              <Form.Dropdown
                options={courses}
                selection
                search
                label="Curso"
                onSearchChange={_.debounce(handleSearchCourses, 400)}
                onChange={(e, { value }) => filterByCourse(value)}
                placeholder="Pesquisar o curso..."
                clearable
              />
              <Form.Dropdown
                options={[

                  {
                    key: 1,
                    value: 1,
                    text: '1º Semestre',
                  },
                  {
                    key: 2,
                    value: 2,
                    text: '2º Semestre',
                  },
                ]}
                placeholder="Selecione o semestre"
                selection
                search
                label="Semestre"
                onChange={filterBySemester}
                clearable
              />
              <Form.Input onChange={_.debounce(handleSearchCourseUnits, 400)} search label="Pesquisar por nome" />
            </Form.Group>
          </Form>
        </Card.Content>
        <Card.Content>
          <Table celled>
            <Table.Header>
              <Table.Row>
                {columns.map(({ name, textAlign, width }) => (
                  <Table.HeaderCell textAlign={textAlign} width={width}>
                    {name}
                  </Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {courseUnits.map(
                (
                  {
                    id, name, course_description, methods, branch, group_name,
                  },
                ) => (
                  <Table.Row key={id}>
                    <Table.Cell>
                      {name}
                    </Table.Cell>
                    <Table.Cell>
                      {course_description}
                    </Table.Cell>
                    <Table.Cell>{branch?.name}</Table.Cell>
                    <Table.Cell><Icon name={methods?.length > 0 ? 'check' : 'close'} /></Table.Cell>
                    <Table.Cell>{group_name || '-'}</Table.Cell>
                    <Table.Cell width="5">
                      <ShowComponentIfAuthorized permission={[SCOPES.EDIT_COURSE_UNITS]}>
                        <Link
                          to={`${match.path}edit/${id}`}
                        >
                          <Button color="yellow" icon>
                            <Icon name="edit" />
                          </Button>
                        </Link>
                      </ShowComponentIfAuthorized>
                      <ShowComponentIfAuthorized permission={[SCOPES.DELETE_COURSE_UNITS]}>
                        <Button
                          onClick={() => remove({
                            id,
                            course: course_description,
                          })}
                          color="red"
                          icon
                        >
                          <Icon name="trash" />
                        </Button>
                      </ShowComponentIfAuthorized>
                      <ShowComponentIfAuthorized
                        permission={[SCOPES.MANAGE_EVALUATION_METHODS]}
                      >
                        <Link to={`unidade-curricular/${id}/metodos`}>
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
          <Pagination
            secondary
            pointing
            fluid
            defaultActivePage={1}
            activePage={paginationInfo.current_page}
            totalPages={paginationInfo.last_page}
            onPageChange={loadCourseUnits}
          />
        </Card.Content>
      </Card>
      <Modal
        dimmer="blurring"
        open={modalOpen}
        onClose={handleModalClose}
      >
        <Modal.Header>Remover Unidade Curricular</Modal.Header>
        <Modal.Content>
          Tem a certeza que deseja remover a Unidade Curricular
          {' '}
          {modalInfo?.course}
          ?
        </Modal.Content>
        <Modal.Actions>
          <Button negative onClick={handleModalClose}>
            Cancelar
          </Button>
          <Button positive onClick={handleRemoval}>
            Sim
          </Button>
        </Modal.Actions>
      </Modal>

    </Container>
  );
};

export default List;
