import React from 'react';
import {useTranslation} from "react-i18next";
import {Button, Modal, List, Icon, Table, Header, Message} from 'semantic-ui-react';

const PopupRevisionDetail = ( {isOpen, onClose, warnings} ) => {
    // const history = useNavigate();
    const { t } = useTranslation();

    return (
        <Modal closeOnEscape closeOnDimmerClick open={isOpen} onClose={onClose}>
            <Modal.Header as={"h2"}>{ t("Revisão") }</Modal.Header>
            <Modal.Content scrolling>
                <List relaxed>
                    {warnings.map((item, indexUc) => (
                        <List.Item key={indexUc} className={"margin-top-base "} >
                            <List.Icon size={"large"} name={item.is_complete ? 'check circle' : "close"} color={item.is_complete ? 'green' : "red"} />
                            <List.Content>
                                <List.Header as={"h3"}>{ item.name }</List.Header>
                                { item.methods.length > 0 ? (
                                        <Table basic='very' celled>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell width="1"></Table.HeaderCell>
                                                    <Table.HeaderCell>{ t("Elemento de Avaliação") }</Table.HeaderCell>
                                                    <Table.HeaderCell>{ t("Época") }</Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                { item.methods.map((method, indexMethod) => (
                                                    <Table.Row key={indexMethod}>
                                                        <Table.Cell textAlign={"center"}>
                                                            <Icon name={method.is_done ? 'checkmark' : "close"} color={method.is_done ? 'green' : "red"}/>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Header as='h5' disabled floated={"right"}>
                                                                Min. {method.minimum} / Peso: {parseInt(method.weight, 10)}%
                                                            </Header>
                                                            <Header as='h4'>
                                                                {method.description}
                                                            </Header>
                                                        </Table.Cell>
                                                        <Table.Cell>{method.epoch}</Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                ) : (
                                    <Message size='tiny' warning={true}>
                                        <div>{ t("Esta Unidade Curricular não tem métodos definidos.")}</div>
                                        <div className='margin-top-xs'>
                                            <a href={ "/unidade-curricular/edit/" + item.id} target="_blank">{ t("Preencha aqui")} <Icon name="external alternate" /></a>
                                        </div>
                                    </Message>
                                )}
                            </List.Content>
                        </List.Item>
                    ))}
                </List>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>{t('Fechar')}</Button>
            </Modal.Actions>
        </Modal>
    );
};
export default PopupRevisionDetail;