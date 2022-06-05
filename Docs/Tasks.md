
### TODO

- [ ] Criar calendario
    - [X] Criação de calendário com bug quando adicionamos uma interrupção ao calendário, e depois apagamos, ela não é efetivamente removida do array e vai no post de criação, gerando erro porque vai com uma data inválida.
    - [X] Loading feriados
    - [ ] Otimizar load de permissões
    - [ ] data de recurso nao tem validacao de minDate para a epoca normal 


- [X] Rever HTML e detalhe dos Agrupamentos de UC
    - [ ] Traduções
    - [ ] Métodos

- [ ] Ano-letivo
  - [ ] atualizar os loadings automaticamente


- [ ] Detalhe Calendario
    - [ ] Otimizar load de permissões e outros pedidos
    - [X] Detalhe de exame, falta mostrar data de inicio/fim se existir


- [ ] Melhorar logs dos cursos, na alteração de métodos
- [ ] Adicionar titulo as paginas

---
## Done
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
--- 

# Meetings log

---
## 2022-05-16
- [X] Nos cursos, UC's que não estão em tronco comum não aparecem (falta confirmar se foram carregadas na BD)
---
## 2022-05-29
- [X] Rever sync/refresh ano letivo
- [X] Rever falta de warning das configs da escola, quando as opções não estão todas preenchidas
---
## Perguntas - 2022-05-17
- [X] ao criar o calendario, adicionar campo para a 10 semana
    - so o gop
- [ ] detalhe calendario
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
- [ ] Nas UCs agrupadas, os Coordenadores de Curso podem marcar grupos apenas para as UC's dos seus cursos (ex: EI PL e D)

---
## Reunião 2022-05-31
**Notas távora**
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
- [ ] Descrição da avaliação
- [ ] Melhorar diferença visual das épocas
- [X] validar datas fora de época selecionada (ao marcar avaliações)
  - [X] Esta a validar do calendario, mas pode ser adicionado validacao por epoca
- [ ] Ao eliminar avaliações contínuas, só apaga o dia a apagar
- [ ] tipos de avaliações
    - [ ] Projetos e trabalhos
        - obrigatório data de lançamento dos enunciados
- [ ] ir buscar os dados do sigla e nome inglês do novo webservice - QUANDO FOR CRIADO

---

##### Extra stuff
- [ ] Marcar avaliações:
    - [X] Ter em conta o ano letivo selecionado
    - [X] Adicionar comentários
    - [X] Ignorar comentários
    - [X] Eliminar comentários (durante os 1ºs 10/15min ?!)
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

### TODO Miguel
- [ ] Limpeza "Requests Folder"


### BUGS

- [ ] Quando abrimos um popup de edição e alteramos a data, ele limpa as informações dos outros campos
- [ ] Quando alteramos alguma coisa, e gravamos, ele não altera no calendário (exemplo datas)

















Boa tarde professores. Fizemos ontem uma nova passagem para a VM do projeto. 
Como foram duas semanas desde a última versão que colocámos na VM, tentei descrever de forma mais pormenorizada  o que foi alterado, mas podem existir pequenas coisas que tenham ficado omissas.
Tentámos iterar sobre quase todo o feedback que recebemos nas semanas anteriores, pelo que em relação a esta nova versão temos: 

Novas features: 
- Adicionar comentários
- Esconder comentários
- Eliminar comentários (durante os 1ºs 15min)
- Adicionaram-se filtros na página de lista e criação de calendários
- Foi adicionada a opção de selecionar qual a 10ª semana de aulas (pré-calculada)
- Foi acrescentado um campo para a descrição dos métodos de avaliação, que é automaticamente preenchido tendo em conta o tipo de método que está a ser marcado.

Issues corrigidos: 
- Foi melhorada a feature de duplicar metodos e para poder ir gravar sem ter os métodos todos preenchidos
    - Os botões de guardar e duplicar ficaram também sticky, de forma a podermos ir fazendo scroll e continuar a ver os botões sempre disponíveis no ecrã)
- Foi retirada a opção de poder criar calendários para todos os cursos
- Foi melhorada a forma de selecionar e desselecionar os cursos para os quais queremos criar o calendário
- Foi melhorado de forma geral o processo criação de calendário
    - Adicionadas validações nas datas
    - Adicionados mais alertas visuais para as interrupções "obrigatórias"
    - Trocado o componente para DateRange para ser mais fácil selecionar o periodo das épocas
- Foi melhorada a marcação de avaliações
    - Adicionadas opções para avaliações que precisem de mais do que 1 dia (start e end date)
    - Adicionada opção para selecionar quando a avaliação é realizada na aula
    - Foi melhorado a seleção de UC's e métodos de avaliação ao marcar o exame: 
        - Agora é possível ver todas as UCs do curso e do semestre a que estamos a marcar
        - Caso não tenha métodos aparece o aviso e não pode selecionar
        - Caso existam métodos por marcar, aparce um aviso com um atalho para a lista de UC's do curso, onde podem adicionar os métodos
    - Foram retiradas outras validações que tinham sido colocadas pelo antigo grupo, como apenas poder ter uma avaliação por dia, ou ser obrigatório colocar a hora.
- Foi melhorada a página de detalhe de calendário
    - Foi criada uma distinção visual para avaliações em aula e avaliações não em aula (quando visualizamos o calendário)
    - Foi alterada a informação mostrada na avaliação do calendário 
        - Caso não tenha iniciais, aparece o nome completo da UC em vez de "null"
        - Em vez do tipo de avaliação, agora aparece a descrição da avaliação (com base na atualização dos métodos)
        - Foi adicionada uma "tooltip" com o nome completo da UC e descrição da UC (caso o texto seja grande e fique cortado) que aparecer ao fazer hover na avaliação.
    - Foi adicionada a possibilidade de adicionar interrupções em dias que já têm avaliações marcadas (sendo que as avaliações são eliminadas)
- A nível de BD, foi revista a forma como os Cursos e UCs se relacionavam com o ano letivo, as fases de calendários e as permissões foram limpas para a maioria dos utilizadores.


Features/issues ainda pendentes: 
- Ir buscar os dados do sigla e nome inglês do novo webservice (QUANDO FOR DISPONIBILIZADO)
- Melhorar diferença visual das épocas
- Ao adicionar uma interrupção numa avaliação contínua, só deve apagar o dia a escolhido e não todos os dias da avaliação
- Automatizar melhor o processo de projetos e trabalhos (obrigatório calendarizar data de lançamento dos enunciados, entrega do projeto e apresentação/defesa)
- Nas UCs agrupadas, os Coordenadores de Curso podem marcar grupos apenas para as UC's dos seus cursos (ex: EI PL e D)
- Rever todas as funcionalidades para cada grupo de permissões e validar que está tudo a funcionar como definido no fluxo inicial.
 
Como falámos na útlima reunião, o Miguel estará de férias esta semana, mas eu estarei disponível para estar na reunião de 3ª-feira. Seria bom se conseguissem testar mais um pouco da aplicação novamente, para recolher mais feedback na reunião.
 
Em relação a esta semana, o plano para mim será estar mais focado no relatório que entretanto tem ficado sempre para 2º plano.