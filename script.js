// Egg Timer Application
class EggTimer {
    constructor() {
        this.timer = null;
        this.timeRemaining = 0;
        this.isRunning = false;
        this.selectedMode = 'hard'; // Default to hard boiled
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
        // Progress and timer elements
        this.progressEl = document.querySelector('.text-4xl.font-bold.text-black');
        this.timeRemainingEl = document.querySelectorAll('.text-4xl.font-bold.text-black')[1];
        
        // Cooking mode elements
        this.cookingModeBtn = document.querySelector('button.bg-black.text-white');
        this.pauseBtn = document.querySelector('button.bg-gray-200');
        
        // Temperature elements
        this.fridgeLabel = document.querySelector('.text-lg.font-bold');
        this.roomLabel = document.querySelectorAll('.text-lg.font-bold')[1];
        this.tempDial = document.querySelector('.w-8.h-8.bg-black.rounded-full');
        
        // Egg size elements
        this.eggSizeCircles = document.querySelectorAll('.w-12.h-12.border-2.rounded-full');
        
        // Action buttons
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.alarmSound = document.getElementById('alarm-sound');
        
        // Initialize with default values
        this.updateProgressDisplay();
    }
    
    setupEventListeners() {
        // Cooking mode button
        if (this.cookingModeBtn) {
            this.cookingModeBtn.addEventListener('click', () => this.toggleCookingMode());
        }
        
        // Pause button
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Temperature selection
        if (this.fridgeLabel && this.roomLabel) {
            this.fridgeLabel.addEventListener('click', () => this.selectTemperature('cold'));
            this.roomLabel.addEventListener('click', () => this.selectTemperature('room'));
        }
        
        // Egg size selection
        this.eggSizeCircles.forEach((circle, index) => {
            circle.addEventListener('click', () => this.selectEggSize(index));
        });
        
        // Action buttons
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    setDefaultSelection() {
        // Set default selections
        this.selectTemperature('cold');
        this.selectEggSize(1); // Medium size
        this.updateProgressDisplay();
    }
    
    toggleCookingMode() {
        const modes = ['soft', 'medium', 'hard'];
        const currentIndex = modes.indexOf(this.selectedMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.selectedMode = modes[nextIndex];
        
        // Update button text
        const modeNames = {
            soft: 'SOFT BOILED',
            medium: 'MEDIUM BOILED',
            hard: 'HARD BOILED'
        };
        
        if (this.cookingModeBtn) {
            this.cookingModeBtn.textContent = modeNames[this.selectedMode];
        }
        
        this.updateProgressDisplay();
    }
    
    togglePause() {
        if (this.isRunning) {
            this.stopTimer();
        } else if (this.selectedMode && this.selectedTemp) {
            this.startTimer();
        }
    }
    
    selectTemperature(temp) {
        this.selectedTemp = temp;
        
        // Update visual selection
        if (this.tempDial) {
            if (temp === 'cold') {
                this.tempDial.style.transform = 'rotate(0deg)';
            } else {
                this.tempDial.style.transform = 'rotate(180deg)';
            }
        }
        
        this.updateProgressDisplay();
    }
    
    selectEggSize(index) {
        const sizes = ['small', 'medium', 'large'];
        this.selectedSize = sizes[index];
        
        // Update visual selection
        this.eggSizeCircles.forEach((circle, i) => {
            circle.classList.remove('border-red-500', 'bg-gray-200');
            circle.classList.add('border-black');
            
            if (i === index) {
                circle.classList.remove('border-black');
                circle.classList.add('border-red-500', 'bg-gray-200');
            }
        });
        
        this.updateProgressDisplay();
    }
    
    updateProgressDisplay() {
        if (!this.selectedMode || !this.selectedTemp) return;
        
        const totalTime = this.timerSettings[this.selectedMode][this.selectedTemp];
        const elapsed = totalTime - this.timeRemaining;
        const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
        
        // Update progress percentage
        if (this.progressEl) {
            this.progressEl.textContent = `${Math.round(progress)}%`;
        }
        
        // Update time remaining
        if (this.timeRemainingEl) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            this.timeRemainingEl.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update progress arc
        this.updateProgressArc(progress);
    }
    
    updateProgressArc(progress) {
        const progressArc = document.querySelector('.border-r-red-500.border-b-red-500');
        if (progressArc) {
            const rotation = (progress / 100) * 360;
            progressArc.style.transform = `rotate(${rotation}deg)`;
        }
        
        // Update progress dot position
        const progressDot = document.querySelector('.absolute.top-2.right-2.w-3.h-3.bg-red-500');
        if (progressDot) {
            const angle = (progress / 100) * Math.PI * 2;
            const radius = 80; // Approximate radius
            const x = Math.cos(angle - Math.PI/2) * radius;
            const y = Math.sin(angle - Math.PI/2) * radius;
            progressDot.style.transform = `translate(${x}px, ${y}px)`;
        }
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
        this.updateProgressDisplay();
        
        // Start countdown
        this.isRunning = true;
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateProgressDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }
    
    timerComplete() {
        // Stop timer
        clearInterval(this.timer);
        this.isRunning = false;
        
        // Update display
        this.timeRemainingEl.textContent = '00:00';
        this.progressEl.textContent = '100%';
        
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
        
        // Stop alarm if playing
        if (this.alarmSound) {
            this.alarmSound.pause();
            this.alarmSound.currentTime = 0;
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
        
        // Reset timer display
        this.updateProgressDisplay();
        
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
    
    handleKeyboard(e) {
        // Space bar to start/stop timer
        if (e.code === 'Space' && !e.target.matches('button')) {
            e.preventDefault();
            if (this.isRunning) {
                this.stopTimer();
            } else if (this.selectedMode && this.selectedTemp) {
                this.startTimer();
            }
        }
        
        // Escape key to reset
        if (e.code === 'Escape') {
            this.resetTimer();
        }
        
        // M key to toggle cooking mode
        if (e.code === 'KeyM') {
            this.toggleCookingMode();
        }
        
        // T key for temperature toggle
        if (e.code === 'KeyT') {
            const newTemp = this.selectedTemp === 'cold' ? 'room' : 'cold';
            this.selectTemperature(newTemp);
        }
        
        // S key for egg size toggle
        if (e.code === 'KeyS') {
            const sizes = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(this.selectedSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            this.selectEggSize(nextIndex);
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