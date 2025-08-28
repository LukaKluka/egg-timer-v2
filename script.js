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
        
        this.initializeElements();
        this.setupEventListeners();
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
        
        // Create concentric circles with dotted lines
        const numCircles = 5;
        const dotsPerCircle = 24;
        
        for (let circle = 0; circle < numCircles; circle++) {
            const radius = (maxRadius * (circle + 1)) / numCircles;
            
            for (let dot = 0; dot < dotsPerCircle; dot++) {
                const angle = (dot / dotsPerCircle) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                this.particles.push({
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y,
                    radius: radius,
                    angle: angle,
                    circleIndex: circle,
                    dotIndex: dot,
                    size: 2 + (circle * 0.5), // Larger dots for outer circles
                    speed: 0.02 + (circle * 0.01), // Faster for outer circles
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        
        console.log('Created', this.particles.length, 'particles in', numCircles, 'concentric circles');
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
    
    updateParticleAnimation() {
        if (!this.ctx) return;
        
        // Calculate progress (0 to 1)
        let progress = 0;
        if (this.isRunning && this.selectedMode && this.selectedTemp) {
            const totalTime = this.timerSettings[this.selectedMode][this.selectedTemp];
            progress = (totalTime - this.timeRemaining) / totalTime;
        }
        
        // Update particle positions based on progress
        this.particles.forEach(particle => {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            // Calculate movement speed (faster at beginning, slower as it progresses)
            const movementSpeed = 0.05 - (progress * 0.04); // From 0.05 to 0.01
            const wiggleSpeed = 0.008 - (progress * 0.006); // From 0.008 to 0.002
            const wiggleAmount = 8 - (progress * 6); // From 8px to 2px
            
            // Calculate new position with orbital movement and wiggle
            const time = Date.now() * wiggleSpeed + particle.phase;
            const orbitalAngle = particle.angle + (time * particle.speed);
            
            // Base position on circle
            let targetX = centerX + Math.cos(orbitalAngle) * particle.radius;
            let targetY = centerY + Math.sin(orbitalAngle) * particle.radius;
            
            // Add wiggle (more at beginning, less as it progresses)
            if (wiggleAmount > 0) {
                targetX += Math.sin(time * 2) * wiggleAmount;
                targetY += Math.cos(time * 2) * wiggleAmount;
            }
            
            // Move toward center as cooking progresses
            if (progress > 0) {
                const dx = centerX - targetX;
                const dy = centerY - targetY;
                targetX += dx * progress * 0.3;
                targetY += dy * progress * 0.3;
            }
            
            // Smooth movement
            particle.x += (targetX - particle.x) * movementSpeed;
            particle.y += (targetY - particle.y) * movementSpeed;
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