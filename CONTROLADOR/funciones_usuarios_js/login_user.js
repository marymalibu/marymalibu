document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('loginButton').addEventListener('click', loginUser);
});

async function loginUser(event) {
    event.preventDefault(); // Prevenir el envío del formulario
    const user_name = document.getElementById('user_name').value;
    const contrasenia = document.getElementById('password').value;

    if (!user_name || !contrasenia) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    
    try {
        const response = await fetch(`https://localhost/MESOFILAWEB_V2/MODELO/funciones_usuario/login.php?user_name=${encodeURIComponent(user_name)}&contrasenia=${encodeURIComponent(contrasenia)}`);
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok: ' + response.status);
        }

        const data = await response.json(); // Aquí se convierte la respuesta a JSON
        especiesData = data;
        localStorage.setItem('userData',JSON.stringify(data))
        // Comprobación adicional para ver qué se está recibiendo exactamente
        console.log('Datos recibidos:', data);
       
        window.location.href='https://localhost/MESOFILAWEB_V2/VISTA/home.html';//'https://localhost/MESOFILAWEB_TEST/View/home.html')
       //displayResults(data);
    } catch (error) {

        console.error('Error fetching data:', error);
        if (error.message.includes('404')) {
            console.error('El usuario no está registrado.');
            alert('El usuario no está registrado');
        }
       
    }
}
