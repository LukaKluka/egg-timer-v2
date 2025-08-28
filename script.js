// Egg Timer Application
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
        
        // Particle system settings (ADJUSTABLE VIA DEV CONTROLS)
        this.particleSettings = {
            numParticles: 120,        // Total number of particles
            baseSpeed: 0.02,          // Base movement speed
            wiggleAmount: 8,          // Wiggle movement amount
            randomFactor: 0.5,        // Randomness factor
            showSphere: true,         // Show central sphere
            showEmitter: false,       // Show particle emitter
            sphereRadius: 30,         // Sphere radius
            emitterRadius: 40,        // Emitter radius
            sphereRotation: 0,        // Sphere rotation speed
            particleSize: 2,          // Uniform particle size
            gridSpacing: 8,           // Grid spacing for sphere formation
            expansionFactor: 0        // How much particles expand outward
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDevControls();
        this.setDefaultSelection();
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
        
        // Particle system
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        this.cookingModeBtns = document.querySelectorAll('.cooking-mode-btn');
        this.tempBtns = document.querySelectorAll('.temp-btn');
        
        // Initialize particle system immediately
        this.initParticleSystem();
        this.startParticleAnimation();
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
    }
    
    setupDevControls() {
        // Particle count controls
        document.getElementById('particles-down').addEventListener('click', () => {
            this.particleSettings.numParticles = Math.max(10, this.particleSettings.numParticles - 10);
            this.updateDevDisplay();
            this.reinitParticleSystem();
        });
        
        document.getElementById('particles-up').addEventListener('click', () => {
            this.particleSettings.numParticles = Math.min(500, this.particleSettings.numParticles + 10);
            this.updateDevDisplay();
            this.reinitParticleSystem();
        });
        
        // Speed controls
        document.getElementById('speed-down').addEventListener('click', () => {
            this.particleSettings.baseSpeed = Math.max(0.001, this.particleSettings.baseSpeed - 0.005);
            this.updateDevDisplay();
        });
        
        document.getElementById('speed-up').addEventListener('click', () => {
            this.particleSettings.baseSpeed = Math.min(0.1, this.particleSettings.baseSpeed + 0.005);
            this.updateDevDisplay();
        });
        
        // Wiggle controls
        document.getElementById('wiggle-down').addEventListener('click', () => {
            this.particleSettings.wiggleAmount = Math.max(0, this.particleSettings.wiggleAmount - 1);
            this.updateDevDisplay();
        });
        
        document.getElementById('wiggle-up').addEventListener('click', () => {
            this.particleSettings.wiggleAmount = Math.min(20, this.particleSettings.wiggleAmount + 1);
            this.updateDevDisplay();
        });
        
        // Random controls
        document.getElementById('random-down').addEventListener('click', () => {
            this.particleSettings.randomFactor = Math.max(0, this.particleSettings.randomFactor - 0.1);
            this.updateDevDisplay();
        });
        
        document.getElementById('random-up').addEventListener('click', () => {
            this.particleSettings.randomFactor = Math.min(2, this.particleSettings.randomFactor + 0.1);
            this.updateDevDisplay();
        });
        
        // Toggle controls
        document.getElementById('reset-particles').addEventListener('click', () => {
            this.resetParticleSettings();
        });
        
        document.getElementById('toggle-sphere').addEventListener('click', () => {
            this.particleSettings.showSphere = !this.particleSettings.showSphere;
            this.updateDevDisplay();
        });
        
        document.getElementById('toggle-emitter').addEventListener('click', () => {
            this.particleSettings.showEmitter = !this.particleSettings.showEmitter;
            this.updateDevDisplay();
        });
        
        // Initialize display
        this.updateDevDisplay();
    }
    
    updateDevDisplay() {
        document.getElementById('particle-count').textContent = this.particleSettings.numParticles;
        document.getElementById('speed-value').textContent = this.particleSettings.baseSpeed.toFixed(3);
        document.getElementById('wiggle-value').textContent = this.particleSettings.wiggleAmount;
        document.getElementById('random-value').textContent = this.particleSettings.randomFactor.toFixed(1);
    }
    
    resetParticleSettings() {
        this.particleSettings = {
            numParticles: 120,
            baseSpeed: 0.02,
            wiggleAmount: 8,
            randomFactor: 0.5,
            showSphere: true,
            showEmitter: false,
            sphereRadius: 30,
            emitterRadius: 40
        };
        this.updateDevDisplay();
        this.reinitParticleSystem();
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
    
    initParticleSystem() {
        this.particles = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Create particles in a more natural distribution
        const numParticles = this.particleSettings.numParticles;
        
        for (let i = 0; i < numParticles; i++) {
            // Random distribution with some clustering
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxRadius * 0.8 + maxRadius * 0.2;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.particles.push({
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                radius: radius,
                angle: angle,
                size: 1.5 + Math.random() * 2, // Random size between 1.5-3.5
                speed: this.particleSettings.baseSpeed + (Math.random() - 0.5) * this.particleSettings.randomFactor * 0.02,
                phase: Math.random() * Math.PI * 2,
                randomOffset: Math.random() * Math.PI * 2,
                velocityX: (Math.random() - 0.5) * 0.5,
                velocityY: (Math.random() - 0.5) * 0.5
            });
        }
        
        console.log('Created', this.particles.length, 'particles with improved distribution');
    }
    
    reinitParticleSystem() {
        this.stopParticleAnimation();
        this.initParticleSystem();
        this.startParticleAnimation();
    }
    
    drawParticles() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate progress for color
        let progress = 0;
        if (this.isRunning && this.selectedMode && this.selectedTemp) {
            const totalTime = this.timerSettings[this.selectedMode][this.selectedTemp];
            progress = (totalTime - this.timeRemaining) / totalTime;
        }
        
        // Draw central sphere if enabled
        if (this.particleSettings.showSphere) {
            this.drawSphere(progress);
        }
        
        // Draw emitter if enabled
        if (this.particleSettings.showEmitter) {
            this.drawEmitter();
        }
        
        // Draw all particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            
            // Color based on progress
            if (progress === 0) {
                this.ctx.fillStyle = '#374151'; // Dark gray for idle state
            } else if (progress < 0.3) {
                this.ctx.fillStyle = '#fbbf24'; // Yellow
            } else if (progress < 0.6) {
                this.ctx.fillStyle = '#f59e0b'; // Orange
            } else if (progress < 0.8) {
                this.ctx.fillStyle = '#d97706'; // Dark orange
            } else {
                this.ctx.fillStyle = '#92400e'; // Brown
            }
            
            this.ctx.fill();
        });
    }
    
    drawSphere(progress) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.particleSettings.sphereRadius;
        
        // Create gradient for sphere
        const gradient = this.ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        
        // Color based on progress
        let baseColor = '#e5e7eb'; // Light gray for idle
        if (progress > 0) {
            if (progress < 0.3) baseColor = '#fef3c7'; // Light yellow
            else if (progress < 0.6) baseColor = '#fed7aa'; // Light orange
            else if (progress < 0.8) baseColor = '#fdba74'; // Orange
            else baseColor = '#fb923c'; // Dark orange
        }
        
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(0.7, baseColor);
        gradient.addColorStop(1, this.adjustBrightness(baseColor, -20));
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add highlight
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = this.adjustBrightness(baseColor, 30);
        this.ctx.fill();
    }
    
    drawEmitter() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.particleSettings.emitterRadius;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw emitter particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Date.now() * 0.001;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fill();
        }
    }
    
    adjustBrightness(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    updateParticleAnimation() {
        if (!this.ctx) return;
        
        // Calculate progress (0 to 1)
        let progress = 0;
        if (this.isRunning && this.selectedMode && this.selectedTemp) {
            const totalTime = this.timerSettings[this.selectedMode][this.selectedTemp];
            progress = (totalTime - this.timeRemaining) / totalTime;
        }
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Update particle positions with floating movement
        this.particles.forEach(particle => {
            // Add floating movement
            const time = Date.now() * 0.001;
            const floatX = Math.sin(time + particle.phase) * this.particleSettings.wiggleAmount * 0.5;
            const floatY = Math.cos(time + particle.phase * 0.7) * this.particleSettings.wiggleAmount * 0.5;
            
            // Add random drift
            const randomX = Math.sin(time * 0.5 + particle.randomOffset) * this.particleSettings.randomFactor * 2;
            const randomY = Math.cos(time * 0.3 + particle.randomOffset) * this.particleSettings.randomFactor * 2;
            
            // Calculate target position with orbital movement
            const orbitalAngle = particle.angle + (time * particle.speed);
            let targetX = centerX + Math.cos(orbitalAngle) * particle.radius;
            let targetY = centerY + Math.sin(orbitalAngle) * particle.radius;
            
            // Add floating and random movement
            targetX += floatX + randomX;
            targetY += floatY + randomY;
            
            // Move toward center as cooking progresses (if sphere is shown)
            if (progress > 0 && this.particleSettings.showSphere) {
                const dx = centerX - targetX;
                const dy = centerY - targetY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = this.particleSettings.sphereRadius + 20;
                
                if (distance > maxDistance) {
                    targetX += dx * progress * 0.1;
                    targetY += dy * progress * 0.1;
                }
            }
            
            // Smooth movement with velocity
            particle.velocityX += (targetX - particle.x) * 0.05;
            particle.velocityY += (targetY - particle.y) * 0.05;
            
            // Apply velocity with damping
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            
            // Damping
            particle.velocityX *= 0.95;
            particle.velocityY *= 0.95;
            
            // Keep particles within bounds
            const maxRadius = Math.min(centerX, centerY) - 10;
            const distance = Math.sqrt((particle.x - centerX) ** 2 + (particle.y - centerY) ** 2);
            if (distance > maxRadius) {
                const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
                particle.x = centerX + Math.cos(angle) * maxRadius;
                particle.y = centerY + Math.sin(angle) * maxRadius;
            }
        });
        
        // Draw all particles
        this.drawParticles();
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.updateParticleAnimation());
    }
    
    startParticleAnimation() {
        console.log('Starting particle animation...');
        this.initParticleSystem();
        this.updateParticleAnimation();
    }
    
    stopParticleAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
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
        
        // Stop particle animation
        this.stopParticleAnimation();
        
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
        
        // Stop particle animation
        this.stopParticleAnimation();
        
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
        
        // Stop particle animation
        this.stopParticleAnimation();
        
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