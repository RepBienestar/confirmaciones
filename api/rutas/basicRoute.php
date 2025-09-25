<?php
global $app;

use Slim\Psr7\Request;
use Slim\Psr7\Response;
use App\Response as ApiResponse;

// Ruta de estado/health check
$app->get('/', function (Request $request, Response $response) {
    $data = ApiResponse::success([
        'api' => 'API REST Base',
        'version' => API_VERSION,
        'status' => 'online',
        'timestamp' => date('c')
    ], 'API funcionando correctamente');

    $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
    return $response->withHeader('Content-Type', 'application/json');
});

// Ruta de información de la API
$app->get('/info', function (Request $request, Response $response) {
    $data = ApiResponse::success([
        'name' => 'API REST Base',
        'version' => API_VERSION,
        'description' => 'Plantilla base para APIs REST con Slim Framework',
        'endpoints' => [
            'GET /' => 'Estado de la API',
            'GET /info' => 'Información de la API',
            'GET /test' => 'Endpoint de prueba'
        ],
        'php_version' => PHP_VERSION,
        'slim_version' => '4.x'
    ], 'Información de la API');

    $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
    return $response->withHeader('Content-Type', 'application/json');
});

// Ruta de prueba
$app->get('/test', function (Request $request, Response $response) {
    try {
        // Ejemplo de log
        $logger = $this->get('logger');
        $logger->info('Endpoint de prueba accedido', [
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        $data = ApiResponse::success([
            'message' => 'Endpoint de prueba funcionando',
            'request_method' => $request->getMethod(),
            'request_uri' => $request->getUri()->getPath(),
            'request_params' => $request->getQueryParams()
        ], 'Prueba exitosa');

        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');

    } catch (Exception $e) {
        $data = ApiResponse::error($e->getMessage(), 500);
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

// Ejemplo de ruta con parámetros
$app->get('/test/{id}', function (Request $request, Response $response, array $args) {
    try {
        $id = $args['id'];

        $data = ApiResponse::success([
            'id' => $id,
            'type' => is_numeric($id) ? 'numeric' : 'string',
            'message' => "Parámetro recibido: {$id}"
        ], 'Parámetro procesado correctamente');

        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json');

    } catch (Exception $e) {
        $data = ApiResponse::error($e->getMessage(), 500);
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

// Ejemplo de ruta POST
$app->post('/test', function (Request $request, Response $response) {
    try {
        $body = $request->getParsedBody();

        $data = ApiResponse::success([
            'received_data' => $body,
            'content_type' => $request->getHeaderLine('Content-Type'),
            'message' => 'Datos recibidos correctamente'
        ], 'POST procesado exitosamente', 201);

        $response->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);

    } catch (Exception $e) {
        $data = ApiResponse::error($e->getMessage(), 500);
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});