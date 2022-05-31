

# Entregas
- **14 julho** > relatorio inicial
- **18 julho** > relatório final
- **25/26 julho** > apresentacao

## About Project
- Laravel 9.x
- React
- Sail (docker)

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

## Changes !!!important

 Qualquer alteracao feita nas permissoes, tem de ser alterada tambem no ficheiro
 > app/providers/AuthServiceProvider.php
