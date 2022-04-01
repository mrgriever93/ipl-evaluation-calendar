import React from 'react';
import {Button, Header, Icon, Table} from "semantic-ui-react";
import ShowComponentIfAuthorized from "../ShowComponentIfAuthorized";
import {useTranslation} from "react-i18next";

const EmptyTable = ({onBtnClick, colspan, label, permissions, isLoading = false}) => {
    const { t } = useTranslation();
    return (
        <Table.Row key="empty-table">
            <Table.Cell colSpan={colspan} className={"empty-table-row"}>
                { isLoading ? (
                        <div className={"margin-y-l"}>{t("A carregar registos...")}</div>
                    ) : (
                        <div className='empty-table-row-content'>
                            <Header as='h2' className={"margin-y-l"}>{label}</Header>
                            <div className={"margin-bottom-xl"}>
                                <Icon.Group size='huge'>
                                    <Icon size='large' color='grey' name='clipboard outline' className={"margin-none"}/>
                                    <Icon size='tiny' color='grey' name='cogs' />
                                </Icon.Group>
                            </div>
                            <div>
                                <ShowComponentIfAuthorized permission={permissions}>
                                    <Button color="green" content={t("Novo")} onClick={onBtnClick}/>
                                </ShowComponentIfAuthorized>
                            </div>
                        </div>
                    )
                }
            </Table.Cell>
        </Table.Row>
    )
}

export default EmptyTable;
