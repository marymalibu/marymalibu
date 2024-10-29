<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
require_once("conexion.php");

// Función para insertar un usuario
function insertUser($nombre, $apellido,$userName, $edad, $correo, $contrasenia, $rol) {
    $conn = Conexion::ConexionBD();
    if ($conn) {
        try {
            $sql = "INSERT INTO usuarios (nombre, apellido, user_name, edad, correo, contrasenia, roles)
            VALUES (:nombre, :apellido, :username, :edad, :correo, :contrasenia, :roles)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':apellido', $apellido);
            $stmt->bindParam(':username', $userName);
            $stmt->bindParam(':edad', $edad);
            $stmt->bindParam(':correo', $correo);
            $stmt->bindParam(':contrasenia', $contrasenia);
            $stmt->bindParam(':roles', $rol);

            $stmt->execute();

            return $conn->lastInsertId(); // Retorna el ID del usuario insertado
        } catch (PDOException $e) {
            return "Error al crear el usuario: " . $e->getMessage();
        }
    } else {
        return "Error de conexión a la base de datos";
    }
}
/*echo $input['nombre'];
echo $input['edad'];
echo $input['correo'];
echo $input['apellido'];
echo $input['contrasenia'];*/
$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'OPTIONS') {
    // Handle preflight request
    header("HTTP/1.1 200 OK");
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!empty($input['nombre']) && !empty($input['correo']) && !empty($input['contrasenia'])
    && !empty($input['edad']) && !empty($input['apellido']) && !empty($input['userName'])) {
    $nombre = $input['nombre'];
    $correo = $input['correo'];
    $username = $input['userName'];
    $contrasena = $input['contrasenia']; // Asegura la contraseña
    $edad = $input['edad'];
    $apellido = $input['apellido'];

    $result = insertUser($nombre, $apellido,$username, $edad, $correo, $contrasena,'USER');
    echo json_encode(['result' => $result]);
} else {
    echo json_encode(['error' => 'Datos incompletos']);
}
?>