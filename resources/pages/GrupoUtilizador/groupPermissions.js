import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Card, Header, Grid, Checkbox, Tab } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { errorConfig, successConfig } from '../../utils/toastConfig';
import {useParams} from "react-router-dom";

const GroupPermissions = () => {
    // const [groupPermissions, setGroupPermissions] = useState([]);
    const [state, setState] = useState({
        groupPermissions: [],
        permissionsWithGroups: [],
    });
    // const [permissionsWithGroups, setPermissionsWithGroups] = useState([]);
    // const [savingPermissions, setSavingPermissions] = useState([]);
    // const [removingGroups, setRemovingGroups] = useState([]);

    // const updateGroupPermissions = (added, permissionId, groupId) => axios.put('/permission', {
    //     permission_id: permissionId,
    //     group_id: groupId,
    //     enabled: added,
    // });
    // get URL params
    let { id } = useParams();
    let paramsId = id;

    useEffect(() => {
        axios.get('/user-group/' + paramsId + '/permissions').then((res) => {
            const permissionSections = res.data.data || [];
            console.log(permissionSections);
            // console.log(groupPermissions);
            setState( { groupPermissions: permissionSections });
            console.log(state.groupPermissions);

            // const permWithGroups = permissionSections.map((permission) => {
            //     const filteredGroupsWithPermission = groupList.filter(
            //         (x) => x.permissions.find((y) => y.id === permission.id),
            //     );
            //     if (!permission.groups) {
            //     permission.groups = [];
            //     }
            //     if (filteredGroupsWithPermission?.length > 0) {
            //     permission.groups.push(...filteredGroupsWithPermission);
            //     }
            //     return permission;
            // });
            // setPermissionsWithGroups(permWithGroups);
        });

        axios.get('/user-group/' + paramsId + '/calendar-permissions').then((res) => {
            const permissionPhases = res.data.data || [];
            console.log(permissionPhases);
            // console.log(groupPermissions);
            // setState( { groupPermissions: permissionPhases });
            // console.log(state.groupPermissions);
        });
    }, []);

    // const addGroupToPermission = (newGroupId, permissionId) => {
    //     setSavingPermissions((current) => [...current, { permissionId, groupId: newGroupId }]);
    //     const copy = [...permissionsWithGroups];

    //     copy.find(
    //     (x) => x.id === permissionId,
    //     ).groups.push(groups.find((x) => x.id === newGroupId));

    //     setPermissionsWithGroups(copy);
    //     updateGroupPermissions(true, permissionId, newGroupId).then((res) => {
    //     if (res.status >= 200 && res.status <= 300) {
    //         toast('Permissão adicionada ao grupo com sucesso!', successConfig);
    //         setSavingPermissions((current) => [
    //         ...current.filter((x) => x.permissionId !== permissionId && x.groupId !== newGroupId),
    //         ]);
    //     } else {
    //         toast('Erro ao adicionar a permissão ao grupo!', errorConfig);
    //     }
    //     });
    // };

    // const removePermissionOfGroup = (index, permissionId, groupId) => {
    //     setRemovingGroups((current) => [...current, { permissionId, index }]);
    //     const copy = [...permissionsWithGroups];
    //     updateGroupPermissions(
    //     false,
    //     permissionId,
    //     groupId,
    //     ).then((res) => {
    //     if (res.status >= 200 && res.status <= 300) {
    //         toast('Permissão removida ao grupo com sucesso!', successConfig);
    //         setRemovingGroups((current) => [
    //         ...current.filter((x) => x.permissionId !== permissionId && x.index !== index),
    //         ]);

    //         const groupsOfPermission = copy.find(
    //         (x) => x.id === permissionId,
    //         );

    //         groupsOfPermission
    //         .groups.splice(groupsOfPermission.groups.map((x) => x.id).indexOf(groupId), 1);
    //         setPermissionsWithGroups(copy);
    //     } else {
    //         toast('Erro ao remover a permissão ao grupo!', errorConfig);
    //     }
    //     });
    // };

    const panes = [
        {menuItem: "Permissões Gerais", render: () => (
            <Tab.Pane>
                <div className='padding-s-base'>
                    <Grid columns={3} >
                        <Grid.Row>
                            { state.groupPermissions.map( (section, index) => (
                                <Grid.Column>
                                    <div className='section' key={index}>
                                        <div className='section-title'>
                                            {section.label}
                                        </div>
                                        <div className='section-content'>
                                            {section.permissions.map((permission, indexP) => (
                                                <div className='margin-top-base' key={indexP}>
                                                    <Checkbox toggle label={permission.description} value={permission.isActive} checked={permission.isActive}  onChange={(e, data) => alert("oi")} />
                                                </div>
                                            ))}
                                        </div>
                                    </div> 
                                </Grid.Column>
                            )) } 
                        </Grid.Row>
                    </Grid>
                </div>
            </Tab.Pane>
        )},
        {
            menuItem: "Permissões do Calendário", render: () => (
                <Tab.Pane>
                    {/* <div className='padding-s-base'>
                        <div className='section sticky--section margin-top-l'>
                            <div className='section-title'>
                                <Header as='h2'>Phase Permissions</Header>                    
                            </div>
                            <div className='section-content'>
                                <Grid columns={3} >
                                    <Grid.Row>
                                        { state.groupPermissions.map( (section, index) => (
                                            <Grid.Column>
                                                <div className='section' key={index}>
                                                    <div className='section-title'>
                                                        {section.label}
                                                    </div>
                                                    <div className='section-content'>
                                                        {section.permissions.map((permission, indexP) => (
                                                            <div className='margin-top-base' key={indexP}>
                                                                <Checkbox toggle label={permission.description} value={permission.isActive} checked={permission.isActive}  onChange={(e, data) => alert("oi")} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div> 
                                            </Grid.Column>
                                        )) } 
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </div> 
                    </div> */}

                    <div className='padding-s-base'>
                        <div className='section sticky--section margin-top-l'>
                            <div className='section-title'>
                                <Header as='h2'>Criado</Header>                    
                            </div>
                            <div className='section-content'>
                                <Grid columns={3} >
                                    <Grid.Row>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Calendário
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar comentários ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Mudar fase de calendário ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Avaliações
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Editar avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Remover avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Interrupções
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Editar interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Remover interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </div>
                        <div className='section sticky--section margin-top-l'>
                            <div className='section-title'>
                                <Header as='h2'>Edição (GOP)</Header>                    
                            </div>
                            <div className='section-content'>
                                <Grid columns={3} >
                                    <Grid.Row>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Calendário
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar comentários ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Mudar fase de calendário ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Avaliações
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Editar avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Remover avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Interrupções
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Editar interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Remover interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </div>
                        <div className='section sticky--section margin-top-l'>
                            <div className='section-title'>
                                <Header as='h2'>Edição (Coordernador de Curso)</Header>                    
                            </div>
                            <div className='section-content'>
                                <Grid columns={3} >
                                    <Grid.Row>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Calendário
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar comentários ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Mudar fase de calendário ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Avaliações
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Editar avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Remover avaliações ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                        <Grid.Column>
                                            <div className='section'>
                                                <div className='section-title'>
                                                    Interrupções
                                                </div>
                                                <div className='section-content'>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Adicionar interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Editar interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                    <div className='margin-top-base'>
                                                        <Checkbox toggle label='Remover interrupções ' value='false' checked='false'  onChange={(e, data) => console.log("oi")} />
                                                    </div>
                                                </div>
                                            </div> 
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </div>
                        </div>
                    </div>
                </Tab.Pane>
            ),
        },
    ];

    return (
        <>
            { (state.groupPermissions.length > 0) && (
                <div className='margin-top-l'>                    
                    <Tab panes={panes} renderActiveOnly/>
                </div>
            )}
        </>
    );
};

export default GroupPermissions;