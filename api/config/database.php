<?php
use App\Database;

return function ($container) {
    $container->set('db', function () {
        return new Database([
            'host' => 'localhost',
            'dbname' => 'dbconfirmacion',
            'username' => 'root',
            'password' => 'HereditH@1577123',
            'charset' => 'utf8mb4'
        ]);
    });
};