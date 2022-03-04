import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import {
  Container, Image, Menu, Dropdown,
} from 'semantic-ui-react';
import axios from 'axios';
import { logout, setAcademicYear } from '../../redux/app/actions';
import logoSVG from '../../logo.svg';
import SCOPES, {
  ACADEMIC_YEAR_SCOPES, CALENDAR_PHASES_SCOPES, CONFIG_SCOPES, COURSE_SCOPES, COURSE_UNIT_SCOPES, EVALUATION_TYPE_SCOPES, INTERRUPTION_TYPES_SCOPES, LANGUAGE_SCOPES, PERMISSIONS_SCOPES, SCHOOLS_SCOPES, USER_GROUPS_SCOPES, USER_SCOPES,
} from '../../utils/scopesConstants';
import ShowComponentIfAuthorized from '../ShowComponentIfAuthorized';

const HeaderMenu = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [academicYearsList, setAcademicYearsList] = useState([]);

  const logoutUser = () => {
    axios.post('/logout').then(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      dispatch(logout());
      history.push('/login');
    });
  };

  const switchAcademicYear = (academicYear) => {
    axios
      .post('academic-years/switch', {
        switch_to: academicYear.id,
      })
      .then(() => {
        dispatch(setAcademicYear(academicYear));
        history.go(0);
      });
  };

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

  const selectedAcademicYear = useSelector((state) => state.app.academicYear);

  return (
    <Menu borderless>
      <Container>
        <Menu.Item header>
          <Link to="/">
            <Image src={logoSVG} width="100px" />
          </Link>
        </Menu.Item>
        <Menu.Item as={Link} to="/calendario">
          Calendários
        </Menu.Item>
        <ShowComponentIfAuthorized permission={[...COURSE_UNIT_SCOPES]}>
          <Dropdown item simple text="Unidades Curriculares">
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/unidade-curricular">
                Unidades Curriculares
              </Dropdown.Item>
              <Dropdown.Item
                as={Link}
                to="/agrupamento-unidade-curricular"
              >
                Agrupamentos
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ShowComponentIfAuthorized>
        <ShowComponentIfAuthorized
          permission={[...COURSE_SCOPES]}
        >

          <Menu.Item as={Link} to="/curso">
            Cursos
          </Menu.Item>
        </ShowComponentIfAuthorized>
        <ShowComponentIfAuthorized
          permission={[...CONFIG_SCOPES]}
        >
          <Dropdown item simple text="Configurações">
            <Dropdown.Menu>
              <ShowComponentIfAuthorized
                permission={[...ACADEMIC_YEAR_SCOPES]}
              >
                <Dropdown.Item as={Link} to="/ano-letivo">
                  Anos Letivos
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              <ShowComponentIfAuthorized
                permission={[...SCHOOLS_SCOPES]}
              >
                <Dropdown.Item as={Link} to="/escola">
                  Unidades de Ensino
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              { false && (
              <ShowComponentIfAuthorized
                permission={[...LANGUAGE_SCOPES]}
              >
                <Dropdown.Item as={Link} to="/idioma">
                  Idiomas
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              )}
              <ShowComponentIfAuthorized
                permission={[...CALENDAR_PHASES_SCOPES]}
              >
                <Dropdown.Item
                  as={Link}
                  to="/calendario/fases"
                >
                  Fases Calendário
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              <ShowComponentIfAuthorized
                permission={[
                  ...INTERRUPTION_TYPES_SCOPES,
                ]}
              >
                <Dropdown.Item as={Link} to="/interrupcao/">
                  Tipos Interrupções
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              <ShowComponentIfAuthorized
                permission={[...EVALUATION_TYPE_SCOPES]}
              >
                <Dropdown.Item as={Link} to="/tipo-avaliacao">
                  Tipos Avaliações
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              <ShowComponentIfAuthorized
                permission={[...USER_GROUPS_SCOPES]}
              >
                <Dropdown.Item
                  as={Link}
                  to="/grupo-utilizador"
                >
                  Grupos Utilizador
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              <ShowComponentIfAuthorized
                permission={[...USER_SCOPES]}
              >
                <Dropdown.Item as={Link} to="/utilizador/">
                  Utilizadores
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
              <ShowComponentIfAuthorized
                permission={[...PERMISSIONS_SCOPES]}
              >
                <Dropdown.Item as={Link} to="/permissoes/">
                  Permissões
                </Dropdown.Item>
              </ShowComponentIfAuthorized>
            </Dropdown.Menu>
          </Dropdown>
        </ShowComponentIfAuthorized>
        <Menu.Menu position="right">
          {academicYearsList?.length > 1 && (
            <Dropdown item text="Ano letivo">
              <Dropdown.Menu>
                {academicYearsList?.map((academicYear) => (
                  <Dropdown.Item
                    key={academicYear?.code}
                    onClick={() => {
                      switchAcademicYear(academicYear);
                    }}
                  >
                    {academicYear?.display}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
          <Menu.Item>{selectedAcademicYear?.display}</Menu.Item>
          <Menu.Item onClick={logoutUser}>
            {localStorage.getItem('username')}
            {' '}
            | Logout
          </Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  );
};

export default HeaderMenu;
