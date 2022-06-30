# TODO

**Detalhe calendário**
- [ ] Adicionar avisos quando marcamos 2 vezes a mesma avaliação
- [2/3] Se tiver uma UC com métodos, validar se todos os métodos da UC estão calendarizados.
- [ ] Ao eliminar avaliações contínuas, só apaga o dia a apagar
  - [X] Campo na BD criado (group_id) > rever melhor mais tarde


**Agrupamentos**
- [ ] Ver lista (tem erro)
- [ ] Traduções
- [ ] Métodos
- [ ] Nas UCs agrupadas, os Coordenadores de Curso podem marcar grupos apenas para as UCs dos seus cursos (ex: EI PL e D)


### A Rever

**Calendário e marcação de avaliações**
  - [ ] Melhorar logs dos cursos, na alteração de métodos 


**Detalhe Calendário**
- [ ] Publicar calendario (nao funciona?)

**Todas as paginas**
- [ ] Rever traduções
- [ ] Adicionar titulo as paginas

**Ano Letivo**
  - [ ] Atualizar os loadings automaticamente 
    - **_talvez trabalho futuro?_** Usar Redis e WebSockets

## Issues
**Role: "Administracao"**

- [ ] detalhe de exame fica com espaco vazio
- [ ] listagem de calendarios fica com campos a menos

**Lista de calendarios**
- [ ] Meus calendarios/todos -> tem de se atualizar o filtro para ter as permissoes
  - [ ] Botao com role mais especifica? (sendo a direcao ou gop) ou grupo com flag? (tipo user generico)


### TODO Miguel
- [ ] Limpeza "Requests Folder"

---
# Done
- [X] No curso, qdo pede para rever cenas tipo Coordenador:
    - [X]  Dps de preencheres e gravar n atualiza para tirar o erro
    - [X]  E mantem o triangulo a dizer q faltam coisas na listagem
- [X] Mostrar um alerta quando estiver acima de 100% (métodos) para confirmar que quer submeter com mais de 100%;
- [X] Guardar nos métodos nem sempre funciona;
- [X] Rever Tabs dos Cursos
    - [X] Erros na utilização
- [X] Falta testar a pesquisa do coordenador de curso no detalhe do curso
- [X] Rever Tabs dos Cursos
    - Comentei botao de adicionar unidades curriculares, talvez trabalho futuro
- [X] Mensagem de erro no detalhe do curso com infos que faltam
- [X] Faltam traduções e validar se há mais mensagens a aparecer
- [X] Refeita tab dos ramos para usar a tabela
- [X] Para adicionar mantém-se a modal?
- [X] Atualizadas as permissões do lado da BD e do React
- [X] Falta testar. O seeder das permissões agora está mal porque os id's mudaram... Devia ser refeito para quando formos testar isto melhor por user na VM


- **(feito a 2-6-2022)**
  - [X] Lista Calendario
      - [X] Filtros so se houver calendarios noutros semestres ou no semestre atual
      - [X] Botao disabled se nao houver anos-letivos
  - [X] Ano-letivo
      - [X] Botao selected, corrigir o disable
      - [X] Refresh da pagina apos selecionar "selecionado" para atualizar o ano letivo escolhido


- **(feito a 17-6-2022)**
  - **Criação do calendário**
    - [X] Dia seguinte na validação das datas na criação do calendário
    - [X] Voltar a colocar inputs de start e end date em vez dos Range Picker

--- 

# Meetings log

---
## 2022-05-16
- [X] Nos cursos, UCs que não estão em tronco comum não aparecem (falta confirmar se foram carregadas na BD)
---
## 2022-05-29
- [X] Rever sync/refresh ano letivo
- [X] Rever falta de warning das configs da escola, quando as opções não estão todas preenchidas
---
## Perguntas - 2022-05-17
- [X] ao criar o calendario, adicionar campo para a 10 semana
    - so o gop
- [X] detalhe calendario
    - quando for para seguir para a proxima fase, mostrar popup com fases

----
## Feedback prof. Pedro Gago
- [X] No separador de "Calendários" (GOP) deve haver filtros

- [X] Na definição de métodos de avaliação falta uma opção que permita copiar entre épocas (é habitual a avaliação em exame ter os mesmos elementos tanto em recurso como em especial/mensal)
    - [X] FE
    - [X] BE
    - [X] Na definição de métodos de avaliação devia ir gravando o que se vai fazendo (está a obrigar a preencher tudo de uma vez)
