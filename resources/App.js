import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { Switch, Route, useHistory } from 'react-router-dom';
import { Provider as StoreProvider } from 'react-redux';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import Login from './pages/Auth/Login';
import NotFoundPage from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import store from './redux/store';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.baseURL = 'http://localhost:8000/api';

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
  const history = useHistory();
  const authToken = localStorage.getItem('authToken');
  useEffect(() => {
    if (!authToken) {
      history.push('/login');
    } else if (
      jwtDecode(localStorage.getItem('authToken')).exp
                < Date.now() / 1000
    ) {
      history.push('/login');
    }
  }, [authToken, history]);

  return (
    <StoreProvider store={store}>
      <ToastContainer />
      <Switch>
        <Route path="/login" exact component={Login} />
        {authToken && (
        <Switch>
          <Route path="/404" exact component={NotFoundPage} />
          <Route path="/" component={Dashboard} />
        </Switch>
        )}
      </Switch>
    </StoreProvider>
  );
}

export default App;
