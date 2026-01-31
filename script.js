// Navegación entre secciones
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    // ===== CONFIGURACIÓN PDF.js =====
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    
    // Variables globales
    let currentPdfId = null;
    let currentPdfFile = null;
    let currentPdfArrayBuffer = null;
    
    // ===== MENÚ MÓVIL =====
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && !event.target.closest('.menu-toggle')) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
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
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    showSection('inicio');
    
    // ===== FUNCIONALIDAD PARA PDFs CON FILE API =====
    const portfolioPdfModal = document.getElementById('portfolioPdfModal');
    const closePortfolioPdfModal = document.getElementById('closePortfolioPdfModal');
    const backToBtn = document.getElementById('backToBtn');
    const portfolioPdfTitle = document.getElementById('portfolioPdfTitle');
    const pdfLoading = document.getElementById('pdfLoading');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFileInput = document.getElementById('pdfFileInput');
    const pdfUploadArea = document.getElementById('pdfUploadArea');
    const currentPdfInfo = document.getElementById('currentPdfInfo');
    const selectedFileName = document.getElementById('selectedFileName');
    const selectedFileSize = document.getElementById('selectedFileSize');
    
    const viewPdfButtons = document.querySelectorAll('.view-pdf-btn');
    const pdfPreviews = document.querySelectorAll('.pdf-preview');
    
    // Inputs específicos para cada PDF
    const cvPdfInput = document.getElementById('cvPdfInput');
    const bravonPdfInput = document.getElementById('bravonPdfInput');
    const gumoPdfInput = document.getElementById('gumoPdfInput');
    const fitnessPdfInput = document.getElementById('fitnessPdfInput');
    
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
    
    // Archivos precargados en localStorage
    const storedFiles = {
        cv: null,
        bravon: null,
        gumo: null,
        fitness: null
    };
    
    // Cargar archivos guardados de localStorage
    function loadStoredFiles() {
        try {
            for (const key in storedFiles) {
                const stored = localStorage.getItem(`pdf_${key}`);
                if (stored) {
                    storedFiles[key] = JSON.parse(stored);
                    console.log(`📁 ${key.toUpperCase()} cargado de almacenamiento local`);
                }
            }
        } catch (error) {
            console.error('Error cargando archivos guardados:', error);
        }
    }
    
    // Guardar archivo en localStorage
    function saveFileToStorage(pdfId, fileData) {
        try {
            localStorage.setItem(`pdf_${pdfId}`, JSON.stringify(fileData));
            storedFiles[pdfId] = fileData;
            console.log(`💾 ${pdfId.toUpperCase()} guardado en localStorage`);
        } catch (error) {
            console.error('Error guardando archivo:', error);
        }
    }
    
    // Inicializar
    loadStoredFiles();
    
    // Función para formatear tamaño de archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Función para mostrar área de carga
    function showUploadArea(pdfId) {
        pdfLoading.style.display = 'block';
        pdfViewer.classList.remove('active');
        pdfViewer.innerHTML = '';
        
        portfolioPdfTitle.innerHTML = `<i class="fas fa-file-pdf"></i> ${pdfTitles[pdfId]}`;
        
        const returnPage = pdfReturnPages[pdfId];
        if (returnPage === 'curriculum') {
            backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Curriculum';
        } else {
            backToBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver al Porfolio';
        }
        
        // Mostrar información si ya hay un archivo cargado
        if (storedFiles[pdfId]) {
            const fileData = storedFiles[pdfId];
            selectedFileName.textContent = fileData.name;
            selectedFileSize.textContent = formatFileSize(fileData.size);
            currentPdfInfo.style.display = 'block';
            
            pdfUploadArea.innerHTML = `
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #28a745; margin-bottom: 1.5rem;"></i>
                <h3 style="color: var(--header-color); margin-bottom: 1rem; font-size: 1.5rem;">
                    Archivo cargado previamente
                </h3>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <p style="margin: 0; font-weight: bold;">${fileData.name}</p>
                    <p style="margin: 0.5rem 0 0 0; color: #666;">${formatFileSize(fileData.size)}</p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                    <button class="btn" id="viewStoredBtn" style="background: var(--accent-color);">
                        <i class="fas fa-eye"></i> Ver PDF
                    </button>
                    <button class="btn btn-outline" id="changeFileBtn">
                        <i class="fas fa-exchange-alt"></i> Cambiar archivo
                    </button>
                </div>
            `;
            
            // Botón para ver archivo almacenado
            document.getElementById('viewStoredBtn').addEventListener('click', function() {
                loadPDFFromStorage(pdfId);
            });
            
            // Botón para cambiar archivo
            document.getElementById('changeFileBtn').addEventListener('click', function() {
                showFileSelector(pdfId);
            });
        } else {
            showFileSelector(pdfId);
        }
    }
    
    // Mostrar selector de archivos
    function showFileSelector(pdfId) {
        pdfUploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 1.5rem;"></i>
            <h3 style="color: var(--header-color); margin-bottom: 1rem; font-size: 1.5rem;">
                ${pdfTitles[pdfId]}
            </h3>
            <p style="margin-bottom: 2rem; color: #666;">
                Selecciona el archivo PDF desde tu computadora
            </p>
            <div style="margin-bottom: 2rem;">
                <input type="file" id="tempFileInput" accept=".pdf" style="display: none;">
                <label for="tempFileInput" class="btn" style="font-size: 1.1rem; padding: 1rem 2rem; cursor: pointer;">
                    <i class="fas fa-folder-open"></i> Buscar archivo PDF
                </label>
            </div>
            <p style="margin-top: 2rem; font-size: 0.9rem; color: #999;">
                <i class="fas fa-info-circle"></i> Solo archivos PDF (.pdf)
            </p>
        `;
        
        currentPdfInfo.style.display = 'none';
        
        // Configurar input temporal
        const tempInput = pdfUploadArea.querySelector('#tempFileInput');
        tempInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                handleFileSelection(file, pdfId);
            } else {
                showDownloadNotification('Por favor, selecciona un archivo PDF válido', 'error');
            }
        };
        
        // Activar el input cuando se haga clic en el label
        pdfUploadArea.querySelector('label').addEventListener('click', function() {
            setTimeout(() => tempInput.click(), 0);
        });
    }
    
    // Manejar selección de archivo
    function handleFileSelection(file, pdfId) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            
            // Guardar información del archivo
            const fileData = {
                name: file.name,
                size: file.size,
                lastModified: file.lastModified,
                type: file.type,
                data: Array.from(new Uint8Array(arrayBuffer))
            };
            
            saveFileToStorage(pdfId, fileData);
            showUploadArea(pdfId); // Actualizar vista
            showDownloadNotification(`✅ "${file.name}" cargado correctamente`, 'success');
            
            // Cargar el PDF automáticamente
            setTimeout(() => loadPDFFromStorage(pdfId), 500);
        };
        
        reader.onerror = function() {
            showDownloadNotification('Error al leer el archivo', 'error');
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    // Cargar PDF desde localStorage
    async function loadPDFFromStorage(pdfId) {
        try {
            if (!storedFiles[pdfId]) {
                throw new Error('No hay archivo cargado');
            }
            
            const fileData = storedFiles[pdfId];
            pdfLoading.style.display = 'none';
            pdfViewer.classList.remove('active');
            pdfViewer.innerHTML = '';
            
            // Convertir datos de array a ArrayBuffer
            const arrayBuffer = new Uint8Array(fileData.data).buffer;
            currentPdfArrayBuffer = arrayBuffer;
            
            // Mostrar loading
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'pdf-loading active';
            loadingDiv.innerHTML = `
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1.5rem;"></i>
                <p style="font-size: 1.2rem;">Cargando PDF...</p>
            `;
            pdfViewer.appendChild(loadingDiv);
            
            // Cargar con PDF.js desde ArrayBuffer
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            
            // Calcular escala
            const containerWidth = pdfViewer.clientWidth - 40;
            const defaultPageWidth = 595;
            const scale = Math.min((containerWidth / defaultPageWidth), 2.5);
            
            // Remover loading
            pdfViewer.innerHTML = '';
            
            // Renderizar páginas
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: scale });
                
                const pageContainer = document.createElement('div');
                pageContainer.className = 'pdf-page';
                pageContainer.style.width = `${viewport.width}px`;
                pageContainer.style.height = `${viewport.height}px`;
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                pageContainer.appendChild(canvas);
                pdfViewer.appendChild(pageContainer);
                
                // Mostrar progreso para PDFs grandes
                if (pdf.numPages > 5) {
                    const progress = Math.round((pageNum / pdf.numPages) * 100);
                    if (loadingDiv.parentNode) {
                        loadingDiv.querySelector('p').textContent = 
                            `Cargando página ${pageNum} de ${pdf.numPages} (${progress}%)`;
                    }
                }
            }
            
            // Mostrar PDF
            pdfViewer.classList.add('active');
            
            // Añadir botón de descarga al modal si es CV
            if (pdfId === 'cv') {
                addDownloadButtonToModal();
            }
            
        } catch (error) {
            console.error('Error cargando PDF:', error);
            pdfViewer.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #d32f2f; margin-bottom: 1.5rem;"></i>
                    <h3 style="color: var(--header-color); margin-bottom: 1.5rem; font-size: 1.5rem;">Error al cargar el PDF</h3>
                    <p style="margin-bottom: 1.5rem;">${error.message}</p>
                    <button class="btn" onclick="closePdfModal()">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                </div>
            `;
        }
    }
    
    // Función para mostrar PDF
    function showPortfolioPdf(pdfId) {
        currentPdfId = pdfId;
        
        portfolioPdfModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        showUploadArea(pdfId);
    }
    
    // Botón de descarga en modal
    function addDownloadButtonToModal() {
        const modalHeader = document.querySelector('.portfolio-pdf-modal-header');
        const existingBtn = document.getElementById('modalDownloadBtn');
        if (existingBtn) existingBtn.remove();
        
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'modalDownloadBtn';
        downloadBtn.className = 'btn btn-success';
        downloadBtn.style.cssText = 'margin-left: auto; margin-right: 1rem; padding: 0.5rem 1rem; font-size: 0.9rem;';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar';
        downloadBtn.addEventListener('click', function() {
            if (currentPdfArrayBuffer && storedFiles[currentPdfId]) {
                downloadCurrentPdf();
            }
        });
        
        const closeBtn = document.getElementById('closePortfolioPdfModal');
        if (closeBtn && closeBtn.parentNode) {
            closeBtn.parentNode.insertBefore(downloadBtn, closeBtn);
        }
    }
    
    // Descargar PDF actual
    function downloadCurrentPdf() {
        if (!currentPdfArrayBuffer || !storedFiles[currentPdfId]) {
            showDownloadNotification('No hay PDF para descargar', 'error');
            return;
        }
        
        try {
            const fileData = storedFiles[currentPdfId];
            const blob = new Blob([currentPdfArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileData.name;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            showDownloadNotification(`✅ "${fileData.name}" descargado`, 'success');
        } catch (error) {
            console.error('Error descargando PDF:', error);
            showDownloadNotification('Error al descargar el PDF', 'error');
        }
    }
    
    // Cerrar modal
    window.closePdfModal = function() {
        portfolioPdfModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        pdfViewer.classList.remove('active');
        pdfViewer.innerHTML = '';
        currentPdfId = null;
        currentPdfArrayBuffer = null;
        
        const modalDownloadBtn = document.getElementById('modalDownloadBtn');
        if (modalDownloadBtn) modalDownloadBtn.remove();
    };
    
    // Event listeners para botones PDF
    viewPdfButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const pdfId = this.getAttribute('data-pdf');
            showPortfolioPdf(pdfId);
        });
    });
    
    pdfPreviews.forEach(preview => {
        preview.addEventListener('click', function(e) {
            e.preventDefault();
            const pdfId = this.getAttribute('data-pdf');
            showPortfolioPdf(pdfId);
        });
    });
    
    if (closePortfolioPdfModal) {
        closePortfolioPdfModal.addEventListener('click', closePdfModal);
    }
    
    if (backToBtn) {
        backToBtn.addEventListener('click', function() {
            if (currentPdfId && pdfReturnPages[currentPdfId]) {
                closePdfModal();
                showSection(pdfReturnPages[currentPdfId]);
            } else {
                closePdfModal();
                showSection('portfolio');
            }
        });
    }
    
    portfolioPdfModal.addEventListener('click', function(e) {
        if (e.target === portfolioPdfModal) closePdfModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && portfolioPdfModal.classList.contains('active')) {
            closePdfModal();
        }
    });
    
    // Redimensionar
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (portfolioPdfModal.classList.contains('active') && currentPdfId && storedFiles[currentPdfId]) {
                loadPDFFromStorage(currentPdfId);
            }
        }, 250);
    });
    
    // ===== FUNCIONALIDAD PARA DESCARGAR CV =====
    function downloadCV() {
        if (storedFiles.cv) {
            const fileData = storedFiles.cv;
            const arrayBuffer = new Uint8Array(fileData.data).buffer;
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileData.name || 'CV_David_Montero_Lopez.pdf';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            showDownloadNotification('✅ CV descargado correctamente', 'success');
        } else {
            // Si no hay CV cargado, pedir que se cargue primero
            showDownloadNotification('Primero carga tu CV en la sección correspondiente', 'error');
            showSection('curriculum');
            
            // Mostrar mensaje en el modal después de un momento
            setTimeout(() => {
                if (!storedFiles.cv) {
                    showPortfolioPdf('cv');
                    setTimeout(() => {
                        const modalTitle = document.getElementById('portfolioPdfTitle');
                        if (modalTitle) {
                            modalTitle.innerHTML = '<i class="fas fa-info-circle"></i> Por favor, carga tu CV primero';
                        }
                    }, 100);
                }
            }, 500);
        }
    }
    
    // Notificaciones
    function showDownloadNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `download-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
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
        
        document.body.appendChild(notification);
        
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
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
    }
    
    // Botón de descarga en sección CV
    const downloadCvBtn = document.getElementById('downloadCvBtn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', downloadCV);
    }
    
    // Botón de descarga en inicio
    const viewCvBtnInicio = document.querySelector('#inicio .view-pdf-btn[data-pdf="cv"]');
    if (viewCvBtnInicio) {
        const buttonContainer = viewCvBtnInicio.parentNode;
        if (buttonContainer && !buttonContainer.querySelector('#downloadCvBtnInicio')) {
            const downloadBtnInicio = document.createElement('button');
            downloadBtnInicio.id = 'downloadCvBtnInicio';
            downloadBtnInicio.className = 'btn btn-download';
            downloadBtnInicio.innerHTML = '<i class="fas fa-download"></i> Descargar CV';
            downloadBtnInicio.style.marginTop = '1rem';
            downloadBtnInicio.addEventListener('click', downloadCV);
            buttonContainer.appendChild(downloadBtnInicio);
        }
    }
    
    // Mensaje de bienvenida
    setTimeout(() => {
        if (Object.values(storedFiles).every(file => file === null)) {
            showDownloadNotification('👋 Bienvenido! Para empezar, carga tus archivos PDF haciendo clic en "Ver PDF"', 'success');
        } else {
            const loadedCount = Object.values(storedFiles).filter(file => file !== null).length;
            showDownloadNotification(`✅ ${loadedCount} archivos PDF cargados previamente`, 'success');
        }
    }, 2000);
    
    // Guardar archivos antes de cerrar la página
    window.addEventListener('beforeunload', function() {
        console.log('💾 Guardando archivos en localStorage...');
    });
});