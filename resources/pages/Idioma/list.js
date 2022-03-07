import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Container,
  Form,
  Header,
  Icon,
  Modal,
  Table,
} from 'semantic-ui-react';
import styled from 'styled-components';
import { deleteLanguage, loadLanguages } from '../../redux/languages/actions';

const Wrapper = styled.div`
  .header {
    display: inline;
  }
`;

const columns = [
  { name: 'Abreviatura' },
  { name: 'Descrição' },
  { name: 'Default?', align: 'center' },
  { name: 'Ações', align: 'center' },
];

const List = ({ match }) => {
  const dispatch = useDispatch();
  const history = useNavigate();
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const languages = useSelector((state) => state.languages.list);
  const [languageInfoAction, setLanguageInfoAction] = useState();

  useEffect(() => {
    dispatch(loadLanguages());
  }, [dispatch]);

  const filterLanguages = useCallback(
    (searchTerm) => {
      const filtered = languages.filter(
        (x) => x.nome.toLowerCase().includes(searchTerm)
          || x.abreviatura.toLowerCase().includes(searchTerm),
      );
      if (filtered.length) {
        setFilteredLanguages(filtered);
      }
    },
    [languages],
  );

  const handleModalClose = () => setModalOpen(false);

  const handleSearch = ({ target: { value: searchTerm } }) => {
    filterLanguages(searchTerm);
  };

  const edit = (id) => {
    history(`${match.path}/edit/${id}`);
  };

  const remove = (language) => {
    setLanguageInfoAction(language);
    setModalOpen(true);
  };

  const handleRemoval = () => {
    dispatch(deleteLanguage(languageInfoAction.id));
    handleModalClose();
  };

  return (
    <Container style={{ marginTop: '2em' }}>
      <Card fluid>
        <Card.Content>
          <Wrapper>
            <Header as="span">Idiomas</Header>
            <Link to="/idioma/novo">
              <Button floated="right" color="green">
                Novo
              </Button>
            </Link>
          </Wrapper>
        </Card.Content>
        <Card.Content>
          <Form>
            <Form.Group widths="5">
              <Form.Input
                label="Pesquisar"
                placeholder="Pesquisar idioma..."
                onChange={handleSearch}
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
              {(filteredLanguages?.length ? filteredLanguages : languages)?.map(
                ({
                  id, abreviatura, nome, por_omissao,
                }, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{abreviatura}</Table.Cell>
                    <Table.Cell>{nome}</Table.Cell>
                    <Table.Cell textAlign="center">
                      {por_omissao ? <Icon name="checkmark" /> : null}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Link to={`${match.path}edit/${id}`}>
                        <Button color="yellow" icon>
                          <Icon name="edit" />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => remove({
                          id, abreviatura, nome, por_omissao,
                        })}
                        color="red"
                        icon
                      >
                        <Icon name="trash" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ),
              )}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
      <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
        <Modal.Header>Remover linguagem</Modal.Header>
        <Modal.Content>
          Tem a certeza que deseja remover a linguagem
          {' '}
          {languageInfoAction?.nome}
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
