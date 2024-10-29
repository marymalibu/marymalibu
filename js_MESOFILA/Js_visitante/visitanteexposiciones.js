document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let exposicionData = [];

function displayResults(data) {
    const resultsTable = document.getElementById('results');
    resultsTable.innerHTML = ''; // Limpiar resultados anteriores

    if (data.length > 0) {
        const headerRow = resultsTable.insertRow();

        const keyList = ["nombre_exposicion", "descripcion", "hora", "fecha", "cargo",];
        const keys = Object.keys(data[0]);

        // Crear la cabecera
        keys.forEach(key => {
            if (keyList.includes(key)) {
                let keyString = "";
                switch (key) {
                    case "nombre_exposicion":
                        keyString = "Nombre de la exposici&oacute;n";
                        break;
                    case "descripcion":
                        keyString = "Descripci&oacute;n";
                        break;
                    case "hora":
                        keyString = "Hora";
                        break;
                    case "fecha":
                        keyString = "Fecha";
                        break;
                    case "cargo":
                        keyString = "Persona encargada";
                        break;
                   
                    default:
                        keyString = key; // Usar la clave directamente si no hay un mapeo
                        break;
                }

                if (keyString !== "") {
                    const th = document.createElement('th');
                    th.innerHTML = keyString;
                    headerRow.appendChild(th);
                }
            }
        });

        // Crear las filas de datos
        data.forEach(exposicion => {
            const row = resultsTable.insertRow();
            keys.forEach(key => {
                if (keyList.includes(key)) {
                    const cell = row.insertCell();
                    cell.textContent = exposicion[key] || 'No disponible';
                }
            });
        });
    } else {
        const row = resultsTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = keyList.length;
        cell.textContent = 'No se encontraron resultados';
    }
}

async function fetchData() {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_exposicion/consultar_exposicion.php');

        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok: ' + response.status);
        }

        const data = await response.json();
        exposicionData = data;
        console.log('Datos recibidos:', data);

        displayResults(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="2">Error al cargar los datos: ' + error.message + '</td></tr>';
    }
}

function filterData() {
    const searchQuery = document.getElementById('nombre_exposicion').value.toLowerCase();
    const filteredData = exposicionData.filter(exposicion => {
        return exposicion.nombre_exposicion.toLowerCase().includes(searchQuery) ||
               exposicion.descripcion.toLowerCase().includes(searchQuery);
    });
    console.log('filter', filteredData);
    displayResults(filteredData);
}

function showAddForm() {
    document.getElementById('myModal').style.display = 'block';
    document.getElementById('exposicionForm').reset();
    document.getElementById('formIndex').value = '';
}

function hideForm() {
    document.getElementById('myModal').style.display = 'none';
}

const saveExposicion = async() => {
    const nombre_exposicion = document.getElementById('nombre_exposicion').value;
    const descripcion = document.getElementById('descripcion').value;
    const hora = document.getElementById('hora').value;
    const fecha = document.getElementById('fecha').value;
    const id_instructor_fk = document.getElementById('id_instructor_fk').value;

    const data = {
        nombre_exposicion,
        descripcion,
        hora,
        fecha,
        id_instructor_fk
    };
    console.log('data', data);
    try {
        const result = await registrarExposicion(data);

        fetchData();
        hideForm();
    } catch (error) {
        console.log(error);
    }
}

async function registrarExposicion(userData) {
    console.log('userData', userData);
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_exposicion/registrar_exposicion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            return data.result;
        } else {
            throw data.error || 'Error desconocido';
        }
    } catch (error) {
        if (response && !response.ok) {
            const errorText = await response.text();
            throw 'Error del servidor: ' + errorText;
        } else {
            throw error.message || 'Error al conectar con la API';
        }
    }
}
