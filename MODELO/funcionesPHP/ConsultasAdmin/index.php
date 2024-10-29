<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Actualizar Contraseña</title>
</head>
<body>
    <h1>Actualizar Contraseña</h1>
    <form action="http://localhost/mesofila/MODELO/Actualizar_Usuario.php" method="POST">
        <input type="hidden" name="_method" value="PUT">
        <label for="nombre">nombre:</label>
        <input type="text" id="nombre" name="nombre"><br><br>
        <label for="newPassword">Nueva Contraseña:</label>
        <input type="password" id="newPassword" name="contrasenia"><br><br>
        <input type="submit" value="Actualizar">
    </form>
</body>
</html>