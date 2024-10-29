document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let exposicionData = [];
let countSelected = 0;
let selectedExposiciones = [];
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
        const keyList = ["id_exposicion", "nombre_exposicion", "descripcion", "hora", "fecha", "cargo"]; // Campos a mostrar

        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            if (keyList.includes(key)) {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            }
        });

        // Crear las filas de datos
        data.forEach(exposicion => {
            const row = resultsTable.insertRow();

            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('row-checkbox');
            checkbox.onclick = () => toggleRowCheckbox(checkbox, exposicion);
            checkboxCell.appendChild(checkbox);

            keys.forEach(key => {
                if (keyList.includes(key)) {
                    const cell = row.insertCell();
                    cell.textContent = exposicion[key] || 'No disponible';

                    if (key !== 'id_exposicion') { // Evitar que el ID sea editable
                        cell.onclick = () => makeCellEditable(cell, exposicion.id_exposicion, key);
                    }
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
        const exposicion = exposicionData.find(expo => expo.id_exposicion === checkbox.closest('tr').cells[1].textContent);
        toggleRowCheckbox(checkbox, exposicion);
    });
}

function toggleRowCheckbox(checkbox, exposicion) {
    if (!exposicion || !exposicion.id_exposicion) {
        console.error('La exposición no tiene un id_exposicion válido:', exposicion);
        return;
    }

    if (checkbox.checked) {
        if (!selectedExposiciones.some(item => item.id_exposicion === exposicion.id_exposicion)) {
            selectedExposiciones.push(exposicion);
            countSelected++;
        }
    } else {
        selectedExposiciones = selectedExposiciones.filter(item => item.id_exposicion !== exposicion.id_exposicion);
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
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_exposicion/consultar_exposicion.php');
        const text = await response.text(); // Obtén el texto sin procesar
        try {
            const data = JSON.parse(text); // Intenta parsear como JSON
            exposicionData = data;
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
    const searchQuery = document.getElementById('nombre_exposicion').value.toLowerCase();
    const filteredData = exposicionData.filter(exposicion =>
        exposicion.nombre_exposicion.toLowerCase().includes(searchQuery)
    );
    console.log('filter', filteredData);
    displayResults(filteredData);
}

function showAddForm() {
    document.getElementById('myModal').style.display = 'block';
    document.getElementById('exposicionForm').reset(); // Restablecer el formulario
    document.getElementById('formIndex').value = '';
}

function hideForm() {
    document.getElementById('myModal').style.display = 'none';
}

const saveExposicion = async () => {
    const nombre_exposicion = document.getElementById('nombre_exposicion_form').value;
    const descripcion = document.getElementById('descripcion').value;
    const hora = document.getElementById('hora').value;
    const fecha = document.getElementById('fecha').value;
    const id_instructor_fk = document.getElementById('id_instructor_fk').value;

    // Verifica que los valores no estén vacíos
    if (!nombre_exposicion || !descripcion || !hora || !fecha || !id_instructor_fk) {
        alert('Por favor, complete todos los campos.');
        return;
    }

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
        if (result && result.message) {
            alert(result.message);
        }
        fetchData(); // Actualiza la lista de exposiciones
        hideForm(); // Oculta el formulario
    } catch (error) {
        console.log("Error saving data:", error);
        alert("Error al guardar los datos: " + error.message);
    }
}

async function registrarExposicion(userData) {
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_exposicion/registrar_exposicion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (jsonError) {
            console.error('Error al parsear la respuesta JSON:', text);
            throw new Error('Respuesta del servidor no es válida: ' + text);
        }
    } catch (error) {
        console.error('Error en registrarExposicion:', error);
        throw new Error(error.message || 'Error al conectar con la API');
    }
}

async function deleteSelectedExposiciones() {
    const ids = selectedExposiciones.map(exposicion => exposicion.id_exposicion);
    if (ids.length === 0) {
        console.error('No hay exposiciones seleccionadas para eliminar.');
        return;
    }

    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_exposicion/eliminar_exposicion.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Exposiciones eliminadas:', result);
            fetchData(); // Volver a cargar los datos después de la eliminación
            selectedExposiciones = []; // Limpiar las exposiciones seleccionadas
            countSelected = 0; // Reiniciar el contador
            toggleDeleteButton(); // Ocultar el botón de eliminación
        } else {
            throw new Error('Error del servidor: ', result.error);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}

function confirmDelete() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar las exposiciones seleccionadas?');
    if (confirmacion) {
        deleteSelectedExposiciones();
    }
}

async function updateExposicion(id, field, value) {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_exposicion/actualizar_exposiciones.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, field, value })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al actualizar la exposición');
        }

        console.log('Exposición actualizada:', result);
        return result;
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        throw error;
    }
}

function makeCellEditable(cell, id, field) {
    const originalContent = cell.textContent;
    cell.contentEditable = true;
    cell.focus();

    cell.onblur = async function () {
        const newValue = cell.textContent.trim();
        cell.contentEditable = false;

        if (newValue !== originalContent) {
            try {
                const result = await updateExposicion(id, field, newValue);
                console.log('Actualización exitosa:', result);
            } catch (error) {
                cell.textContent = originalContent;
                console.error('Error al actualizar la celda:', error);
            }
        }
    };
}

