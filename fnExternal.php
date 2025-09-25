<?php

return function ($rutaArchivo) {
  
    if (!file_exists($rutaArchivo)) {
        echo "El archivo '{$rutaArchivo}' no existe.\n";
        return;
    }

    $lineas = file($rutaArchivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lineas as $linea) {
            // Ignorar líneas de comentarios
            if (strpos(trim($linea), '#') === 0 || empty(trim($linea))) {
                continue;
            }

            list($clave, $valor) = explode('=', $linea, 2);

            $clave = trim($clave);
            $valor = trim($valor, " \t\n\r\0\x0B\"'"); // elimina espacios y comillas
            $_ENV[$clave] = $valor;
    }
}

?>
