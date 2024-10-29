<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once("conexion.php");

// Función para actualizar la contraseña de un usuario
function updateUserPassword($nombre, $newPassword) {
    $conn = Conexion::ConexionBD();
    if ($conn) {
        try {
            $sql = "UPDATE usuarios SET contrasenia = :newPassword WHERE nombre = :nombre";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':newPassword', $newPassword); // Asegura la nueva contraseña
            $stmt->bindParam(':nombre', $nombre);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                return "Contraseña actualizada correctamente.";
            } else {
                return "No se encontró el usuario o no se cambió la contraseña.";
            }
        } catch (PDOException $e) {
            return "Error al actualizar la contraseña: " . $e->getMessage();
        }
    } else {
        return "Error de conexión a la base de datos";
    }
}

if ($_POST['_method'] == 'PUT') {
    if (!empty($_POST['nombre']) && !empty($_POST['contrasenia'])) {
        $nombre = $_POST['nombre'];
        $newPassword = $_POST['contrasenia'];

        $result = updateUserPassword($nombre, $newPassword);
        echo json_encode(['result' => $result]);
    } else {
        echo json_encode(['error' => 'Datos incompletos']);
    }
} else {
    echo json_encode(['error' => 'Método no soportado']);
}
?>