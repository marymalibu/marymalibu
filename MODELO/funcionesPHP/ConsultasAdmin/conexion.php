<?php
class Conexion {
    private static $host = 'localhost';
    private static $port = 5432;
    private static $dbname = 'mesofilaweb';
    private static $username = 'postgres';
    private static $password = '19010288';
    // Método para crear la conexión a la base de datos
    public static function ConexionBD() {
        try {
            $dsn = "pgsql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname;
            $conn = new PDO($dsn, self::$username, self::$password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch (PDOException $exp) {
            echo "No se conectó correctamente a la base de datos, " . $exp->getMessage();
            return null;
        }
    }
    // Método para desconectar la base de datos
    public static function disconnect($conn) {
        if ($conn != null) {
            $conn = null;
            echo "Desconexión exitosa de la base de datos.";
        }
    }
}
?>
