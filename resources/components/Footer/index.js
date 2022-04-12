import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Container, Image, Dropdown, List, Segment, Grid, Header } from 'semantic-ui-react';
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
            <Container>
                <Grid divided inverted stackable>
                    <Grid.Column width={8}>
                        <Link to="/">
                            <Image src={logoSVG} width="100px" style={{ filter: 'invert(1)' }}/>
                        </Link>
                        <Header inverted as='h5' content='CONTACTOS' />
                        <div>
                            <Header inverted as='h6' content='Telefone: (+351) 244830010' />
                            <Header inverted as='h6' content='E-mail: ipleiria@ipleiria.pt' style={{margin: '0'}} />
                        </div>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Header inverted as='h4' content='Links Úteis' />
                        <List link inverted>
                            <List.Item as='a' href='/about'>
                                {t('menu.Sobre')}
                            </List.Item>
                            <List.Item as='a' href='/about'>
                                {t('menu.Sobre')}
                            </List.Item>
                            <List.Item as='a' href='/about'>
                                {t('menu.Sobre')}
                            </List.Item>
                            <List.Item as='a' href='/about'>
                                {t('menu.Sobre')}
                            </List.Item>
                        </List>
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Header inverted as='h4' content='Linguagem' />
                        <List horizontal inverted divided link size='small'>
                            <List.Item as='a' className={selectedLanguage == 'pt' ? 'active' : ''} onClick={()=>{changeLanguage('pt')}}>Português</List.Item>
                            <List.Item as='a' className={selectedLanguage == 'en' ? 'active' : ''} onClick={()=>{changeLanguage('en')}}>English</List.Item>
                        </List>
                    </Grid.Column>
                </Grid>
            </Container>
        </Segment>
    );
};

export default Footer;
