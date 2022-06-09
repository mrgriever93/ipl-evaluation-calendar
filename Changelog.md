# Changelog
## Versão 0.6 - 04/06/2022
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


## Versão 0.5 - 24/05/2022


## Versão 0.4 - 17/05/2022


## Versão 0.3 - 10/05/2022


## Versão 0.2 - 26/04/2022


## Versão 0.1 - 19/04/2022

- Reconhecimento do projeto, instalação e configuração em ambiente local
- Atualização do código base para Laravel 9 e React 17
- Validação das funcionalidades do projeto existentes e problemas
- Resolução e refatorização base das várias páginas e menus de configurações de administração
- Atualizações base na UI para melhorar alguns problemas visuais do layout
- Revisão da estrutura da BD e atualização dos ficherios de Migrations e Seeders do Laravel, para atualização mais fácil da VM
- Atualização da BD para possibilidade de ter 2 idiomas (PT e EN)
- Revisão do código de sincronização dos cursos e do LDAP para autenticação
- Melhoramentos de performance na forma de carregamento dos ficheiros/componentes React


## Versão 0.0 - 04/03/2022

- Início do projeto