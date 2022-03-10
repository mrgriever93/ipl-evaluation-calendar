import React, {useEffect} from 'react';
import {ToastContainer} from 'react-toastify';
import {Routes, Route, useNavigate} from 'react-router-dom';
import {Provider as StoreProvider} from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Login from './pages/Auth/Login';
import NotFoundPage from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import store from './redux/store';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.baseURL = 'http://localhost/api';

axios.interceptors.request.use((config) => {
    if (!config.url.includes('login')) {
        config.headers.Authorization = `Bearer ${localStorage.getItem(
            'authToken',
        )}`;
    }
    return config;
});

axios.interceptors.response.use(
    (res) => res,
    (error) => {
        if (
            (error?.response?.status === 401
                || jwtDecode(localStorage.getItem('authToken')).exp
                < Date.now() / 1000)
            && !error.response.config.url.includes('login')
        ) {
            localStorage.removeItem('authToken');
            window.location = '/login';
            return;
        }

        return error;
    },
);

function App() {
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');
    useEffect(() => {
        if (!authToken) {
            navigate('/login');
        } else if (
            jwtDecode(localStorage.getItem('authToken')).exp
            < Date.now() / 1000
        ) {
            navigate('/login');
        }
    }, [authToken, navigate]);

    return (
        <StoreProvider store={store}>
            <ToastContainer/>
            <Routes>
                <Route path="/login" exact element={ <Login />}/>
                {authToken && <Route path="/" element={<Dashboard />}/> }
                {authToken && <Route path="/404" exact element={<NotFoundPage />}/> }
            </Routes>
        </StoreProvider>
    );
}

export default App;
