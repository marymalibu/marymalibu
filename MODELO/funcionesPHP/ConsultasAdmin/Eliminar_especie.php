<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
require_once("./conexion.php");

// Función para eliminar especies
function deleteEspecies($ids) {
    $conn = Conexion::ConexionBD();
    if ($conn) {
        try {
            $placeholders = rtrim(str_repeat('?, ', count($ids)), ', ');
            $sql = "DELETE FROM especie WHERE id_especie IN ($placeholders)";
            $stmt = $conn->prepare($sql);
            foreach ($ids as $k => $id) {
                $stmt->bindValue(($k+1), $id, PDO::PARAM_INT);
            }
            $stmt->execute();
            
            return $stmt->rowCount(); // Retorna el número de filas afectadas
        } catch (PDOException $e) {
            return "Error al eliminar especie(s): " . $e->getMessage();
        }
    } else {
        return "Error de conexión a la base de datos";
    }
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'OPTIONS') {
    // Handle preflight request
    header("HTTP/1.1 200 OK");
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!empty($input['ids']) && is_array($input['ids'])) {
    $ids = $input['ids'];
    $result = deleteEspecies($ids);
    echo json_encode(['result' => $result]);
} else {
    echo json_encode(['error' => 'Datos incompletos']);
}
?>