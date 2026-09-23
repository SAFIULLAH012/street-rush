/**
 * STREET RUSH - HIGHWAY PURSUIT
 * Complete Game Engine & Lifecycle
 * Vanilla JavaScript, HTML5 Canvas, LocalStorage (No Audio)
 */

'use strict';

/* ==========================================================================
   1. CONFIGURATION & CONSTANTS
   ========================================================================== */
const CONFIG = {
  // Road & World dimensions
  ROAD: {
    LANES: 4,
    LANE_WIDTH: 72,       // pixels per lane in virtual coordinates
    SHOULDER_WIDTH: 36,   // road shoulder on each side
    SEGMENT_LENGTH: 40,   // stripe segment length
    STRIPE_LENGTH: 24,    // white dashed line length
    STRIPE_WIDTH: 4,
    RUMBLE_WIDTH: 8
  },

  // Player Car Specifications (Tuned for smooth, enjoyable, and controllable arcade racing)
  CARS: [
    {
      id: 'viper',
      name: 'VIPER GT',
      class: 'BALANCED PERFORMANCE',
      desc: 'American sports coupe featuring dependable grip, solid top speed, and balanced handling.',
      topSpeed: 150,         // km/h
      boostTopSpeed: 190,    // km/h with nitro
      accel: 45,             // acceleration rate
      brake: 110,            // braking rate
      handling: 400,         // lateral steering speed
      nitroCapacity: 100,
      nitroDrain: 22,        // percent per second
      nitroRecharge: 5.0,    // percent per second passive
      bodyColor: '#1a5fb4',
      accentColor: '#f6f8fa',
      glassColor: '#0b192c',
      stats: { speed: 75, accel: 80, handling: 75, brake: 80, nitro: 85 }
    },
    {
      id: 'phantom',
      name: 'APEX PHANTOM',
      class: 'HYPER SPEED EXOTIC',
      desc: 'Lightweight carbon-fiber supercar with high top speed, designed for highway sprinters.',
      topSpeed: 175,
      boostTopSpeed: 220,
      accel: 42,
      brake: 95,
      handling: 360,
      nitroCapacity: 110,
      nitroDrain: 20,
      nitroRecharge: 4.5,
      bodyColor: '#00b4d8',
      accentColor: '#10141a',
      glassColor: '#04121e',
      stats: { speed: 95, accel: 72, handling: 68, brake: 72, nitro: 90 }
    },
    {
      id: 'specter',
      name: 'SPECTER R',
      class: 'PRECISION TRACK',
      desc: 'Precision-tuned road racer with agile steering and sharp disc brakes.',
      topSpeed: 140,
      boostTopSpeed: 175,
      accel: 50,
      brake: 130,
      handling: 480,
      nitroCapacity: 90,
      nitroDrain: 24,
      nitroRecharge: 6.0,
      bodyColor: '#d90429',
      accentColor: '#2b2d42',
      glassColor: '#180005',
      stats: { speed: 68, accel: 85, handling: 95, brake: 95, nitro: 75 }
    },
    {
      id: 'titan',
      name: 'TITAN TURBO',
      class: 'HYPER ACCELERATION',
      desc: 'Twin-turbocharged muscle beast with strong off-the-line torque and rapid speed recovery.',
      topSpeed: 155,
      boostTopSpeed: 195,
      accel: 60,
      brake: 105,
      handling: 380,
      nitroCapacity: 100,
      nitroDrain: 22,
      nitroRecharge: 5.0,
      bodyColor: '#ffb703',
      accentColor: '#023047',
      glassColor: '#120d02',
      stats: { speed: 78, accel: 95, handling: 72, brake: 76, nitro: 85 }
    }
  ],

  // Traffic Vehicle Profiles (Calm, relaxed highway cruising speeds)
  TRAFFIC_TYPES: [
    { type: 'sedan', width: 42, length: 82, minSpeed: 65, maxSpeed: 85, weight: 35, colors: ['#4a5568', '#2b6cb0', '#c53030', '#718096'] },
    { type: 'compact', width: 38, length: 72, minSpeed: 70, maxSpeed: 90, weight: 30, colors: ['#38b2ac', '#ecc94b', '#9f7aea', '#e53e3e'] },
    { type: 'suv', width: 46, length: 92, minSpeed: 60, maxSpeed: 80, weight: 20, colors: ['#1a202c', '#4a5568', '#2c5282'] },
    { type: 'sports', width: 43, length: 84, minSpeed: 80, maxSpeed: 105, weight: 10, colors: ['#e53e3e', '#dd6b20', '#3182ce'] },
    { type: 'truck', width: 50, length: 135, minSpeed: 50, maxSpeed: 70, weight: 5, colors: ['#e2e8f0', '#718096', '#4a5568'] }
  ],

  // Gameplay Balancing
  PHYSICS: {
    COAST_DECEL: 26,        // km/h per second when throttle released (gentle coasting)
    STEER_INERTIA: 0.12,    // lateral smoothing
    CAMERA_FOLLOW_LERP: 0.1,
    COLLISION_SPEED_LOSS: 0.55,
    INVULNERABILITY_TIME: 1.5, // seconds after hit
    HEALTH_MAX: 100,
    DAMAGE_PER_HIT: 30       // 100% -> 70% -> 40% -> 10% -> 0%
  },

  SCORING: {
    POINTS_PER_KM: 250,
    OVERTAKE_POINTS: 40,
    NEAR_MISS_POINTS: 120,
    HIGH_SPEED_THRESHOLD: 120,
    HIGH_SPEED_MULTIPLIER: 1.5,
    COMBO_TIMEOUT: 4.0,     // seconds before combo streak resets
    NEAR_MISS_DIST_X: 34,   // max lateral clearance for near miss
    NEAR_MISS_DIST_Y: 70    // vertical clearance corridor
  },

  DAY_NIGHT: {
    CYCLE_DURATION: 90      // seconds for full Day -> Sunset -> Night -> Dawn cycle
  }
};

/* ==========================================================================
   2. DEFENSIVE STORAGE MANAGER (localStorage)
   ========================================================================== */
class StorageManager {
  static STORAGE_KEY = 'street_rush_career_data';

  static getDefaultData() {
    return {
      bestScore: 0,
      longestDistance: 0,
      highestSpeed: 0,
      totalNearMisses: 0,
      bestCombo: 0,
      selectedCarId: 'viper',
      screenShake: true,
      touchOpacity: 80,
      completedMissions: []
    };
  }

  static load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return this.getDefaultData();
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return this.getDefaultData();

      return {
        bestScore: this.validateNum(parsed.bestScore, 0),
        longestDistance: this.validateNum(parsed.longestDistance, 0),
        highestSpeed: this.validateNum(parsed.highestSpeed, 0),
        totalNearMisses: this.validateNum(parsed.totalNearMisses, 0),
        bestCombo: this.validateNum(parsed.bestCombo, 0),
        selectedCarId: typeof parsed.selectedCarId === 'string' ? parsed.selectedCarId : 'viper',
        screenShake: typeof parsed.screenShake === 'boolean' ? parsed.screenShake : true,
        touchOpacity: this.validateNum(parsed.touchOpacity, 80),
        completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : []
      };
    } catch (e) {
      console.warn('StorageManager: Failed to read localStorage, using default data.', e);
      return this.getDefaultData();
    }
  }

  static save(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('StorageManager: Failed to save to localStorage.', e);
    }
  }

  static validateNum(val, fallback) {
    const n = Number(val);
    return !Number.isNaN(n) && Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  static clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('StorageManager: Failed to clear localStorage.', e);
    }
  }
}

/* ==========================================================================
   3. PROCEDURAL ASSET GENERATOR (Cached Offscreen Vehicle Canvas Sprites)
   ========================================================================== */
class AssetGenerator {
  constructor() {
    this.carSprites = new Map();
    this.generateAllAssets();
  }

  generateAllAssets() {
    // Generate 4 playable car sprites
    CONFIG.CARS.forEach(car => {
      this.carSprites.set(car.id, this.renderCarSprite(44, 86, car.bodyColor, car.accentColor, car.glassColor, true));
    });

    // Generate traffic car sprites
    CONFIG.TRAFFIC_TYPES.forEach(t => {
      t.colors.forEach((color, idx) => {
        const key = `${t.type}_${idx}`;
        this.carSprites.set(key, this.renderCarSprite(t.width, t.length, color, '#222', '#0b192c', false, t.type));
      });
    });
  }

  getSprite(key) {
    return this.carSprites.get(key) || null;
  }

