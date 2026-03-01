document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================================
       CUSTOM CURSOR
       ========================================================================= */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    document.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        if (cursorDot) cursorDot.style.transform = `translate(${posX}px, ${posY}px)`;
        if (cursorOutline) cursorOutline.style.transform = `translate(${posX}px, ${posY}px)`;
    });

    // Efecto hover en elementos clickeables
    const clickables = document.querySelectorAll('a, button, input, .tool-card');
    clickables.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });

    /* =========================================================================
       NAVBAR MORPH (SCROLL)
       ========================================================================= */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });

    /* =========================================================================
       GSAP ANIMATIONS: HERO
       ========================================================================= */
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();

        // Animación del título (stagger)
        tl.fromTo('.hero-title .line',
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out", delay: 0.2 }
        );

        // Animación de los elementos del hero
        tl.fromTo('.fade-up',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out" },
            "-=0.6"
        );
    }

    /* =========================================================================
       VIDEO PLACEHOLDER / GRID HOVER LOGIC
       ========================================================================= */
    const toolCards = document.querySelectorAll('.tool-card');
    const videoContainer = document.getElementById('video-preview-container');
    const previewVideo = document.getElementById('preview-video');

    // Puedes usar colores gradientes o un mismo video de test para los placeholders
    // En el futuro, reemplaza src con el video real
    const placeholderVideoSrc = ""; // Deja vacío o añade un URI a un MP4 estético de Unsplash

    toolCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            videoContainer.classList.add('active');
            // Si hubiera videos distintos:
            // const targetVideo = card.getAttribute('data-video');
            // previewVideo.src = `./public/videos/${targetVideo}.mp4`;
            // previewVideo.play();
        });

        card.addEventListener('mouseleave', () => {
            videoContainer.classList.remove('active');
            // previewVideo.pause();
        });
    });

    /* =========================================================================
       CHECKOUT MODAL LOGIC
       ========================================================================= */
    const modal = document.getElementById('checkout-modal');
    const btnClose = document.getElementById('close-modal');
    const btnVerify = document.getElementById('btn-verify-download');
    const inputKey = document.getElementById('access-key');
    const errorMsg = document.getElementById('error-message');

    // Abre el modal desde los botones
    const downloadBtns = [document.getElementById('btn-download-nav'), document.getElementById('btn-download-hero')];

    downloadBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
                inputKey.value = '';
                errorMsg.classList.add('hidden');
                inputKey.focus();
            });
        }
    });

    // Cerrar modal
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Cerrar si se clickea el overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Validar y "Descargar"
    const handleDownload = () => {
        const val = inputKey.value.trim();
        if (val === 'Gnerlab2026') {
            errorMsg.classList.add('hidden');

            // Simular la descarga
            const dlLink = document.createElement('a');
            // La ruta en GitHub Pages buscará en nuestra carpeta local
            dlLink.href = "./public/downloads/GnerLab_Setup_Oficial_V2.rar";
            dlLink.download = "GnerLab_Setup_Oficial_V2.rar";
            dlLink.click();

            // alert opcional para dar feedback en caso de que la descarga sea silenciosa
            alert("Autenticación exitosa. Iniciando descarga de GnerLab_Setup_Oficial_V2.rar...");

            // Reset Modal
            modal.classList.remove('active');
        } else {
            errorMsg.classList.remove('hidden');
            inputKey.focus();
        }
    };

    if (btnVerify) btnVerify.addEventListener('click', handleDownload);
    if (inputKey) {
        inputKey.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleDownload();
        });
    }

    /* =========================================================================
       VIDEO PLAYER MODAL LOGIC (COTAS Y OTROS)
       ========================================================================= */
    const vidModal = document.getElementById('video-modal');
    const btnCloseVid = document.getElementById('close-video-modal');
    const featurePlayer = document.getElementById('feature-video-player');
    // Funsiones globales de Video para evitar problemas con addEventListener
    window.openVideoModal = function (videoId) {
        if (!videoId || videoId === "video-placeholder") return;
        const vidModal = document.getElementById('video-modal');
        const featurePlayer = document.getElementById('feature-video-player');

        if (vidModal && featurePlayer) {
            featurePlayer.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
            vidModal.classList.add('active');
        }
    };

    // Cerrar y detener el video (AHORA ES GLOBAL Y LLAMADO DESDE HTML DIRECTAMENTE Y DESDE JS)
    window.closeVideoModal = () => {
        const vidModal = document.getElementById('video-modal');
        const featurePlayer = document.getElementById('feature-video-player');
        if (vidModal) {
            vidModal.classList.remove('active');
        }
        if (featurePlayer) {
            featurePlayer.setAttribute('src', '');
        }
    };
});
