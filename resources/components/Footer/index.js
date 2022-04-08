import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Container, Image, Dropdown, List, Segment} from 'semantic-ui-react';
import {useTranslation} from "react-i18next";
import logoSVG from '../../logo.svg';

const Footer = ({languageChanger}) => {
    const { t, i18n } = useTranslation();

    const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('language'));

    const changeLanguage = (lang) => {
        localStorage.setItem('language', lang);
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang);
        languageChanger(lang);
    }
    return (
        <Segment inverted vertical className={'footer'}>
            <Container textAlign='center'>
                <Link to="/">
                    <Image centered src={logoSVG} width="100px"/>
                </Link>
                <List horizontal inverted divided link size='small'>
                    <List.Item as='a' href='/about'>
                        {t('menu.Sobre')}
                    </List.Item>
                    <List.Item>
                        <Dropdown upward item closeOnChange={true} text={selectedLanguage} className='lang-dropdown'>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={()=>{changeLanguage('pt')}}>Português</Dropdown.Item>
                                <Dropdown.Item onClick={()=>{changeLanguage('en')}}>English</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </List.Item>
                </List>
            </Container>
        </Segment>
    );
};

export default Footer;
