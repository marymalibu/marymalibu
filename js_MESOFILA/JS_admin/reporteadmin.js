document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let exposicionData = [];
let countSelected = 0;
let checkboxes = [];
let buttonDelete = document.getElementById('buttonDelete')
function displayResults(data) {
    const resultsTable = document.getElementById('results');
    resultsTable.innerHTML = ''; // Limpiar resultados anteriores

    if (data.length > 0) {
        // Crear la cabecera
        const headerRow = resultsTable.insertRow();
        const th = document.createElement('th');
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.onclick = () => toggleSelectAll(selectAllCheckbox.checked);
        th.appendChild(selectAllCheckbox);
        headerRow.appendChild(th);

        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });

        // Crear las filas de datos
        data.forEach((reportes, index) => {
            const row = resultsTable.insertRow();

            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('row-checkbox');
            checkboxCell.appendChild(checkbox);

            row.insertCell(1).textContent = reportes.id_reporte ? 'General' : 'terrarios';
            row.insertCell(2).textContent = reportes.tipo || 'No disponible';
            row.insertCell(3).textContent = reportes.fecha || 'No disponible';
            row.insertCell(4).textContent = reportes.encargado || 'No disponible';
            row.insertCell(5).textContent = reportes.descripcion || 'No disponible';
            
            
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
        const response = await fetch('http://localhost/MESOFILAWEB/funcionesPHP/ConsultasAdmin/consultar_reporte.php');
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok: ' + response.status);
        }

        const data = await response.json(); // Aquí se convierte la respuesta a JSON
        exposicionData = data;
        // Comprobación adicional para ver qué se está recibiendo exactamente
        console.log('Datos recibidos:', data);

        displayResults(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="2">Error al cargar los datos: ' + error.message + '</td></tr>';
    }
}
//funcion exposicion
function filterData() {
    const searchQuery = document.getElementById('nombre').value.toLowerCase();
    const filteredData = exposicionData.filter(exposicion => {
        console.log('tipo', reportes);
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

const saveReporte = async() =>{
    const tipo = document.getElementById('tipo').value;
    const fecha = document.getElementById('fecha').value;
    const encargado = document.getElementById('encargado').value;
    const descripcion = document.getElementById('descripcion').value;
    



    const data = {
       tipo,
       fecha,
       encargado,
       descripcion
    };
    console.log('data', data);
    try {
        const result = await registrarexposicion(data);

        fetchData();
        hideForm();
    } catch (error) {
        console.log(error)

    }
}
async function registrarexposicion(userData) {
    console.log('userData', userData);
    let response;
    try {
        response = await fetch('http://localhost/MESOFILAWEB/funcionesPHP/ConsultasAdmin/registrar_reporte.php', { // Asegúrate de reemplazar con la URL correcta de tu API
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
function toggleRowCheckbox(checkbox, reportes) {
    if (checkbox.checked) {
        selectedReportes.push(reportes);
        countSelected++;
    } else {
        selectedReportes = selectedReportes.filter(item => item.id_reporte !== reportes.id_reporte);
        countSelected--;
    }
    toggleDeleteButton();
     console.log("reportes",selectedReportes)
}


function toggleDeleteButton() {
    buttonDelete.style.display = countSelected > 0 ? 'block' : 'none';
}


async function deleteSelectedreporte() {
    const ids = selectedReportes.map(reportes => reportes.id_reporte);

    try {
        const response = await fetch('http://localhost/MESOFILAWEB_V2/funcionesPHP/ConsultasAdmin/eliminar_reporteadmin.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('reporte eliminadas:', result);
            fetchData(); // Volver a cargar los datos después de la eliminación
        } else {
            console.error('Error al eliminar reportes:', result.error);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}

function confirmDelete() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar las especies seleccionadas?');
    if (confirmacion) {
        deleteSelectedreporte();
    }
}

async function updatereporte(id, field, value) {
    try {
        const response = await fetch('http://localhost/MESOFILAWEB_V2/fun/actualizar_reporte.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, field, value })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('reporte actualizada:', result);
        } else {
            console.error('Error al actualizar reporte:', result.error);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}