  renderCarSprite(w, h, bodyColor, accentColor, glassColor, isPlayer, carType = 'coupe') {
    const canvas = document.createElement('canvas');
    const pad = 12; // padding for drop shadow & glow
    canvas.width = w + pad * 2;
    canvas.height = h + pad * 2;
    const ctx = canvas.getContext('2d');

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Soft Ambient Drop Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.filter = 'blur(6px)';
    this.drawRoundedRect(ctx, -halfW - 2, -halfH + 4, w + 4, h + 4, 10);
    ctx.fill();
    ctx.restore();

    // 2. Wheels / Tires
    ctx.fillStyle = '#1c1e24';
    const wheelW = 7;
    const wheelH = 18;
    const wheelInsetX = halfW - 2;
    const frontWheelY = -halfH + 18;
    const rearWheelY = halfH - 22;

    // Front wheels & rear wheels
    this.drawRoundedRect(ctx, -wheelInsetX - 2, frontWheelY, wheelW, wheelH, 3);
    this.drawRoundedRect(ctx, wheelInsetX - wheelW + 2, frontWheelY, wheelW, wheelH, 3);
    this.drawRoundedRect(ctx, -wheelInsetX - 2, rearWheelY, wheelW, wheelH, 3);
    this.drawRoundedRect(ctx, wheelInsetX - wheelW + 2, rearWheelY, wheelW, wheelH, 3);
    ctx.fill();

    // 3. Main Car Body Chassis
    const bodyGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    bodyGrad.addColorStop(0, this.adjustBrightness(bodyColor, -25));
    bodyGrad.addColorStop(0.2, bodyColor);
    bodyGrad.addColorStop(0.5, this.adjustBrightness(bodyColor, 30));
    bodyGrad.addColorStop(0.8, bodyColor);
    bodyGrad.addColorStop(1, this.adjustBrightness(bodyColor, -30));

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;

    // Aerodynamic Body Contour
    ctx.beginPath();
    const cornerR = carType === 'truck' ? 4 : 10;
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, cornerR);
    ctx.fill();
    ctx.stroke();

    // 4. Accent Center Racing Stripes
    ctx.fillStyle = accentColor;
    if (isPlayer) {
      ctx.fillRect(-4, -halfH + 2, 8, h - 4);
    }

    // 5. Hood Aerodynamic Vents & Creases
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-halfW * 0.5, -halfH + 12);
    ctx.lineTo(-halfW * 0.3, -halfH + 28);
    ctx.moveTo(halfW * 0.5, -halfH + 12);
    ctx.lineTo(halfW * 0.3, -halfH + 28);
    ctx.stroke();

    // 6. Cabin Glass / Windshields
    const glassGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
    glassGrad.addColorStop(0, '#102030');
    glassGrad.addColorStop(0.5, '#1e3852');
    glassGrad.addColorStop(1, '#0b1622');

    ctx.fillStyle = glassGrad;
    const glassW = w * 0.72;
    const glassH = h * 0.44;
    const glassY = -halfH + h * 0.28;

    this.drawRoundedRect(ctx, -glassW / 2, glassY, glassW, glassH, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glass Specular Glare Reflection
    ctx.save();
    ctx.beginPath();
    this.drawRoundedRect(ctx, -glassW / 2, glassY, glassW, glassH, 7);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-glassW, glassY - 10);
    ctx.lineTo(glassW, glassY + glassH + 10);
    ctx.stroke();
    ctx.restore();

    // Roof Panel
    ctx.fillStyle = bodyColor;
    const roofW = glassW * 0.8;
    const roofH = glassH * 0.45;
    this.drawRoundedRect(ctx, -roofW / 2, glassY + glassH * 0.28, roofW, roofH, 4);
    ctx.fill();

    // 7. Headlights (Front - top in top-down orientation)
    const hlGrad = ctx.createLinearGradient(0, -halfH, 0, -halfH + 10);
    hlGrad.addColorStop(0, '#ffffff');
    hlGrad.addColorStop(1, '#a0e7e5');
    ctx.fillStyle = hlGrad;

    const hlW = 8;
    const hlH = 6;
    this.drawRoundedRect(ctx, -halfW + 3, -halfH + 1, hlW, hlH, 2);
    this.drawRoundedRect(ctx, halfW - hlW - 3, -halfH + 1, hlW, hlH, 2);
    ctx.fill();

    // 8. Taillights (Rear - bottom)
    ctx.fillStyle = '#ff2233';
    const tlW = 9;
    const tlH = 4;
    this.drawRoundedRect(ctx, -halfW + 3, halfH - tlH - 1, tlW, tlH, 2);
    this.drawRoundedRect(ctx, halfW - tlW - 3, halfH - tlH - 1, tlW, tlH, 2);
    ctx.fill();

    // 9. Rear Spoiler for sports/player cars
    if (isPlayer || carType === 'sports') {
      ctx.fillStyle = '#111418';
      ctx.fillRect(-halfW + 4, halfH - 4, w - 8, 4);
      // Wing endplates
      ctx.fillStyle = accentColor;
      ctx.fillRect(-halfW + 2, halfH - 7, 3, 7);
      ctx.fillRect(halfW - 5, halfH - 7, 3, 7);
    }

    // 10. Side Mirrors
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-halfW - 3, glassY + 4, 3, 6);
    ctx.fillRect(halfW, glassY + 4, 3, 6);

    ctx.restore();
    return canvas;
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, width, height, radius) : ctx.rect(x, y, width, height);
  }

  adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
}

/* ==========================================================================
   4. UNIFIED INPUT MANAGER (Keyboard + Mobile Multi-Touch)
   ========================================================================== */
class InputManager {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      nitro: false,
      pause: false
    };

    this.touchStates = {
      left: false,
      right: false,
      gas: false,
      brake: false,
      nitro: false
    };

    this.onPausePressed = null;
    this.initKeyboard();
    this.initTouchControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.handleKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKey(e.code, false);
    });
  }

  handleKey(code, isDown) {
    switch (code) {
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = isDown;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = isDown;
        break;
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = isDown;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = isDown;
        break;
      case 'Space':
        this.keys.nitro = isDown;
        break;
      case 'KeyP':
      case 'Escape':
        if (isDown && this.onPausePressed) this.onPausePressed();
        break;
    }
  }

  initTouchControls() {
    const bindBtn = (id, prop) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const setActive = (active) => {
        this.touchStates[prop] = active;
        btn.classList.toggle('active', active);
      };

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        setActive(true);
      });

      btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        setActive(false);
      });

      btn.addEventListener('pointercancel', () => setActive(false));
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    };

    bindBtn('touch-left', 'left');
    bindBtn('touch-right', 'right');
    bindBtn('touch-gas', 'gas');
    bindBtn('touch-brake', 'brake');
    bindBtn('touch-nitro', 'nitro');
  }

  isSteeringLeft() {
    return this.keys.left || this.touchStates.left;
  }

  isSteeringRight() {
    return this.keys.right || this.touchStates.right;
  }

  isAccelerating() {
    return this.keys.up || this.touchStates.gas;
  }

  isBraking() {
    return this.keys.down || this.touchStates.brake;
  }

  isNitro() {
    return this.keys.nitro || this.touchStates.nitro;
  }

  reset() {
    for (let k in this.keys) this.keys[k] = false;
    for (let t in this.touchStates) this.touchStates[t] = false;
  }
}

/* ==========================================================================
   5. PLAYER VEHICLE & PHYSICS
   ========================================================================== */
class Player {
  constructor(configCar) {
    this.config = configCar;
    this.reset();
  }

  reset(configCar = this.config) {
    this.config = configCar;
    this.width = 44;
    this.length = 86;
    this.x = 0;              // Road center offset in virtual coordinates
    this.y = 0;              // Virtual highway progress
    this.speed = 0;          // km/h
    this.lateralVelocity = 0;
    this.steerAngle = 0;     // radians for tilt visual effect
    this.health = CONFIG.PHYSICS.HEALTH_MAX;
    this.nitro = 50;         // starts with half tank
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.isBrakingVisual = false;
    this.isNitroActive = false;
  }

