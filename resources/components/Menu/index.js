import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useNavigate} from 'react-router-dom';
import {Container, Image, Menu, Dropdown} from 'semantic-ui-react';
import axios from 'axios';
import {useTranslation} from "react-i18next";
import {logout, setAcademicYear} from '../../redux/app/actions';
import logoSVG from '../../logo.svg';
import SCOPES, {
    ACADEMIC_YEAR_SCOPES,
    CALENDAR_PHASES_SCOPES,
    CONFIG_SCOPES,
    COURSE_SCOPES,
    COURSE_UNIT_SCOPES,
    EVALUATION_TYPE_SCOPES,
    INTERRUPTION_TYPES_SCOPES,
    LANGUAGE_SCOPES,
    PERMISSIONS_SCOPES,
    SCHOOLS_SCOPES,
    USER_GROUPS_SCOPES,
    USER_SCOPES,
} from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../ShowComponentIfAuthorized';

const HeaderMenu = ({languageChanger}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [academicYearsList, setAcademicYearsList] = useState([]);

    const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('language'));

    useEffect(() => {
        axios.get('academic-years').then((response) => {
            if (response.status >= 200 && response.status < 300) {
                dispatch(
                    setAcademicYear(
                        response?.data?.data?.find((year) => year.selected),
                    ),
                );
                setAcademicYearsList(response?.data?.data);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        axios.get('/permissions').then((res) => {
            if (res.status === 200) {
                localStorage.setItem('scopes', JSON.stringify(res.data));
            }
        });
    }, []);

    const logoutUser = () => {
        axios.post('/logout').then(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            dispatch(logout());
            navigate('/login');
        });
    };

    const switchAcademicYear = (academicYear) => {
        axios
            .post('academic-years/switch', {
                switch_to: academicYear.id,
            })
            .then(() => {
                dispatch(setAcademicYear(academicYear));
                window.location.reload();
            });
    };

    const changeLanguage = (lang) => {
        localStorage.setItem('language', lang);
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang);
        languageChanger(lang);
        //window.location.reload();
    }

    const selectedAcademicYear = useSelector((state) => state.app.academicYear);

    return (
        <Menu borderless>
            <Container>
                <Menu.Item header>
                    <Link to="/">
                        <Image src={logoSVG} width="100px"/>
                    </Link>
                </Menu.Item>
                <Menu.Item as={Link} to="/calendario">{t('menu.Calendários')}</Menu.Item>
                <ShowComponentIfAuthorized permission={[...COURSE_UNIT_SCOPES]}>
                    <Dropdown item text={t('menu.Unidades Curriculares')}>
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/unidade-curricular">{t('menu.Unidades Curriculares')}</Dropdown.Item>
                            <Dropdown.Item as={Link} to="/agrupamento-unidade-curricular">{t('menu.Agrupamentos')}</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </ShowComponentIfAuthorized>
                <ShowComponentIfAuthorized permission={[...COURSE_SCOPES]}>
                    <Menu.Item as={Link} to="/curso">{t('menu.Cursos')}</Menu.Item>
                </ShowComponentIfAuthorized>
                <ShowComponentIfAuthorized permission={[...CONFIG_SCOPES]}>
                    <Dropdown item text={t('menu.Configurações')}>
                        <Dropdown.Menu>
                            <ShowComponentIfAuthorized permission={[...ACADEMIC_YEAR_SCOPES]}>
                                <Dropdown.Item as={Link} to="/ano-letivo">{t('menu.Anos Letivos')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            <ShowComponentIfAuthorized permission={[...SCHOOLS_SCOPES]}>
                                <Dropdown.Item as={Link} to="/escola">{t('menu.Unidades de Ensino')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            <ShowComponentIfAuthorized permission={[...CALENDAR_PHASES_SCOPES]}>
                                <Dropdown.Item as={Link} to="/calendario/fases">{t('menu.Fases Calendário')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            <ShowComponentIfAuthorized permission={[...INTERRUPTION_TYPES_SCOPES,]}>
                                <Dropdown.Item as={Link} to="/interrupcao/">{t('menu.Tipos Interrupções')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            <ShowComponentIfAuthorized permission={[...EVALUATION_TYPE_SCOPES]}>
                                <Dropdown.Item as={Link} to="/tipo-avaliacao">{t('menu.Tipos Avaliações')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            <ShowComponentIfAuthorized permission={[...USER_GROUPS_SCOPES]}>
                                <Dropdown.Item as={Link} to="/grupo-utilizador">{t('menu.Grupos Utilizador')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            <ShowComponentIfAuthorized permission={[...USER_SCOPES]}>
                                <Dropdown.Item as={Link} to="/utilizador/">{t('menu.Utilizadores')}</Dropdown.Item>
                            </ShowComponentIfAuthorized>
                            {/* <ShowComponentIfAuthorized permission={[...PERMISSIONS_SCOPES]}>
                                <Dropdown.Item as={Link} to="/permissoes/">{t('menu.Permissões')}</Dropdown.Item>
                            </ShowComponentIfAuthorized> */}
                        </Dropdown.Menu>
                    </Dropdown>
                </ShowComponentIfAuthorized>
                <Menu.Item as={Link} to="/about">{t('menu.Sobre')}</Menu.Item>
                <Menu.Menu position="right">
                    <Dropdown item closeOnChange={true} text={selectedLanguage} className='lang-dropdown'>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={()=>{changeLanguage('pt')}}>Português</Dropdown.Item>
                            <Dropdown.Item onClick={()=>{changeLanguage('en')}}>English</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    {academicYearsList?.length > 1 && (
                        <Dropdown item text={t('menu.Ano letivo')}>
                            <Dropdown.Menu>
                                {academicYearsList?.map((academicYear) => (
                                    <Dropdown.Item key={academicYear?.code} onClick={()=>{switchAcademicYear(academicYear)}}>
                                        {academicYear?.display}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                    <Menu.Item>{selectedAcademicYear?.display}</Menu.Item>
                    <Menu.Item onClick={logoutUser}>
                        {localStorage.getItem('username') + ' '}| {t('menu.Sair')}
                    </Menu.Item>
                </Menu.Menu>
            </Container>
        </Menu>
    );
};

export default HeaderMenu;
