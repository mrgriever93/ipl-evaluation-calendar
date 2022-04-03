import React from 'react';
import {Outlet} from 'react-router-dom';
import HeaderMenu from '../components/Menu';

const Layout = () => {
    const updateLang = (lang) =>{
        console.log(lang);
    }
    return (
        <>
            <HeaderMenu languageChanger={updateLang}/>
            <Outlet/>
        </>
    );
};

export default Layout;
