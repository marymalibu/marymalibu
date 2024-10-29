/*document.addEventListener('DOMContentLoaded', (event) => {
    event.preventDefault();
    fetchData(); // Llama a la función fetchData cuando la página se haya cargado
});

let especiesData = [];
let countSelected = 0;
let checkboxes = [];
let buttonDelete = document.getElementById('buttonDelete');
let buttonAdd = document.getElementById('btnAdd');
let selectedEspecies = [];
let roles = [];

buttonDelete.onclick = () => confirmDelete() ;

function displayResults(data) {
    const currentUser = localStorage.getItem('userData');
    console.log('currentUser', currentUser);

    roles = JSON.parse(currentUser)[0].roles.split(',');
    const resultsTable = document.getElementById('results');
    resultsTable.innerHTML = ''; // Limpiar resultados anteriores

    if (data.length > 0) {
        // Crear la cabecera
        const headerRow = resultsTable.insertRow();
        const th = document.createElement('th');
        
        headerRow.appendChild(th);

        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });

        // Crear las filas de datos
        data.forEach((especie, index) => {
            const row = resultsTable.insertRow();
            const checkboxCell = row.insertCell(0);

            if(roles.includes("ADMIN")) {    
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('row-checkbox');
                checkbox.onclick = () => toggleRowCheckbox(checkbox,especie);
                checkboxCell.appendChild(checkbox); 
                buttonAdd.style.display = 'block';  
            } else {
                buttonAdd.style.display = 'none';
            }
            
            keys.forEach(key => {
                const cell = row.insertCell();
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'input-edit';
                if (roles.includes("ADMIN")) {
                    input.disabled = false;
                } else {
                    input.disabled = true;
                }                        
                input.value = especie[key] || 'No disponible';
                input.dataset.id = especie.id_especie;
                input.dataset.key = key;

                // Agregar evento para detectar Enter
                input.addEventListener('keydown', async (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        input.blur(); // Quitar el foco de la celda para finalizar la edición
                        const updatedValue = input.textContent;
                        const id = input.dataset.id;
                        const field = input.dataset.key;
                        await updateEspecie(id, field, updatedValue);
                    }
                });

                
                cell.appendChild(input);
            });
            
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
    try {
        const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/consultar_especie.php');
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
        console.log(error)

    }
}
async function registrarEspecie(userData) {
    console.log('userData', userData);
    let response;
    try {
        response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/Funciones_especie/registrar_especie.php', { // Asegúrate de reemplazar con la URL correcta de tu API
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
function toggleRowCheckbox(checkbox, especie) {
    if (checkbox.checked) {
        selectedEspecies.push(especie);
        countSelected++;
    } else {
        selectedEspecies = selectedEspecies.filter(item => item.id_especie !== especie.id_especie);
        countSelected--;
    }
    toggleDeleteButton();
     console.log("especies",selectedEspecies)
}


function toggleDeleteButton() {
    buttonDelete.style.display = countSelected > 0 ? 'block' : 'none';
}


async function deleteSelectedEspecies() {
    const ids = selectedEspecies.map(especie => especie.id_especie);

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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, field, value })
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Especie actualizada:', result);
        } else {
            console.error('Error al actualizar especie:', result.error);
        }
    } catch (error) {
        console.error('Error al conectar con la API:', error);
    }
}*/