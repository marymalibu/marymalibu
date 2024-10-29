<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once("../conexion.php");

try {
    $conn = Conexion::ConexionBD();
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $queryParams = [];
    $sql = "SELECT * FROM usuarios WHERE 1=1";

    if (!empty($_GET['nombre'])) {
        $sql .= " AND nombre ILIKE :nombre";
        $queryParams[':nombre'] = '%' . $_GET['nombre'] . '%';
    }//pueva

    if (!empty($_GET['correo'])) {
        $sql .= " AND correo LIKE :correo";
        $queryParams[':correo'] = '%' . $_GET['correo'] . '%';
    }
    // Preparar la consulta SQL
    $stmt = $conn->prepare($sql);
    $stmt->execute($queryParams);

    // Configurar el modo de fetch a asociativo
    $stmt->setFetchMode(PDO::FETCH_ASSOC);

    // Obtener todos los registros
    $result = $stmt->fetchAll();

    // Devolver el resultado como JSON
    echo json_encode($result);
} catch (PDOException $e) {
    echo 'Conexión fallida: ' . $e->getMessage();
}
?>