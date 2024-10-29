document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let terrarioData = [];
let countSelected = 0;
let checkboxes = [];
let buttonDelete = document.getElementById('buttonDelete')
function displayResults(data) {
    const resultsTable = document.getElementById('results');
    resultsTable.innerHTML = ''; // Limpiar resultados anteriores

    if (data.length > 0) {
        
        // Crear las filas de datos
        data.forEach((terarios, index) => {
            const row = resultsTable.insertRow();

            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('row-checkbox');
            checkboxCell.appendChild(checkbox);

            
            row.insertCell(2).textContent = terarios.dimenciones || 'No disponible';
            row.insertCell(3).textContent = terarios.peso || 'No disponible';
            row.insertCell(4).textContent = terarios.material || 'No disponible';
            row.insertCell(5).textContent = terarios.marcaje || 'No disponible';
            row.insertCell(6).textContent = terarios.temperatura || 'No disponible';
            
            
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
        const response = await fetch('http://localhost/MESOFILAWEB/funcionesPHP/ConsultasAdmin/consultar_terrario.php');
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok: ' + response.status);
        }

        const data = await response.json(); // Aquí se convierte la respuesta a JSON
        terrarioData = data;
        // Comprobación adicional para ver qué se está recibiendo exactamente
        console.log('Datos recibidos:', data);

        displayResults(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="2">Error al cargar los datos: ' + error.message + '</td></tr>';
    }
}
//funcion terrarios
function filterData() {
    const searchQuery = document.getElementById('nombre').value.toLowerCase();
    const filteredData = terariosData.filter(terarios => {
        console.log('marcaje', terarios);
        return terarios.marcaje.toLowerCase().includes(searchQuery) 
    });
    console.log('filter', filteredData);
    displayResults(filteredData);
}

function showAddForm() {
    document.getElementById('myModal').style.display = 'block';
    document.getElementById('terariosForm').reset();
    document.getElementById('formIndex').value = '';
}

function hideForm() {
    document.getElementById('myModal').style.display = 'none';
}

const saveterrario = async() =>{
    const dimenciones = document.getElementById('dimenciones').value;
    const peso = document.getElementById('peso').value;
    const material = document.getElementById('material').value;
    const marcaje = document.getElementById('marcaje').value;
    const temperatura = document.getElementById('temperatura').value;
    



    const data = {
       dimenciones,
       peso,
       material,
       marcaje,
       temperatura
    };
    console.log('data', data);
    try {
        const result = await registrarterrario(data);

        fetchData();
        hideForm();
    } catch (error) {
        console.log(error)

    }
}
async function registrarterrario(userData) {
    console.log('userData', userData);
    let response;
    try {
        response = await fetch('http://localhost/MESOFILAWEB/funcionesPHP/ConsultasAdmin/registrar_terrario.php', { // Asegúrate de reemplazar con la URL correcta de tu API
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