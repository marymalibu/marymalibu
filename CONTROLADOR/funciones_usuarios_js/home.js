 document.addEventListener('DOMContentLoaded', (event) => {
            console.log('DOM fully loaded and parsed');
             // Función para cargar datos basados en roles
             const currentUserJSON = localStorage.getItem('userData');
             console.log("current user",currentUserJSON);
             const currentUser = JSON.parse(currentUserJSON);
         
            
            // Obtener elementos del DOM
            const iconMenu = document.getElementById("img_menu"); 
            const menu = document.getElementById("menu");
            const instructores = document.getElementById('modulo_instructores');
            const terrarios = document.getElementById('modulo_terrarios');
            const moduloExposicion = document.getElementById("modulo_exposicion");
            const moduloEspecie = document.getElementById("modulo_especie");
            const btnLogout = document.getElementById('btnLogout');
            if (currentUser) {
                loadData(currentUser[0].roles);
            }
            // Evento para el botón de cerrar sesión
            btnLogout.addEventListener('click', logoutUser);
            
            // Evento para el icono del menú lateral
            iconMenu.onclick = () => {
                if(menu.style.width == '80px') {
                    iconMenu.style.marginLeft = '210px';
                    menu.style.width = '220px';
                    showMenuText(); // Mostrar los textos del menú al abrir
                } else {
                    iconMenu.style.marginLeft = '70px';
                    menu.style.width = '80px';
                    hideMenuText(); // Ocultar los textos del menú al cerrar
                }
            };
            moduloEspecie.onclick = () => {
                if(currentUser[0].roles.includes('ADMIN')){
                    window.location.href='https://localhost/MESOFILAWEB_V2/administrador/Especies.html'

                }
                else{window.location.href='https://localhost/MESOFILAWEB_V2/Visitante/VistadeListaEspecies.html'

                }
            };
            moduloExposicion.onclick = () => {
                if(currentUser[0].roles.includes('ADMIN')){
                    window.location.href='https://localhost/MESOFILAWEB_V2/administrador/exposicion.html'

                }
                else{window.location.href='https://localhost/MESOFILAWEB_V2/Visitante/VistadeExposiciones.html'

                }
            };
            // Función para mostrar los textos de los enlaces del menú
            function showMenuText() {
                const menuItems = document.getElementsByClassName("menu-item");
                Array.from(menuItems).forEach(item => {
                    const link = item.querySelector("a");
                    link.style.display = "block";
                });
            }
        
            // Función para ocultar los textos de los enlaces del menú
            function hideMenuText() {
                const menuItems = document.getElementsByClassName("menu-item");
                Array.from(menuItems).forEach(item => {
                    const link = item.querySelector("a");
                    link.style.display = "none";
                });
            }
        
           

        // Función para cargar datos basados en roles del usuario
        function loadData(roleString) {

            let roles = roleString.split(",");
            console.log("roles", roles);
        
            if (roles.includes("USER")  && !roles.includes("ADMIN")) {

                // Ocultar elemento de reporte si el usuario es un invitado
                instructores.style.display = 'none';
                terrarios.style.display = 'none';
            }
        }
        
        // Función para cerrar sesión del usuario
        async function logoutUser(event) {
            event.preventDefault(); // Prevenir el envío del formulario
        
            const currentUserJSON = localStorage.getItem('userData');
            const currentUser = JSON.parse(currentUserJSON);
        
          /*  if (!currentUser || !currentUser.user_name) {
                alert('No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.');
                return;
            }*/
        
            const data = {
                user_name: currentUser.user_name
            };
        
            try {
                const response = await fetch('https://localhost/MESOFILAWEB_V2/MODELO/funciones_usuario/logout.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
        
                if (!response.ok) {
                    throw new Error('La respuesta de la red no fue ok: ' + response.status);
                }
        
                // Eliminar datos del usuario del localStorage y redirigir a la página de inicio 
                localStorage.removeItem('userData');
                window.location.href = 'https://localhost/MESOFILAWEB_V2/Main.html';
        
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        


        });
        