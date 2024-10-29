<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
require_once("../conexion.php");

// Función para insertar especie
function insertEspecie($nombre_comun, $nombre_cientifico, $ubicacion, $venenosa, $descripcion,
 $id_terrario, $edad, $comportamiento, $tipo_alimentacion, $imagen = '') {
    $conn = Conexion::ConexionBD();
    if ($conn) {
        try {
            $sql = "INSERT INTO especie (nombre_comun, nombre_cientifico, ubicacion, 
            venenosa, descripcion,
            id_terrario, edad, comportamiento, tipo_alimentacion, imagen)
            VALUES (:nombre_comun, :nombre_cientifico, :ubicacion, :venenosa, :descripcion,
            :id_terrario, :edad, :comportamiento, :tipo_alimentacion, :imagen)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':nombre_comun', $nombre_comun);
            $stmt->bindParam(':nombre_cientifico', $nombre_cientifico);
            $stmt->bindParam(':ubicacion', $ubicacion);
            $stmt->bindParam(':venenosa', $venenosa);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':id_terrario', $id_terrario);
            $stmt->bindParam(':edad', $edad);
            $stmt->bindParam(':comportamiento', $comportamiento);
            $stmt->bindParam(':tipo_alimentacion', $tipo_alimentacion);
            $stmt->bindParam(':imagen', $imagen);

            $stmt->execute();

            return $conn->lastInsertId(); // Retorna el ID del usuari
        } catch (PDOException $e) {
            return "Error al crear especie: " . $e->getMessage();
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

if (!empty($input['nombre_comun']) && !empty($input['nombre_cientifico']) && !empty($input['ubicacion']) && isset($input['venenosa']) && !empty($input['descripcion']) && !empty($input['id_terrario']) && !empty($input['edad']) && !empty($input['comportamiento']) && !empty($input['tipo_alimentacion'])) {
    $nombre_comun = $input['nombre_comun'];
    $nombre_cientifico = $input['nombre_cientifico'];
    $ubicacion = $input['ubicacion'];
    $venenosa = $input['venenosa'] === 'Sí' ? 1 : 0;
    $descripcion = $input['descripcion'];
    $id_terrario = $input['id_terrario'];
    $edad = $input['edad'];
    $comportamiento = $input['comportamiento'];
    $tipo_alimentacion = $input['tipo_alimentacion'];
    $imagen = isset($input['imagen']) ? $input['imagen'] : '';

    $result = insertEspecie($nombre_comun, $nombre_cientifico, $ubicacion, $venenosa, $descripcion, $id_terrario, $edad, $comportamiento, $tipo_alimentacion, $imagen);
    echo json_encode(['result' => $result]);
} else {
    echo json_encode(['error' => 'Datos incompletos']);
}//pueva
?>