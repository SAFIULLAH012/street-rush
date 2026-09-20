# 🏎️ Street Rush - Endless Highway Racer

A portfolio-quality, mobile-first browser arcade racing game built from scratch with **Vanilla JavaScript**, **HTML5 Canvas**, and **CSS3**. Dodge dense highway traffic, chain near misses for massive combos, engage high-velocity nitro boosts, and survive the rush.

---

## 🌟 Key Highlights & Features

- **Consolidated Clean Architecture**: Built across only **4 files** (`index.html`, `style.css`, `game.js`, `README.md`) with a completely modular, object-oriented engine structure inside.
- **Audio-Free**: Completely free of audio dependencies, Web Audio API errors, or mobile autoplay restrictions.
- **Procedural Vector Vehicle Sprites**: No emoji or simplistic rectangular placeholders! Renders realistic sports cars, supercars, sedans, SUVs, and heavy transport trucks to offscreen canvases with metallic gradients, aerodynamic creases, tinted glass reflections, alloy wheels, drop shadows, and projector headlights.
- **4 Distinct Playable Cars with Real Physics**:
  1. **Viper GT** (*Balanced Performance*): Dependable grip, solid top speed (210 km/h), balanced handling.
  2. **Apex Phantom** (*Hyper Speed Exotic*): Blistering top speed (245 km/h, 300 km/h with nitro) for highway sprinters.
  3. **Specter R** (*Precision Track*): Extreme steering agility (540 deg/s) and rapid disc brakes (190 rate).
  4. **Titan Turbo** (*Hyper Acceleration*): Twin-turbocharged muscle car with violent torque (125 accel) and instant recovery.
- **Interactive Garage Showroom**: Interactive turntable preview, real-time stat bars for Top Speed, Acceleration, Handling, Braking, and Nitro Power, with instant selection.
- **Procedural Traffic System**: Intelligent multi-lane spawner with speed hierarchies by lane (slower trucks on outer lanes, fast sports cars on inner lanes) and an **Anti-Blockade Algorithm** ensuring a viable passing lane is always open.
- **Proximity Near-Miss & Combo System**: Squeezing past traffic at speeds > 70 km/h triggers near-miss alerts (`+120 * Combo`), chains multipliers up to `x10`, recharges Nitro by +14%, and floats visual feed toasts.
- **High-Velocity Nitro**: Real-time boost exceeding normal top speeds, accompanied by radial speed-warp blur and dual-plume cyan/purple flame particles.
- **Dynamic Day / Sunset / Night Cycle**: Smooth ambient environment transitions, changing sky gradients, streetlights illuminating the roadway at dusk, and headlight projection cones casting onto the asphalt.
- **Integrated Mission Objectives**: Career objectives ("Highway Rookie", "Speed Demon", "Close Shave", "Traffic Weaver", "Combo Master", "Endurance Legend") tracked in real time with HUD progress chips and completion notifications.
- **Vehicle Integrity & Damage**: 3-stage collision system (100% -> 70% -> 40% -> 0%) with collision sparks, speed loss, camera shake, and 1.5-second invulnerability blinking.
- **Defensive LocalStorage Management**: Validates and stores All-Time Best Score, Longest Distance (km), Top Speed Hit, Total Near Misses, Best Combo, and preferences without `NaN`, `Infinity`, or corrupted data.
- **Ergonomic Responsive Controls**: Full keyboard support on desktop (WASD / Arrows / Space / P) and dedicated multi-touch on-screen thumb buttons (Left, Right, Gas, Brake, Nitro) with Pointer Events and adjustable opacity.

---

## 🎮 Controls

### Desktop Keyboard
| Action | Key Bindings |
| :--- | :--- |
| **Steer Left** | `A` or `Left Arrow` |
| **Steer Right** | `D` or `Right Arrow` |
| **Accelerate / Gas** | `W` or `Up Arrow` |
| **Brake / Reverse** | `S` or `Down Arrow` |
| **Nitro Boost (NOS)** | `Spacebar` (Requires > 15% charge) |
| **Pause / Resume** | `P` or `Escape` |

### Mobile & Tablet Touch
- **Left Thumb**: Dedicated **`Left`** and **`Right`** ergonomic steering buttons.
- **Right Thumb**:
  - **`GAS`** (Green button): Accelerates vehicle forward.
  - **`BRAKE`** (Red button): Applies disc brakes and activates taillight glare.
  - **`NOS`** (Cyan button): Ignites high-speed nitro thrusters.
- *Supports simultaneous multi-touch inputs (e.g., steer right + gas + nitro at the same time).*

---

## 📁 Project Structure

```
street-rush/
├── index.html       # Semantic HTML5 layout, HUD overlays, garage, menus, modals
├── style.css        # Responsive styling, arcade neon theme, cockpit HUD, touch controls
├── game.js          # Core engine: Config, Storage, Input, Assets, Physics, Traffic, UI
└── README.md        # Documentation, controls, architecture, checklist
```

---

## 🚀 Running Locally

Because **Street Rush** is built with standard Vanilla web technologies and contains zero external dependencies:

### Method 1: Direct File Launch
Simply double-click or open `index.html` directly in any modern browser (Chrome, Safari, Firefox, Edge, or mobile browsers).

### Method 2: Local HTTP Server (Recommended)
Using Node.js:
```bash
npx serve .
# or
npx http-server -p 8080
```

Using Python:
```bash
python -m http.server 8080
```
Open `http://localhost:8080` in your desktop or mobile browser.

---

## 🧪 Testing Checklist

- [x] **Game Start & State Transitions**: Clean transitions between Main Menu, Garage, Playing, Paused, and Game Over.
- [x] **Vehicle Physics**: Smooth delta-time integration; car accelerates, coasts to a stop when throttle is released, and handles smoothly.
- [x] **Car Differences**: Viper GT, Apex Phantom, Specter R, and Titan Turbo display noticeably distinct top speeds, acceleration curves, and steering sharpness.
- [x] **Traffic Spawner**: Traffic vehicles spawn across all 4 lanes with varied lengths, speeds, and colors; anti-blockade logic guarantees open corridors.
- [x] **Collision & Health**: Colliding causes speed loss, screen shake, spark debris, damage flash, 1.5s invulnerability blinking, and health reduction (100% -> 70% -> 40% -> 0%).
- [x] **Near Miss & Combo**: Close passes at high speed trigger "+120 NEAR MISS" toasts, boost combo streaks (x2, x3, x4...), and award bonus nitro.
- [x] **Nitro Boost**: Engaging Space / NOS button rapidly surges car past normal top speed with blue flame particles and speed warp overlay.
- [x] **Day / Night Lighting**: Smooth progression from daytime to sunset and night; streetlights and vehicle headlights illuminate the asphalt at night.
- [x] **Responsive Touch Controls**: Works on mobile viewports (360x800, 390x844, 412x915) and scales appropriately on desktop (1920x1080).
- [x] **LocalStorage Persistence**: Career records and settings persist across page refreshes with defensive type checking.

---

## 💡 Suggestions for Future V2 Features

1. **Weather System**: Dynamic rain effects with wet road surface reflections, wiper animations, and hydroplaning physics.
2. **Police Pursuit Mode**: AI patrol cruisers attempting pit maneuvers and roadblock interventions.
3. **Ghost Replays**: Record telemetry to race against your personal best run or friend's ghost vehicle.
4. **Car Customization**: Paint shop for custom neon underglow, rim designs, and vinyl decals.
