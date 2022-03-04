import React from "react";
import { Container, Tab } from "semantic-ui-react";
import PermissoesGerais from "./partials/PermissoesGerais";
import PermissoesCalendario from "./partials/PermissoesCalendario";

const List = () => {
  const panes = [
    { menuItem: "Permissões Gerais", render: () => <PermissoesGerais /> },
    {
      menuItem: "Permissões do Calendário",
      render: () => <PermissoesCalendario />,
    },
  ];

  return (
    <Container style={{ marginTop: "2em" }}>
      <Tab panes={panes} renderActiveOnly />
    </Container>
  );
};

export default List;
