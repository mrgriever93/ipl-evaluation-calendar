import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Card, Header, Grid, Checkbox, Tab } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { errorConfig, successConfig } from '../../utils/toastConfig';
import {useParams} from "react-router-dom";

const GroupPermissions = () => {
    const [state, setState] = useState({
        groupPermissions: [],
        calendarGroupPermissions: [],
    });
    // const [groupPermissions, setGroupPermissions] = useState([]);
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
            let permissionSections = res.data.data || [];
            setState( prevState => ({
                calendarGroupPermissions: prevState.calendarGroupPermissions,
                groupPermissions: permissionSections
            }));
            console.log(state.groupPermissions);
        });

        axios.get('/user-group/' + paramsId + '/calendar-permissions').then((res) => {
            let permissionPhases = res.data.data || [];
            setState( prevState => ({
                groupPermissions: prevState.groupPermissions,
                calendarGroupPermissions: permissionPhases
            }));
            console.log(state.calendarGroupPermissions);
        });
    }, []);

    

    const updateGroupPermissions = (added, permissionId, groupId) => {
        added.isActive = true;
        console.log(added, permissionId, groupId);
        // axios.put('/permission', {
        //     permission_id: permissionId,
        //     group_id: groupId,
        //     enabled: added,
        // });
    };

    const panes = [
        {menuItem: "Permissões Gerais", render: () => (
            <Tab.Pane>
                <div className='padding-s-base'>
                    <Grid columns={3} >
                        <Grid.Row>
                            { state.groupPermissions.map( (section, index) => (
                                <Grid.Column key={index}>
                                    <div className='section'>
                                        <div className='section-title'>
                                            {section.label}
                                        </div>
                                        <div className='section-content'>
                                            {section.permissions.map((permission, indexP) => (
                                                <div className='margin-top-base' key={indexP}>
                                                    <Checkbox toggle label={permission.description} checked={permission.isActive} onChange={ (e, data) => updateGroupPermissions(permission, section, '12321') } />
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
                    <div className='padding-s-base'>
                        { state.calendarGroupPermissions.map( (phase, phaseIndex) => (
                            <div className='section sticky--section margin-top-l' key={phaseIndex}>
                                <div className='section-title'>
                                    <Header as='h3'>{phase.label}</Header>                    
                                </div>
                                <div className='section-content'>
                                    <Grid columns={3} >
                                        <Grid.Row>
                                            { phase.sections.map( (section, sectionIndex) => (
                                                <Grid.Column key={sectionIndex}>
                                                    <div className='section'>
                                                        <div className='section-title'>{section.label}</div>
                                                        <div className='section-content'>
                                                            { section.permissions.map( (perm, permIndex) => (
                                                                <div className='margin-top-base' key={permIndex}>
                                                                    <Checkbox toggle label={perm.description} checked={perm.isActive} onChange={(e, data) => console.log("oi", perm.id)} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div> 
                                                </Grid.Column>
                                            ))}
                                        </Grid.Row>
                                    </Grid>
                                </div>
                            </div>
                        ))}
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