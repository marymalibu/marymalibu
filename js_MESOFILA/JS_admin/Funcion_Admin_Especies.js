document.addEventListener('DOMContentLoaded', (event) => {
    let userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData[0] || !userData[0].roles.includes('ADMIN')) {
        window.location.href = 'https://localhost/MESOFILAWEB_V2/administrador/Especies.html';
    }
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let especiesData = [];
let countSelected = 0;
let selectedEspecies = [];
let buttonDelete = document.getElementById('buttonDelete');

// Define la función toggleDeleteButton
function toggleDeleteButton() {
    if (buttonDelete) {
        buttonDelete.style.display = countSelected > 0 ? 'block' : 'none';
    } else {
        console.error('No se encontró el botón con el id "buttonDelete".');
    }
}

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
        data.forEach(especie => {
            const row = resultsTable.insertRow();

            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('row-checkbox');
            checkbox.onclick = () => toggleRowCheckbox(checkbox, especie);
            checkboxCell.appendChild(checkbox);

            keys.forEach(key => {
                const cell = row.insertCell();
                cell.textContent = especie[key] || 'No disponible';

                if (key !== 'id_especie') { // Evitar que el ID sea editable
                    cell.onclick = () => makeCellEditable(cell, especie.id_especie, key);
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
        const especie = especiesData.find(especie => especie.id_especie === checkbox.closest('tr').cells[1].textContent);
        toggleRowCheckbox(checkbox, especie);
    });
}

// Función para manejar la selección de filas
function toggleRowCheckbox(checkbox, especie) {
    if (!especie || !especie.id_especie) {
        console.error('La especie no tiene un id_especie válido:', especie);
        return;
    }

    if (checkbox.checked) {
        if (!selectedEspecies.some(item => item.id_especie === especie.id_especie)) {
            selectedEspecies.push(especie);
            countSelected++;
        }
    } else {
        selectedEspecies = selectedEspecies.filter(item => item.id_especie !== especie.id_especie);
        countSelected--;
    }

    toggleDeleteButton();
}

async function fetchData() {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/consultar_especie.php');
        if (!response.ok) {
            throw new Error('La respuesta de la red no fue ok: ' + response.status);
        }
        const data = await response.json();
        especiesData = data;
        console.log('Datos recibidos:', data);
        displayResults(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('results').innerHTML = '<tr><td colspan="12">Error al cargar los datos: ' + error.message + '</td></tr>';
    }
}

function filterData() {
    const searchQuery = document.getElementById('nombre').value.toLowerCase();
    const filteredData = especiesData.filter(especie =>
        especie.nombre_comun.toLowerCase().includes(searchQuery) ||
        especie.nombre_cientifico.toLowerCase().includes(searchQuery)
    );
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

const saveEspecie = async () => {
    const nombre_comun = document.getElementById('nombre_comun').value;
    const nombre_cientifico = document.getElementById('nombre_cientifico').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const venenosa = document.getElementById('venenosa').checked ? 'Sí' : 'No';
    const descripcion = document.getElementById('descripcion').value;
    const id_terrario = document.getElementById('id_terrario').value;
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
        id_terrario,
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
        console.log(error);
    }
}

async function registrarEspecie(userData) {
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/registrar_especie.php', {
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
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        if (response && !response.ok) {
            const errorText = await response.text();
            throw new Error('Error del servidor: ' + errorText);
        } else {
            throw new Error(error.message || 'Error al conectar con la API');
        }
    }
}

async function deleteSelectedEspecies() {
    const ids = selectedEspecies.map(especie => especie.id_especie);
    if (ids.length === 0) {
        console.error('No hay especies seleccionadas para eliminar.');
        return;
    }

    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/eliminar_especie.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Especies eliminadas:', result);
            fetchData(); // Volver a cargar los datos después de la eliminación
            selectedEspecies = []; // Limpiar las especies seleccionadas
            countSelected = 0; // Reiniciar el contador
            toggleDeleteButton(); // Ocultar el botón de eliminación
        } else {
            console.error('Error al eliminar especies:', result.error);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}

function confirmDelete() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar las especies seleccionadas?');
    if (confirmacion) {
        deleteSelectedEspecies();
    }
}

async function updateEspecie(id, field, value) {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/actualizar_especie.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, field, value })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al actualizar la especie');
        }

        console.log('Especie actualizada:', result);
        return result;
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
                await updateEspecie(id, field, newValue);
                fetchData(); // Recargar los datos después de la actualización
            } catch (error) {
                console.error('Error al actualizar la especie:', error);
                cell.textContent = originalValue; // Revertir al valor original en caso de error
            }
        }
    };
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
}
