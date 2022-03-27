import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Container,
  Table,
  Form,
  Button,
  Header,
  Icon,
  Modal,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { errorConfig, successConfig } from '../../utils/toastConfig';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';

const Wrapper = styled.div`
  .header {
    display: inline;
  }
`;

const columns = [
  { name: 'Código' },
  { name: 'Descrição' },
  { name: 'Ativo?', align: 'center' },
  { name: 'Ações', align: 'center' },
];

const List = ({ match }) => {
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvaluationTypes = () => {
    setIsLoading(true);
    axios.get('/evaluation-types/').then((res) => {
      setIsLoading(false);
      if (res.status >= 200 && res.status < 300) {
        setEvaluationTypes(res.data?.data);
      }
    });
  };

  useEffect(() => {
    fetchEvaluationTypes();
  }, []);

  const filterResults = useCallback(
    (searchTerm) => {
      const filtered = evaluationTypes.filter(
        (x) => x.code.toLowerCase().includes(searchTerm.toLowerCase())
          || x.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (filtered.length) {
        setFilteredResults(filtered);
      }
    },
    [evaluationTypes],
  );

  const handleModalClose = () => setModalOpen(false);

  const handleSearch = ({ target: { value: searchTerm } }) => {
    filterResults(searchTerm);
  };

  const remove = (interruption) => {
    setModalInfo(interruption);
    setModalOpen(true);
  };

  const handleRemoval = () => {
    axios.delete(`/evaluation-types/${modalInfo?.id}`).then((res) => {
      fetchEvaluationTypes();
      if (res.status === 200) {
        toast('Tipo de avaliação eliminado com sucesso', successConfig);
      } else {
        toast('Não foi possível eliminar o tipo de avaliação!', errorConfig);
      }
    });
    handleModalClose();
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Card fluid>
        <Card.Content>
          {isLoading && (
          <Dimmer active inverted>
            <Loader indeterminate>A carregar os tipos de avaliação</Loader>
          </Dimmer>
          )}
          <Wrapper>
            <Header as="span">Tipos de Avaliação</Header>
            <ShowComponentIfAuthorized permission={[SCOPES.CREATE_EVALUATION_TYPES]}>
              <Link to="/tipo-avaliacao/novo">
                <Button floated="right" color="green">
                  Novo
                </Button>
              </Link>
            </ShowComponentIfAuthorized>
          </Wrapper>
        </Card.Content>
        <Card.Content>
          <Form>
            <Form.Group widths="2">
              <Form.Input
                label="Pesquisar"
                placeholder="Pesquisar tipo de avaliação..."
                onChange={_.debounce(handleSearch, 400)}
              />
            </Form.Group>
          </Form>
        </Card.Content>
        <Card.Content>
          <Table celled fixed>
            <Table.Header>
              <Table.Row>
                {columns.map((col, index) => (
                  <Table.HeaderCell key={index} textAlign={col.align}>
                    {col.name}
                  </Table.HeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(filteredResults?.length
                ? filteredResults
                : evaluationTypes
              )?.map(({
                id, description, code, enabled,
              }, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{code}</Table.Cell>
                  <Table.Cell>{description}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Icon name={!enabled ? 'close' : 'check'} />
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <ShowComponentIfAuthorized permission={[SCOPES.EDIT_EVALUATION_TYPES]}>
                      <Link to={`/tipo-avaliacao/edit/${id}`}>
                        <Button color="yellow" icon>
                          <Icon name="edit" />
                        </Button>
                      </Link>
                    </ShowComponentIfAuthorized>
                    <ShowComponentIfAuthorized permission={[SCOPES.DELETE_EVALUATION_TYPES]}>
                      <Button
                        onClick={() => remove({
                          id, description, code, enabled,
                        })}
                        color="red"
                        icon
                      >
                        <Icon name="trash" />
                      </Button>
                    </ShowComponentIfAuthorized>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
      <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
        <Modal.Header>Remover Tipo de Avaliação</Modal.Header>
        <Modal.Content>
          Tem a certeza que deseja remover o seguinte tipo de avaliação
          {' '}
          {modalInfo?.description}
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
