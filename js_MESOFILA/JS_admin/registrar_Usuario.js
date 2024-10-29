document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const edad = document.getElementById('edad').value;
    const correo = document.getElementById('correo').value;
    const contrasenia = document.getElementById('contrasenia').value;

    const data = {
        nombre,
        apellido,
        edad,
        correo,
        contrasenia
    };

    try {
        const result = await registrarUsuario(data);
        document.getElementById('response').textContent = 'Usuario registrado con éxito.';
    } catch (error) {
        console.log(error)
        document.getElementById('response').textContent = 'Error al registrar el usuario: ' + error;
    }
});

async function registrarUsuario(userData) {
    let response;
    try {
        response = await fetch('http://localhost/MESOFILAWEB/funcionesPHP/ConsultasAdmin/crear_usuario.php', { // Asegúrate de reemplazar con la URL correcta de tu API
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(userData)
        });
        
        // Intenta analizar la respuesta como JSON
        const data = await response.json();
        
        if (response.ok) {
            return data.result;
        } else {
            throw data.error || 'Error desconocido';
        }
    } catch (error) {
        // Maneja errores de parsing JSON o de red
        if (response && !response.ok) {
            // Puedes intentar leer la respuesta como texto si el JSON falla
            const errorText = await response.text();
            throw 'Error del servidor: ' + errorText;
        } else {
            // Error de red o al procesar la respuesta
            throw error.message || 'Error al conectar con la API';
        }
    }
}