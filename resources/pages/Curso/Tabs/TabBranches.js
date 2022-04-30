import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {Form, Button, Table, Icon, Modal, Dimmer, Loader } from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {useTranslation} from "react-i18next";

import {successConfig, errorConfig} from '../../../utils/toastConfig';
const SweetAlertComponent = withReactContent(Swal);

const CourseTabsBranches = ({ courseId }) => {
    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [branches, setBranches] = useState([]);
    const [newBranch, setNewBranch] = useState({name_pt: '', initials_pt: '', name_en: '', initials_en: ''});

    const loadCourseBranches = () => {
        setLoading(true);
        axios.get(`/courses/${courseId}/branches`).then((res) => {
            setBranches(res.data.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadCourseBranches();
    }, [courseId]);

    const addNewBranch = () => {
        setLoadingRequest(true);
        axios.post(`/courses/${courseId}/branch`, newBranch).then((res) => {
            if (res.status === 200) {
                setBranches(res.data.data);
                toast('Ramo adicionado com sucesso!', successConfig);
                setOpenModal(false);
                setNewBranch({name_pt: '', initials_pt: '', name_en: '', initials_en: ''});
                setLoadingRequest(false);
            } else {
                toast('Ocorreu um erro ao gravar o ramo!', errorConfig);
            }
        });
    };
    const closeModal = () => {
        setOpenModal(false);
        setNewBranch({name_pt: '', initials_pt: '', name_en: '', initials_en: ''});
    }

    const removeBranch = (branchId) => {
        SweetAlertComponent.fire({
            title: 'Atenção!',
            html: 'Ao eliminar este ramo, todas as UCs deste ramo, terão de ser atualizadas posteriormente!<br/><strong>Tem a certeza que deseja eliminar este ramo?</strong>',
            denyButtonText: 'Não',
            confirmButtonText: 'Sim',
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        }).then((result) => {
                if (result.isConfirmed) {
                    setLoadingRequest(true);
                    axios.delete(`/courses/${courseId}/branch/${branchId}`).then((res) => {
                        if (res.status === 200) {
                            setBranches(res.data.data);
                            setLoadingRequest(false);
                            toast('Ramo eliminado com sucesso!', successConfig);
                        } else {
                            toast('Ocorreu um problema ao eliminar este ramo!', errorConfig);
                        }
                    });
                }
            });
    };

    return (
        <div>
            { loading && (                
                <div style={{height: "80px"}}>
                    <Dimmer active inverted>
                        <Loader indeterminate>{t('A carregar os ramos')}</Loader>
                    </Dimmer>
                </div>
            )}
            {!loading && (
                <Table compact celled className={"definition-last"}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={4}>Nome - PT</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Iniciais - PT</Table.HeaderCell>
                            <Table.HeaderCell width={4}>Nome - EN</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Iniciais - EN</Table.HeaderCell>
                            <Table.HeaderCell style={{ width: "1%" }} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {branches?.map((branch, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>{ branch.name_pt }</Table.Cell>
                                <Table.Cell>{ branch.initials_pt }</Table.Cell>
                                <Table.Cell>{ branch.name_en }</Table.Cell>
                                <Table.Cell>{ branch.initials_en }</Table.Cell>
                                <Table.Cell collapsing>                                            
                                    <Button color="red" icon onClick={() => removeBranch(branch.id)}>
                                        <Icon name={"trash"} />
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>

                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='5'>
                                <Button floated='right' icon labelPosition='left' color={"green"} size='small' onClick={() => setOpenModal(true)} >
                                    <Icon name='plus' /> Adicionar ramo
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            )}

            {openModal && (
                <Modal dimmer="blurring" open={openModal} onClose={closeModal}>
                    <Modal.Header>Adicionar ramo</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Group widths={2}>
                                <Form.Input label={"Nome do ramo - PT"} placeholder="Nome do ramo - PT" onChange={(e, {value}) => setNewBranch(newBranch => ({...newBranch, name_pt: value}))}/>
                                <Form.Input label={"Iniciais do ramo - PT"} placeholder="Iniciais do ramo - PT" onChange={(e, {value}) => setNewBranch(newBranch => ({...newBranch, initials_pt: value}))}/>
                            </Form.Group>
                            <Form.Group widths={2}>
                                <Form.Input label="Nome do ramo - EN" placeholder="Nome do ramo - EN" onChange={(e, {value}) => setNewBranch(newBranch => ({...newBranch, name_en: value}))}/>
                                <Form.Input label="Iniciais do ramo - EN" placeholder="Iniciais do ramo - EN" onChange={(e, {value}) => setNewBranch(newBranch => ({...newBranch, initials_en: value}))}/>
                            </Form.Group>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={closeModal}>
                            Cancelar
                        </Button>
                        <Button positive onClick={addNewBranch} loading={loadingRequest}>
                            Adicionar
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        </div>
    );
};

export default CourseTabsBranches;
