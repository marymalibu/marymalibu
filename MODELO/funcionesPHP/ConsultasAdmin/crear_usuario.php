<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
require_once("../conexion.php");

// Función para insertar un usuario
function insertUser($nombre, $apellido, $edad, $correo, $contrasenia) {
    $conn = Conexion::ConexionBD();
    if ($conn) {
        try {
            $sql = "INSERT INTO usuarios (nombre, apellido, edad, correo, contrasenia)
            VALUES (:nombre, :apellido, :edad, :correo, :contrasenia)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':apellido', $apellido);
            $stmt->bindParam(':edad', $edad);
            $stmt->bindParam(':correo', $correo);
            $stmt->bindParam(':contrasenia', $contrasenia);
            $stmt->execute();

            return $conn->lastInsertId(); // Retorna el ID del usuario insertado
        } catch (PDOException $e) {
            return "Error al crear el usuario: " . $e->getMessage();
        }
    } else {
        return "Error de conexión a la base de datos";
    }
}



if (!empty($_POST['nombre']) && !empty($_POST['correo']) && !empty($_POST['contrasenia'])
    && !empty($_POST['edad']) && !empty($_POST['apellido'])) {
    $nombre = $_POST['nombre'];
    $correo = $_POST['correo'];
    $contrasena = password_hash($_POST['contrasenia'], PASSWORD_DEFAULT); // Asegura la contraseña
    $edad = $_POST['edad'];
    $apellido = $_POST['apellido'];

    $result = insertUser($nombre, $apellido, $edad, $correo, $contrasena);
    echo json_encode(['result' => $result]);
} else {
    echo json_encode(['error' => 'Datos incompletos']);
}
?>