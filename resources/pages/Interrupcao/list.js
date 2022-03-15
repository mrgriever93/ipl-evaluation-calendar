import React, {useCallback, useEffect, useState} from 'react';
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
import {Link} from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-toastify';
import {successConfig} from '../../utils/toastConfig';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';

const Wrapper = styled.div`
  .header {
    display: inline;
  }
`;

const columns = [
    {name: 'Nome'},
    {name: 'Descrição'},
    {name: 'Ativo?', align: 'center'},
    {name: 'Ações', align: 'center'},
];

const List = ({match}) => {
    const [interruptionList, setInterruptionList] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [filteredResults, setFilteredResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInterruptionList = useCallback(() => {
        setIsLoading(true);
        axios.get('/interruption-types').then((response) => {
            setIsLoading(false);
            setInterruptionList(response?.data?.data);
        });
    }, []);

    useEffect(() => {
        fetchInterruptionList();
    }, []);

    const filterResults = useCallback(
        (searchTerm) => {
            const filtered = interruptionList.filter(
                (x) => x.description.toLowerCase().includes(searchTerm.toLowerCase())
                    || x.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            if (filtered.length) {
                setFilteredResults(filtered);
            }
        },
        [interruptionList],
    );

    const handleModalClose = () => setModalOpen(false);

    const handleSearch = ({target: {value: searchTerm}}) => {
        filterResults(searchTerm);
    };

    const remove = (interruption) => {
        setModalInfo(interruption);
        setModalOpen(true);
    };

    const handleRemoval = () => {
        axios.delete(`/interruption-types/${modalInfo.id}`).then((res) => {
            if (res.status === 200) {
                toast('Tipo de interrupção eliminado!', successConfig);
                fetchInterruptionList();
            }
        });

        handleModalClose();
    };

    return (
        <Container style={{marginTop: '2em'}}>
            <Card fluid>
                <Card.Content>
                    {isLoading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar os tipos de interrupções</Loader>
                        </Dimmer>
                    )}
                    <Wrapper>
                        <Header as="span">Tipos de Interrupções</Header>
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_INTERRUPTION_TYPES]}>
                            <Link to="/interrupcao/novo">
                                <Button floated="right" color="green">
                                    Nova
                                </Button>
                            </Link>
                        </ShowComponentIfAuthorized>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Form>
                        <Form.Group widths="5">
                            <Form.Input
                                label="Pesquisar"
                                placeholder="Pesquisar interrupção..."
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
                                    // eslint-disable-next-line react/no-array-index-key
                                    <Table.HeaderCell key={index} textAlign={col.align}>
                                        {col.name}
                                    </Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {(filteredResults?.length ? filteredResults : interruptionList)?.map(
                                ({
                                     id, name, description, enabled,
                                 }) => (
                                    <Table.Row key={id}>
                                        <Table.Cell>{name}</Table.Cell>
                                        <Table.Cell>{description}</Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Icon name={!enabled ? 'close' : 'check'}/>
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_INTERRUPTION_TYPES]}>
                                                <Link to={`/interrupcao/edit/${id}`}>
                                                    <Button color="yellow" icon>
                                                        <Icon name="edit"/>
                                                    </Button>
                                                </Link>
                                            </ShowComponentIfAuthorized>
                                            <ShowComponentIfAuthorized permission={[SCOPES.DELETE_INTERRUPTION_TYPES]}>
                                                <Button
                                                    onClick={() => remove({
                                                        id, description,
                                                    })}
                                                    color="red"
                                                    icon
                                                >
                                                    <Icon name="trash"/>
                                                </Button>
                                            </ShowComponentIfAuthorized>
                                        </Table.Cell>
                                    </Table.Row>
                                ),
                            )}
                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
                <Modal.Header>Remover Interrupção</Modal.Header>
                <Modal.Content>
                    Tem a certeza que deseja remover a interrupção
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
