document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let terrarioData = [];
let countSelected = 0;
let selectedTerrarios = [];
let buttonDelete = document.getElementById('buttonDelete');

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
        data.forEach(terrario => {
            const row = resultsTable.insertRow();

            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('row-checkbox');
            checkbox.onclick = () => toggleRowCheckbox(checkbox, terrario);
            checkboxCell.appendChild(checkbox);

            keys.forEach(key => {
                const cell = row.insertCell();
                cell.textContent = terrario[key] || 'No disponible';

                if (key !== 'id_terrario') { // Evitar que el ID sea editable
                    cell.onclick = () => makeCellEditable(cell, terrario.id_terrario, key);
                }
            });
        });
    } else {
        const row = resultsTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = Object.keys(data[0] || {}).length + 1; // Ajustar el colspan al número de columnas
        cell.textContent = 'No se encontraron resultados';
    }
}

function toggleSelectAll(isChecked) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        const terrario = terrarioData.find(terrario => terrario.id_terrario === checkbox.closest('tr').cells[1].textContent);
        toggleRowCheckbox(checkbox, terrario);
    });
}

function toggleRowCheckbox(checkbox, terrario) {
    if (!terrario || !terrario.id_terrario) {
        console.error('El terrario no tiene un id_terrario válido:', terrario);
        return;
    }

    if (checkbox.checked) {
        if (!selectedTerrarios.some(item => item.id_terrario === terrario.id_terrario)) {
            selectedTerrarios.push(terrario);
            countSelected++;
        }
    } else {
        selectedTerrarios = selectedTerrarios.filter(item => item.id_terrario !== terrario.id_terrario);
        countSelected--;
    }

    toggleDeleteButton();
}

function toggleDeleteButton() {
    if (buttonDelete) {
        buttonDelete.style.display = countSelected > 0 ? 'block' : 'none';
    } else {
        console.error('No se encontró el botón con el id "buttonDelete".');
    }
}

async function fetchData() {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_terrarios/consultar_terrario.php');
        const text = await response.text(); // Obtén el texto sin procesar
        try {
            const data = JSON.parse(text); // Intenta parsear como JSON
            terrarioData = data;
            console.log('Datos recibidos:', data);
            displayResults(data);
        } catch (jsonError) {
            throw new Error('Respuesta no válida: ' + text);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="7">Error al cargar los datos: ' + error.message + '</td></tr>';
    }
}

function filterData() {
    const searchQuery = document.getElementById('nombre').value.toLowerCase();
    const filteredData = terrarioData.filter(terrario =>
        terrario.marcaje.toLowerCase().includes(searchQuery)
    );
    console.log('filter', filteredData);
    displayResults(filteredData);
}

function showAddForm() {
    document.getElementById('myModal').style.display = 'block';
    document.getElementById('terrariosForm').reset(); // Corregir el ID del formulario
    document.getElementById('formIndex').value = '';
}

function hideForm() {
    document.getElementById('myModal').style.display = 'none';
}

const saveTerrario = async () => {
    const dimensiones = document.getElementById('dimensiones').value;
    const peso = document.getElementById('peso').value;
    const material = document.getElementById('material').value;
    const marcaje = document.getElementById('marcaje').value;
    const temperatura = document.getElementById('temperatura').value;

    const data = {
        dimensiones,
        peso,
        material,
        marcaje,
        temperatura
    };

    console.log('data', data);
    try {
        const result = await registrarTerrario(data);
        fetchData();
        hideForm();
    } catch (error) {
        console.log(error);
    }
}

async function registrarTerrario(userData) {
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_terrarios/registrar_terrario.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const text = await response.text();
        if (response.ok) {
            return JSON.parse(text).result;
        } else {
            throw new Error('Error del servidor: ' + text);
        }
    } catch (error) {
        console.error('Error en registrarTerrario:', error);
        throw new Error(error.message || 'Error al conectar con la API');
    }
}

async function deleteSelectedTerrarios() {
    const ids = selectedTerrarios.map(terrario => terrario.id_terrario);
    if (ids.length === 0) {
        console.error('No hay terrarios seleccionados para eliminar.');
        return;
    }

    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_terrarios/eliminar_terrarios.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const text = await response.text();
        if (response.ok) {
            const result = JSON.parse(text);
            console.log('Terrarios eliminados:', result);
            fetchData(); // Volver a cargar los datos después de la eliminación
            selectedTerrarios = []; // Limpiar los terrarios seleccionados
            countSelected = 0; // Reiniciar el contador
            toggleDeleteButton(); // Ocultar el botón de eliminación
        } else {
            throw new Error('Error del servidor: ' + text);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}

function confirmDelete() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar los terrarios seleccionados?');
    if (confirmacion) {
        deleteSelectedTerrarios();
    }
}

async function updateTerrario(id, field, value) {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_terrarios/actualizar_terrarios.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, field, value })
        });

        const text = await response.text();
        if (response.ok) {
            const result = JSON.parse(text);
            console.log('Terrario actualizado:', result);
            return result;
        } else {
            throw new Error('Error del servidor: ' + text);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        throw error;
    }
}

function makeCellEditable(cell, id, field) {
    const originalValue = cell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalValue;
    input.onblur = async function () {
        const newValue = input.value;
        cell.textContent = newValue;

        if (newValue !== originalValue) {
            try {
                await updateTerrario(id, field, newValue);
                fetchData(); // Recargar los datos después de la actualización
            } catch (error) {
                console.error('Error al actualizar el terrario:', error);
                cell.textContent = originalValue; // Revertir al valor original en caso de error
            }
        }
    };
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
}