  update(dt, input, roadLeftLimit, roadRightLimit) {
    // 1. Invulnerability timer countdown
    if (this.isInvulnerable) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // 2. Nitro Handling
    const wantsNitro = input.isNitro();
    const canNitro = this.nitro > 5 && this.speed > 80;
    this.isNitroActive = wantsNitro && canNitro;

    if (this.isNitroActive) {
      this.nitro = Math.max(0, this.nitro - this.config.nitroDrain * dt);
      if (this.nitro <= 0) this.isNitroActive = false;
    } else {
      // Passive recharge
      this.nitro = Math.min(this.config.nitroCapacity, this.nitro + this.config.nitroRecharge * dt);
    }

    // 3. Longitudinal Acceleration & Speed
    const currentTopSpeed = this.isNitroActive ? this.config.boostTopSpeed : this.config.topSpeed;
    const accelRate = this.isNitroActive ? this.config.accel * 1.6 : this.config.accel;

    if (input.isAccelerating() || this.isNitroActive) {
      this.speed += accelRate * dt;
      if (this.speed > currentTopSpeed) {
        this.speed = Math.max(currentTopSpeed, this.speed - CONFIG.PHYSICS.COAST_DECEL * dt);
      }
      this.isBrakingVisual = false;
    } else if (input.isBraking()) {
      this.speed = Math.max(0, this.speed - this.config.brake * dt);
      this.isBrakingVisual = true;
    } else {
      // Coasting deceleration
      this.speed = Math.max(0, this.speed - CONFIG.PHYSICS.COAST_DECEL * dt);
      this.isBrakingVisual = false;
    }

    // 4. Lateral Steering with Inertia & Speed Scaling
    let steerDir = 0;
    if (input.isSteeringLeft()) steerDir -= 1;
    if (input.isSteeringRight()) steerDir += 1;

    // Steering effectiveness scales with speed (zero turn when stopped)
    const speedFactor = Math.min(1.0, this.speed / 60);
    const targetLateralVelocity = steerDir * this.config.handling * speedFactor;

    this.lateralVelocity += (targetLateralVelocity - this.lateralVelocity) * (1 - Math.exp(-20 * dt));
    this.x += this.lateralVelocity * dt;

    // Constrain to road boundaries (shoulders included)
    const minX = roadLeftLimit + this.width / 2;
    const maxX = roadRightLimit - this.width / 2;
    if (this.x < minX) {
      this.x = minX;
      this.lateralVelocity = 0;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.lateralVelocity = 0;
    }

    // Car chassis tilt angle for dynamic visual feel
    const targetAngle = (this.lateralVelocity / this.config.handling) * 0.12;
    this.steerAngle += (targetAngle - this.steerAngle) * (1 - Math.exp(-15 * dt));

    // Forward road progression (converted from km/h to virtual pixels)
    // 100 km/h = 320 pixels/sec (delivers high speed feel while giving comfortable reaction time)
    const forwardPixelsPerSec = (this.speed / 100) * 320;
    this.y += forwardPixelsPerSec * dt;
  }

  takeDamage(amount) {
    if (this.isInvulnerable) return false;
    this.health = Math.max(0, this.health - amount);
    this.speed *= CONFIG.PHYSICS.COLLISION_SPEED_LOSS;
    this.isInvulnerable = true;
    this.invulnerableTimer = CONFIG.PHYSICS.INVULNERABILITY_TIME;
    return true;
  }

  addNitro(amount) {
    this.nitro = Math.min(this.config.nitroCapacity, this.nitro + amount);
  }

  getHitbox() {
    // Inset hitbox for forgiving arcade feel
    return {
      x: this.x - (this.width * 0.8) / 2,
      y: this.y - (this.length * 0.8) / 2,
      width: this.width * 0.8,
      height: this.length * 0.8
    };
  }
}

/* ==========================================================================
   6. TRAFFIC SYSTEM & PROCEDURAL VEHICLE SPAWNER
   ========================================================================== */
class TrafficManager {
  constructor(assetGen) {
    this.assetGen = assetGen;
    this.vehicles = [];
    this.spawnTimer = 0;
    this.overtakeCount = 0;
  }

  reset() {
    this.vehicles = [];
    this.spawnTimer = 0;
    this.overtakeCount = 0;
  }

  update(dt, player, roadConfig, difficultyFactor) {
    // 1. Update existing traffic vehicles
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];

      // Forward travel
      const vPixelsPerSec = (v.speed / 100) * 320;
      v.y += vPixelsPerSec * dt;

      // Overtake detection (player passed vehicle)
      if (!v.isOvertaken && player.y > v.y + v.length / 2) {
        v.isOvertaken = true;
        this.overtakeCount++;
        if (this.onOvertake) this.onOvertake(v);
      }

      // Despawn if far behind or way too far ahead
      const distBehind = player.y - v.y;
      if (distBehind > 500 || distBehind < -2800) {
        this.vehicles.splice(i, 1);
      }
    }

    // 2. Spawn logic with anti-blockade guarantee
    this.spawnTimer -= dt;
    const baseSpawnInterval = Math.max(0.75, 1.9 - difficultyFactor * 0.7);

    if (this.spawnTimer <= 0) {
      this.spawnTimer = baseSpawnInterval + (Math.random() * 0.4 - 0.2);
      this.trySpawnVehicle(player, roadConfig, difficultyFactor);
    }
  }

  trySpawnVehicle(player, roadConfig, difficultyFactor) {
    // Choose random lane (0 to 3)
    const laneCount = roadConfig.LANES;
    const laneWidth = roadConfig.LANE_WIDTH;
    const roadStartLeft = -(laneCount * laneWidth) / 2;

    // Pick traffic type based on weighted probabilities
    const typeObj = this.pickTrafficType();
    const colorIdx = Math.floor(Math.random() * typeObj.colors.length);
    const spriteKey = `${typeObj.type}_${colorIdx}`;

    // Available lanes check to prevent unwinnable walls
    const candidateLanes = [];
    for (let lane = 0; lane < laneCount; lane++) {
      const laneCenterX = roadStartLeft + lane * laneWidth + laneWidth / 2;
      // Check if any car is within safe spawn window in this lane
      const isBlocked = this.vehicles.some(v => {
        return Math.abs(v.laneX - laneCenterX) < 10 && (v.y - player.y) > 1000 && (v.y - player.y) < 1800;
      });
      if (!isBlocked) candidateLanes.push(lane);
    }

    // Anti-blockade rule: ensure at least one open gap
    if (candidateLanes.length === 0) return;

    const chosenLane = candidateLanes[Math.floor(Math.random() * candidateLanes.length)];
    const laneCenterX = roadStartLeft + chosenLane * laneWidth + laneWidth / 2;

    // Speed varies by lane: outer lanes slower, inner lanes faster
    const laneSpeedBonus = (chosenLane === 1 || chosenLane === 2) ? 12 : -8;
    const baseSpeed = typeObj.minSpeed + Math.random() * (typeObj.maxSpeed - typeObj.minSpeed);
    const speed = Math.min(150, Math.max(70, baseSpeed + laneSpeedBonus + difficultyFactor * 10));

    // Spawn 1400 - 2000 pixels ahead so the car appears naturally on the horizon
    const spawnY = player.y + 1400 + Math.random() * 500;

    this.vehicles.push({
      type: typeObj.type,
      width: typeObj.width,
      length: typeObj.length,
      x: laneCenterX,
      laneX: laneCenterX,
      y: spawnY,
      speed: speed,
      spriteKey: spriteKey,
      isOvertaken: false,
      hasNearMissed: false
    });
  }

  pickTrafficType() {
    const totalWeight = CONFIG.TRAFFIC_TYPES.reduce((sum, t) => sum + t.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const t of CONFIG.TRAFFIC_TYPES) {
      if (rand < t.weight) return t;
      rand -= t.weight;
    }
    return CONFIG.TRAFFIC_TYPES[0];
  }
}

/* ==========================================================================
   7. COLLISION & IMPACT SYSTEM
   ========================================================================== */
class CollisionManager {
  constructor() {
    this.screenShakeMagnitude = 0;
  }

  update(dt) {
    if (this.screenShakeMagnitude > 0) {
      this.screenShakeMagnitude = Math.max(0, this.screenShakeMagnitude - dt * 25);
    }
  }

  triggerShake(magnitude = 12) {
    this.screenShakeMagnitude = Math.max(this.screenShakeMagnitude, magnitude);
  }

  getShakeOffset() {
    if (this.screenShakeMagnitude <= 0) return { x: 0, y: 0 };
    const x = (Math.random() * 2 - 1) * this.screenShakeMagnitude;
    const y = (Math.random() * 2 - 1) * this.screenShakeMagnitude;
    return { x, y };
  }

  checkCollision(player, trafficList, onCrash) {
    const pHitbox = player.getHitbox();

    for (const v of trafficList) {
      const vHitbox = {
        x: v.x - (v.width * 0.8) / 2,
        y: v.y - (v.length * 0.8) / 2,
        width: v.width * 0.8,
        height: v.length * 0.8
      };

      if (this.rectsIntersect(pHitbox, vHitbox)) {
        // Collision resolved
        const hitConfirmed = player.takeDamage(CONFIG.PHYSICS.DAMAGE_PER_HIT);
        if (hitConfirmed) {
          this.triggerShake(18);
          // Push traffic car slightly forward/away
          v.speed = Math.max(v.speed, player.speed * 0.85);
          if (onCrash) onCrash(player, v);
          return true;
        }
      }
    }
    return false;
  }

