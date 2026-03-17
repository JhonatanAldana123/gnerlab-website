document.addEventListener('DOMContentLoaded', () => {
    /* =========================================================================
       DETECCIÓN DE DISPOSITIVO (Mobile vs Desktop)
       ========================================================================= */
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = isTouchDevice || window.innerWidth <= 768;

    /* =========================================================================
       CUSTOM CURSOR (Solo Desktop — evita overhead en móvil)
       ========================================================================= */
    if (!isTouchDevice) {
        const customCursor = document.querySelector('.custom-cursor');

        document.addEventListener('mousemove', (e) => {
            if (customCursor) {
                customCursor.style.left = `${e.clientX}px`;
                customCursor.style.top = `${e.clientY}px`;
            }
        });
    }

    // Efecto hover y magnético en elementos clickeables (solo desktop)
    if (!isTouchDevice) {
        const clickables = document.querySelectorAll('a, button, input, .tool-card');
        clickables.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                if (el.classList.contains('btn-primary') || el.classList.contains('btn-secondary')) {
                    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
                }
            });

            // Magnetic Effect
            if (el.classList.contains('btn-primary') || el.classList.contains('btn-secondary')) {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    gsap.to(el, {
                        x: x * 0.3,
                        y: y * 0.3,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                });
            }
        });
    }

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
       LENIS SMOOTH SCROLLING
       ========================================================================= */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    /* =========================================================================
       GSAP ANIMATIONS & LENIS TICKER (Integración Única Anti-Lag)
       ========================================================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        
        // El ticker de GSAP se usa como la única fuente de la verdad para FPS
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    } else {
        // Fallback en caso de que GSAP no esté definido
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();

        // Entrada inicial cargada en la vista - Animación tipo Decrypt/Fade
        tl.fromTo('.hero-title .line',
            { y: 60, opacity: 0, filter: "blur(10px)", rotationX: -20 },
            { y: 0, opacity: 1, filter: "blur(0px)", rotationX: 0, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.2 }
        );

        tl.fromTo('.fade-up',
            { y: 30, opacity: 0, filter: "blur(5px)" },
            { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.2, ease: "power3.out" },
            "-=0.8"
        );

        // SCROLL REVEAL (Pin y escala de elementos)
        if (typeof ScrollTrigger !== 'undefined') {
            const flowTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "+=120%",   // Reducido levemente para que el progreso sea más directo
                    scrub: 1,        // Sigue al scroll de manera fluida (1 delay)
                    pin: true        // Deja anclada toda la sección mientras animamos el interior
                }
            });

            // "Atravesamos" el logo GnerLab
            flowTl.to("#massive-logo", {
                scale: 10, // Escala reducida de 30 a 10 para evitar la pérdida visual de geometría
                opacity: 0, 
                ease: "power3.in" // Acelera más natural al final sin explotar de golpe
            }, 0);

            // Los textos caen hacia el abismo de manera veloz
            flowTl.to("#hero-texts", {
                y: -100, // Desplazamiento más sutil
                scale: 0.85, // Disminuye el tamaño suavemente
                opacity: 0,
                ease: "power2.inOut"
            }, 0);

            // Al mismo tiempo, el video/malla de fondo se acerca lévemente
            flowTl.to(".hero-video-wrapper", {
                scale: 1.05, // Efecto zoom más delicado
                ease: "none"
            }, 0);
        }
    }

    /* =========================================================================
       VIDEO PLACEHOLDER / GRID HOVER LOGIC (Solo Desktop)
       ========================================================================= */
    if (!isTouchDevice) {
        const toolCards = document.querySelectorAll('.tool-card');
        const videoContainer = document.getElementById('video-preview-container');
        const previewVideo = document.getElementById('preview-video');

        const placeholderVideoSrc = "";

        toolCards.forEach(card => {
            let cardTicking = false;

            card.addEventListener('mousemove', (e) => {
                if (!cardTicking) {
                    requestAnimationFrame(() => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        card.style.setProperty('--mouse-x', `${x}px`);
                        card.style.setProperty('--mouse-y', `${y}px`);
                        
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = ((y - centerY) / centerY) * -4; 
                        const rotateY = ((x - centerX) / centerX) * 4;
                        
                        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                        cardTicking = false;
                    });
                    cardTicking = true;
                }
            });

            card.addEventListener('mouseenter', () => {
                videoContainer.classList.add('active');
                card.style.transition = 'transform 0.1s linear, background 0.5s, border-color 0.5s';
            });

            card.addEventListener('mouseleave', () => {
                videoContainer.classList.remove('active');
                card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                card.style.setProperty('--mouse-x', `-1000px`);
                card.style.setProperty('--mouse-y', `-1000px`);
            });
        });
    }

    /* =========================================================================
       LÓGICA UNIFICADA: Video EXCLUSIVAMENTE mediante botón Play ("Bot_You")
       ========================================================================= */
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        const playBtn = card.querySelector('.module-play-btn');
        const onclickAttr = card.getAttribute('onclick');
        
        if (onclickAttr && playBtn) {
            // Elimina el evento que abría video con cliquear fuera
            card.removeAttribute('onclick');
            
            // Asigna el evento exclusivamente al ícono "Play"
            playBtn.setAttribute('onclick', onclickAttr);
            playBtn.style.pointerEvents = 'auto'; // Permitir captar clics
            playBtn.style.cursor = 'pointer';
        }
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
    const downloadBtns = [document.getElementById('btn-download-pro')];

    downloadBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
                inputKey.value = '';
                inputKey.disabled = false;
                errorMsg.classList.add('hidden');
                
                // Reset terminal UI completely
                document.getElementById('terminal-input-container').style.display = 'block';
                document.getElementById('btn-verify-download').style.display = 'block';
                const output = document.getElementById('terminal-output');
                output.innerHTML = `
                    <p class="typewriter">> INICIALIZANDO PROTOCOLO DE SECURE STREAM...</p>
                    <p class="typewriter delay-1">> ESCANEANDO INTEGRIDAD DE CANAL...</p>
                    <p class="typewriter delay-2 text-warning">> ADVERTENCIA: INTERFAZ ENCRIPTADA. VERIFICACIÓN REQUERIDA.</p>
                `;
                
                // Foco después de animación (2.5 segundos para no forzar inmediatamente)
                setTimeout(() => {
                    inputKey.focus();
                }, 2500);
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
        const output = document.getElementById('terminal-output');
        const inputContainer = document.getElementById('terminal-input-container');
        const btnVerify = document.getElementById('btn-verify-download');

        if (val === 'Gnerlab2026') {
            errorMsg.classList.add('hidden');
            // Deshabilitar input para la animación
            inputKey.disabled = true;
            btnVerify.style.display = 'none';
            inputContainer.style.display = 'none';

            output.innerHTML += '<p class="typewriter text-warning">> VALIDATING MD5 HASH...</p>';
            
            setTimeout(() => {
                output.innerHTML += '<p class="typewriter">> SIGNATURE ACCEPTED. HTTP 200 OK.</p>';
                output.innerHTML += '<p class="typewriter">> DECRYPTING PAYLOAD: GnerLab_Setup_Oficial_V9.rar...</p>';
                document.querySelector('.terminal-modal').classList.add('glitch-active');
                
                setTimeout(() => {
                    document.querySelector('.terminal-modal').classList.remove('glitch-active');
                    output.innerHTML += '<p class="typewriter text-warning">> TRANSFERENCIA INICIADA.</p>';
                    
                    const dlLink = document.createElement('a');
                    dlLink.href = "./public/downloads/GnerLab_Setup_Oficial_V9.rar";
                    dlLink.download = "GnerLab_Setup_Oficial_V9.rar";
                    document.body.appendChild(dlLink);
                    dlLink.click();
                    document.body.removeChild(dlLink);

                    setTimeout(() => {
                        modal.classList.remove('active');
                        // Restore state for next time
                        inputKey.disabled = false;
                        btnVerify.style.display = 'block';
                        inputContainer.style.display = 'block';
                    }, 2500);
                }, 1500);
            }, 800);
        } else {
            errorMsg.classList.remove('hidden');
            inputKey.focus();
            document.querySelector('.terminal-modal').classList.add('glitch-active-error');
            setTimeout(() => {
                document.querySelector('.terminal-modal').classList.remove('glitch-active-error');
            }, 300);
        }
    };

    if (btnVerify) btnVerify.addEventListener('click', handleDownload);
    if (inputKey) {
        inputKey.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleDownload();
        });
    }

    // --- Interacción Espacial 3D y Spotlight para la Terminal Modal (solo desktop) ---
    if (!isTouchDevice) {
        const terminalModal = document.querySelector('.terminal-modal');
        if (terminalModal) {
            let modalTicking = false;

            terminalModal.addEventListener('mousemove', (e) => {
                if (!modalTicking) {
                    requestAnimationFrame(() => {
                        const rect = terminalModal.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        terminalModal.style.setProperty('--mouse-x', `${x}px`);
                        terminalModal.style.setProperty('--mouse-y', `${y}px`);
                        
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = ((y - centerY) / centerY) * -1.5; 
                        const rotateY = ((x - centerX) / centerX) * 1.5;
                        
                        terminalModal.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
                        modalTicking = false;
                    });
                    modalTicking = true;
                }
            });

            terminalModal.addEventListener('mouseenter', () => {
                 terminalModal.style.transition = 'transform 0.1s linear, background 0.5s, border-color 0.5s';
            });

            terminalModal.addEventListener('mouseleave', () => {
                terminalModal.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                terminalModal.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                terminalModal.style.setProperty('--mouse-x', `-1000px`);
                terminalModal.style.setProperty('--mouse-y', `-1000px`);
            });
        }
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

    /* =========================================================================
       SPLINE 3D LAZY LOADER (IntersectionObserver)
       Solo carga el runtime 3D cuando la sección es visible.
       En móvil, no se carga nunca (ahorra ~4MB de JS + GPU).
       ========================================================================= */
    const splineContainer = document.getElementById('spline-container');
    if (splineContainer) {
        if (isMobile) {
            // En móvil: deja el div vacío o muestra un gradiente estático
            splineContainer.style.background = 'radial-gradient(ellipse at center, rgba(255,0,55,0.08) 0%, transparent 70%)';
        } else {
            // En desktop: carga Spline cuando la sección sea visible
            let splineLoaded = false;
            const splineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !splineLoaded) {
                        splineLoaded = true;
                        const url = splineContainer.dataset.splineUrl;
                        // Cargar el runtime de Spline dinámicamente
                        const script = document.createElement('script');
                        script.type = 'module';
                        script.src = 'https://unpkg.com/@splinetool/viewer@1.9.72/build/spline-viewer.js';
                        script.onload = () => {
                            // Crear el viewer una vez que el script esté listo
                            const viewer = document.createElement('spline-viewer');
                            viewer.setAttribute('url', url);
                            viewer.style.width = '100%';
                            viewer.style.height = '100%';
                            splineContainer.appendChild(viewer);
                        };
                        document.head.appendChild(script);
                        splineObserver.disconnect();
                    }
                });
            }, { rootMargin: '200px' }); // Pre-carga 200px antes de que sea visible
            splineObserver.observe(splineContainer);
        }
    }
});