- [X] É provavelmente melhor retirar a opção de criação de calendário para todos os cursos (são cursos a mais)
- [X] Na criação de Novo Calendário, se se escolher apenas a opção de avançar,
    - [X] pede "Tem de selecionar as interrupcoes mandatorias pelo menos!" - mudar para obrigatórias e/ou
    - [X] dizer quais
- [X] Tirar Inglês Geral, Matemáticas Gerais, etc
- [X] Quando tento marcar uma avaliação (1º semestre - 9119) fica "a pensar" à procura de UC

---
## Feedback reunião 2022-05-24
- [X] Marcar avaliações:
    - [X] Verificar se os métodos estão preenchidos
    - [X] Se não estiverem apresentar mensagem de erro e link para as Unidades Curriculares do curso
    - [X] Adicionar icone (check) nos métodos que já estão marcados
    - [X] Adicionar start e end date para avaliações (que se prolongam durante a semana, por exemplo)
    - [X] Retirar outras validações que limitem a plataforma
- [ ] Nas UCs agrupadas, os Coordenadores de Curso podem marcar grupos apenas para as UCs dos seus cursos (ex: EI PL e D)

---
## Reunião 2022-05-31
**Notas Távora**
- [X] Validações da 10a semana
- [X] validações datas época periódica, normal e Recurso, tem de ser superior às outras e ao ano letivo
- [X] Adicional + filtros na criação de calendário para selecionar o curso
- [X] Bug no detalhe da avaliação - observações não está a guardar
- [X] Adicionar descrição dos métodos de avaliação
  - [X] Atualizar no calendario a label
- [X] Automatizar criação da descrição dos métodos ao selecionar o tipo de avaliação
- [X] BUG - Ao duplicar métodos, no FE ele limpa, mas não adiciona à lista de elementos a eliminar, e ao gravar mostra os elementos de avaliação antigos
- [X] Botão Duplicar sticky nos métodos
- [X] Diferenciar quando é feito em aula ou nao (checkbox ou hora)
  - [X] cor diferente se for aula
- [X] Marcar mais do que uma prova no mesmo dia
- [X] Descrição da avaliação
- [X] Melhorar diferença visual das épocas
- [X] validar datas fora de época selecionada (ao marcar avaliações)
  - [X] Esta a validar do calendario, mas pode ser adicionado validacao por epoca
- [ ] Ao eliminar avaliações contínuas, só apaga o dia a apagar
- [X] tipos de avaliações
    - [X] Projetos e trabalhos
        - obrigatório data de lançamento dos enunciados
- [X] ir buscar os dados da sigla e nome inglês do novo webservice - QUANDO FOR CRIADO

---
## Reunião 2022-06-07
**Notas Pedro**
- [X] Validação das épocas não está bem:
  - [X] Deu para criar uma época de recurso no meio da época periódica
- [X] Issue do sticky na tab dos métodos que não renderiza bem até fazer scroll (já sabíamos)
- [X] Ao alterar uma data de uma avaliação, obriga a fazer refresh. Falta atualizar os dados no calendário (já sabíamos)
- [X] Devíamos adicionar uma notificação caso alguma avaliação dure mais do que 1 semana.


- [X] arranjar um webservice que disponibilize os dados das avaliações para outro grupo usar? **Pedido pelo Teams**
  - Penso que não haverá problema em ser pública (os calendários são públicos). A ser necessária, a parte da autenticação poderá ficar em trabalho futuro.
  - Só me parece necessário ter, para cada avaliação: UC, Tipo de Avaliação, Data. Se for possível, juntar o peso na nota final e o mínimo, caso exista.
  - Só português (nesta fase é só para eles poderem ligar datas de avaliação a possível abandono escolar)

**Notas Távora**
- não testou.
- [X] WebService já foi atualizado com Siglas das UCs e deve estar quase a ter também as UCs traduzidas
- [X] Não deve ser possível copiar da época periódica para as outras épocas (querem mesmo limitar pq agr qdo há as fichas das FUC tb têm de introduzir pelo menos duas épocas)
    - Feito mas esta "hardcoded"
- [ ] Deve permitir desfasar os anos. Eventualmente com uma checkbox quando criamos um calendário
    - **Trabalho Futuro?**
---
## Reunião 14/06/2022

- [X] Verificar regulamento para regras das datas;
  - Não havia nada de importante em relação às datas. Apenas as precedências de cada época

**Metodos**
- [X] Voltar a deixar duplicar entre todas as épocas;
- [X] Adicionar validação campo a campo (não saber inputs com erro)
- [X] "Tipo de curso" em vez de “grau de ensino"
- [X] Adicionar warning na tab professores quando responsável não está selecionado
- [X] Trocar ordem das tabs "métodos e professores
- [X] Definir números dos métodos de acordo com o tipo
- [X] "Época de origem" e "época de destino" em vez de “de" e "para"
- [X] No duplicar trocar os dropdowns para checkboxes.
- [X] Falta Acrescente métodos automáticos do projeto

