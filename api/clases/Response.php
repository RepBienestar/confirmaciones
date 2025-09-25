<?php
namespace App;

class Response
{
    public static function success($data = null, string $message = 'Operación exitosa', int $code = 200): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'code' => $code,
            'timestamp' => date('c'),
            'version' => API_VERSION
        ];
    }

    public static function error(string $message = 'Error en la operación', int $code = 400, $errors = null): array
    {
        return [
            'success' => false,
            'message' => $message,
            'code' => $code,
            'errors' => $errors,
            'timestamp' => date('c'),
            'version' => API_VERSION
        ];
    }

    public static function paginated($data, int $page, int $limit, int $total, string $message = 'Datos obtenidos'): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next_page' => ($page * $limit) < $total,
                'has_prev_page' => $page > 1
            ],
            'timestamp' => date('c'),
            'version' => API_VERSION
        ];
    }
}