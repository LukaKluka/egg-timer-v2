// Egg Timer Application with Three.js Particle System
// Note: This version uses CDN libraries loaded via script tags in HTML

class EggTimer {
    constructor() {
        this.timer = null;
        this.timeRemaining = 0;
        this.isRunning = false;
        this.selectedMode = null;
        this.selectedTemp = 'cold'; // Default to cold
        
        // Timer settings (in seconds)
        this.timerSettings = {
            soft: { cold: 360, room: 300 },    // 6 min cold, 5 min room
            medium: { cold: 480, room: 420 },  // 8 min cold, 7 min room
            hard: { cold: 600, room: 540 }     // 10 min cold, 9 min room
        };
        
        // Three.js Particle system settings
        this.particleSettings = {
            particleSize: 1,
            particleCount: 8000,
            sphereRadius: 60,
            distribution: 'volume', // 'surface' or 'volume'
            dispersion: 0,
            flowSpeed: 0.3,
            noiseStrength: 0.8,
            noiseScale: 1,
            rotationSpeed: 0.3,
            randomnessX: 1,
            randomnessY: 1,
            randomnessZ: 1,
            seed: 0,
            particleColor: '#ffffff'
        };
        
        // Three.js variables
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.particleSystem = null;
        this.basePositions = [];
        this.currentPositions = [];
        this.noise3D = null;
        this.clock = null;
        this.animationId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDevControls();
        this.setDefaultSelection();
        
        // Initialize Three.js after a short delay to ensure libraries are loaded
        setTimeout(() => this.initThreeJS(), 100);
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.timeRemainingEl = document.getElementById('time-remaining');
        this.cookingModeDisplay = document.getElementById('cooking-mode-display');
        this.controls = document.getElementById('controls');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.alarmSound = document.getElementById('alarm-sound');
        
        // Get the canvas container
        this.canvasContainer = document.getElementById('particle-canvas');
        
        this.cookingModeBtns = document.querySelectorAll('.cooking-mode-btn');
        this.tempBtns = document.querySelectorAll('.temp-btn');
    }
    
