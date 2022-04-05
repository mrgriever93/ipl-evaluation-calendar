import React, {useEffect, useState} from 'react';
import {Card, Container, Table, Button, Icon, Modal, Header, Dimmer, Loader, Checkbox, Popup} from 'semantic-ui-react';
import axios from 'axios';
import {useTranslation} from "react-i18next";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {toast} from 'react-toastify';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';
import EmptyTable from "../../components/EmptyTable";
import YearSelector from "./yearSelector";

const SweetAlertComponent = withReactContent(Swal);


const AnoLetivo = () => {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [academicYearsList, setAcademicYearsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        {name: 'ID',                style: {width: '15%'}},
        {name: t('Descrição')},
        {name: t('Ativo'),          textAlign: 'center', popup: <Popup trigger={<Icon name="info circle" />} content={t('Anos letivos disponivies para os utilizadores selecionarem.')} position='top center'/>},
        {name: t('Selecionado'),    textAlign: 'center', popup: <Popup trigger={<Icon name="info circle" />} content={t('É o ano que irá estar selecionado automáticamente para o utilizador! Apenas um pode estar selecionado de cada vez.')} position='top center'/>},
        {name: t('Ações'),          style: {width: '15%'}}
    ];

    const getAcademicYearsList = () => {
        setLoading(true);
        axios.get('academic-years').then((response) => {
            setLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setAcademicYearsList(response?.data?.data);
            }
        });
    }

    useEffect(() => {
        getAcademicYearsList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = (id, code) => {
        setModalInfo({id, code});
        setModalOpen(true);
    };


    const handleModalClose = () => setModalOpen(false);

    const handleRemoval = () => {
        handleModalClose();
        setLoading(true);
        axios.delete('/academic-year/' + modalInfo.id).then((res) => {
            setLoading(false);
            if (res.status === 200) {
                toast(t('ano_letivo.Ano letivo atualizado com sucesso!'), successConfig);
                setAcademicYearsList(res?.data?.data);
            } else {
                toast(t('ano_letivo.Ocorreu um problema ao atualizar o ano letivo!'), errorConfig);
            }
        });
    };

    const handleYearSelected = (id) => {
        const toUpdateSelectedIndex = academicYearsList.findIndex((el) => el.id === id);
        const toUpdateUnSelectedIndex = academicYearsList.findIndex((el) => el.selected);
        if(toUpdateSelectedIndex !== toUpdateUnSelectedIndex && toUpdateSelectedIndex > -1 && toUpdateUnSelectedIndex > -1){
            setLoading(true);
            axios.post('/academic-year/' + id + "/selected").then((res) => {
                setLoading(false);
                if (res.status === 200) {
                    setAcademicYearsList(res?.data?.data);
                    toast(t('ano_letivo.Ano letivo atualizado com sucesso!'), successConfig);
                } else {
                    toast(t('ano_letivo.Ocorreu um problema ao atualizar o ano letivo!'), errorConfig);
                }
                //getAcademicYearsList();
            });
        } else {
            alert("There is always one selected");
        }
    };

    const handleYearActive = (id) => {
        const toUpdateSelectedIndex = academicYearsList.findIndex((el) => el.id === id);
        academicYearsList[toUpdateSelectedIndex].isActiveLoading = true;
        axios.post('/academic-year/' + id + "/active").then((res) => {
            if (res.status === 200) {
                toast(t('ano_letivo.Ano letivo atualizado com sucesso!'), successConfig);
                academicYearsList[toUpdateSelectedIndex].isActiveLoading = false;
                academicYearsList[toUpdateSelectedIndex].active = !academicYearsList[toUpdateSelectedIndex].active;
            } else {
                toast(t('ano_letivo.Ocorreu um problema ao atualizar o ano letivo!'), errorConfig);
            }
        });
    };
    function handleGetList() {
        getAcademicYearsList();
    }
    const openNewAcademicYear = () => {
        let selectedYear = "";
        SweetAlertComponent.fire({
            title: t('ano_letivo.Abrir novo ano letivo'),
            html: <YearSelector existingYears={academicYearsList} yearChange={(year) => {selectedYear = year;}} />,
            denyButtonText: t('Não'),
            confirmButtonText: t('Sim'),
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        }).then((result) => {
                if (result.isConfirmed) {
                    setLoading(true);
                    const codeYear = selectedYear.replace('-', '');
                    axios.post('/academic-years', {
                        code: codeYear,
                        display: selectedYear,
                    }).then((res) => {
                        if (res.status === 201) {
                            toast(t('ano_letivo.O novo ano letivo foi aberto com sucesso!'), successConfig);
                            setAcademicYearsList(res?.data?.data);
                            setLoading(false);
                        } else {
                            toast(t('ano_letivo.Ocorreu um problema ao abrir um novo ano letivo!'), errorConfig);
                        }
                    });
                }
            });
    };

    return (
        <Container>
            <Card fluid>
                <Card.Content>
                    <div>
                        <Header as="span" className={'display-inline'}>{t('ano_letivo.Anos letivos')}</Header>
                        <ShowComponentIfAuthorized permission={[SCOPES.CREATE_ACADEMIC_YEARS]}>
                            {!loading && (
                                <Button floated="right" color="green" onClick={openNewAcademicYear}>
                                    {t('Criar novo')}
                                </Button>
                            )}
                        </ShowComponentIfAuthorized>
                    </div>
                </Card.Content>
                <Card.Content>
                    { !loading && academicYearsList.length > 0 ? (
                        <Table celled fixed>
                            <Table.Header>
                                <Table.Row>
                                    {columns.map(({name, textAlign, popup, style}, index) => (
                                        <Table.HeaderCell key={index} textAlign={textAlign} style={ style }>{name} {popup}</Table.HeaderCell>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                { academicYearsList.map(({id, active, selected, display, code, isActiveLoading, isSelectedLoading}) => (
                                    <Table.Row key={id}>
                                        <Table.Cell>{id}</Table.Cell>
                                        <Table.Cell><b>{display}</b> <small>({code})</small></Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_ACADEMIC_YEARS]} renderIfNotAllowed={<Checkbox toggle disabled defaultChecked={active}/>}>
                                                { isActiveLoading && (<Icon loading name='spinner'/>)}
                                                <Checkbox toggle defaultChecked={active} onChange={() => handleYearActive(id)} />
                                            </ShowComponentIfAuthorized>
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <ShowComponentIfAuthorized permission={[SCOPES.EDIT_ACADEMIC_YEARS]} renderIfNotAllowed={<Checkbox toggle disabled defaultChecked={selected}/>}>
                                                { isSelectedLoading && (<Icon loading name='spinner'/>)}
                                                <Checkbox toggle defaultChecked={selected} disabled={selected} onChange={() => handleYearSelected(id)} />
                                            </ShowComponentIfAuthorized>
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <ShowComponentIfAuthorized permission={[SCOPES.DELETE_ACADEMIC_YEARS]}>
                                                <Button onClick={() => remove(id, code)} color="red" icon disabled={selected}>
                                                    <Icon name="trash"/>
                                                </Button>
                                            </ShowComponentIfAuthorized>
                                        </Table.Cell>
                                    </Table.Row>
                                )) }
                            </Table.Body>
                        </Table>
                        ) : ( <EmptyTable isLoading={loading} label={t('Sem resultados')}/> ) }
                </Card.Content>
            </Card>
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
                <Modal.Header>{t('ano_letivo.Remover Ano letivo')}</Modal.Header>
                <Modal.Content>
                    {t('ano_letivo.Tem a certeza que deseja remover o Ano letivo')} <strong>{modalInfo?.code}</strong>?
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={handleModalClose}>{t('Cancelar')}</Button>
                    <Button positive onClick={handleRemoval}>{t('Sim')}</Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
};

export default AnoLetivo;
