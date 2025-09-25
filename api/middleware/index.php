<?php
global $container;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response;

// Middleware de seguridad para headers
$container->set('SecurityHeadersMiddleware', function () {
    return function (Request $request, RequestHandler $handler): \Psr\Http\Message\MessageInterface|\Psr\Http\Message\ResponseInterface {
        $response = $handler->handle($request);

        return $response
            ->withHeader('X-Content-Type-Options', 'nosniff')
            ->withHeader('X-Frame-Options', 'DENY')
            ->withHeader('X-XSS-Protection', '1; mode=block')
            ->withHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
            ->withHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    };
});

// Middleware de CORS
$container->set('CorsMiddleware', function () {
    return function (Request $request, RequestHandler $handler): \Psr\Http\Message\MessageInterface|\Psr\Http\Message\ResponseInterface {
        $response = $handler->handle($request);

        $allowedOrigins = [
            'http://localhost:4200'
        ];

        $origin = $request->getHeaderLine('Origin');

        if (in_array($origin, $allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }

        return $response
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Requested-With')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Max-Age', '86400');
    };
});

// Middleware de validación de API Key (opcional)
$container->set('ApiKeyMiddleware', function () {
    return function (Request $request, RequestHandler $handler): \Psr\Http\Message\ResponseInterface {
        $apiKey = $request->getHeaderLine('X-API-Key');

        if (empty($apiKey) || $apiKey !== API_KEY) {
            $response = new Response();
            $data = [
                'success' => false,
                'message' => 'API Key inválida o faltante',
                'error_code' => 'UNAUTHORIZED',
                'timestamp' => date('c')
            ];

            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        return $handler->handle($request);
    };
});