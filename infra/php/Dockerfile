FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libonig-dev libzip-dev libicu-dev \
 && docker-php-ext-install pdo_mysql gd zip intl opcache \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
