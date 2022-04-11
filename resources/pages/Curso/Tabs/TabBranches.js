import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {Card, Form, Button, List, Header, Image, Grid, Tab} from 'semantic-ui-react';
import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {successConfig, errorConfig} from '../../../utils/toastConfig';
import IplLogo from '../../../../public/images/ipl.png';

const SweetAlertComponent = withReactContent(Swal);

const CourseTabsBranches = ({ courseId, isLoading }) => {
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [additionalBranches, setAdditionalBranches] = useState([]);

    const loadCourseBranches = () => {
        setLoading(true);
        isLoading = true;
        setAdditionalBranches([]);
        axios.get(`/courses/${courseId}/branches`).then((res) => {
            setLoading(false);
            isLoading = false;
            setBranches(res.data.data);
        });
    };

    useEffect(() => {
        loadCourseBranches();
    }, [courseId]);

    const onSaveBranches = () => {
        axios.patch(`/courses/${courseId}/branches`, {
            branches: [...additionalBranches.map((branch) => ({
                name: branch.name,
                initials: branch.name,
            }))],
        }).then((res) => {
            if (res.status === 200) {
                toast('Curso atualizado com sucesso!', successConfig);
            } else {
                toast('Ocorreu um erro ao gravar o curso!', errorConfig);
            }
        });
    };

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
                    axios.delete(`/branches/${branchId}`).then((res) => {
                        if (res.status === 200) {
                            loadCourseDetail();
                            toast('Ramo eliminado com sucesso!', successConfig);
                        } else {
                            toast('Ocorreu um problema ao eliminar este ramo!', errorConfig);
                        }
                    });
                }
            });
    };

    return (
        <Tab.Pane loading={loading} key='tab_branches'>
            {!loading && (
                <Grid padded="vertically">
                    <Grid.Column width="8">
                        <Grid.Row>
                            <List>
                                {branches?.map((branch) => (
                                    <List.Item key={branch.id}>
                                        <List.Content floated="right">
                                            <Button color="red" onClick={() => removeBranch(branch.id)}>
                                                Remover
                                            </Button>
                                        </List.Content>
                                        <Image avatar src={IplLogo}/>
                                        <List.Content>
                                            {branch.name}
                                        </List.Content>
                                    </List.Item>
                                ))}
                                {additionalBranches.map((branch) => (
                                    <List.Item key={branch.id}>
                                        <List.Content floated="right">
                                            <Button color="red"
                                                    onClick={() => setAdditionalBranches(
                                                        (current) => [...current.filter((x) => x.order !== branch.order)],
                                                    )}>
                                                Remover
                                            </Button>
                                        </List.Content>
                                        <Image avatar src={IplLogo}/>
                                        <List.Content>
                                            <Form.Input placeholder="Nome do novo ramo"
                                                        onChange={(e, {value}) => setAdditionalBranches((current) => [...current.filter((x) => x.order !== branch.order), {
                                                            order: branch.order,
                                                            name: value
                                                        }])}
                                            />
                                        </List.Content>
                                    </List.Item>
                                ))}
                            </List>
                        </Grid.Row>
                        <br/>
                        <Grid.Row>
                            <Button color="green" onClick={() => setAdditionalBranches((current) => [...current, {order: current.length}])}>
                                Adicionar ramo
                            </Button>
                        </Grid.Row>
                    </Grid.Column>
                </Grid>
            )}
        </Tab.Pane>
    );
};

export default CourseTabsBranches;
