document.addEventListener('DOMContentLoaded', (event) => {
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let instructoresData = [];
let countSelected = 0;
let selectedInstructores = [];
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
        const keyList = ["telefono", "cargo", "nombre", "apellido"]; // Campos a mostrar

        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            if (keyList.includes(key)) {
                console.log('Key:',key);
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            }
        });

        // Crear las filas de datos
        data.forEach(instructor => {
            const row = resultsTable.insertRow();

            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('row-checkbox');
            checkbox.onclick = () => toggleRowCheckbox(checkbox, instructor);
            checkboxCell.appendChild(checkbox);

            keys.forEach(key => {
                if (keyList.includes(key)) {
                    const cell = row.insertCell();
                    cell.textContent = instructor[key] || 'No disponible';

                    if (key !== 'id') { // Evitar que el ID sea editable
                        cell.onclick = () => makeCellEditable(cell, instructor.id, key);
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
        const instructor = instructoresData.find(instructor => instructor.id === checkbox.closest('tr').cells[1].textContent);
        toggleRowCheckbox(checkbox, instructor);
    });
}

function toggleRowCheckbox(checkbox, instructor) {
    if (!instructor || !instructor.id) {
        console.error('El instructor no tiene un ID válido:', instructor);
        return;
    }

    if (checkbox.checked) {
        if (!selectedInstructores.some(item => item.id === instructor.id)) {
            selectedInstructores.push(instructor);
            countSelected++;
        }
    } else {
        selectedInstructores = selectedInstructores.filter(item => item.id !== instructor.id);
        countSelected--;
    }

    toggleDeleteButton();
}

function toggleDeleteButton() {
    if (buttonDelete) {
        buttonDelete.style.display = countSelected > 0 ? 'block' : 'none';
    } else {
        console.error('No se encontró el botón con el ID "buttonDelete".');
    }
}

async function fetchData() {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_instructores/Consultar_instructor.php');
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            instructoresData = data;
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
    const filteredData = instructoresData.filter(instructor =>
        instructor.nombre.toLowerCase().includes(searchQuery)
    );
    console.log('filter', filteredData);
    displayResults(filteredData);
}

function showAddForm() {
    document.getElementById('myModal').style.display = 'block';
    document.getElementById('instructorForm').reset();
    document.getElementById('formIndex').value = '';
}

function hideForm() {
    document.getElementById('myModal').style.display = 'none';
}

async function saveInstructores() {
    const telefono = document.getElementById('telefono').value;
    const cargo = document.getElementById('cargo').value;
    const id_usuario_fk = document.getElementById('id_usuario_fk').value; // ID correcto

    // Verifica que los valores no estén vacíos
    if (!telefono || !cargo || !id_usuario_fk) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const data = {
        telefono,
        cargo,
        id_usuario_fk,
    };

    console.log('data', data);

    try {
        const result = await registrarInstructor(data);
        if (result && result.message) {
            alert(result.message);
        }
        fetchData(); // Actualiza la lista de instructores
        hideForm(); // Oculta el formulario
    } catch (error) {
        console.log("Error saving data:", error);
        alert("Error al guardar los datos: " + error.message);
    }
}



async function registrarInstructor(userData) {
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_instructores/registrar_instructor.php', {
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
        console.error('Error en registrarInstructor:', error);
        throw new Error(error.message || 'Error al conectar con la API');
    }

}
async function deleteSelectedInstructores() {
    const ids = selectedInstructores.map(instructor => instructor.id); // Asegúrate de que el ID es correcto
    if (ids.length === 0) {
        console.error('No hay instructores seleccionados para eliminar.');
        return;
    }

    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_instructores/eliminar_instructores.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Instructores eliminados:', result);
            fetchData(); // Recargar los datos después de la eliminación
            selectedInstructores = []; // Limpiar la lista de seleccionados
            countSelected = 0; // Reiniciar el contador
            toggleDeleteButton(); // Ocultar el botón de eliminación
        } else {
            console.error('Error al eliminar instructores:', result.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}


function confirmDelete() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar los instructores seleccionados?');
    if (confirmacion) {
        deleteSelectedInstructores();
    }
}
async function updateInstructor(id, field, value) {
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_instructores/actualizar_instructores.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, field, value })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Error desconocido al actualizar el instructor');
        }

        console.log('Instructor actualizado:', result);
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
                // Corregido el nombre de la función de updateInstructores a updateInstructor
                await updateInstructor(id, field, newValue);
                fetchData(); // Recargar los datos después de la actualización
            } catch (error) {
                console.error('Error al actualizar el instructor:', error);
                cell.textContent = originalValue; // Revertir al valor original en caso de error
            }
        }
    };
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();
}

