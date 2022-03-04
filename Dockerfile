FROM php:7.4-fpm as develop

RUN apt update -y && \
    apt install -y openssl zip libzip-dev unzip git libfreetype6-dev libjpeg62-turbo-dev libpng-dev libldb-dev libldap2-dev

RUN docker-php-ext-install mysqli pdo_mysql zip
RUN docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd
RUN docker-php-ext-configure ldap --with-libdir=lib/$(uname -m)-linux-gnu/
RUN docker-php-ext-install ldap
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt-get install -y nodejs

RUN ln -s /usr/lib/$(uname -m)-linux-gnu/libldap.so /usr/lib/libldap.so \
    && ln -s /usr/lib/$(uname -m)-linux-gnu/liblber.so /usr/lib/liblber.so


RUN echo 'memory_limit = 1024M' >> $PHP_INI_DIR/conf.d/custom.ini && \
    echo 'max_execution_time = 120' >> $PHP_INI_DIR/conf.d/custom.ini

RUN pecl install xdebug && \
    docker-php-ext-enable xdebug
RUN echo "xdebug.mode=develop,coverage,debug" >> $PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.log_level=0" >> $PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.start_with_request=yes" >> $PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_host=host.docker.internal" >> $PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_port=9011" >> $PHP_INI_DIR/conf.d/docker-php-ext-xdebug.ini

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
WORKDIR /var/www
