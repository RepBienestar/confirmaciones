<?php
global $app;

use Slim\Psr7\Request;
use Slim\Psr7\Response;
use App\Response as ApiResponse;

// Función helper para respuestas estandarizadas
function jsonResponse($response, $data = null, $message = '', $status = 'success', $title = '') {
    $responseData = [
        'respuesta' => $status,
        'mensaje' => $message,
        'titulo' => $title,
        'datos' => $data
    ];

    $response->getBody()->write(json_encode($responseData, JSON_PRETTY_PRINT));
    return $response->withHeader('Content-Type', 'application/json');
}

// Función para obtener datos del POST
function getPostData($request) {
    $body = $request->getBody()->getContents();
    $formData = $request->getParsedBody();

    if (isset($formData['dato'])) {
        return json_decode($formData['dato'], true);
    }

    return json_decode($body, true);
}

/*-- Obtener el catálogo de tipos de formulario*/
$app->get('/obtenerTiposFormulario', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');

        $sql = "SELECT idTipoFormulario, tipoFormulario FROM tipoformulario ORDER BY idTipoFormulario";
        $data = $db->query($sql);

        return jsonResponse($response, $data, 'Tipos de formulario obtenidos correctamente');
    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error al obtener tipos');
    }
});

/*-- Obtener el listado de formularios*/
$app->get('/formularios', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');

        $sql = "SELECT 
                    f.idFormulario,
                    f.titulo,
                    f.descripcion,
                    f.idTipoFormulario,
                    f.estado,
                    tf.tipoFormulario
                FROM formulario f
                INNER JOIN tipoformulario tf ON f.idTipoFormulario = tf.idTipoFormulario
                ORDER BY f.idFormulario DESC";

        $data = $db->query($sql);

        return jsonResponse($response, $data, 'Formularios obtenidos correctamente');
    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error al obtener formularios');
    }
});

/*-- Crear nuevos formularios*/
$app->post('/formularios/crear', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');
        $datos = getPostData($request);

        // Validaciones
        if (empty($datos['titulo'])) {
            return jsonResponse($response, null, 'El título es requerido', 'error', 'Validación');
        }

        if (empty($datos['descripcion'])) {
            return jsonResponse($response, null, 'La descripción es requerida', 'error', 'Validación');
        }

        if (empty($datos['idTipoFormulario'])) {
            return jsonResponse($response, null, 'El tipo de formulario es requerido', 'error', 'Validación');
        }

        // Verificar que el tipo de formulario existe
        $sqlCheck = "SELECT idTipoFormulario FROM tipoformulario WHERE idTipoFormulario = ?";
        $tipoExists = $db->queryOne($sqlCheck, [$datos['idTipoFormulario']]);

        if (!$tipoExists) {
            return jsonResponse($response, null, 'El tipo de formulario seleccionado no existe', 'error', 'Validación');
        }

        // Insertar formulario
        $sql = "INSERT INTO formulario (titulo, descripcion, idTipoFormulario, estado) 
                VALUES (?, ?, ?, ?)";

        $params = [
            $datos['titulo'],
            $datos['descripcion'],
            $datos['idTipoFormulario'],
            $datos['estado'] ?? 1
        ];

        $success = $db->execute($sql, $params);

        if ($success) {
            $nuevoId = $db->lastInsertId();
            return jsonResponse($response, ['idFormulario' => $nuevoId], 'Formulario creado exitosamente');
        } else {
            return jsonResponse($response, null, 'Error al crear el formulario', 'error');
        }

    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error del servidor');
    }
});

/*-- Actualizar formulario*/
$app->post('/formularios/actualizar', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');
        $datos = getPostData($request);

        // Validaciones
        if (empty($datos['idFormulario'])) {
            return jsonResponse($response, null, 'El ID del formulario es requerido', 'error', 'Validación');
        }

        if (empty($datos['titulo'])) {
            return jsonResponse($response, null, 'El título es requerido', 'error', 'Validación');
        }

        if (empty($datos['descripcion'])) {
            return jsonResponse($response, null, 'La descripción es requerida', 'error', 'Validación');
        }

        if (empty($datos['idTipoFormulario'])) {
            return jsonResponse($response, null, 'El tipo de formulario es requerido', 'error', 'Validación');
        }

        // Verificar que el formulario existe
        $sqlCheck = "SELECT idFormulario FROM formulario WHERE idFormulario = ?";
        $formularioExists = $db->queryOne($sqlCheck, [$datos['idFormulario']]);

        if (!$formularioExists) {
            return jsonResponse($response, null, 'El formulario no existe', 'error', 'Validación');
        }

        // Verificar que el tipo de formulario existe
        $sqlCheckTipo = "SELECT idTipoFormulario FROM tipoformulario WHERE idTipoFormulario = ?";
        $tipoExists = $db->queryOne($sqlCheckTipo, [$datos['idTipoFormulario']]);

        if (!$tipoExists) {
            return jsonResponse($response, null, 'El tipo de formulario seleccionado no existe', 'error', 'Validación');
        }

        // Actualizar formulario
        $sql = "UPDATE formulario 
                SET titulo = ?, descripcion = ?, idTipoFormulario = ?, estado = ?
                WHERE idFormulario = ?";

        $params = [
            $datos['titulo'],
            $datos['descripcion'],
            $datos['idTipoFormulario'],
            $datos['estado'] ?? 1,
            $datos['idFormulario']
        ];

        $success = $db->execute($sql, $params);

        if ($success) {
            return jsonResponse($response, null, 'Formulario actualizado exitosamente');
        } else {
            return jsonResponse($response, null, 'Error al actualizar el formulario', 'error');
        }

    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error del servidor');
    }
});

