# 🥚 3D Egg Yolk - Liquid to Hard-boiled Visualization

A Three.js-based interactive 3D particle visualization that simulates an egg yolk with realistic liquid physics. Watch as particles behave like they're inside a liquid-filled sphere, with a viscosity slider that transforms the behavior from runny (liquid) to firm (hard-boiled).

## ✨ Features

- **🌊 Liquid Physics**: Realistic particle movement with spring-damper forces
- **🎛️ Viscosity Control**: Morph from liquid (runny) to hard-boiled (firm) with a single slider
- **👆 Touch Interaction**: Click/touch the yolk surface to push particles into perspective
- **🔄 Auto-Rotation**: Slow, natural sphere rotation
- **🎮 Manual Control**: OrbitControls for camera manipulation
- **📊 View Modes**: Volume, Surface, or Mixed particle distribution
- **🎨 Customizable**: Full GUI controls for all parameters

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd egg-yolk-3d
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🎮 Controls

### **🥚 Yolk Properties**
- **Particle Count**: 10k-60k particles (default: 15k)
- **Radius**: Sphere size (50-200, default: 120)
- **View Mode**: Volume, Surface, or Mixed distribution
- **Mix Ratio**: Blend between volume and surface (0-1)

### **🔄 Animation**
- **Rotation Speed**: Auto-rotation speed (0-0.2 rad/s)
- **Particle Size**: Screen-space particle size (1-3px)

### **💧 Physics**
- **Noise Strength**: Random movement intensity (0-2)
- **Noise Scale**: Spatial frequency of movement (0.001-0.1)
- **Flow Speed**: Time speed of noise flow (0-3)
- **Viscosity**: **Main control** - transforms from liquid (0) to hard-boiled (1)

### **👆 Interaction**
- **Push Strength**: Force of touch interaction (10-200)
- **Spread (σ)**: How far touch effect spreads (0.1-2)
- **Max Influence Angle**: Maximum angle for touch effect (0-π)
- **View Bias**: Blend between perspective and normal direction (0-1)

### **🎨 Appearance**
- **Particle Color**: Customize yolk color
- **Background Color**: Change scene background

## 🔬 Physics Model

The visualization uses a sophisticated physics engine with:

- **Spring-Damper System**: Particles return to base positions with configurable stiffness
- **Noise Flow**: Coherent random movement for organic liquid behavior
- **Viscosity Mapping**: Single slider controls multiple physics parameters:
  - **Liquid (0.0)**: springK=2.0, damping=1.2, noiseStrength=0.8
  - **Medium (0.5)**: springK=3.5, damping=2.2, noiseStrength=0.45
  - **Hard-boiled (1.0)**: springK=7.0, damping=4.5, noiseStrength=0.06

## 🎯 Interaction Details

- **Touch Detection**: Only works on the front half of the sphere
- **Raycasting**: Uses invisible target sphere for accurate hit detection
- **Impulse System**: Particles near touch point receive force pushing into perspective
- **Gaussian Falloff**: Touch effect decreases with angular distance from epicenter

## 🛠️ Technical Details

- **Three.js**: 3D graphics and rendering
- **Simplex Noise**: Organic particle movement
- **Float32Arrays**: Efficient particle data storage
- **Euler Integration**: Physics simulation with clamped timestep
- **High-DPI Support**: Capped at 2x for performance

## 📱 Performance Notes

- **Particle Count**: 15k default, up to 60k for high-end devices
- **Responsiveness**: Touch interaction optimized for smooth 60fps
- **Memory**: Efficient buffer management with minimal allocations

## 🎨 Customization

The `viscosityToParams()` function maps the viscosity slider to all physics parameters, allowing for easy tuning of the liquid-to-solid transition. Modify this function to create custom viscosity curves or add new physics behaviors.

## 🔧 Development

### Project Structure
```
src/
├── main.js          # Main application class
├── index.html       # HTML entry point
└── package.json     # Dependencies and scripts
```

### Key Classes
- **EggYolkVisualizer**: Main application class
- **Particle System**: Float32Array-based physics arrays
- **Physics Engine**: Spring-damper with noise forces
- **Interaction System**: Raycast-based touch detection

## 📄 License

MIT License - feel free to use and modify for your projects!

---

**Enjoy exploring the physics of egg yolks! 🥚✨** 