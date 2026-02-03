// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // ===== MENÚ MÓVIL =====
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            
            // Cambiar icono
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && !event.target.closest('.menu-toggle')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // ===== NAVEGACIÓN ENTRE SECCIONES =====
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        navButtons.forEach(button => {
            if (button.getAttribute('data-section') === sectionId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Mostrar sección de inicio por defecto
    showSection('inicio');
    
    // ===== FUNCIONALIDAD PARA PDFs =====
    const portfolioPdfModal = document.getElementById('portfolioPdfModal');
    const closePortfolioPdfModal = document.getElementById('closePortfolioPdfModal');
    const backToBtn = document.getElementById('backToBtn');
    const portfolioPdfTitle = document.getElementById('portfolioPdfTitle');
    const portfolioPdfContent = document.getElementById('portfolioPdfContent');
    const pdfIframe = document.getElementById('pdfIframe');
    const pdfLoading = document.getElementById('pdfLoading');
    const viewPdfButtons = document.querySelectorAll('.view-pdf-btn');
    const pdfPreviews = document.querySelectorAll('.pdf-preview');
    
    const pdfTitles = {
        'cv': 'Curriculum Vitae - David Montero López',
        'bravon': 'Bravon - Plan de Negocio',
        'gumo': 'Gumo - Plan de Atención al Cliente',
        'fitness': 'Proyecto de Investigación: Impacto de las Redes Sociales en la Cultura Fitness'
    };
    
    const pdfReturnPages = {
        'cv': 'curriculum',
        'bravon': 'portfolio',
        'gumo': 'portfolio',
        'fitness': 'portfolio'
    };
    
    const pdfFiles = {
        'cv': 'CV.pdf',
        'bravon': 'Bravon.pdf',
        'gumo': 'Gumo.pdf',
        'fitness': 'Proyecto.pdf'
    };
    
    function showPortfolioPdf(pdfId) {
        if (pdfTitles[pdfId]) {
            portfolioPdfTitle.innerHTML = `<i class="fas fa-file-pdf"></i> ${pdfTitles[pdfId]}`;
            
            const returnPage = pdfReturnPages[pdfId];
            if (returnPage === 'curriculum') {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Curriculum';
            } else {
                backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Porfolio';
            }
            
            pdfLoading.classList.add('active');
            pdfIframe.style.display = 'none';
            
            const pdfFile = pdfFiles[pdfId];
            
            // Limpiar y recargar el iframe para evitar problemas de caché
            const newIframe = document.createElement('iframe');
            newIframe.className = 'pdf-iframe';
            newIframe.id = 'pdfIframe';
            newIframe.frameBorder = '0';
            
            // Reemplazar el iframe existente
            const oldIframe = document.getElementById('pdfIframe');
            if (oldIframe) {
                portfolioPdfContent.removeChild(oldIframe);
            }
            portfolioPdfContent.appendChild(newIframe);
            
            const updatedPdfIframe = document.getElementById('pdfIframe');
            const updatedPdfLoading = document.getElementById('pdfLoading');
            
            updatedPdfIframe.onload = function() {
                updatedPdfLoading.classList.remove('active');
                updatedPdfIframe.style.display = 'block';
            };
            
            updatedPdfIframe.onerror = function() {
                updatedPdfLoading.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #d32f2f; margin-bottom: 1.5rem;"></i>
                        <h3 style="color: var(--header-color); margin-bottom: 1.5rem; font-size: 1.5rem;">Error al cargar el porfolio</h3>
                        <p style="margin-bottom: 1.5rem; font-size: 1.1rem;">No se pudo cargar el porfolio "${pdfTitles[pdfId]}".</p>
                        <p style="font-size: 1rem; color: #666; margin-bottom: 2rem;">
                            Asegúrate de que el archivo <strong>${pdfFile}</strong> está en la misma carpeta que este archivo HTML.
                        </p>
                        <button class="btn" onclick="closePdfModal()">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                `;
            };
            
            // Cargar el PDF
            updatedPdfIframe.src = pdfFile;
            portfolioPdfModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Función para cerrar el modal
    window.closePdfModal = function() {
        portfolioPdfModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    
    viewPdfButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pdfId = this.getAttribute('data-pdf');
            showPortfolioPdf(pdfId);
        });
    });
    
    pdfPreviews.forEach(preview => {
        preview.addEventListener('click', function() {
            const pdfId = this.getAttribute('data-pdf');
            showPortfolioPdf(pdfId);
        });
    });
    
    if (closePortfolioPdfModal) {
        closePortfolioPdfModal.addEventListener('click', function() {
            closePdfModal();
        });
    }
    
    if (backToBtn) {
        backToBtn.addEventListener('click', function() {
            const pdfId = getCurrentPdfId();
            if (pdfId && pdfReturnPages[pdfId]) {
                closePdfModal();
                showSection(pdfReturnPages[pdfId]);
            } else {
                closePdfModal();
                showSection('portfolio');
            }
        });
    }
    
    function getCurrentPdfId() {
        const currentTitle = portfolioPdfTitle.textContent || portfolioPdfTitle.innerText;
        for (const [id, title] of Object.entries(pdfTitles)) {
            if (currentTitle.includes(title)) {
                return id;
            }
        }
        return null;
    }
    
    portfolioPdfModal.addEventListener('click', function(e) {
        if (e.target === portfolioPdfModal) {
            closePdfModal();
        }
    });
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && portfolioPdfModal.classList.contains('active')) {
            closePdfModal();
        }
    });
    
    // Verificar archivos PDF
    function checkFiles() {
        console.log('Verificando archivos PDF...');
        Object.entries(pdfFiles).forEach(([id, file]) => {
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`Archivo no encontrado: ${file}`);
                        // Mostrar advertencia en la consola
                        console.error(`Por favor, asegúrate de que el archivo "${file}" está en la misma carpeta que el archivo HTML.`);
                    } else {
                        console.log(`Archivo encontrado: ${file}`);
                    }
                })
                .catch(() => {
                    console.warn(`No se pudo acceder al archivo: ${file}`);
                    console.error(`Por favor, coloca el archivo "${file}" en la misma carpeta que el archivo HTML.`);
                });
        });
    }
    
    checkFiles();
});
// ===== FUNCIONALIDAD PARA DESCARGAR CV =====
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    // Función para descargar el CV
    function downloadCV() {
        const pdfFile = 'CV.pdf'; // Nombre del archivo PDF
        
        // Verificar si el archivo existe
        fetch(pdfFile)
            .then(response => {
                if (response.ok) {
                    // Crear un enlace temporal para la descarga
                    const link = document.createElement('a');
                    link.href = pdfFile;
                    link.download = 'CV_David_Montero_Lopez.pdf'; // Nombre del archivo descargado
                    
                    // Añadir al DOM, hacer clic y remover
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Mostrar notificación de éxito
                    showDownloadNotification('CV descargado correctamente', 'success');
                } else {
                    throw new Error('Archivo no encontrado');
                }
            })
            .catch(error => {
                console.error('Error al descargar el CV:', error);
                showDownloadNotification('Error al descargar el CV. Asegúrate de que el archivo CV.pdf está en la carpeta.', 'error');
            });
    }
    
    // Función para mostrar notificación de descarga
    function showDownloadNotification(message, type) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `download-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
            max-width: 350px;
            border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};
        `;
        
        // Estilo para el botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 1rem;
            padding: 0.2rem;
            margin-left: auto;
        `;
        
        // Añadir al DOM
        document.body.appendChild(notification);
        
        // Cerrar notificación al hacer clic en el botón
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
        // Animaciones CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Añadir evento al botón de descarga
    const downloadCvBtn = document.getElementById('downloadCvBtn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', downloadCV);
    }
    
    // También añadir botón de descarga en el modal del CV
    const originalShowPortfolioPdf = window.showPortfolioPdf;
    window.showPortfolioPdf = function(pdfId) {
        originalShowPortfolioPdf(pdfId);
        
        // Si es el CV, añadir botón de descarga en el modal
        if (pdfId === 'cv') {
            setTimeout(() => {
                const modalHeader = document.querySelector('.portfolio-pdf-modal-header');
                if (modalHeader) {
                    // Verificar si ya existe el botón de descarga
                    if (!document.getElementById('modalDownloadBtn')) {
                        const downloadBtn = document.createElement('button');
                        downloadBtn.id = 'modalDownloadBtn';
                        downloadBtn.className = 'btn btn-success';
                        downloadBtn.style.cssText = 'margin-left: auto; margin-right: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;';
                        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar';
                        
                        downloadBtn.addEventListener('click', downloadCV);
                        
                        // Insertar antes del botón de cerrar
                        const closeBtn = document.getElementById('closePortfolioPdfModal');
                        if (closeBtn && closeBtn.parentNode) {
                            closeBtn.parentNode.insertBefore(downloadBtn, closeBtn);
                        }
                    }
                }
            }, 100);
        }
    };
    
    // También añadir botón de descarga en la sección de inicio
    const viewCvBtnInicio = document.querySelector('#inicio .view-pdf-btn[data-pdf="cv"]');
    if (viewCvBtnInicio) {
        // Crear contenedor para ambos botones
        const buttonContainer = viewCvBtnInicio.parentNode;
        if (buttonContainer && !buttonContainer.querySelector('#downloadCvBtnInicio')) {
            const downloadBtnInicio = document.createElement('button');
            downloadBtnInicio.id = 'downloadCvBtnInicio';
            downloadBtnInicio.className = 'btn btn-download';
            downloadBtnInicio.innerHTML = '<i class="fas fa-download"></i> Descargar CV';
            downloadBtnInicio.style.marginTop = '1rem';
            
            downloadBtnInicio.addEventListener('click', downloadCV);
            
            // Insertar después del botón de ver CV
            buttonContainer.appendChild(downloadBtnInicio);
        }
    }
});