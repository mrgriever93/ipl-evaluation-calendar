import React, {useEffect, useState} from 'react';
import {
    Card, Container, Table, Button, Icon, Modal, Header, Dimmer, Loader,
} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {toast} from 'react-toastify';
import moment from 'moment';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);

const Wrapper = styled.div`
    .header {
        display: inline;
    }
`;

const AnoLetivo = ({match}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [academicYearsList, setAcademicYearsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const columns = [
        {name: 'ID'},
        {name: 'Descrição'},
        {name: 'Ativo', textAlign: 'center'},
        {name: 'Ações'}];

    useEffect(() => {
        axios.get('academic-years').then((response) => {
            setLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setAcademicYearsList(response?.data?.data);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = (userGroup) => {
        setModalInfo(userGroup);
        setModalOpen(true);
    };

    const handleModalClose = () => setModalOpen(false);

    const handleRemoval = () => {
        handleModalClose();
    };

    const openNewAcademicYear = () => {
        SweetAlertComponent.fire({
            title: 'Abrir novo ano letivo',
            html: `Ao abrir um novo ano letivo, este ficará ativo por defeito para todos os utilizadores!<br/><strong>Tem a certeza que deseja abrir um novo ano letivo com o seguinte código?<h1>${moment(new Date()).format('YYYY')}-${moment(new Date()).add(1, 'year').format('YY')}</h1></strong>`,
            denyButtonText: 'Não',
            confirmButtonText: 'Sim',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    axios.post('/academic-years', {
                        code: `${moment(new Date()).format('YYYY')}${moment(new Date()).add(1, 'year').format('YY')}`,
                        display: `${moment(new Date()).format('YYYY')}-${moment(new Date()).add(1, 'year').format('YY')}`,
                    }).then((res) => {
                        if (res.status === 201) {
                            toast('O novo ano letivo foi aberto com sucesso!', successConfig);
                        } else {
                            toast('Ocorreu um problema ao abrir um novo ano letivo!', errorConfig);
                        }
                    });
                }
            });
    };

    return (
        <Container style={{marginTop: '2em'}}>
            <Card fluid>
                <Card.Content>
                    {loading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>A carregar os anos letivos</Loader>
                        </Dimmer>
                    )}
                    <Wrapper>
                        <Header as="span">Anos letivos</Header>
                        <ShowComponentIfAuthorized
                            permission={[SCOPES.CREATE_ACADEMIC_YEARS]}
                        >
                            {!loading && !academicYearsList?.find((x) => x.code === `${moment(new Date()).format('YYYY')}${moment(new Date()).add(1, 'year').format('YY')}`) && (
                                <Button floated="right" color="green" onClick={openNewAcademicYear}>
                                    Criar novo
                                </Button>
                            )}
                        </ShowComponentIfAuthorized>
                    </Wrapper>
                </Card.Content>
                <Card.Content>
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map(({name, textAlign}) => (
                                    <Table.HeaderCell textAlign={textAlign}>{name}</Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {academicYearsList.map(({id, code, active}) => (
                                <Table.Row key={id}>
                                    <Table.Cell>{id}</Table.Cell>
                                    <Table.Cell>{code}</Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <Icon
                                            name={active ? 'checkmark' : 'close'}
                                        />
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        {false && (
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_ACADEMIC_YEARS]}>
                                                <Link to={`/ano-letivo/edit/${id}`}>
                                                    <Button color="yellow" icon>
                                                        <Icon name="edit"/>
                                                    </Button>
                                                </Link>
                                            </ShowComponentIfAuthorized>
                                        )}
                                        <ShowComponentIfAuthorized permission={[SCOPES.DELETE_ACADEMIC_YEARS]}>
                                            <Button
                                                onClick={() => remove({
                                                    id,
                                                    code,
                                                })}
                                                color="red"
                                                icon
                                                disabled={active}
                                            >
                                                <Icon name="trash"/>
                                            </Button>
                                        </ShowComponentIfAuthorized>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
            <Modal
                dimmer="blurring"
                open={modalOpen}
                onClose={handleModalClose}
            >
                <Modal.Header>Remover Ano letivo</Modal.Header>
                <Modal.Content>
                    Tem a certeza que deseja remover o Ano letivo
                    <strong>{modalInfo?.code}</strong>
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

export default AnoLetivo;
