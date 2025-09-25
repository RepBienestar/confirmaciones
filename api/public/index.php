<?php
declare(strict_types=1);

$development = true; // Cambiar a false en producción

// Configuración de errores
if ($development) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// Configuraciones de seguridad
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_only_cookies', 1);

session_start();

use Slim\Factory\AppFactory;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Response;
use DI\Container;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

require __DIR__ . '/../vendor/autoload.php';

// Headers de seguridad
header("X-Content-Type-Options: nos niff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self'");
header("Referrer-Policy: strict-origin-when-cross-origin");

// CORS configurado de forma segura
$allowedOrigins = [
    'http://localhost:4200'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Contenedor DI
$container = new Container();

// Logger
$logger = new Logger('api');
$logger->pushHandler(new StreamHandler(__DIR__ . '/../logs/app.log', Logger::DEBUG));
$container->set('logger', $logger);

// Configuración de base de datos (opcional)
(require __DIR__ . '/../config/database.php')($container);

// Configurar Slim
AppFactory::setContainer($container);
$app = AppFactory::create();

// Cargar configuraciones
require __DIR__ . '/../config/security.php';
require __DIR__ . '/../middleware/index.php';

// Configurar base path si es necesario
$app->setBasePath("/api/public");

// Middleware en orden de prioridad
$app->add('SecurityHeadersMiddleware');
$app->add('CorsMiddleware');

// Middleware de parsing y routing
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

// Manejo de errores
$errorMiddleware = $app->addErrorMiddleware($development, true, true);

$errorMiddleware->setDefaultErrorHandler(
    function (Request $request, Throwable $exception, bool $displayErrorDetails) use ($logger) {
        $response = new Response();

        // Log del error
        $logger->error('API Error', [
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'request_uri' => $request->getUri()->getPath(),
            'request_method' => $request->getMethod(),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);

        $statusCode = 500;
        if (method_exists($exception, 'getCode') && $exception->getCode() >= 400 && $exception->getCode() < 600) {
            $statusCode = $exception->getCode();
        }

        $data = [
            'success' => false,
            'message' => $displayErrorDetails ? $exception->getMessage() : 'Error interno del servidor',
            'error_code' => 'INTERNAL_ERROR',
            'timestamp' => date('c')
        ];

        if ($displayErrorDetails) {
            $data['debug'] = [
                'file' => $exception->getFile(),
                'line' => $exception->getLine()
            ];
        }

        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($statusCode);
    }
);

// Rutas básicas
require __DIR__ . '/../rutas/basicRoute.php';
require __DIR__ . '/../rutas/formularioRoute.php';

$app->run();