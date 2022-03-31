import React from 'react';
import {Button, Header, Icon, Table} from "semantic-ui-react";
import ShowComponentIfAuthorized from "../ShowComponentIfAuthorized";
import {useTranslation} from "react-i18next";

const EmptyTable = ({onBtnClick, colspan, label, permissions, isLoading = false}) => {
    const { t } = useTranslation();
    return (
        <Table.Row key="empty-table">
            <Table.Cell colSpan={colspan} textAlign="center" className={"padding-xl empty-table-row"}>
                {
                    isLoading ?
                    (
                        <div className={"margin-y-l"}>{t("A carregar registos...")}</div>
                    ) : (
                        <>
                            <Header as='h2' color='red' className={"margin-y-l"} disabled>
                                {label}
                            </Header>
                            <div className={"margin-bottom-xl"}>
                                <Icon.Group size='huge'>
                                    <Icon size='large' color='grey' name='clipboard outline' className={"margin-none"}/>
                                    <Icon size='tiny' color='grey' name='cogs' />
                                </Icon.Group>
                            </div>
                            <div>
                                <ShowComponentIfAuthorized permission={permissions}>
                                    <Button color="green" content={t("Novo")} icon='plus' labelPosition='right' onClick={onBtnClick}/>
                                </ShowComponentIfAuthorized>
                            </div>
                        </>
                    )
                }
            </Table.Cell>
        </Table.Row>
    )
}

export default EmptyTable;