/*-- Eliminar formulario*/
$app->delete('/formularios/eliminar', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');
        $datos = getPostData($request);

        if (empty($datos['idFormulario'])) {
            return jsonResponse($response, null, 'El ID del formulario es requerido', 'error', 'Validación');
        }

        // Verificar que el formulario existe
        $sqlCheck = "SELECT idFormulario FROM formulario WHERE idFormulario = ?";
        $formularioExists = $db->queryOne($sqlCheck, [$datos['idFormulario']]);

        if (!$formularioExists) {
            return jsonResponse($response, null, 'El formulario no existe', 'error', 'Validación');
        }

        // Eliminar formulario
        $sql = "DELETE FROM formulario WHERE idFormulario = ?";
        $success = $db->execute($sql, [$datos['idFormulario']]);

        if ($success) {
            return jsonResponse($response, null, 'Formulario eliminado exitosamente');
        } else {
            return jsonResponse($response, null, 'Error al eliminar el formulario', 'error');
        }

    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error del servidor');
    }
});

/*-- Obtener un formulario especifico*/
$app->get('/formularios/{id}', function (Request $request, Response $response, array $args) {
    try {
        $db = $this->get('db');
        $idFormulario = $args['id'];

        $sql = "SELECT 
                    f.idFormulario,
                    f.titulo,
                    f.descripcion,
                    f.idTipoFormulario,
                    f.estado,
                    tf.tipoFormulario
                FROM formulario f
                INNER JOIN tipoformulario tf ON f.idTipoFormulario = tf.idTipoFormulario
                WHERE f.idFormulario = ?";

        $data = $db->queryOne($sql, [$idFormulario]);

        if ($data) {
            return jsonResponse($response, $data, 'Formulario obtenido correctamente');
        } else {
            return jsonResponse($response, null, 'Formulario no encontrado', 'error');
        }

    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error del servidor');
    }
});

/*-- Buscar un formulario*/
$app->post('/formularios/buscar', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');
        $datos = getPostData($request);
        $termino = $datos['termino'] ?? '';

        $sql = "SELECT 
                    f.idFormulario,
                    f.titulo,
                    f.descripcion,
                    f.idTipoFormulario,
                    f.estado,
                    tf.tipoFormulario
                FROM formulario f
                INNER JOIN tipoformulario tf ON f.idTipoFormulario = tf.idTipoFormulario
                WHERE f.titulo LIKE ? 
                   OR f.descripcion LIKE ?
                   OR tf.tipoFormulario LIKE ?
                ORDER BY f.idFormulario DESC";

        $searchTerm = "%{$termino}%";
        $data = $db->query($sql, [$searchTerm, $searchTerm, $searchTerm]);

        return jsonResponse($response, $data, 'Búsqueda completada');
    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error en la búsqueda');
    }
});

/*-- Cambiar el estado de un formulario*/
$app->post('/formularios/cambiar-estado', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');
        $datos = getPostData($request);

        if (empty($datos['idFormulario'])) {
            return jsonResponse($response, null, 'El ID del formulario es requerido', 'error', 'Validación');
        }

        $nuevoEstado = isset($datos['estado']) ? (int)$datos['estado'] : 1;

        // Verificar que el formulario existe
        $sqlCheck = "SELECT idFormulario FROM formulario WHERE idFormulario = ?";
        $formularioExists = $db->queryOne($sqlCheck, [$datos['idFormulario']]);

        if (!$formularioExists) {
            return jsonResponse($response, null, 'El formulario no existe', 'error', 'Validación');
        }

        $sql = "UPDATE formulario SET estado = ? WHERE idFormulario = ?";
        $success = $db->execute($sql, [$nuevoEstado, $datos['idFormulario']]);

        if ($success) {
            $estadoTexto = $nuevoEstado ? 'activado' : 'desactivado';
            return jsonResponse($response, null, "Formulario {$estadoTexto} exitosamente");
        } else {
            return jsonResponse($response, null, 'Error al cambiar el estado', 'error');
        }

    } catch (Exception $e) {
        return jsonResponse($response, null, $e->getMessage(), 'error', 'Error del servidor');
    }
});