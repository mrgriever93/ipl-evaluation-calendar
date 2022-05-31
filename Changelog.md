
### TODO

- [ ] Criar calendario
    - [x] Criação de calendário com bug quando adicionamos uma interrupção ao calendário, e depois apagamos, ela não é efetivamente removida do array e vai no post de criação, gerando erro porque vai com uma data inválida.
    - [x] Loading feriados
    - [ ] Otimizar load de permissões


- [X] Rever HTML e detalhe dos Agrupamentos de UC
    - [ ] Traduções
    - [ ] Métodos


- [ ] Lista Calendario
    - [ ] Filtros so se houver calendarios noutros semestres ou no semestre atual

- [ ] Detalhe Calendario
    - [ ] Otimizar load de permissões e outros pedidos


- [ ] Melhorar logs dos cursos, na alteração de métodos


- [ ] Adicionar titulo as paginas

---
## Done
- [x] No curso, qdo pede para rever cenas tipo Coordenador:
    - [x]  Dps de preencheres e gravar n atualiza para tirar o erro
    - [x]  E mantem o triangulo a dizer q faltam coisas na listagem
- [x] Mostrar um alerta quando estiver acima de 100% (métodos) para confirmar que quer submeter com mais de 100%;
- [x] Guardar nos métodos nem sempre funciona;
- [x] Rever Tabs dos Cursos
    - [x] Erros na utilização
- [x] Falta testar a pesquisa do coordenador de curso no detalhe do curso
- [x] Rever Tabs dos Cursos
    - Comentei botao de adicionar unidades curriculares, talvez trabalho futuro
- [x] Mensagem de erro no detalhe do curso com infos que faltam
- [x] Faltam traduções e validar se há mais mensagens a aparecer
- [x] Refeita tab dos ramos para usar a tabela
- [x] Para adicionar mantém-se a modal?
- [x] Atualizadas as permissões do lado da BD e do React
- [x] Falta testar. O seeder das permissões agora está mal porque os id's mudaram... Devia ser refeito para quando formos testar isto melhor por user na VM
--- 
- 2022-05-16
- [x] Nos cursos, UC's que não estão em tronco comum não aparecem (falta confirmar se foram carregadas na BD)

-- 2022-05-29
- [x] Rever sync/refresh ano letivo
- [x] Rever falta de warning das configs da escola, quando as opções não estão todas preenchidas


### Perguntas - 17-05-2022
- [ ] ao criar o calendario, adicionar campo para a 10 semana
    - so o gop
- [ ] detalhe calendario
    - quando for para seguir para a proxima fase, mostrar popup com fases

----
### Feedback prof. Pedro Gago
- [x] No separador de "Calendários" (GOP) deve haver filtros


- [x] Na definição de métodos de avaliação falta uma opção que permita copiar entre épocas (é habitual a avaliação em exame ter os mesmos elementos tanto em recurso como em especial/mensal)
    - [x] FE
    - [x] BE
    - [x] Na definição de métodos de avaliação devia ir gravando o que se vai fazendo (está a obrigar a preencher tudo de uma vez)
- [x] É provavelmente melhor retirar a opção de criação de calendário para todos os cursos (são cursos a mais)
- [X] Na criação de Novo Calendário, se se escolher apenas a opção de avançar,
    - [x] pede "Tem de selecionar as interrupcoes mandatorias pelo menos!" - mudar para obrigatórias e/ou
    - [x] dizer quais
- [x] Tirar Inglês Geral, Matemáticas Gerais, etc
- [x] Quando tento marcar uma avaliação (1º semestre - 9119) fica "a pensar" à procura de UC


### Feedback reunião 24/05
- [x] Marcar avaliações:
    - [x] Verificar se os métodos estão preenchidos
    - [x] Se não estiverem apresentar mensagem de erro e link para as Unidades Curriculares do curso
    - [X] Adicionar icone (check) nos métodos que já estão marcados
    - [x] Adicionar start e end date para avaliações (que se prolongam durante a semana, por exemplo)
    - [x] Retirar outras validações que limitem a plataforma
- [ ] Nas UCs agrupadas, os Coordenadores de Curso podem marcar grupos apenas para as UC's dos seus cursos (ex: EI PL e D)

---
## Reunião 31/05/2022
**Notas távora**
- [ ] Calendários desfasados por ano -
    - trabalho futuro
- [ ] Validações da 10a semana
- [ ] validações datas época periódica, normal e Recurso, tem de ser superior às outras e ao ano letivo
- [ ] Adicional + filtros na criação de calendário para selecionar o curso
- [ ] ir buscar os dados do sigla e nome inglês do novo webservice
- [ ] Adicionar descrição dos métodos de avaliação
- [ ] Botão Duplicar sticky nos métodos
- [ ] Marcar mais do que uma prova no mesmo dia
- [ ] Melhorar diferença das épocas
- [ ] validar datas fora de época selecionada
- [ ] Diferenciar quando é feito em aula ou nao
    - cor diferente se for aula
- [ ] Ao eliminar avaliações contínuas, só apaga o dia a apagar
- [ ] tipos de avaliações
    - [ ] Projetos e trabalhos
        - obrigatório data de lançamento dos enunciados
- [ ] Descrição da avaliação
- [ ] Bug no detalhe da avaliação
    - observação

# Entregas
- **14 julho** > relatorio inicial
- **18 julho** > relatório final
- **25/26 julho** > apresentacao

---

##### Extra stuff
- [ ] Marcar avaliações:
    - [x] Ter em conta o ano letivo selecionado
    - [x] Adicionar comentários
    - [x] Ignorar comentários
    - [x] Eliminar comentários (durante os 1ºs 10/15min ?!)
    - [ ] Validar permissoes dos vários popups
    - [ ] Melhorar loading popups ?!
    - [ ] Rever traduções

- [ ] Submeter calendário para próximas fases
    - [ ] Criar popup para apresentar possibilidades
        - [ ] Colocar calendário em Edição
            - [ ] GOP
            - [ ] Coordenador de Curso
            - [ ] Responsável de UC (selecionar quais UCs)
        - [ ] Colocar calendário em Avaliação
            - [ ] Estudantes
            - [ ] CCP
            - [ ] GOP
            - [ ] Conselho Pedagócio
            - [ ] Direção
        - [ ] Publicar calendário
            - [ ] Se for GOP, CC ou Direção



### TRABALHO FUTURO:
- [ ] Adicionar flag em cursos como Inglês e Matemática para remover da listagem (não são cursos);
- [ ] Adicionar flag nos cursos para saber quais estão em Inglês e devem ser sempre apresentados em Inglês;
- [ ] Users com mais do que um role (validar o que deve ser feito)
- [ ] Log dos métodos: registar o que foi alterado e quem alterou;
- [ ] Rever "voltar a lista" para navegar entre paginas de detalhe e listas (ex: curso e detalhe de unidades curriculares)
- [ ] Notificacoes de quando muda de fase ou adicionam  comentarios no calendario
    - [ ] Notificacoes Web
    - [ ] Notificacoes Email
- [ ] subtipos de avaliação (Reunião 31/05/2022)
    - poder adicionar subtipos na pagina de tipos de avaliacoes e depois quando se adicionar o metodo de avaliacao,
      estes sao automaticamente preenchidos, podendo ter o campo de obrigatoriedade ou nao.


### TODO Miguel
- [ ] Limpeza "Requests Folder"
