import React, {useEffect, useState} from 'react';
import {Card, Container, Table, Button, Icon, Modal, Header, Dimmer, Loader, Checkbox} from 'semantic-ui-react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {useTranslation} from "react-i18next";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {toast} from 'react-toastify';
import moment from 'moment';
import ShowComponentIfAuthorized from '../../components/ShowComponentIfAuthorized';
import SCOPES from '../../utils/scopesConstants';
import {successConfig, errorConfig} from '../../utils/toastConfig';

const SweetAlertComponent = withReactContent(Swal);


const AnoLetivo = () => {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [academicYearsList, setAcademicYearsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newYearSelected, setNewYearSelected] = useState();
    const columns = [
        {name: 'ID'},
        {name: t('Descrição')},
        {name: t('Ativo'), textAlign: 'center'},
        {name: t('Ações')}
    ];
    const academicYears = [
        moment(new Date()).add(-2, 'year').format('YYYY') + "-" + moment(new Date()).add(-1, 'year').format('YY'),
        moment(new Date()).add(-1, 'year').format('YYYY') + "-" +  moment(new Date()).format('YY'),
        moment(new Date()).format('YYYY') + "-" +  moment(new Date()).add(1, 'year').format('YY'),
        moment(new Date()).add(1, 'year').format('YYYY') + "-" +  moment(new Date()).add(2, 'year').format('YY'),
        moment(new Date()).add(2, 'year').format('YYYY') + "-" +  moment(new Date()).add(3, 'year').format('YY')
    ];


    const currentAcademicYear = moment(new Date()).format('YYYY') + moment(new Date()).add(1, 'year').format('YY');

    useEffect(() => {
        axios.get('academic-years').then((response) => {
            setLoading(false);
            if (response.status >= 200 && response.status < 300) {
                setAcademicYearsList(response?.data?.data);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = (userGroup) => {
        setModalInfo(userGroup);
        setModalOpen(true);
    };

    const handleModalClose = () => setModalOpen(false);

    const handleRemoval = () => {
        handleModalClose();
    };

    const openNewAcademicYear = () => {
        const title = moment(new Date()).format('YYYY') + '-' + moment(new Date()).add(1, 'year').format('YY');

        let finalHTML = t('ano_letivo.Ao abrir um novo ano letivo, este ficará ativo por defeito para todos os utilizadores!');
        finalHTML += '<br/><strong>' + t('ano_letivo.Tem a certeza que deseja abrir um novo ano letivo com o seguinte código?') + '</strong>';
        finalHTML += '<br/><br/>'; //<h1 title>' + title + '</h1>

        academicYears.forEach((element) => {
            finalHTML +=`<div class="field"><div class="ui radio checkbox">`;
            finalHTML +=`    <input type="radio" class="hidden" tabIndex="0" value="${element}" id="radio_year_${element}" name="radio_year"/>`;
            finalHTML +=`    <label for="radio_year_${element}">${element}</label>`;
            finalHTML +=`</div></div>`;
        });

        SweetAlertComponent.fire({
            title: t('ano_letivo.Abrir novo ano letivo'),
            html: finalHTML,
            denyButtonText: t('Não'),
            confirmButtonText: t('Sim'),
            showConfirmButton: true,
            showDenyButton: true,
            confirmButtonColor: '#21ba45',
            denyButtonColor: '#db2828',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    axios.post('/academic-years', {
                        code: `${moment(new Date()).format('YYYY')}${moment(new Date()).add(1, 'year').format('YY')}`,
                        display: `${moment(new Date()).format('YYYY')}-${moment(new Date()).add(1, 'year').format('YY')}`,
                    }).then((res) => {
                        if (res.status === 201) {
                            toast(t('ano_letivo.O novo ano letivo foi aberto com sucesso!'), successConfig);
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
                    {loading && (
                        <Dimmer active inverted>
                            <Loader indeterminate>{t('A carregar dados')}</Loader>
                        </Dimmer>
                    )}
                    <Header as="span">{t('ano_letivo.Anos letivos')}</Header>
                    <ShowComponentIfAuthorized permission={[SCOPES.CREATE_ACADEMIC_YEARS]}>
                        {!loading && !academicYearsList?.find((x) => x.code === currentAcademicYear) && (
                            <Button floated="right" color="green" onClick={openNewAcademicYear}>
                                {t('Criar novo')}
                            </Button>
                        )}
                    </ShowComponentIfAuthorized>
                </Card.Content>
                <Card.Content>
                    <Table celled fixed>
                        <Table.Header>
                            <Table.Row>
                                {columns.map(({name, textAlign}, index) => (
                                    <Table.HeaderCell key={index} textAlign={textAlign}>{name}</Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {academicYearsList.length > 0 ? academicYearsList.map(({id, code, active}) => (
                                <Table.Row key={id}>
                                    <Table.Cell>{id}</Table.Cell>
                                    <Table.Cell>{code}</Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <Icon name={active ? 'checkmark' : 'close'}/>
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        <ShowComponentIfAuthorized permission={[SCOPES.EDIT_ACADEMIC_YEARS]}>
                                            <Link to={`/ano-letivo/edit/${id}`}>
                                                <Button color="yellow" icon>
                                                    <Icon name="edit"/>
                                                </Button>
                                            </Link>
                                        </ShowComponentIfAuthorized>
                                        <ShowComponentIfAuthorized permission={[SCOPES.DELETE_ACADEMIC_YEARS]}>
                                            <Button onClick={() => remove({id, code})} color="red" icon disabled={active}>
                                                <Icon name="trash"/>
                                            </Button>
                                        </ShowComponentIfAuthorized>
                                    </Table.Cell>
                                </Table.Row>
                            )) :
                                (
                                    <Table.Row>
                                        <Table.Cell colSpan='4' textAlign="center">
                                            {t('Sem resultados')}
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                        </Table.Body>
                    </Table>
                </Card.Content>
            </Card>
            <Modal dimmer="blurring" open={modalOpen} onClose={handleModalClose}>
                <Modal.Header>{t('ano_letivo.Remover Ano letivo')}</Modal.Header>
                <Modal.Content>
                    {t('ano_letivo.Tem a certeza que deseja remover o Ano letivo')}<strong>{modalInfo?.code}</strong>?
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