    initThreeJS() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded. Please check the CDN links.');
            return;
        }
        
        this.clock = new THREE.Clock();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.createParticleSystem();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8fafc);
    }
    
    setupCamera() {
        const container = this.canvasContainer;
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 120);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        
        const container = this.canvasContainer;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Clear the container and add the Three.js canvas
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);
        
        // Style the canvas to fit the container
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.borderRadius = '50%';
    }
    
    setupControls() {
        if (typeof THREE.OrbitControls === 'undefined' && typeof OrbitControls === 'undefined') {
            console.warn('OrbitControls not available, using basic controls');
            this.controls = {
                update: () => {},
                autoRotate: true,
                autoRotateSpeed: 0.5,
                reset: () => {}
            };
        } else {
            const OrbitControlsClass = THREE.OrbitControls || OrbitControls;
            this.controls = new OrbitControlsClass(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = false;
            this.controls.enablePan = false;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
        }
    }
    
    createParticleSystem() {
        this.updateSeed();
        this.generateBasePositions();
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.currentPositions, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.particleSettings.particleSize,
            sizeAttenuation: false,
            color: this.particleSettings.particleColor,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }
    
    generateBasePositions() {
        const positions = [];
        this.basePositions = [];
        
        for (let i = 0; i < this.particleSettings.particleCount; i++) {
            let x, y, z;
            
            if (this.particleSettings.distribution === 'surface') {
                const phi = Math.acos(2 * Math.random() - 1);
                const theta = 2 * Math.PI * Math.random();
                
                x = this.particleSettings.sphereRadius * Math.sin(phi) * Math.cos(theta);
                y = this.particleSettings.sphereRadius * Math.sin(phi) * Math.sin(theta);
                z = this.particleSettings.sphereRadius * Math.cos(phi);
            } else {
                const phi = Math.acos(2 * Math.random() - 1);
                const theta = 2 * Math.PI * Math.random();
                const r = this.particleSettings.sphereRadius * Math.pow(Math.random(), 1/3);
                
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            }
            
            this.basePositions.push(x, y, z);
            positions.push(x, y, z);
        }
        
        this.currentPositions = new Float32Array(positions);
    }
    
    updateSeed() {
        // Simple noise function if simplex-noise is not available
        if (typeof createNoise3D !== 'undefined') {
            this.noise3D = createNoise3D(() => this.particleSettings.seed);
        } else if (typeof SimplexNoise !== 'undefined') {
            // Alternative simplex noise library
            const simplex = new SimplexNoise();
            this.noise3D = (x, y, z) => simplex.noise3D(x, y, z);
        } else {
            // Fallback simple noise
            this.noise3D = (x, y, z) => {
                const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
                return (n - Math.floor(n)) * 2 - 1;
            };
        }
    }
    
    updateParticlePositions(time) {
        if (!this.particleSystem) return;
        
        const positions = this.particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < this.particleSettings.particleCount; i++) {
            const baseIndex = i * 3;
            const baseX = this.basePositions[baseIndex];
            const baseY = this.basePositions[baseIndex + 1];
            const baseZ = this.basePositions[baseIndex + 2];
            
            // Calculate noise offsets
            const noiseX = this.noise3D(
                baseX * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed,
                baseY * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed * 0.7,
                baseZ * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed * 1.3
            );
            
            const noiseY = this.noise3D(
                baseX * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed * 1.1,
                baseY * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed,
                baseZ * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed * 0.9
            );
            
            const noiseZ = this.noise3D(
                baseX * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed * 0.8,
                baseY * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed * 1.2,
                baseZ * this.particleSettings.noiseScale * 0.01 + time * this.particleSettings.flowSpeed
            );
            
            // Apply noise with per-axis randomness
            const offsetX = noiseX * this.particleSettings.noiseStrength * this.particleSettings.randomnessX;
            const offsetY = noiseY * this.particleSettings.noiseStrength * this.particleSettings.randomnessY;
            const offsetZ = noiseZ * this.particleSettings.noiseStrength * this.particleSettings.randomnessZ;
            
            // Calculate final position with dispersion
            const distance = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
            const dispersionFactor = distance / this.particleSettings.sphereRadius;
            
            positions[baseIndex] = baseX + offsetX + (baseX / distance) * this.particleSettings.dispersion * dispersionFactor;
            positions[baseIndex + 1] = baseY + offsetY + (baseY / distance) * this.particleSettings.dispersion * dispersionFactor;
            positions[baseIndex + 2] = baseZ + offsetZ + (baseZ / distance) * this.particleSettings.dispersion * dispersionFactor;
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (!this.clock) return;
        
        const time = this.clock.getElapsedTime();
        
        // Update particle positions
        this.updateParticlePositions(time);
        
        // Apply rotation to the entire particle system
        if (this.particleSystem) {
            this.particleSystem.rotation.y = time * this.particleSettings.rotationSpeed;
        }
        
        // Update controls
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
        
        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    setupEventListeners() {
        // Cooking mode selection
        this.cookingModeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectCookingMode(btn));
        });
        
        // Temperature selection
        this.tempBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectTemperature(btn));
        });
        
        // Start button
        this.startBtn.addEventListener('click', () => this.startTimer());
        
        // Stop button
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        if (this.camera && this.renderer) {
            const container = this.canvasContainer;
            const aspect = container.clientWidth / container.clientHeight;
            
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }
    
    setupDevControls() {
        // Particle count controls
        document.getElementById('particles-down').addEventListener('click', () => {
            this.particleSettings.particleCount = Math.max(1000, this.particleSettings.particleCount - 1000);
            this.updateDevDisplay();
            this.rebuildParticleSystem();
        });
        
        document.getElementById('particles-up').addEventListener('click', () => {
            this.particleSettings.particleCount = Math.min(20000, this.particleSettings.particleCount + 1000);
            this.updateDevDisplay();
            this.rebuildParticleSystem();
        });
        
        // Speed controls
        document.getElementById('speed-down').addEventListener('click', () => {
            this.particleSettings.flowSpeed = Math.max(0, this.particleSettings.flowSpeed - 0.1);
            this.updateDevDisplay();
        });
        
        document.getElementById('speed-up').addEventListener('click', () => {
            this.particleSettings.flowSpeed = Math.min(2, this.particleSettings.flowSpeed + 0.1);
            this.updateDevDisplay();
        });
        
        // Wiggle controls (noise strength)
        document.getElementById('wiggle-down').addEventListener('click', () => {
            this.particleSettings.noiseStrength = Math.max(0, this.particleSettings.noiseStrength - 0.1);
            this.updateDevDisplay();
        });
        
        document.getElementById('wiggle-up').addEventListener('click', () => {
            this.particleSettings.noiseStrength = Math.min(3, this.particleSettings.noiseStrength + 0.1);
            this.updateDevDisplay();
        });
        
        // Random controls (dispersion)
        document.getElementById('random-down').addEventListener('click', () => {
            this.particleSettings.dispersion = Math.max(0, this.particleSettings.dispersion - 0.5);
            this.updateDevDisplay();
        });
        
        document.getElementById('random-up').addEventListener('click', () => {
            this.particleSettings.dispersion = Math.min(10, this.particleSettings.dispersion + 0.5);
            this.updateDevDisplay();
        });
        
        // Rotation controls
        document.getElementById('rotation-down').addEventListener('click', () => {
            this.particleSettings.rotationSpeed = Math.max(0, this.particleSettings.rotationSpeed - 0.1);
            this.updateDevDisplay();
        });
        
        document.getElementById('rotation-up').addEventListener('click', () => {
            this.particleSettings.rotationSpeed = Math.min(2, this.particleSettings.rotationSpeed + 0.1);
            this.updateDevDisplay();
        });
        
        // Size controls
        document.getElementById('size-down').addEventListener('click', () => {
            this.particleSettings.particleSize = Math.max(0.5, this.particleSettings.particleSize - 0.5);
            this.updateDevDisplay();
            this.updateParticleMaterial();
        });
        
        document.getElementById('size-up').addEventListener('click', () => {
            this.particleSettings.particleSize = Math.min(3, this.particleSettings.particleSize + 0.5);
            this.updateDevDisplay();
            this.updateParticleMaterial();
        });
        
        // Spacing controls (noise scale)
        document.getElementById('spacing-down').addEventListener('click', () => {
            this.particleSettings.noiseScale = Math.max(0.1, this.particleSettings.noiseScale - 0.1);
            this.updateDevDisplay();
        });
        
        document.getElementById('spacing-up').addEventListener('click', () => {
            this.particleSettings.noiseScale = Math.min(3, this.particleSettings.noiseScale + 0.1);
            this.updateDevDisplay();
        });
        
        // Expansion controls (distribution toggle)
        document.getElementById('expand-down').addEventListener('click', () => {
            this.particleSettings.distribution = this.particleSettings.distribution === 'volume' ? 'surface' : 'volume';
            this.updateDevDisplay();
            this.rebuildParticleSystem();
        });
        
        document.getElementById('expand-up').addEventListener('click', () => {
            this.particleSettings.distribution = this.particleSettings.distribution === 'volume' ? 'surface' : 'volume';
            this.updateDevDisplay();
            this.rebuildParticleSystem();
        });
        
        // Toggle controls
        document.getElementById('reset-particles').addEventListener('click', () => {
            this.resetParticleSettings();
        });
        
        document.getElementById('toggle-sphere').addEventListener('click', () => {
            if (this.controls && this.controls.autoRotate !== undefined) {
                this.controls.autoRotate = !this.controls.autoRotate;
            }
            this.updateDevDisplay();
        });
        
        document.getElementById('toggle-emitter').addEventListener('click', () => {
            this.particleSettings.dispersion = this.particleSettings.dispersion > 0 ? 0 : 2;
            this.updateDevDisplay();
        });
        
        document.getElementById('reset-rotation').addEventListener('click', () => {
            this.resetSphereRotation();
        });
        
        // Initialize display
        this.updateDevDisplay();
    }
    
    updateDevDisplay() {
        document.getElementById('particle-count').textContent = this.particleSettings.particleCount;
        document.getElementById('speed-value').textContent = this.particleSettings.flowSpeed.toFixed(1);
        document.getElementById('wiggle-value').textContent = this.particleSettings.noiseStrength.toFixed(1);
        document.getElementById('random-value').textContent = this.particleSettings.dispersion.toFixed(1);
        document.getElementById('rotation-value').textContent = this.particleSettings.rotationSpeed.toFixed(1);
        document.getElementById('size-value').textContent = this.particleSettings.particleSize.toFixed(1);
        document.getElementById('spacing-value').textContent = this.particleSettings.noiseScale.toFixed(1);
        document.getElementById('expand-value').textContent = this.particleSettings.distribution;
    }
    
    updateParticleMaterial() {
        if (this.particleSystem) {
            this.particleSystem.material.size = this.particleSettings.particleSize;
        }
    }
    
    rebuildParticleSystem() {
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
            this.particleSystem.geometry.dispose();
            this.particleSystem.material.dispose();
        }
        this.createParticleSystem();
    }
    
    resetParticleSettings() {
        this.particleSettings = {
            particleSize: 1,
            particleCount: 8000,
            sphereRadius: 60,
            distribution: 'volume',
            dispersion: 0,
            flowSpeed: 0.3,
            noiseStrength: 0.8,
            noiseScale: 1,
            rotationSpeed: 0.3,
            randomnessX: 1,
            randomnessY: 1,
            randomnessZ: 1,
            seed: 0,
            particleColor: '#ffffff'
        };
        this.updateDevDisplay();
        this.rebuildParticleSystem();
    }
    
    resetSphereRotation() {
        if (this.controls && this.controls.reset) {
            this.controls.reset();
            this.controls.autoRotate = true;
        }
    }
    
    setDefaultSelection() {
        // Set default temperature selection
        const coldBtn = document.querySelector('[data-temp="cold"]');
        if (coldBtn) {
            this.selectTemperature(coldBtn);
        }
    }
    
    selectCookingMode(clickedBtn) {
        // Remove active class from all buttons
        this.cookingModeBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        clickedBtn.classList.add('active');
        
        // Store selected mode
        this.selectedMode = clickedBtn.dataset.mode;
        
        // Update start button state
        this.updateStartButtonState();
    }
    
    selectTemperature(clickedBtn) {
        // Remove active class from all buttons
        this.tempBtns.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        clickedBtn.classList.add('active');
        
        // Store selected temperature
        this.selectedTemp = clickedBtn.dataset.temp;
        
        // Update start button state
        this.updateStartButtonState();
    }
    
    updateStartButtonState() {
        const canStart = this.selectedMode !== null && this.selectedTemp !== null;
        this.startBtn.disabled = !canStart;
    }
    
    startTimer() {
        if (!this.selectedMode || !this.selectedTemp) {
            alert('Please select both cooking mode and temperature!');
            return;
        }
        
        // Calculate timer duration
        this.timeRemaining = this.timerSettings[this.selectedMode][this.selectedTemp];
        
        // Switch buttons
        this.startBtn.classList.add('hidden');
        this.stopBtn.classList.remove('hidden');
        
        // Update display
        this.updateTimerDisplay();
        
        // Start countdown
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timerComplete();
            }
        }, 1000);
        
        // Add countdown animation
        this.timerDisplay.classList.add('countdown-active');
    }
    
    updateTimerDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;
        
        this.timeRemainingEl.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update cooking mode display
        if (this.selectedMode) {
            const modeNames = {
                soft: 'Soft Boiled',
                medium: 'Medium Boiled',
                hard: 'Hard Boiled'
            };
            this.cookingModeDisplay.textContent = modeNames[this.selectedMode];
        } else {
            this.cookingModeDisplay.textContent = 'Select mode to start';
        }
    }
    
    timerComplete() {
        // Stop timer
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Remove countdown animation and add completion state
        this.timerDisplay.classList.remove('countdown-active');
        this.timerDisplay.classList.add('timer-complete');
        
        // Update display
        this.timeRemainingEl.textContent = '00:00:00';
        this.cookingModeDisplay.textContent = 'Time\'s up! 🎉';
        
        // Switch buttons back
        this.startBtn.classList.remove('hidden');
        this.stopBtn.classList.add('hidden');
        
        // Play alarm sound
        this.playAlarm();
        
        // Show browser notification if supported
        this.showNotification();
        
        // Vibrate on mobile if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }
    
    stopTimer() {
        // Stop timer if running
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Reset state
        this.isRunning = false;
        
        // Switch buttons back
        this.startBtn.classList.remove('hidden');
        this.stopBtn.classList.add('hidden');
        
        // Remove completion state
        this.timerDisplay.classList.remove('timer-complete');
        this.timerDisplay.classList.remove('countdown-active');
        
        // Reset timer display
        this.timeRemainingEl.textContent = '00:00:00';
        this.cookingModeDisplay.textContent = 'Select mode to start';
        
        // Stop alarm if playing
        if (this.alarmSound) {
            this.alarmSound.pause();
            this.alarmSound.currentTime = 0;
        }
    }
    
    playAlarm() {
        // Try to play the embedded audio
        if (this.alarmSound) {
            this.alarmSound.currentTime = 0;
            this.alarmSound.play().catch(() => {
                // Fallback to browser alert if audio fails
                this.fallbackAlarm();
            });
        } else {
            this.fallbackAlarm();
        }
    }
    
    fallbackAlarm() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Final fallback to browser alert
            alert('⏰ Time\'s up! Your eggs are ready!');
        }
    }
    
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Egg Timer', {
                body: 'Your eggs are ready!',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification();
                }
            });
        }
    }
    
    resetTimer() {
        // Stop timer if running
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Reset state
        this.isRunning = false;
        this.timeRemaining = 0;
        
        this.startBtn.classList.remove('hidden');
        this.stopBtn.classList.add('hidden');
        
        // Remove completion state
        this.timerDisplay.classList.remove('timer-complete');
        this.timerDisplay.classList.remove('countdown-active');
        
        // Reset timer display
        this.timeRemainingEl.textContent = '00:00:00';
        this.cookingModeDisplay.textContent = 'Select mode to start';
        
        // Stop alarm if playing
        if (this.alarmSound) {
            this.alarmSound.pause();
            this.alarmSound.currentTime = 0;
        }
    }
    
    handleKeyboard(e) {
        // Space bar to start/stop timer
        if (e.code === 'Space' && !e.target.matches('button')) {
            e.preventDefault();
            if (this.isRunning) {
                this.resetTimer();
            } else if (this.selectedMode && this.selectedTemp) {
                this.startTimer();
            }
        }
        
        // Escape key to reset
        if (e.code === 'Escape') {
            this.resetTimer();
        }
        
        // Number keys for quick mode selection
        if (e.code >= 'Digit1' && e.code <= 'Digit3') {
            const modes = ['soft', 'medium', 'hard'];
            const index = parseInt(e.code.replace('Digit', '')) - 1;
            if (modes[index]) {
                const btn = document.querySelector(`[data-mode="${modes[index]}"]`);
                if (btn) this.selectCookingMode(btn);
            }
        }
        
        // T key for temperature toggle
        if (e.code === 'KeyT') {
            const currentTemp = this.selectedTemp;
            const newTemp = currentTemp === 'cold' ? 'room' : 'cold';
            const btn = document.querySelector(`[data-temp="${newTemp}"]`);
            if (btn) this.selectTemperature(btn);
        }
    }
    
    // Method to update timer settings (for easy customization)
    updateTimerSettings(newSettings) {
        this.timerSettings = { ...this.timerSettings, ...newSettings };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const eggTimer = new EggTimer();
    
    // Make it globally accessible for debugging
    window.eggTimer = eggTimer;
    
    // Request notification permission on first load
    if ('Notification' in window && Notification.permission === 'default') {
        // We'll request permission when the timer completes instead
        // to avoid being too pushy on first visit
    }
});

// Service Worker for PWA capabilities (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 