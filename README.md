<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Project
sdfghy

## Installation

1) Install Ubuntu & Docker (WSL 2 on Windows )

2) Install PHP and Composer based on the following docs:

        https://linuxize.com/post/how-to-install-php-8-on-ubuntu-20-04/
        https://www.itsolutionstuff.com/post/how-to-install-laravel-in-ubuntu-serverexample.html

        https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-ubuntu-20-04-pt
        https://www.vultr.com/docs/upgrade-from-php-7-to-php-8-on-ubuntu-20-04-with-apache/ 

        https://oauth2.thephpleague.com/installation/

        

4) Change to your project folder with `cd` command

        $> cd /mnt/c/path_to_your_git_folder        

5) Add sail alias to machine

        $> alias sail='[ -f sail ] && bash sail || bash vendor/bin/sail'

6) Init docker with sail

        $> sail up -d

7) Instal laravel vendor stuff

        $> composer install


8) Run migrations and seeders for the database 

        $> sail artisan migrate --seed
        ---- or -----
        $> sail artisan migrate:fresh --seed

9) Create personal Token for login

        $> sail artisan passport:client --personal

10) Test LDAP connection

        $> sail artisan ldap:test

-----

11) To run React frontend

        $> npm install


        $> npm run watch        // watch changes on files
        
        or
        
        $> npm run dev          // compile once

12) Plugins

   [Translations](https://react.i18next.com/)


13) Links

https://laravel-mix.com/

https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE

https://bobbyhadz.com/blog/javascript-remove-object-from-array-by-value
    
https://github.com/rap2hpoutre/laravel-log-viewer
    
14) Best practices

   https://github.com/alexeymezenin/laravel-best-practices


15) Server commands

        $> composer install --optimize-autoloader --no-dev
        $> php artisan config:cache
        $> php artisan route:cache

    compile JS
    
        $> npm run prod

    Rewrite DB tables and seed
        
        $> php artisan migrate:fresh --seed

    Create new Personal Token for the Front-End app communicate with the API

        $> php artisan passport:client --personal

---

### TODO

- [ ] Criar calendario
  - [x] Criação de calendário com bug quando adicionamos uma interrupção ao calendário, e depois apagamos, ela não é efetivamente removida do array e vai no post de criação, gerando erro porque vai com uma data inválida.
  - [ ] Loading feriados
  - [ ] Otimizar load de permissões


- [X] Rever HTML e detalhe dos Agrupamentos de UC
    - [ ] Traduções
    - [ ] Métodos

- [ ] Detalhe Calendario
  - [ ] Otimizar load de permissões e outros pedidos


- [ ] Melhorar logs dos cursos, na alteração de métodos
- [ ] Rever sync/refresh ano letivo
- [ ] Rever falta de warning das configs da escola, quando as opções não estão todas preenchidas


- [ ] Adicionar titulo as paginas

---
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

### TRABALHO FUTURO:
- [ ] Adicionar flag em cursos como Inglês e Matemática para remover da listagem (não são cursos);
- [ ] Adicionar flag nos cursos para saber quais estão em Inglês e devem ser sempre apresentados em Inglês;
- [ ] Users com mais do que um role (validar o que deve ser feito)
- [ ] Log dos métodos: registar o que foi alterado e quem alterou;
- [ ] Rever "voltar a lista" para navegar entre paginas de detalhe e listas (ex: curso e detalhe de unidades curriculares)
 

### TODO Miguel
- [ ] Limpeza "Requests Folder"


### Perguntas - 17-05-2022
- [ ] Ao criar novo exame, mostra todos as unidades curriculares, ou so as que lhe pertencem? (ex. sou prof de fisica, vejo algebra?)
  - o professor so tem acesso as dele
  - Gop e Coordenador de curso tem acesso as cadeiras do curso
- [ ] Qualquer user pode marcar interrupcoes?
  - ja existem as permissoes por fase na parte do calendario
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
  - [ ] Verificar se os métodos estão preenchidos
  - [ ] Se não estiverem apresentar mensagem de erro e link para as Unidades Curriculares do curso
  - [ ] Adicionar icone (check) nos métodos que já estão marcados
  - [ ] Adicionar start e end date para avaliações (que se prolongam durante a semana, por exemplo)
  - [ ] Retirar outras validações que limitem a plataforma
- [ ] Nas UCs agrupadas, os Coordenadores de Curso podem marcar grupos apenas para as UC's dos seus cursos (ex: EI PL e D)

##### Extra stuff 
- [ ] Marcar avaliações:
  - [ ] Ter em conta o ano letivo selecionado
  - [ ] Adicionar comentários
  - [ ] Ignorar comentários
  - [ ] Eliminar comentários (durante os 1ºs 10/15min ?!)
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