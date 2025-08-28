# 🥚 Egg Timer

A responsive web application for perfectly timing your boiled eggs. Features a clean, modern interface with precise timing controls and multiple alarm options.

## Features

### 🍳 Cooking Modes
- **Soft Boiled**: 5 minutes (room temp) / 6 minutes (cold)
- **Medium Boiled**: 7 minutes (room temp) / 8 minutes (cold)  
- **Hard Boiled**: 9 minutes (room temp) / 10 minutes (cold)

### 🌡️ Temperature Options
- **Cold (from fridge)**: Default selection, adds 1 minute to cooking time
- **Room Temperature**: For eggs that have been sitting out

### ⏰ Timer Features
- Large, easy-to-read countdown display
- Real-time updates every second
- Visual feedback with animations
- Multiple alarm options:
  - Embedded audio file
  - Web Audio API fallback
  - Browser notifications
  - Mobile vibration (if supported)
  - Browser alert as final fallback

### 🎮 Controls
- **Start Timer**: Begin countdown after selecting options
- **Reset**: Stop timer and return to selection screen
- **Keyboard Shortcuts**:
  - `Space`: Start/stop timer
  - `Escape`: Reset timer
  - `1-3`: Quick cooking mode selection
  - `T`: Toggle temperature

## Usage

1. **Select Cooking Mode**: Choose Soft, Medium, or Hard Boiled
2. **Choose Temperature**: Select Cold or Room Temperature
3. **Start Timer**: Click "Start Timer" and immediately place eggs in boiling water
4. **Wait**: The timer will count down with visual feedback
5. **Alarm**: When time is up, multiple alarms will notify you
6. **Reset**: Use the reset button to start over

## Technical Details

### Files
- `index.html`: Main HTML structure with Tailwind CSS
- `style.css`: Custom CSS animations and responsive design
- `script.js`: Complete timer logic and UI interactions

### Browser Support
- Modern browsers with ES6+ support
- Mobile responsive design
- Progressive Web App (PWA) ready
- Works offline after initial load

### Customization
Timer settings can be easily modified in the JavaScript file:

```javascript
// In script.js, update the timerSettings object:
this.timerSettings = {
    soft: { cold: 360, room: 300 },    // 6 min cold, 5 min room
    medium: { cold: 480, room: 420 },  // 8 min cold, 7 min room
    hard: { cold: 600, room: 540 }     // 10 min cold, 9 min room
};
```

## Installation

1. Clone or download the project files
2. Open `index.html` in any modern web browser
3. No build process or dependencies required!

## Browser Permissions

The app may request:
- **Notification permission**: For desktop notifications when timer completes
- **Audio permission**: For alarm sounds (automatically handled)

## Mobile Features

- Responsive design for all screen sizes
- Touch-friendly button sizes
- Mobile vibration alerts
- Optimized for portrait and landscape orientations

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast visual design
- Focus indicators for all interactive elements

## License

This project is open source and available under the MIT License.

---

**Perfect eggs every time! 🥚✨** 