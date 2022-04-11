import React from 'react';
import {Icon, Menu, Tab} from 'semantic-ui-react';

import Branches from "./TabBranches";
import Students from "./TabStudents";
import CurricularUnits from "./TabCurricularUnits";

const CourseTabs = ({ courseId }) => {
    const panes = [
        { menuItem: (<Menu.Item key='tab_header_branches'><Icon name="code branch"/> Ramos</Menu.Item>),        pane: { key: 'tab_branches',    content: <Branches courseId={courseId}/> } },
        { menuItem: (<Menu.Item key='tab_header_units'><Icon name="book"/> Unidades Curriculares</Menu.Item>),  pane: { key: 'tab_units',       content: <CurricularUnits courseId={courseId} /> } },
        { menuItem: (<Menu.Item key='tab_header_students'><Icon name="user"/> Alunos</Menu.Item>),              pane: { key: 'tab_students',    content: <Students courseId={courseId}/> } },
    ]
    return ( <Tab panes={panes} renderActiveOnly={false} /> );
};

export default CourseTabs;
