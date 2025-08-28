// Modern Egg Timer App
class EggTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.totalPauseTime = 0;
        this.duration = 0;
        this.interval = null;
        this.currentMode = 'hard';
        this.currentTemp = 'fridge';
        this.currentSize = 'medium';
        
        this.initializeElements();
        this.setupEventListeners();
        this.drawProgressCircle();
        this.updateDisplay();
    }

    initializeElements() {
        this.progressCanvas = document.getElementById('progress-canvas');
        this.ctx = this.progressCanvas.getContext('2d');
        this.percentageDisplay = document.querySelector('.text-4xl.font-bold.text-black');
        this.timeDisplay = document.querySelector('.text-4xl.font-bold.text-black:last-of-type');
        this.cookingModeBtn = document.getElementById('cooking-mode-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.eggSizeBtns = document.querySelectorAll('.egg-size-btn');
    }

    setupEventListeners() {
        // Cooking mode button
        this.cookingModeBtn.addEventListener('click', () => {
            this.cycleCookingMode();
        });

        // Pause button
        this.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        // Egg size buttons
        this.eggSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectEggSize(btn.dataset.size);
            });
        });

        // Temperature dial (simplified for now)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bg-gray-200.rounded-xl')) {
                this.toggleTemperature();
            }
        });
    }

    cycleCookingMode() {
        const modes = ['SOFT BOILED', 'MEDIUM BOILED', 'HARD BOILED'];
        const currentText = this.cookingModeBtn.querySelector('span').textContent;
        const currentIndex = modes.indexOf(currentText);
        const nextIndex = (currentIndex + 1) % modes.length;
        const nextMode = modes[nextIndex];
        
        this.cookingModeBtn.querySelector('span').textContent = nextMode;
        this.currentMode = nextMode.toLowerCase().replace(' ', '_');
        
        // Update duration based on mode
        this.updateDuration();
    }

    selectEggSize(size) {
        // Remove active class from all buttons
        this.eggSizeBtns.forEach(btn => {
            btn.classList.remove('active', 'bg-gray-300');
            btn.classList.add('bg-gray-200');
            const circle = btn.querySelector('div');
            circle.classList.remove('border-red-500');
            circle.classList.add('border-black');
        });

        // Add active class to selected button
        const selectedBtn = document.querySelector(`[data-size="${size}"]`);
        selectedBtn.classList.remove('bg-gray-200');
        selectedBtn.classList.add('active', 'bg-gray-300');
        const circle = selectedBtn.querySelector('div');
        circle.classList.remove('border-black');
        circle.classList.add('border-red-500');

        this.currentSize = size;
        this.updateDuration();
    }

    toggleTemperature() {
        this.currentTemp = this.currentTemp === 'fridge' ? 'room' : 'fridge';
        const dial = document.querySelector('.w-8.h-8.bg-black.rounded-full');
        const indicator = dial.querySelector('div');
        
        if (this.currentTemp === 'room') {
            indicator.style.transform = 'rotate(45deg)';
        } else {
            indicator.style.transform = 'rotate(-45deg)';
        }
        
        this.updateDuration();
    }

    updateDuration() {
        // Base times in seconds
        const baseTimes = {
            soft_boiled: 180,    // 3 minutes
            medium_boiled: 240,  // 4 minutes
            hard_boiled: 300     // 5 minutes
        };

        // Size multipliers
        const sizeMultipliers = {
            small: 0.8,
            medium: 1.0,
            large: 1.2
        };

        // Temperature adjustments
        const tempAdjustments = {
            fridge: 30,  // Add 30 seconds for fridge eggs
            room: 0      // No adjustment for room temperature
        };

        const baseTime = baseTimes[this.currentMode] || 300;
        const sizeMultiplier = sizeMultipliers[this.currentSize] || 1.0;
        const tempAdjustment = tempAdjustments[this.currentTemp] || 0;

        this.duration = Math.round((baseTime * sizeMultiplier) + tempAdjustment);
        
        // If timer is running, restart with new duration
        if (this.isRunning) {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now() - this.totalPauseTime;
        this.pauseTime = 0;
        
        this.interval = setInterval(() => {
            this.updateTimer();
        }, 100);
        
        // Update button states
        this.pauseBtn.classList.remove('hidden');
    }

    togglePause() {
        if (!this.isRunning) return;
        
        if (this.isPaused) {
            // Resume
            this.isPaused = false;
            this.totalPauseTime += Date.now() - this.pauseTime;
            this.interval = setInterval(() => {
                this.updateTimer();
            }, 100);
        } else {
            // Pause
            this.isPaused = true;
            this.pauseTime = Date.now();
            clearInterval(this.interval);
        }
    }

    stopTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.interval);
        this.startTime = 0;
        this.pauseTime = 0;
        this.totalPauseTime = 0;
        
        // Update button states
        this.pauseBtn.classList.add('hidden');
        
        this.updateDisplay();
        this.drawProgressCircle();
    }

    updateTimer() {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.duration * 1000 - elapsed);
        
        if (remaining <= 0) {
            this.timerComplete();
            return;
        }
        
        const percentage = Math.round(((this.duration * 1000 - remaining) / (this.duration * 1000)) * 100);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        // Update displays
        this.percentageDisplay.textContent = `${percentage}%`;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress circle
        this.drawProgressCircle(percentage);
    }

    timerComplete() {
        this.stopTimer();
        this.playAlarm();
        
        // Show completion state
        this.percentageDisplay.textContent = '100%';
        this.timeDisplay.textContent = '00:00';
        this.drawProgressCircle(100);
        
        // Add completion animation
        document.body.classList.add('timer-complete');
        setTimeout(() => {
            document.body.classList.remove('timer-complete');
        }, 3000);
    }

    drawProgressCircle(percentage = 0) {
        const canvas = this.progressCanvas;
        const ctx = this.ctx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Draw progress arc
        if (percentage > 0) {
            const startAngle = -Math.PI / 2; // Start from top
            const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Draw progress dot
            const dotAngle = endAngle;
            const dotX = centerX + radius * Math.cos(dotAngle);
            const dotY = centerY + radius * Math.sin(dotAngle);
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
        }
    }

    updateDisplay() {
        this.percentageDisplay.textContent = '0%';
        this.timeDisplay.textContent = '00:00';
    }

    playAlarm() {
        const audio = document.getElementById('alarm-sound');
        if (audio) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const eggTimer = new EggTimer();
    
    // Auto-start timer when cooking mode is selected (optional)
    // eggTimer.startTimer();
}); 