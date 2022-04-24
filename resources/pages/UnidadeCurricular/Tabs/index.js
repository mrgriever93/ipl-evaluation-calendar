import React from 'react';
import {Icon, Menu, Tab} from 'semantic-ui-react';
import {useTranslation} from "react-i18next";

import Methods from "./TabMethods";
import Teachers from "./TabTeachers";

const CourseTabs = ({ unitId }) => {
    const { t } = useTranslation();
    const panes = [
        { menuItem: (<Menu.Item key='tab_header_teachers'><Icon name="users"/> { t("Professores") }</Menu.Item>),       pane: { key: 'tab_teachers',    content: <Teachers unitId={unitId} /> } },
        { menuItem: (<Menu.Item key='tab_header_methods'><Icon name="file alternate"/> { t("Métodos") }</Menu.Item>),   pane: { key: 'tab_methods',     content: <Methods unitId={unitId}/> } },
    ]
    return ( <Tab panes={panes} renderActiveOnly={false} /> );
};

export default CourseTabs;
