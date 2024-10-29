document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let especiesData = [];
let countSelected = 0;
let checkboxes = [];
let buttonDelete = document.getElementById('buttonDelete')
function displayResults(data) {
    const resultsTable = document.getElementById('results');
    resultsTable.innerHTML = ''; // Limpiar resultados anteriores

    if (data.length > 0) {
        const headerRow = resultsTable.insertRow();
        const keys = Object.keys(data[0]);
        keys.map(key => {
        let keyString = "";
    
        switch (key){
            case "nombre_comun":
                keyString = "Nombre com&uacute;n";
                break;
            case "nombre_cientifico":
                keyString = "Nombre cientifico";
                break;
            case "ubicacion":
                keyString = "Ubicaci&oacute;n";
                break;
            case "venenosa":
                keyString = "Venenosa";
                break;
            case "descripcion":
                keyString = "Descripci&oacute;n";
                break;
            case "edad":
                keyString = "Edad";
                break;
            case "comportamiento":
                keyString = "Comportamiento";
                break;
            case "tipo_alimentacion":
                keyString = "Tipo de Alimentaci&oacute;n";
                break;
            case "imagen":
                keyString = "Media";
                break;
            default:
                keyString = "";
                break;
        }

        if (keyString != "" )
            { const th = document.createElement('th');
             th.innerHTML = keyString;
             headerRow.appendChild(th);}
         });
       

        // Crear las filas de datos
        data.forEach((especie, index) => {
            const row = resultsTable.insertRow();

            const image=document.createElement('img');
            image.src=`https://localhost/MESOFILAWEB_V2/utils/imagenes/${especie.imagen}` || 'No disponible';
            image.style.width ="100px";
            image.style.height ="100px";
            row.insertCell(0).textContent = especie.nombre_comun || 'No disponible';
            row.insertCell(1).textContent = especie.nombre_cientifico || 'No disponible';
            row.insertCell(2).textContent = especie.ubicacion || 'No disponible';
            row.insertCell(3).textContent = especie.venenosa ? 'Sí' : 'No';
            row.insertCell(4).textContent = especie.descripcion || 'No disponible';
            row.insertCell(5).textContent = especie.edad || 'No disponible';
            row.insertCell(6).textContent = especie.comportamiento || 'No disponible';
            row.insertCell(7).textContent = especie.tipo_alimentacion || 'No disponible';
            row.insertCell(8).appendChild(image);
        });
    } else {
        const row = resultsTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 12;
        cell.textContent = 'No se encontraron resultados';
    }
}

function toggleSelectAll(isChecked) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    let counter = 0;
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        if (checkbox.checked){
            counter +=1;
        }
    });
    countSelected = counter;
    if (countSelected>0){
        buttonDelete.style.display = 'block'
    }
    else {
         buttonDelete.style.display = 'none'
    }
}
async function fetchData() {
    const nombre = document.getElementById('nombre').value;
    try {

        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/consultar_especie.php'); //AYUDA JEZ('https://localhost/MESOFILAWEB_V2/funcionesPHP/ConsultasAdmin/Consultar_Especie.php');

        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok: ' + response.status);
        }

        const data = await response.json(); // Aquí se convierte la respuesta a JSON
        especiesData = data;
        // Comprobación adicional para ver qué se está recibiendo exactamente
        console.log('Datos recibidos:', data);

        displayResults(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="2">Error al cargar los datos: ' + error.message + '</td></tr>';
    }
}

function filterData() {
    const searchQuery = document.getElementById('nombre').value.toLowerCase();
    const filteredData = especiesData.filter(especie => {
        console.log('especie', especie);
        return especie.nombre_comun.toLowerCase().includes(searchQuery) ||
               especie.nombre_cientifico.toLowerCase().includes(searchQuery);
    });
    console.log('filter', filteredData);
    displayResults(filteredData);
}

function showAddForm() {
    document.getElementById('myModal').style.display = 'block';
    document.getElementById('especieForm').reset();
    document.getElementById('formIndex').value = '';
}

function hideForm() {
    document.getElementById('myModal').style.display = 'none';
}

const saveEspecie = async() =>{
    const nombre_comun = document.getElementById('nombre_comun').value;
    const nombre_cientifico = document.getElementById('nombre_cientifico').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const venenosa = document.getElementById('venenosa').checked ? 'Sí' : 'No';
    const descripcion = document.getElementById('descripcion').value;
    const edad = document.getElementById('edad').value;
    const comportamiento = document.getElementById('comportamiento').value;
    const tipo_alimentacion = document.getElementById('tipo_alimentacion').value;
   const imagen = '';



    const data = {
       nombre_comun,
       nombre_cientifico,
       ubicacion,
       venenosa,
       descripcion,
       edad,
       comportamiento,
       tipo_alimentacion,
       imagen
    };
    console.log('data', data);
    try {
        const result = await registrarEspecie(data);

        fetchData();
        hideForm();
    } catch (error) {
        console.log(error)

    }
}
async function registrarEspecie(userData) {
    console.log('userData', userData);
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/registrar_especie.php', { // /funcionesPHP/ConsultasAdmin/Registrar_Especie.php
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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