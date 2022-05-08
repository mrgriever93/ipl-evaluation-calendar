import React, {useState} from 'react';
import {Icon, Menu, Tab} from 'semantic-ui-react';
import {useTranslation} from "react-i18next";

import Methods from "./TabMethods";
import Teachers from "./TabTeachers";
import Logs from "./TabLogs";

const CourseTabs = ({ unitId }) => {
    const { t } = useTranslation();
    const [hasWarnings, setHasWarnings] = useState(false);

    const handleWarningMethods = (value) => {
        setHasWarnings(value)
    }

    const panes = [
        {
            menuItem: (<Menu.Item key='tab_header_teachers'><Icon name="users"/> { t("Professores") }</Menu.Item>),
            pane: { key: 'tab_teachers',    content: <Teachers unitId={unitId} /> }
        },
        {
            menuItem: (<Menu.Item key='tab_header_methods'><Icon name="file alternate"/> { t("Métodos") } {hasWarnings && (<Icon color='orange' name="warning sign"/>)}</Menu.Item>),
            pane: { key: 'tab_methods',     content: <Methods unitId={unitId} warningsHandler={handleWarningMethods} /> }
        },
        {
            menuItem: (<Menu.Item key='tab_header_logs'><Icon name="unordered list"/> { t("Logs") }</Menu.Item>),
            pane: { key: 'tab_logs',        content: <Logs unitId={unitId} /> }
        },
    ]
    return ( <Tab panes={panes} renderActiveOnly={false} /> );
};

export default CourseTabs;
