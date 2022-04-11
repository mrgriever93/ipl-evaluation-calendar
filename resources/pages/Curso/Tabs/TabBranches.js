import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {Form, Button, List, Grid, Tab, Modal, Header} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {successConfig, errorConfig} from '../../../utils/toastConfig';
const SweetAlertComponent = withReactContent(Swal);

const CourseTabsBranches = ({ courseId }) => {
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
        <Tab.Pane loading={loading} key='tab_branches_content'>
            {!loading && (
                <Grid padded="vertically" divided='vertically'>
                    <Grid.Row textAlign={"right"} >
                        <Grid.Column floated={"right"}>
                            <Button color="green" onClick={() => setOpenModal(true)}>
                                Adicionar ramo
                            </Button>
                        </Grid.Column>
                    </Grid.Row>
                    {branches?.map((branch) => (
                        <Grid.Row columns={3} key={branch.id} verticalAlign={"middle"}>
                            <Grid.Column>
                                <div>
                                    <Header size='small'>
                                        Name - PT
                                        <Header.Subheader>
                                            {branch.name_pt}
                                        </Header.Subheader>
                                    </Header>
                                </div>
                                <div className={'margin-top-s'}>
                                    <Header size='small'>
                                        Initials - PT
                                        <Header.Subheader>
                                            {branch.initials_pt}
                                        </Header.Subheader>
                                    </Header>
                                </div>
                            </Grid.Column>
                            <Grid.Column>
                                <div>
                                    <Header size='small'>
                                        Name - EN
                                        <Header.Subheader>
                                            {branch.name_en}
                                        </Header.Subheader>
                                    </Header>
                                </div>
                                <div className={'margin-top-s'}>
                                    <Header size='small'>
                                        Initials - EN
                                        <Header.Subheader>
                                            {branch.initials_en}
                                        </Header.Subheader>
                                    </Header>
                                </div>
                            </Grid.Column>
                            <Grid.Column textAlign={"right"} floated={"right"}>
                                <Button color="red" onClick={() => removeBranch(branch.id)}>Remover</Button>
                            </Grid.Column>
                        </Grid.Row>
                    ))}
                </Grid>
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
        </Tab.Pane>
    );
};

export default CourseTabsBranches;
