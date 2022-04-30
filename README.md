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

        https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-ubuntu-20-04-pt
        https://www.vultr.com/docs/upgrade-from-php-7-to-php-8-on-ubuntu-20-04-with-apache/        

4) Change to your project folder with `cd` command

        $> cd /mnt/c/path_to_your_git_folder        

5) Add sail alias to machine

        $> alias sail='[ -f sail ] && bash sail || bash vendor/bin/sail'

5) Run 

        $> composer install


2) To do sail command:

        $> <command here>

3) Run migrations and seeders for the database 

        $> sail artisan migrate --seed

4) Create personal Token for login

        $> sail artisan passport:client --personal

5) Test LDAP connection

        $> sail artisan ldap:test

-----

6) To run React frontend

        $> npm install


        $> npm run watch        // watch changes on files
        
        or
        
        $> npm run dev          // compile once

7) Plugins

   [Translations](https://react.i18next.com/)


8) Links

   https://laravel-mix.com/
   
    https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE

   https://bobbyhadz.com/blog/javascript-remove-object-from-array-by-value

    
9) Best practices

   https://github.com/alexeymezenin/laravel-best-practices


10) Server commands

        $> composer install --optimize-autoloader --no-dev

    compile JS
    
        $> npm run prod

    Rewrite DB tables and seed
        
        $> php artisan migrate:fresh --seed

---

### TODO
- Falta testar a pesquisa do coordenador de curso no detalhe do curso
- Mostrar um alerta quando estiver acima de 100% (métodos) para confirmar que quer submeter com mais de 100%;
- Guardar nos métodos nem sempre funciona;
- Rever Tabs dos Cursos
- Erros na utilização
- Rever HTML e detalhe dos Agrupamentos de UC
- Traduções
- Rework Novo calendario
- Adicionar flag nos tipos de interrupções para obrigatórios (Natal e Páscoa);


### TRABALHO FUTURO:
- Adicionar flag em cursos como Inglês e Matemática para remover da listagem (não são cursos);
- Adicionar flag nos cursos para saber quais estão em Inglês e devem ser sempre apresentados em Inglês;
- Users com mais do que um role (validar o q deve ser feito)
- Log dos métodos: registar o que foi alterado e quem alterou;

### DONE:
- Mensagem de erro no detalhe do curso com infos que faltam
- Falta traduções e validar se há mais mensagens a aparecer
- Refeita tab dos ramos para usar a tabela
- Para adicionar mantém-se  a modal?
- Atualizadas as permissões do lado da BD e do React
- Falta testar. O seeder das permissões agora está mal porque os id's mudaram.. Devia ser refeito para quando formos testar isto melhor por user na VM