  rectsIntersect(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }
}

/* ==========================================================================
   8. NEAR MISS & COMBO SYSTEM
   ========================================================================== */
class NearMissManager {
  constructor() {
    this.combo = 1;
    this.comboTimer = 0;
    this.totalNearMisses = 0;
    this.bestCombo = 1;
    this.onNearMiss = null;
  }

  reset() {
    this.combo = 1;
    this.comboTimer = 0;
    this.totalNearMisses = 0;
    this.bestCombo = 1;
  }

  update(dt, player, trafficList) {
    // 1. Combo decay countdown
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Minimum speed required for near miss is 70 km/h
    if (player.speed < 70) return;

    // 2. Check each traffic car proximity corridor
    for (const v of trafficList) {
      if (v.hasNearMissed) continue;

      // Must be moving faster than the traffic car
      if (player.speed <= v.speed + 15) continue;

      // Calculate distance between centers
      const dx = Math.abs(player.x - v.x);
      const dy = Math.abs(player.y - v.y);

      const requiredX = (player.width + v.width) / 2 + CONFIG.SCORING.NEAR_MISS_DIST_X;
      const minClearanceX = (player.width + v.width) / 2 - 2; // don't trigger if collided

      // Tight proximity condition
      if (dx < requiredX && dx > minClearanceX && dy < (player.length + v.length) / 2 + 10) {
        v.hasNearMissed = true;
        this.registerNearMiss(player);
      }
    }
  }

  registerNearMiss(player) {
    this.combo = Math.min(10, this.combo + 1);
    this.comboTimer = CONFIG.SCORING.COMBO_TIMEOUT;
    this.totalNearMisses++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;

    // Award bonus nitro
    player.addNitro(14);

    if (this.onNearMiss) {
      const pts = CONFIG.SCORING.NEAR_MISS_POINTS * this.combo;
      this.onNearMiss(pts, this.combo);
    }
  }

  getComboProgress() {
    return Math.max(0, this.comboTimer / CONFIG.SCORING.COMBO_TIMEOUT);
  }
}

/* ==========================================================================
   9. MISSION SYSTEM (Data-driven objectives)
   ========================================================================== */
class MissionManager {
  constructor(storageData) {
    this.allMissions = [
      { id: 'dist_1', title: 'Highway Rookie', desc: 'Drive 2.0 km in a single race', target: 2.0, type: 'distance', current: 0 },
      { id: 'speed_1', title: 'Speed Demon', desc: 'Reach 200 km/h on the highway', target: 200, type: 'speed', current: 0 },
      { id: 'nearmiss_1', title: 'Close Shave', desc: 'Perform 6 near misses', target: 6, type: 'nearmiss', current: 0 },
      { id: 'overtake_1', title: 'Traffic Weaver', desc: 'Overtake 25 vehicles', target: 25, type: 'overtake', current: 0 },
      { id: 'combo_1', title: 'Combo Master', desc: 'Achieve a x4 Combo streak', target: 4, type: 'combo', current: 0 },
      { id: 'dist_2', title: 'Endurance Legend', desc: 'Drive 6.0 km without wrecking', target: 6.0, type: 'distance', current: 0 }
    ];

    this.completedIds = new Set(storageData.completedMissions || []);
    this.onMissionComplete = null;
  }

  resetRun() {
    this.allMissions.forEach(m => {
      if (!this.completedIds.has(m.id)) {
        m.current = 0;
      }
    });
  }

  update(distanceKm, speed, nearMisses, overtakes, combo) {
    this.allMissions.forEach(m => {
      if (this.completedIds.has(m.id)) return;

      if (m.type === 'distance') m.current = distanceKm;
      if (m.type === 'speed') m.current = Math.max(m.current, speed);
      if (m.type === 'nearmiss') m.current = nearMisses;
      if (m.type === 'overtake') m.current = overtakes;
      if (m.type === 'combo') m.current = Math.max(m.current, combo);

      if (m.current >= m.target) {
        this.completedIds.add(m.id);
        if (this.onMissionComplete) {
          this.onMissionComplete(m);
        }
      }
    });
  }

  getActiveMission() {
    return this.allMissions.find(m => !this.completedIds.has(m.id)) || null;
  }

  getCompletedCount() {
    return this.completedIds.size;
  }
}

/* ==========================================================================
   10. DAY / NIGHT & ENVIRONMENT MANAGER
   ========================================================================== */
class EnvironmentManager {
  constructor() {
    this.timeOfDay = 0; // 0 to 1 (0 = Noon, 0.35 = Sunset, 0.65 = Midnight, 0.9 = Dawn)
  }

  update(dt) {
    this.timeOfDay = (this.timeOfDay + dt / CONFIG.DAY_NIGHT.CYCLE_DURATION) % 1;
  }

  getLightingState() {
    // Calculate sky and road illumination
    // Noon: bright, warm white
    // Sunset: golden amber / deep purple
    // Night: deep navy / charcoal
    let ambientDarkness = 0;
    let skyColor1 = '#4a90e2';
    let skyColor2 = '#90caf9';
    let isNight = false;
    let streetlightsOn = false;

    if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.45) {
      // Sunset transition
      const t = (this.timeOfDay - 0.25) / 0.2;
      ambientDarkness = t * 0.45;
      skyColor1 = '#c94b4b';
      skyColor2 = '#4b134f';
      streetlightsOn = t > 0.5;
    } else if (this.timeOfDay >= 0.45 && this.timeOfDay < 0.8) {
      // Full Night
      ambientDarkness = 0.72;
      skyColor1 = '#060a12';
      skyColor2 = '#101726';
      isNight = true;
      streetlightsOn = true;
    } else if (this.timeOfDay >= 0.8 && this.timeOfDay < 0.95) {
      // Dawn
      const t = 1 - (this.timeOfDay - 0.8) / 0.15;
      ambientDarkness = t * 0.45;
      skyColor1 = '#f3904f';
      skyColor2 = '#3b4371';
      streetlightsOn = t > 0.4;
    }

    return {
      ambientDarkness,
      skyColor1,
      skyColor2,
      isNight,
      streetlightsOn
    };
  }
}

/* ==========================================================================
   11. CANVAS RENDERER & VISUAL EFFECTS PIPELINE
   ========================================================================== */
class Renderer {
  constructor(canvas, assetGen) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assetGen = assetGen;
    this.particles = [];
    this.feedNotifications = [];
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // Virtual world scaling
    const roadTotalWidth = CONFIG.ROAD.LANES * CONFIG.ROAD.LANE_WIDTH + CONFIG.ROAD.SHOULDER_WIDTH * 2;
    
