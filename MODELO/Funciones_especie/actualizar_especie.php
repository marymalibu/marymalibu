<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once("../conexion.php");

// Función para actualizar especie
function updateEspecie($id, $field, $value) {
    $conn = Conexion::ConexionBD();
    if ($conn) {
        try {
            // Sanitize the field to prevent SQL injection
            $field = preg_replace('/[^a-zA-Z0-9_]/', '', $field); 
            $sql = "UPDATE especie SET $field = :value WHERE id_especie = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return ["result" => "Especie actualizada correctamente"];
        } catch (PDOException $e) {
            return ["error" => "Error al actualizar especie: " . $e->getMessage()];
        }
    } else {
        return ["error" => "Error de conexión a la base de datos"];
    }
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'OPTIONS') {
    // Handle preflight request
    header("HTTP/1.1 200 OK");
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!empty($input['id']) && !empty($input['field']) && isset($input['value'])) {
    $id = $input['id'];
    $field = $input['field'];
    $value = $input['value'];

    $result = updateEspecie($id, $field, $value);
    echo json_encode($result);
} else {
    echo json_encode(['error' => 'Datos incompletos']);
}
?>
