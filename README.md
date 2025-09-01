# Interactive Particle Sphere 🌟

An advanced interactive 3D particle sphere built with vanilla JavaScript and HTML5 Canvas. Features physics-based interactions, real-time controls, and smooth animations.

## ✨ Features

- **🎯 Interactive Physics**: Click anywhere on the sphere to apply localized impulses
- **🔄 Continuous Rotation**: Smooth auto-rotation with manual drag controls
- **⚙️ Real-time Controls**: Adjust particle count, size, physics parameters, and more
- **🎨 Customizable**: Change colors, distribution, noise effects, and physics behavior
- **📱 Responsive**: Works on desktop and mobile devices
- **🚀 Performance**: Optimized 2D canvas rendering with 3D perspective

## 🎮 Controls

### Physics Settings
- **Push Strength**: How strongly particles are pushed when clicked
- **Sigma (Spread)**: How far the impulse effect spreads
- **Spring K**: How quickly particles return to their base positions
- **Damping**: How much velocity is reduced each frame
- **Max Influence Angle**: Maximum angle for impulse influence

### Visual Settings
- **Particle Count**: Number of particles (100-2000)
- **Particle Size**: Size of each particle in pixels
- **Sphere Radius**: Size of the particle sphere
- **Rotation Speed**: Speed of automatic rotation
- **Noise Strength**: Intensity of particle movement
- **Flow Speed**: Speed of noise-based particle flow
- **Distribution**: Surface, volume, or mixed particle placement
- **Colors**: Customize particle and background colors

## 🚀 Quick Start

### Option 1: Direct Access
Visit the live demo: [Interactive Particle Sphere](https://your-username.github.io/egg-timer-v2/sphere-standalone-fixed.html)

### Option 2: Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/egg-timer-v2.git
   cd egg-timer-v2
   ```

2. Open in your browser:
   - **Main app**: `index.html`
   - **Standalone sphere**: `sphere-standalone-fixed.html`
   - **Simple sphere**: `sphere-simple.html`

3. Or run with a local server:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 🎯 How to Use

1. **Watch the sphere rotate** automatically
2. **Click anywhere on the sphere** to push particles away
3. **Drag to rotate** the sphere manually
4. **Adjust controls** in real-time to see immediate effects
5. **Reset physics** to return particles to their original positions

## 🔧 Technical Details

- **Rendering**: HTML5 Canvas with 2D context
- **3D Simulation**: Custom 3D math with perspective projection
- **Physics**: Spring-damper system with impulse forces
- **Interaction**: Custom raycaster for accurate sphere clicking
- **Animation**: RequestAnimationFrame with fixed timestep
- **Noise**: Custom Perlin noise implementation

## 📁 File Structure

```
egg-timer-v2/
├── index.html                 # Main egg timer app
├── sphere-standalone-fixed.html  # Advanced interactive sphere
├── sphere-simple.html         # Simple particle sphere
├── sphere-standalone.html     # Basic standalone version
├── script.js                  # Main application logic
├── style.css                  # Styling
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## 🎨 Customization

The particle sphere is highly customizable through the GUI controls:

- **Physics**: Adjust how particles respond to interactions
- **Visual**: Change appearance and behavior
- **Performance**: Balance particle count vs. smoothness
- **Colors**: Match your design preferences

## 🌟 Advanced Features

- **Raycasting**: Accurate 3D sphere intersection detection
- **Rotation Support**: Works correctly with rotated spheres
- **Continuous Interaction**: Auto-rotation resumes after manual interaction
- **Mobile Support**: Touch events for mobile devices
- **High Performance**: Optimized for smooth 60fps animation

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy exploring the interactive particle sphere!** 🎉 