**Detalhe avaliacao - Calendário**
- [X] Nos métodos não está a funcionar bem. (label na drodpwon não está correta)
  - [X] Erro na API não devolve a description
- [X] "Remover Avaliação" e "Alterar Data"
- [X] "Elemento de avaliação" em vez de "método"

**Criação do calendário**
- [X] Dia seguinte na validação das datas na criação do calendário
- [X] Voltar a colocar inputs de start e end date em vez dos Range Picker
- [X] Adicionar “voltar” na criação do calendario

**Detalhe calendário**
- [X] Adicionar “voltar” no detalhe na calendario
- [X] Adicionar flag para fases de calendários que precisam de ter os métodos todos marcados.
- [X] Quando se marca dois métodos no mesmo dia está a substituir ?!
- [ ] Adicionar avisos quando marcamos 2 vezes a mesma avaliação
- [X] Se tiver uma UC com métodos, validar se todos os métodos da UC estão calendarizados.
- [X] Adicionar validações que faltam preencher UCs no calendário.
- [X] Adicionar aviso visual que falta marcar Uc's

- [X] atualizar campos da escola no detalhe

---
## Reunião 21/06/2022

- [ ] Calendário provisório
- [X] Cada utilizador pode ter vários roles
- [ ] Guardar histórico dos calendários
- [ ] Só GOP / Direção / Coordenador podem publicar calendários
- [X] Destacar mais a revisão

## Reunião 28/06/2022
Melhorias:
- [ ] Filtrar lista de calendários por provisório/definitivo;
- [ ] Melhorar apresentação dos métodos associados a Projeto
  - [ ] Remover Peso e Minimos do Lançamento de Enunciado e Apresentação Oral
  - [ ] Bloquear a dropdown para não poder ser alterada
  - [ ] Deixar submeter caso algum metodo esteja a 0
- [ ] Publicar um calendário
  - [ ] Só CC, GOP ou Direção é que pode publicar
    - [ ] Se for o CC, é uma publicação provisória, e cria automaticamente um clone do calendário para continuar a editar e receber feedback
    - [ ] Se for o GOP Publica como definitivo e não cria copia
  - [ ] A direção e o Conselho Pedagógico deve ver apenas botões para Aprovar ou Rejeitar
    - [ ] Se rejeitarem devem poder adicionar um comentário/parecer
    - [ ] 



## TRABALHO FUTURO:
- [X] Adicionar flag em cursos como Inglês e Matemática para remover da listagem (não são cursos); **(Feito a ~~26/05/2022)**
- [ ] Adicionar flag nos cursos para saber quais estão em Inglês e devem ser sempre apresentados em Inglês;
- [ ] Users com mais do que um role (validar o que deve ser feito)
- [ ] Log dos métodos: registar o que foi alterado e quem alterou;
- [ ] Rever "voltar a lista" para navegar entre paginas de detalhe e listas (ex: curso e detalhe de unidades curriculares)
- [ ] Notificacoes de quando muda de fase ou adicionam  comentarios no calendario
    - [ ] Notificacoes Web
    - [ ] Notificacoes Email
- [ ] subtipos de avaliação **(Reunião 31/05/2022)**
    - poder adicionar subtipos na pagina de tipos de avaliacoes e depois quando se adicionar o metodo de avaliacao,
      estes sao automaticamente preenchidos, podendo ter o campo de obrigatoriedade ou nao.
- [ ] Anos curriculares desfasados por ano no Calendários - **(Reunião 31/05/2022)**
  - ex: o 1 ano pode comecar numa data diferente da do 2 e/ou 3 ano
  - trabalho futuro
  
- [ ] Melhorar accessibilidades pelo site (WCAG checklist) - especialmente cores e navegação com o keyboard
- [ ] Deve permitir desfasar os anos. Eventualmente com uma checkbox quando criamos um calendário - **(Reunião 2022-06-07)**
- [ ] Adicionar alertas de sistema para relembrar publicação do calendário provisório e definitivo (Artigo 21) **Ideia Alexandre**
  - [ ] Provisório - até 1º dia de aulas
  - [ ] Definitivo - até 5a semana de aulas


## Perguntar aos profs
- Como é em relação ao Poster A3 e a esta entrega dia 11 de Julho? Não era dia 14?
- Perguntar como funciona em relação ao Parecer?
- Quando fazemos uma cópia... copiamos exames e interrupções. E os comentários? Também é para copiar?