    if (this.width <= 480) {
      // Mobile portrait: scale road so it leaves comfortable room on both sides
      this.scale = Math.min(0.78, (this.width * 0.74) / roadTotalWidth);
    } else if (this.width <= 768) {
      // Mobile landscape / phablet
      this.scale = Math.min(0.9, (this.width * 0.8) / roadTotalWidth);
    } else {
      // Desktop / Tablet
      this.scale = Math.min(1.2, (this.height * 0.82) / 650);
    }
  }

  addParticle(x, y, vx, vy, color, size, life, decay) {
    if (this.particles.length > 120) return; // bounded particles for mobile performance
    this.particles.push({ x, y, vx, vy, color, size, life, maxLife: life, decay });
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnNitroFlames(player) {
    const padY = player.y - player.length / 2 - 4;
    for (let i = 0; i < 2; i++) {
      const offsetX = (i === 0 ? -12 : 12);
      this.addParticle(
        player.x + offsetX + (Math.random() * 4 - 2),
        padY,
        (Math.random() * 2 - 1) * 20,
        -player.speed * 4 - 80,
        Math.random() > 0.3 ? '#00f0ff' : '#9d4edd',
        Math.random() * 5 + 3,
        0.35,
        1.0
      );
    }
  }

  spawnCollisionSparks(x, y) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 320 + 80;
      this.addParticle(
        x,
        y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        Math.random() > 0.3 ? '#ffb700' : '#ff2a55',
        Math.random() * 4 + 2,
        0.45,
        1.2
      );
    }
  }

  render(player, trafficManager, envManager, collisionManager, settings) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Apply Screen Shake if enabled
    const shake = settings.screenShake ? collisionManager.getShakeOffset() : { x: 0, y: 0 };
    ctx.save();
    ctx.translate(shake.x, shake.y);

    const lighting = envManager.getLightingState();

    // 1. Roadside Terrain & Background
    this.renderTerrain(ctx, w, h, lighting);

    // 2. Center Game Camera on Player
    ctx.save();
    // Anchor camera according to screen height
    const isMobile = this.width <= 768;
    const cameraY = isMobile ? h * 0.74 : h * 0.82;
    ctx.translate(w / 2, cameraY);
    ctx.scale(this.scale, this.scale);
    // Camera moves with player.y (so highway scrolls downward)
    ctx.translate(0, player.y);

    // 3. Render Highway (Asphalt, Lanes, Curbs, Guardrails, Streetlights)
    this.renderHighway(ctx, player.y, lighting);

    // 4. Render Headlight Beams (Cast on the road ahead at night/sunset)
    if (lighting.ambientDarkness > 0.2) {
      this.renderHeadlightBeams(ctx, player, trafficManager.vehicles);
    }

    // 5. Render Traffic Vehicles
    this.renderTraffic(ctx, trafficManager.vehicles, player.y);

    // 6. Render Particles (Nitro flames, sparks)
    this.renderParticles(ctx);

    // 7. Render Player Vehicle
    this.renderPlayer(ctx, player);

    // 8. Render Streetlight Light Pools on Road
    if (lighting.streetlightsOn) {
      this.renderStreetlightPools(ctx, player.y);
    }

    ctx.restore();

    // 9. Day/Sunset/Night Ambient Overlay
    if (lighting.ambientDarkness > 0.05) {
      ctx.fillStyle = `rgba(5, 8, 16, ${lighting.ambientDarkness})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  renderTerrain(ctx, w, h, lighting) {
    // Dynamic Horizon / Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, lighting.skyColor1);
    skyGrad.addColorStop(1, lighting.skyColor2);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Distant Highway Mountains & Horizon Silhouettes
    ctx.fillStyle = lighting.ambientDarkness > 0.4 ? '#09101c' : '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.4);
    for (let x = 0; x <= w; x += 60) {
      const my = h * 0.38 + Math.sin(x * 0.015) * 20;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }

  renderHighway(ctx, playerY, lighting) {
    const lanes = CONFIG.ROAD.LANES;
    const laneW = CONFIG.ROAD.LANE_WIDTH;
    const shoulderW = CONFIG.ROAD.SHOULDER_WIDTH;
    const totalW = lanes * laneW + shoulderW * 2;
    const halfW = totalW / 2;

    const topY = -playerY - 2600;
    const bottomY = -playerY + 700;
    const segH = bottomY - topY;

    // Grass / Verge on sides
    ctx.fillStyle = lighting.ambientDarkness > 0.4 ? '#0d1810' : '#223824';
    ctx.fillRect(-halfW - 200, topY, 200, segH);
    ctx.fillRect(halfW, topY, 200, segH);

    // Outer Guardrails
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-halfW - 4, topY, 4, segH);
    ctx.fillRect(halfW, topY, 4, segH);

    // Asphalt Main Surface
    ctx.fillStyle = lighting.ambientDarkness > 0.4 ? '#12141a' : '#21252d';
    ctx.fillRect(-halfW, topY, totalW, segH);

    // Road Shoulders (Darker rumble zones)
    ctx.fillStyle = lighting.ambientDarkness > 0.4 ? '#181b22' : '#2b303b';
    ctx.fillRect(-halfW, topY, shoulderW, segH);
    ctx.fillRect(halfW - shoulderW, topY, shoulderW, segH);

    // Red & White Striped Rumble Strips
    const rumbleStep = 32;
    const startRumbleY = Math.floor(topY / rumbleStep) * rumbleStep;
    for (let y = startRumbleY; y < bottomY; y += rumbleStep) {
      const isRed = Math.abs(Math.floor(y / rumbleStep)) % 2 === 0;
      ctx.fillStyle = isRed ? '#e53e3e' : '#f7fafc';
      ctx.fillRect(-halfW + shoulderW - CONFIG.ROAD.RUMBLE_WIDTH, y, CONFIG.ROAD.RUMBLE_WIDTH, rumbleStep);
      ctx.fillRect(halfW - shoulderW, y, CONFIG.ROAD.RUMBLE_WIDTH, rumbleStep);
    }

    // Lane Dividers (Dashed White Markings)
    const stripeLen = CONFIG.ROAD.STRIPE_LENGTH;
    const segLen = CONFIG.ROAD.SEGMENT_LENGTH;
    const startStripeY = Math.floor(topY / segLen) * segLen;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let lane = 1; lane < lanes; lane++) {
      const laneX = -halfW + shoulderW + lane * laneW;
      for (let y = startStripeY; y < bottomY; y += segLen) {
        ctx.fillRect(laneX - CONFIG.ROAD.STRIPE_WIDTH / 2, y, CONFIG.ROAD.STRIPE_WIDTH, stripeLen);
      }
    }

    // Highway Streetlight Poles
    const poleSpacing = 280;
    const startPoleY = Math.floor(topY / poleSpacing) * poleSpacing;
    ctx.fillStyle = '#475569';
    for (let y = startPoleY; y < bottomY; y += poleSpacing) {
      // Left and right light poles
      ctx.fillRect(-halfW - 12, y, 6, 6);
      ctx.fillRect(halfW + 6, y, 6, 6);
    }
  }

  renderHeadlightBeams(ctx, player, traffic) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Player Headlights
    const pBeamLen = 360;
    const pGrad = ctx.createRadialGradient(player.x, -player.y - 40, 20, player.x, -player.y - pBeamLen, pBeamLen);
    pGrad.addColorStop(0, 'rgba(230, 245, 255, 0.75)');
    pGrad.addColorStop(0.6, 'rgba(180, 220, 255, 0.3)');
    pGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');

    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(player.x - 20, -player.y);
    ctx.lineTo(player.x - 110, -player.y - pBeamLen);
    ctx.lineTo(player.x + 110, -player.y - pBeamLen);
    ctx.lineTo(player.x + 20, -player.y);
    ctx.fill();

    // Traffic Headlights (Forward facing)
    for (const v of traffic) {
      const tGrad = ctx.createRadialGradient(v.x, -v.y - 30, 10, v.x, -v.y - 220, 220);
      tGrad.addColorStop(0, 'rgba(255, 250, 230, 0.55)');
      tGrad.addColorStop(1, 'rgba(255, 220, 150, 0)');
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.moveTo(v.x - 15, -v.y);
      ctx.lineTo(v.x - 70, -v.y - 220);
      ctx.lineTo(v.x + 70, -v.y - 220);
      ctx.lineTo(v.x + 15, -v.y);
      ctx.fill();
    }

    ctx.restore();
  }

  renderStreetlightPools(ctx, playerY) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const poleSpacing = 280;
    const topY = -playerY - 1400;
    const bottomY = -playerY + 800;
    const startPoleY = Math.floor(topY / poleSpacing) * poleSpacing;

    const lanes = CONFIG.ROAD.LANES;
    const totalW = lanes * CONFIG.ROAD.LANE_WIDTH + CONFIG.ROAD.SHOULDER_WIDTH * 2;
    const halfW = totalW / 2;

    for (let y = startPoleY; y < bottomY; y += poleSpacing) {
      const radGrad = ctx.createRadialGradient(0, y, 20, 0, y, halfW);
      radGrad.addColorStop(0, 'rgba(255, 220, 150, 0.22)');
      radGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, y, halfW, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderTraffic(ctx, traffic, playerY) {
    for (const v of traffic) {
      const sprite = this.assetGen.getSprite(v.spriteKey);
      if (!sprite) continue;

      ctx.save();
      // Canvas coordinate conversion: virtual y increases forward, so canvas y = -v.y
      ctx.translate(v.x, -v.y);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);

      // High-visibility glowing taillights so traffic cars are instantly spotted from far away
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = '#ff1a2b';
      ctx.shadowColor = '#ff2233';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-v.width / 2 + 5, v.length / 2 - 2, 4.5, 0, Math.PI * 2);
      ctx.arc(v.width / 2 - 5, v.length / 2 - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }
  }

  renderPlayer(ctx, player) {
    const sprite = this.assetGen.getSprite(player.config.id);
    if (!sprite) return;

    ctx.save();
    ctx.translate(player.x, -player.y);
    ctx.rotate(player.steerAngle);

    // Flicker when invulnerable
    if (player.isInvulnerable) {
      const blink = Math.floor(player.invulnerableTimer * 16) % 2 === 0;
      if (blink) ctx.globalAlpha = 0.35;
    }

    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);

    // Dynamic Braking Taillight Bloom
    if (player.isBrakingVisual) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255, 30, 40, 0.8)';
      ctx.shadowColor = '#ff1122';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(-player.width / 2 + 6, player.length / 2 - 2, 7, 0, Math.PI * 2);
      ctx.arc(player.width / 2 - 6, player.length / 2 - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, -p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/* ==========================================================================
   12. USER INTERFACE & STATE MANAGER
   ========================================================================== */
class UIManager {
  constructor(game) {
    this.game = game;
    this.selectedGarageIndex = 0;
    this.initDOMElements();
    this.bindEvents();
  }

  initDOMElements() {
    // Screens
    this.screenMenu = document.getElementById('screen-menu');
    this.screenGarage = document.getElementById('screen-garage');
    this.screenPause = document.getElementById('screen-pause');
    this.screenGameOver = document.getElementById('screen-gameover');
    this.gameHud = document.getElementById('game-hud');

    // Modals
    this.modalMissions = document.getElementById('modal-missions');
    this.modalHighScores = document.getElementById('modal-highscores');
    this.modalSettings = document.getElementById('modal-settings');

    // Overlays
    this.damageVignette = document.getElementById('damage-vignette');
    this.speedWarpOverlay = document.getElementById('speed-warp-overlay');

    // HUD Elements
    this.hudDistance = document.getElementById('hud-distance');
    this.hudScore = document.getElementById('hud-score');
    this.hudSpeedVal = document.getElementById('hud-speed-val');
    this.hudSpeedArc = document.getElementById('hud-speed-arc');
    this.hudHealthNum = document.getElementById('hud-health-num');
    this.hudHealthFill = document.getElementById('hud-health-fill');
    this.hudNitroFill = document.getElementById('hud-nitro-fill');
    this.hudNitroNum = document.getElementById('hud-nitro-num');
    this.hudComboContainer = document.getElementById('hud-combo-container');
    this.hudComboMultiplier = document.getElementById('hud-combo-multiplier');
    this.hudComboTimerFill = document.getElementById('hud-combo-timer-fill');
    this.hudMissionChip = document.getElementById('hud-mission-chip');
    this.hudMissionText = document.getElementById('hud-mission-text');
    this.hudMissionFill = document.getElementById('hud-mission-fill');
    this.hudFeed = document.getElementById('hud-feed');

    // Garage Elements
    this.garageCanvas = document.getElementById('garage-car-canvas');
    this.garageCtx = this.garageCanvas ? this.garageCanvas.getContext('2d') : null;
    this.garageCarName = document.getElementById('garage-car-name');
    this.garageCarClass = document.getElementById('garage-car-class');
    this.garageCarDesc = document.getElementById('garage-car-desc');
    this.statSpeedBar = document.getElementById('stat-speed-bar');
    this.statSpeedVal = document.getElementById('stat-speed-val');
    this.statAccelBar = document.getElementById('stat-accel-bar');
    this.statAccelVal = document.getElementById('stat-accel-val');
    this.statHandlingBar = document.getElementById('stat-handling-bar');
    this.statHandlingVal = document.getElementById('stat-handling-val');
    this.statBrakeBar = document.getElementById('stat-brake-bar');
    this.statBrakeVal = document.getElementById('stat-brake-val');
    this.statNitroBar = document.getElementById('stat-nitro-bar');
    this.statNitroVal = document.getElementById('stat-nitro-val');
    this.btnSelectCar = document.getElementById('btn-select-car');

    // Menu preview canvas
    this.menuCanvas = document.getElementById('menu-car-canvas');
    this.menuCtx = this.menuCanvas ? this.menuCanvas.getContext('2d') : null;
    this.menuCarName = document.getElementById('menu-selected-car-name');
  }

  bindEvents() {
    // Menu Buttons
    document.getElementById('btn-play').addEventListener('click', () => this.game.startRace());
    document.getElementById('btn-garage').addEventListener('click', () => this.showGarage());
    document.getElementById('btn-missions').addEventListener('click', () => this.showMissionsModal());
    document.getElementById('btn-highscores').addEventListener('click', () => this.showHighScoresModal());
    document.getElementById('btn-settings').addEventListener('click', () => this.showSettingsModal());

    // Quick Car Switching Directly on Main Menu
    const btnMenuPrev = document.getElementById('btn-menu-prev-car');
    if (btnMenuPrev) btnMenuPrev.addEventListener('click', () => this.cycleMenuCar(-1));
    const btnMenuNext = document.getElementById('btn-menu-next-car');
    if (btnMenuNext) btnMenuNext.addEventListener('click', () => this.cycleMenuCar(1));
    const menuCarClickable = document.getElementById('menu-car-clickable');
    if (menuCarClickable) menuCarClickable.addEventListener('click', () => this.showGarage());

    // Garage Buttons
    document.getElementById('btn-garage-prev').addEventListener('click', () => this.cycleGarageCar(-1));
    document.getElementById('btn-garage-next').addEventListener('click', () => this.cycleGarageCar(1));
    this.btnSelectCar.addEventListener('click', () => this.selectCurrentGarageCar());
    document.getElementById('btn-garage-back').addEventListener('click', () => this.showMainMenu());

    // Direct Race Now from Garage
    const btnGarageRaceNow = document.getElementById('btn-garage-race-now');
    if (btnGarageRaceNow) {
      btnGarageRaceNow.addEventListener('click', () => {
        this.selectCurrentGarageCar();
        this.game.startRace();
      });
    }

    // Modal Close Buttons
    document.getElementById('btn-close-missions').addEventListener('click', () => this.hideModal(this.modalMissions));
    document.getElementById('btn-missions-done').addEventListener('click', () => this.hideModal(this.modalMissions));
    document.getElementById('btn-close-highscores').addEventListener('click', () => this.hideModal(this.modalHighScores));
    document.getElementById('btn-highscores-done').addEventListener('click', () => this.hideModal(this.modalHighScores));
    document.getElementById('btn-close-settings').addEventListener('click', () => this.hideModal(this.modalSettings));
    document.getElementById('btn-settings-done').addEventListener('click', () => this.hideModal(this.modalSettings));

    // Settings Inputs
    const shakeToggle = document.getElementById('setting-screen-shake');
    shakeToggle.addEventListener('change', (e) => {
      this.game.storage.screenShake = e.target.checked;
      StorageManager.save(this.game.storage);
    });

    const opacitySlider = document.getElementById('setting-touch-opacity');
    opacitySlider.addEventListener('input', (e) => {
      const val = e.target.value;
      this.game.storage.touchOpacity = val;
      this.applyTouchOpacity(val);
      StorageManager.save(this.game.storage);
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all high scores and mission records?')) {
        StorageManager.clear();
        this.game.storage = StorageManager.load();
        this.hideModal(this.modalSettings);
        alert('Career data has been reset.');
        this.updateMenuCarPreview();
      }
    });

    // In-Game Pause
    document.getElementById('btn-pause').addEventListener('click', () => this.game.pauseGame());
    document.getElementById('btn-pause-resume').addEventListener('click', () => this.game.resumeGame());
    document.getElementById('btn-pause-restart').addEventListener('click', () => this.game.startRace());
    document.getElementById('btn-pause-menu').addEventListener('click', () => this.showMainMenu());

    // Game Over Buttons
    document.getElementById('btn-go-restart').addEventListener('click', () => this.game.startRace());
    document.getElementById('btn-go-garage').addEventListener('click', () => this.showGarage());
    document.getElementById('btn-go-menu').addEventListener('click', () => this.showMainMenu());
  }

  applyTouchOpacity(opacityVal) {
    const controls = document.getElementById('mobile-touch-controls');
    if (controls) {
      controls.style.opacity = (opacityVal / 100).toString();
    }
  }

  showMainMenu() {
    this.game.state = 'MENU';
    this.hideAllScreens();
    this.screenMenu.classList.remove('screen-hidden');
    this.screenMenu.classList.add('screen-visible');
    this.updateMenuCarPreview();
  }

  showGarage() {
    this.game.state = 'GARAGE';
    this.hideAllScreens();
    this.screenGarage.classList.remove('screen-hidden');
    this.screenGarage.classList.add('screen-visible');

    // Sync selected car index
    const carIdx = CONFIG.CARS.findIndex(c => c.id === this.game.storage.selectedCarId);
    this.selectedGarageIndex = carIdx >= 0 ? carIdx : 0;
    this.updateGarageView();
  }

  cycleGarageCar(delta) {
    this.selectedGarageIndex = (this.selectedGarageIndex + delta + CONFIG.CARS.length) % CONFIG.CARS.length;
    this.updateGarageView();
  }

  cycleMenuCar(delta) {
    const curIdx = CONFIG.CARS.findIndex(c => c.id === this.game.storage.selectedCarId);
    const nextIdx = (curIdx + delta + CONFIG.CARS.length) % CONFIG.CARS.length;
    this.game.storage.selectedCarId = CONFIG.CARS[nextIdx].id;
    StorageManager.save(this.game.storage);
    this.updateMenuCarPreview();
  }

  updateGarageView() {
    const car = CONFIG.CARS[this.selectedGarageIndex];
    if (!car) return;

    this.garageCarName.textContent = car.name;
    this.garageCarClass.textContent = car.class;
    this.garageCarDesc.textContent = car.desc;

    // Stat bars
    this.statSpeedBar.style.width = `${car.stats.speed}%`;
    this.statSpeedVal.textContent = `${car.topSpeed} km/h`;

    this.statAccelBar.style.width = `${car.stats.accel}%`;
    this.statAccelVal.textContent = `${(car.stats.accel / 10).toFixed(1)} / 10`;

    this.statHandlingBar.style.width = `${car.stats.handling}%`;
    this.statHandlingVal.textContent = `${(car.stats.handling / 10).toFixed(1)} / 10`;

    this.statBrakeBar.style.width = `${car.stats.brake}%`;
    this.statBrakeVal.textContent = `${(car.stats.brake / 10).toFixed(1)} / 10`;

    this.statNitroBar.style.width = `${car.stats.nitro}%`;
    this.statNitroVal.textContent = `${car.stats.nitro}%`;

    // Button label
    const isSelected = this.game.storage.selectedCarId === car.id;
    this.btnSelectCar.textContent = isSelected ? 'VEHICLE SELECTED' : 'SELECT VEHICLE';
    this.btnSelectCar.classList.toggle('btn-secondary', isSelected);
    this.btnSelectCar.classList.toggle('btn-primary', !isSelected);

    // Draw car preview on garage stage
    if (this.garageCtx) {
      const sprite = this.game.assetGen.getSprite(car.id);
      this.garageCtx.clearRect(0, 0, this.garageCanvas.width, this.garageCanvas.height);
      if (sprite) {
        const cx = this.garageCanvas.width / 2;
        const cy = this.garageCanvas.height / 2;
        this.garageCtx.save();
        this.garageCtx.translate(cx, cy);
        this.garageCtx.rotate(Math.PI / 2); // Show horizontally in garage showroom
        this.garageCtx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        this.garageCtx.restore();
      }
    }
  }

  selectCurrentGarageCar() {
    const car = CONFIG.CARS[this.selectedGarageIndex];
    this.game.storage.selectedCarId = car.id;
    StorageManager.save(this.game.storage);
    this.updateGarageView();
  }

  updateMenuCarPreview() {
    const car = CONFIG.CARS.find(c => c.id === this.game.storage.selectedCarId) || CONFIG.CARS[0];
    this.menuCarName.textContent = car.name;

    if (this.menuCtx) {
      const sprite = this.game.assetGen.getSprite(car.id);
      this.menuCtx.clearRect(0, 0, this.menuCanvas.width, this.menuCanvas.height);
      if (sprite) {
        const cx = this.menuCanvas.width / 2;
        const cy = this.menuCanvas.height / 2;
        this.menuCtx.save();
        this.menuCtx.translate(cx, cy);
        this.menuCtx.rotate(Math.PI / 2);
        this.menuCtx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        this.menuCtx.restore();
      }
    }
  }

  showMissionsModal() {
    const container = document.getElementById('missions-list');
    container.innerHTML = '';

    this.game.missionManager.allMissions.forEach(m => {
      const isDone = this.game.missionManager.completedIds.has(m.id);
      const card = document.createElement('div');
      card.className = `mission-card ${isDone ? 'completed' : ''}`;

      const progressVal = Math.min(m.target, m.current || 0);
      const percent = Math.min(100, (progressVal / m.target) * 100);

      card.innerHTML = `
        <div class="mission-card-header">
          <span class="mission-card-title">${m.title}</span>
          <span class="mission-card-badge">${isDone ? '✓ COMPLETED' : 'IN PROGRESS'}</span>
        </div>
        <div class="mission-card-desc">${m.desc}</div>
        <div class="mission-progress-wrap">
          <div class="mission-progress-bar"><div class="mission-progress-fill" style="width: ${percent}%"></div></div>
          <span class="mission-progress-text">${progressVal.toFixed(1)} / ${m.target}</span>
        </div>
      `;
      container.appendChild(card);
    });

    this.modalMissions.classList.remove('modal-hidden');
  }

  showHighScoresModal() {
    const s = this.game.storage;
    document.getElementById('stat-best-score').textContent = Math.floor(s.bestScore).toLocaleString();
    document.getElementById('stat-longest-dist').textContent = `${(s.longestDistance || 0).toFixed(2)} km`;
    document.getElementById('stat-highest-speed').textContent = `${Math.floor(s.highestSpeed || 0)} km/h`;
    document.getElementById('stat-total-nearmisses').textContent = (s.totalNearMisses || 0).toLocaleString();
    document.getElementById('stat-best-combo').textContent = `x${s.bestCombo || 0}`;

    this.modalHighScores.classList.remove('modal-hidden');
  }

  showSettingsModal() {
    document.getElementById('setting-screen-shake').checked = this.game.storage.screenShake;
    document.getElementById('setting-touch-opacity').value = this.game.storage.touchOpacity;
    this.modalSettings.classList.remove('modal-hidden');
  }

  hideModal(modal) {
    if (modal) modal.classList.add('modal-hidden');
  }

  showPauseScreen(player, score, distanceKm) {
    document.getElementById('pause-speed').textContent = `${Math.floor(player.speed)} km/h`;
    document.getElementById('pause-dist').textContent = `${distanceKm.toFixed(2)} km`;
    document.getElementById('pause-score').textContent = Math.floor(score).toLocaleString();

    this.screenPause.classList.remove('screen-hidden');
    this.screenPause.classList.add('screen-visible');
  }

  hidePauseScreen() {
    this.screenPause.classList.remove('screen-visible');
    this.screenPause.classList.add('screen-hidden');
  }

  showGameOverScreen(finalScore, distanceKm, maxSpeed, nearMisses, bestCombo, isNewRecord) {
    this.hideAllScreens();
    document.getElementById('go-score').textContent = Math.floor(finalScore).toLocaleString();
    document.getElementById('go-dist').textContent = `${distanceKm.toFixed(2)} km`;
    document.getElementById('go-speed').textContent = `${Math.floor(maxSpeed)} km/h`;
    document.getElementById('go-nearmiss').textContent = nearMisses;
    document.getElementById('go-combo').textContent = `x${bestCombo}`;

    const recBanner = document.getElementById('gameover-new-record');
    recBanner.classList.toggle('record-hidden', !isNewRecord);

    this.screenGameOver.classList.remove('screen-hidden');
    this.screenGameOver.classList.add('screen-visible');
  }

  hideAllScreens() {
    this.screenMenu.classList.add('screen-hidden');
    this.screenGarage.classList.add('screen-hidden');
    this.screenPause.classList.add('screen-hidden');
    this.screenGameOver.classList.add('screen-hidden');
    this.screenMenu.classList.remove('screen-visible');
    this.screenGarage.classList.remove('screen-visible');
    this.screenPause.classList.remove('screen-visible');
    this.screenGameOver.classList.remove('screen-visible');
  }

  updateHUD(player, score, distanceKm, combo, comboProgress, activeMission) {
    this.hudDistance.textContent = `${distanceKm.toFixed(2)} km`;
    this.hudScore.textContent = Math.floor(score).toLocaleString();

    // Speedometer
    const spd = Math.floor(player.speed);
    this.hudSpeedVal.textContent = spd;
    // Update curved arc stroke dashoffset (188.5 is full perimeter)
    const arcPercent = Math.min(1.0, spd / player.config.boostTopSpeed);
    const offset = 188.5 * (1 - arcPercent);
    this.hudSpeedArc.style.strokeDashoffset = offset;

    // Health
    const healthPercent = Math.max(0, player.health);
    this.hudHealthNum.textContent = `${Math.round(healthPercent)}%`;
    this.hudHealthFill.style.width = `${healthPercent}%`;
    this.hudHealthFill.classList.toggle('warning', healthPercent <= 70 && healthPercent > 30);
    this.hudHealthFill.classList.toggle('danger', healthPercent <= 30);

    // Health Pips (3 pips)
    document.getElementById('pip-1').classList.toggle('active', healthPercent > 10);
    document.getElementById('pip-2').classList.toggle('active', healthPercent > 40);
    document.getElementById('pip-3').classList.toggle('active', healthPercent > 70);

    // Nitro
    const nitroPercent = (player.nitro / player.config.nitroCapacity) * 100;
    this.hudNitroFill.style.width = `${nitroPercent}%`;
    this.hudNitroFill.classList.toggle('boosting', player.isNitroActive);
    this.hudNitroNum.textContent = player.isNitroActive ? 'BOOST' : (player.nitro > 15 ? 'READY' : 'CHARGING');

    // Speed warp overlay & nitro styling
    this.speedWarpOverlay.classList.toggle('active', player.isNitroActive || spd > 220);

    // Combo Streak
    if (combo > 1) {
      this.hudComboContainer.classList.remove('combo-hidden');
      this.hudComboMultiplier.textContent = `x${combo}`;
      this.hudComboTimerFill.style.width = `${comboProgress * 100}%`;
    } else {
      this.hudComboContainer.classList.add('combo-hidden');
    }

    // Mission status chip
    if (activeMission) {
      this.hudMissionChip.style.display = 'flex';
      const cur = Math.min(activeMission.target, activeMission.current || 0);
      this.hudMissionText.textContent = `${activeMission.title} (${cur.toFixed(1)}/${activeMission.target})`;
      const mPercent = Math.min(100, (cur / activeMission.target) * 100);
      this.hudMissionFill.style.width = `${mPercent}%`;
    } else {
      this.hudMissionChip.style.display = 'none';
    }
  }

  showDamageFlash() {
    this.damageVignette.classList.add('flash');
    setTimeout(() => this.damageVignette.classList.remove('flash'), 250);
  }

  showFeedToast(text, type = 'nearmiss') {
    const toast = document.createElement('div');
    toast.className = `feed-toast ${type}`;
    toast.textContent = text;
    this.hudFeed.appendChild(toast);
    setTimeout(() => toast.remove(), 1200);
  }
}

/* ==========================================================================
   13. MAIN GAME CONTROLLER & TICK LOOP
   ========================================================================== */
class Game {
  constructor() {
    this.state = 'MENU'; // MENU, GARAGE, PLAYING, PAUSED, GAME_OVER
    this.canvas = document.getElementById('game-canvas');
    this.storage = StorageManager.load();

    this.assetGen = new AssetGenerator();
    this.input = new InputManager();
    this.renderer = new Renderer(this.canvas, this.assetGen);
    this.collisionManager = new CollisionManager();
    this.nearMissManager = new NearMissManager();
    this.missionManager = new MissionManager(this.storage);
    this.envManager = new EnvironmentManager();
    this.trafficManager = new TrafficManager(this.assetGen);

    const initialCar = CONFIG.CARS.find(c => c.id === this.storage.selectedCarId) || CONFIG.CARS[0];
    this.player = new Player(initialCar);

    this.ui = new UIManager(this);

    this.score = 0;
    this.distanceKm = 0;
    this.maxSpeedHit = 0;
    this.difficultyFactor = 0;
    this.lastTime = 0;

    this.initCallbacks();
    this.bindWindowEvents();
    this.ui.showMainMenu();

    // Start Animation Loop
    requestAnimationFrame((t) => this.loop(t));
  }

  initCallbacks() {
    this.input.onPausePressed = () => {
      if (this.state === 'PLAYING') this.pauseGame();
      else if (this.state === 'PAUSED') this.resumeGame();
    };

    this.nearMissManager.onNearMiss = (pts, combo) => {
      this.score += pts;
      this.ui.showFeedToast(`+${pts} NEAR MISS x${combo}!`, 'nearmiss');
    };

    this.trafficManager.onOvertake = () => {
      this.score += CONFIG.SCORING.OVERTAKE_POINTS;
    };

    this.missionManager.onMissionComplete = (m) => {
      this.storage.completedMissions = Array.from(this.missionManager.completedIds);
      StorageManager.save(this.storage);
      this.ui.showFeedToast(`MISSION COMPLETE: ${m.title}!`, 'mission');
    };
  }

  bindWindowEvents() {
    window.addEventListener('resize', () => {
      this.renderer.resize();
      if (this.state === 'GARAGE') this.ui.updateGarageView();
      if (this.state === 'MENU') this.ui.updateMenuCarPreview();
    });
  }

  startRace() {
    const selectedCar = CONFIG.CARS.find(c => c.id === this.storage.selectedCarId) || CONFIG.CARS[0];
    this.player.reset(selectedCar);
    this.trafficManager.reset();
    this.nearMissManager.reset();
    this.missionManager.resetRun();
    this.input.reset();

    this.score = 0;
    this.distanceKm = 0;
    this.maxSpeedHit = 0;
    this.difficultyFactor = 0;

    this.state = 'PLAYING';
    this.ui.hideAllScreens();
    this.ui.gameHud.classList.remove('hud-hidden');
    this.ui.applyTouchOpacity(this.storage.touchOpacity);
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.ui.showPauseScreen(this.player, this.score, this.distanceKm);
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.ui.hidePauseScreen();
  }

  gameOver() {
    this.state = 'GAME_OVER';
    this.ui.gameHud.classList.add('hud-hidden');

    // Check records
    let isNewRecord = false;
    if (this.score > this.storage.bestScore) {
      this.storage.bestScore = this.score;
      isNewRecord = true;
    }
    if (this.distanceKm > this.storage.longestDistance) {
      this.storage.longestDistance = this.distanceKm;
    }
    if (this.maxSpeedHit > this.storage.highestSpeed) {
      this.storage.highestSpeed = this.maxSpeedHit;
    }
    this.storage.totalNearMisses += this.nearMissManager.totalNearMisses;
    if (this.nearMissManager.bestCombo > this.storage.bestCombo) {
      this.storage.bestCombo = this.nearMissManager.bestCombo;
    }

    StorageManager.save(this.storage);
    this.ui.showGameOverScreen(
      this.score,
      this.distanceKm,
      this.maxSpeedHit,
      this.nearMissManager.totalNearMisses,
      this.nearMissManager.bestCombo,
      isNewRecord
    );
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Clamp dt to 0.08 (prevents physics tunneling on frame drops or inactive tab switch)
    const dt = Math.min(rawDt, 0.08);

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.renderer.render(
        this.player,
        this.trafficManager,
        this.envManager,
        this.collisionManager,
        this.storage
      );
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 1. World Road Lateral Bounds
    const roadLeftLimit = -(CONFIG.ROAD.LANES * CONFIG.ROAD.LANE_WIDTH) / 2;
    const roadRightLimit = (CONFIG.ROAD.LANES * CONFIG.ROAD.LANE_WIDTH) / 2;

    // 2. Update Player Physics
    this.player.update(dt, this.input, roadLeftLimit, roadRightLimit);

    if (this.player.speed > this.maxSpeedHit) {
      this.maxSpeedHit = this.player.speed;
    }

    // 3. Distance & Scoring Progression
    // Distance in km: speed (km/h) * dt (seconds) / 3600
    const deltaKm = (this.player.speed * dt) / 3600;
    this.distanceKm += deltaKm;

    // Difficulty smoothly scales with distance and time (caps at 1.0)
    this.difficultyFactor = Math.min(1.0, this.distanceKm / 8.0);

    // Continuous distance score + high speed multiplier
    let speedMultiplier = 1.0;
    if (this.player.speed >= CONFIG.SCORING.HIGH_SPEED_THRESHOLD) {
      speedMultiplier = CONFIG.SCORING.HIGH_SPEED_MULTIPLIER;
    }
    this.score += deltaKm * CONFIG.SCORING.POINTS_PER_KM * speedMultiplier;

    // 4. Update Traffic
    this.trafficManager.update(dt, this.player, CONFIG.ROAD, this.difficultyFactor);

    // 5. Collision Checks
    this.collisionManager.update(dt);
    const crashed = this.collisionManager.checkCollision(
      this.player,
      this.trafficManager.vehicles,
      (player, trafficCar) => {
        this.renderer.spawnCollisionSparks(player.x, -player.y);
        this.ui.showDamageFlash();
      }
    );

    // 6. Near Miss Proximity Checks
    this.nearMissManager.update(dt, this.player, this.trafficManager.vehicles);

    // 7. Mission Progression
    this.missionManager.update(
      this.distanceKm,
      this.player.speed,
      this.nearMissManager.totalNearMisses,
      this.trafficManager.overtakeCount,
      this.nearMissManager.combo
    );

    // 8. Environment Day/Night Cycle
    this.envManager.update(dt);

    // 9. Particle Spawning & Updates
    if (this.player.isNitroActive) {
      this.renderer.spawnNitroFlames(this.player);
    }
    this.renderer.updateParticles(dt);

    // 10. Check Health / Game Over
    if (this.player.health <= 0) {
      this.gameOver();
      return;
    }

    // 11. Update HUD
    const activeMission = this.missionManager.getActiveMission();
    this.ui.updateHUD(
      this.player,
      this.score,
      this.distanceKm,
      this.nearMissManager.combo,
      this.nearMissManager.getComboProgress(),
      activeMission
    );
  }
}

/* ==========================================================================
   14. BOOTSTRAP INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
