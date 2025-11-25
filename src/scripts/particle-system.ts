// Galaxy particle system - Optimized for homepage hero section

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  baseOpacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
  type: 'star' | 'accent-star' | 'nebula';
  rotation: number;
  rotationSpeed: number;
  distanceFromCenter: number;
  angle: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  headRadius: number;
}

// Constants for better maintainability
const CONSTANTS = {
  // Device breakpoints
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  
  // Star distribution
  ACCENT_STAR_RATIO: 0.15,
  NEBULA_RATIO: 0.05,
  
  // Spiral configuration
  SPIRAL_TIGHTNESS: 0.3,
  SPIRAL_DISTANCE_FACTOR: 0.8,
  
  // Physics
  SPIRAL_CORRECTION_STRENGTH: 0.00005,
  PULL_STRENGTH: 0.0001,
  DISTANCE_THRESHOLD: 10,
  DAMPING_FACTOR: 0.99,
  MOUSE_INFLUENCE_MULTIPLIER: 0.01,
  MOUSE_INFLUENCE_RADIUS_FACTOR: 0.3,
  BRIGHTNESS_MULTIPLIER: 1.5,
  
  // Twinkle
  TWINKLE_AMPLITUDE: 0.3,
  TWINKLE_OFFSET: 0.7,
  RADIUS_VARIATION_MIN: 0.8,
  RADIUS_VARIATION_MAX: 0.2,
  
  // Shooting stars - improved for more frequent, longer, varied spawns
  SHOOTING_STAR_MIN_INTERVAL: 800,
  SHOOTING_STAR_MAX_INTERVAL: 2000,
  SHOOTING_STAR_MIN_TAIL_LENGTH: 150,
  SHOOTING_STAR_MAX_TAIL_LENGTH: 300,
  SHOOTING_STAR_MIN_HEAD_RADIUS: 3,
  SHOOTING_STAR_MAX_HEAD_RADIUS: 6,
  SHOOTING_STAR_MIN_LIFE: 300,
  SHOOTING_STAR_MAX_LIFE: 500,
  SHOOTING_STAR_SPEED_MIN: 0.6,
  SHOOTING_STAR_SPEED_MAX: 1.2,
  SHOOTING_STAR_ANGLE_MIN: 0,
  SHOOTING_STAR_ANGLE_RANGE: Math.PI * 2,
  SHOOTING_STAR_SPAWN_OFFSET: 50,
  SHOOTING_STAR_BOUNDS_OFFSET: 100,
  SHOOTING_STAR_SPAWN_FROM_EDGE_CHANCE: 0.4, // 40% chance to spawn from edge, 60% from anywhere
  TAIL_WIDTH_FACTOR: 0.8,
  MIN_TAIL_WIDTH: 2,
  
  // Opacity ranges
  LIGHT_MODE_OPACITY_MIN: 0.4,
  LIGHT_MODE_OPACITY_RANGE: 0.3,
  DARK_MODE_OPACITY_MIN: 0.3,
  DARK_MODE_OPACITY_RANGE: 0.4,
  
  // Glow multipliers
  NEBULA_GLOW_LIGHT: 3,
  NEBULA_GLOW_DARK: 2,
  ACCENT_STAR_GLOW_LIGHT: 4,
  ACCENT_STAR_GLOW_DARK: 3,
  REGULAR_STAR_GLOW_LIGHT: 2.5,
  REGULAR_STAR_GLOW_DARK: 2,
  SHOOTING_STAR_GLOW_LIGHT: 3,
  SHOOTING_STAR_GLOW_DARK: 2.5,
  
  // Light mode star colors (subtle dark colors for visibility)
  LIGHT_MODE_STAR_COLORS: [
    '#1F2937', // Dark gray
    '#374151', // Medium-dark gray
    '#4B5563', // Medium gray
    '#6B7280', // Lighter gray
  ],
  
  // Boundary wrap offset
  BOUNDARY_OFFSET: 50,
} as const;

export class GalaxyParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private shootingStars: ShootingStar[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private isMouseActive = false;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private centerX = 0;
  private centerY = 0;
  private lastShootingStarTime = 0;
  private shootingStarInterval = 0;
  
  // Configuration
  private config = {
    starCount: 0,
    accentStarRatio: CONSTANTS.ACCENT_STAR_RATIO,
    nebulaRatio: CONSTANTS.NEBULA_RATIO,
    speed: 0,
    rotationSpeed: 0,
    twinkleSpeed: 0,
    mouseInfluence: 0,
  };

  // Theme colors and cached values
  private accentColor = '#A3E635';
  private accentColorRgb: string = '';
  private starColors: string[] = [];
  private nebulaColors: string[] = [];
  private isLightMode = false;
  private textPrimary = '#FFFFFF';
  private textSecondary = '#A0A0A0';
  
  // Cached canvas size
  private cachedLogicalSize = { width: 0, height: 0 };
  private cachedMaxDistance = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    this.initializeConfig();
    this.setupCanvas();
    this.setupEventListeners();
    this.createStars();
    this.initializeShootingStars();
    this.animate();
  }

  private initializeConfig() {
    const width = window.innerWidth;
    const isMobile = width < CONSTANTS.MOBILE_BREAKPOINT;
    const isTablet = width < CONSTANTS.TABLET_BREAKPOINT && width >= CONSTANTS.MOBILE_BREAKPOINT;

    // Set config based on device for optimal performance
    if (isMobile) {
      this.config.starCount = 80;
      this.config.speed = 0.1;
      this.config.rotationSpeed = 0.0001;
      this.config.twinkleSpeed = 0.02;
      this.config.mouseInfluence = 0.3;
    } else if (isTablet) {
      this.config.starCount = 150;
      this.config.speed = 0.15;
      this.config.rotationSpeed = 0.00015;
      this.config.twinkleSpeed = 0.025;
      this.config.mouseInfluence = 0.5;
    } else {
      this.config.starCount = 250;
      this.config.speed = 0.2;
      this.config.rotationSpeed = 0.0002;
      this.config.twinkleSpeed = 0.03;
      this.config.mouseInfluence = 0.8;
    }

    // Update theme colors
    this.updateThemeColors();
    
    // Set shooting star interval (random between 0.8-2 seconds for more frequent stars)
    this.shootingStarInterval = 
      Math.random() * (CONSTANTS.SHOOTING_STAR_MAX_INTERVAL - CONSTANTS.SHOOTING_STAR_MIN_INTERVAL) + 
      CONSTANTS.SHOOTING_STAR_MIN_INTERVAL;
  }
  
  private initializeShootingStars() {
    // Create initial shooting stars
    this.shootingStars = [];
    this.lastShootingStarTime = Date.now();
  }
  
  private createShootingStar() {
    const { width, height } = this.cachedLogicalSize;
    const spawnFromEdge = Math.random() < CONSTANTS.SHOOTING_STAR_SPAWN_FROM_EDGE_CHANCE;
    
    let x: number, y: number, vx: number, vy: number;
    const speed = CONSTANTS.SHOOTING_STAR_SPEED_MIN + 
      Math.random() * (CONSTANTS.SHOOTING_STAR_SPEED_MAX - CONSTANTS.SHOOTING_STAR_SPEED_MIN);
    
    if (spawnFromEdge) {
      // Spawn from edge (40% chance)
      const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      const angle = CONSTANTS.SHOOTING_STAR_ANGLE_MIN + 
        Math.random() * CONSTANTS.SHOOTING_STAR_ANGLE_RANGE;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      
      switch (side) {
        case 0: // Top
          x = Math.random() * width;
          y = -CONSTANTS.SHOOTING_STAR_SPAWN_OFFSET;
          vx = cosAngle * speed;
          vy = sinAngle * speed;
          break;
        case 1: // Right
          x = width + CONSTANTS.SHOOTING_STAR_SPAWN_OFFSET;
          y = Math.random() * height;
          vx = -cosAngle * speed;
          vy = sinAngle * speed;
          break;
        case 2: // Bottom
          x = Math.random() * width;
          y = height + CONSTANTS.SHOOTING_STAR_SPAWN_OFFSET;
          vx = cosAngle * speed;
          vy = -sinAngle * speed;
          break;
        default: // Left
          x = -CONSTANTS.SHOOTING_STAR_SPAWN_OFFSET;
          y = Math.random() * height;
          vx = cosAngle * speed;
          vy = sinAngle * speed;
          break;
      }
    } else {
      // Spawn from anywhere on screen (60% chance)
      // Choose a random point on screen
      x = Math.random() * width;
      y = Math.random() * height;
      
      // Choose a random direction (full 360 degrees)
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }
    
    const length = CONSTANTS.SHOOTING_STAR_MIN_TAIL_LENGTH + 
      Math.random() * (CONSTANTS.SHOOTING_STAR_MAX_TAIL_LENGTH - CONSTANTS.SHOOTING_STAR_MIN_TAIL_LENGTH);
    const headRadius = CONSTANTS.SHOOTING_STAR_MIN_HEAD_RADIUS + 
      Math.random() * (CONSTANTS.SHOOTING_STAR_MAX_HEAD_RADIUS - CONSTANTS.SHOOTING_STAR_MIN_HEAD_RADIUS);
    const maxLifeValue = CONSTANTS.SHOOTING_STAR_MIN_LIFE + 
      Math.random() * (CONSTANTS.SHOOTING_STAR_MAX_LIFE - CONSTANTS.SHOOTING_STAR_MIN_LIFE);
    
    this.shootingStars.push({
      x,
      y,
      vx,
      vy,
      length,
      opacity: 1,
      color: this.accentColor,
      life: 0,
      maxLife: maxLifeValue,
      headRadius,
    });
  }

  private updateThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    this.accentColor = computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
    this.textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#FFFFFF';
    this.textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#A0A0A0';
    
    // Cache RGB value for accent color (used frequently)
    this.accentColorRgb = this.hexToRgb(this.accentColor);
    
    // Detect light mode
    this.isLightMode = root.classList.contains('light');
    
    // Set star colors based on theme
    if (this.isLightMode) {
      // For light mode: use subtle dark colors for galaxy effect
      this.starColors = [...CONSTANTS.LIGHT_MODE_STAR_COLORS];
    } else {
      // For dark mode: use lighter variations of text colors
      this.starColors = [
        this.textPrimary,
        this.lightenColor(this.textPrimary, 0.1),
        this.lightenColor(this.textPrimary, 0.2),
        this.textSecondary,
      ];
    }
    
    // Create nebula colors from accent color
    if (this.isLightMode) {
      // For light mode: use softer, more transparent accent colors
      this.nebulaColors = [
        this.accentColor,
        this.adjustBrightness(this.accentColor, 0.8),
        this.adjustBrightness(this.accentColor, 0.6),
        this.blendColors(this.accentColor, '#6B7280', 0.3),
      ];
    } else {
      // For dark mode: use accent color variations
      this.nebulaColors = [
        this.accentColor,
        this.adjustBrightness(this.accentColor, 0.7),
        this.adjustBrightness(this.accentColor, 0.5),
        this.adjustBrightness(this.accentColor, 0.3),
      ];
    }
  }

  // Optimized color utility methods
  private hexToRgbValues(hex: string): [number, number, number] {
    const cleanHex = hex.replace('#', '');
    return [
      parseInt(cleanHex.substring(0, 2), 16),
      parseInt(cleanHex.substring(2, 4), 16),
      parseInt(cleanHex.substring(4, 6), 16),
    ];
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  private adjustBrightness(color: string, factor: number): string {
    const [r, g, b] = this.hexToRgbValues(color);
    return this.rgbToHex(r * factor, g * factor, b * factor);
  }
  
  private lightenColor(color: string, factor: number): string {
    const [r, g, b] = this.hexToRgbValues(color);
    // Blend with white (255, 255, 255)
    return this.rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    );
  }

  private blendColors(color1: string, color2: string, ratio: number): string {
    const [r1, g1, b1] = this.hexToRgbValues(color1);
    const [r2, g2, b2] = this.hexToRgbValues(color2);
    
    return this.rgbToHex(
      r1 * (1 - ratio) + r2 * ratio,
      g1 * (1 - ratio) + g2 * ratio,
      b1 * (1 - ratio) + b2 * ratio
    );
  }

  private setupCanvas() {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      
      // Update cached values
      this.updateCanvasCache();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    
    // Watch container size changes
    if (this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private updateCanvasCache() {
    const dpr = window.devicePixelRatio || 1;
    this.cachedLogicalSize = {
      width: this.canvas.width / dpr,
      height: this.canvas.height / dpr,
    };
    this.centerX = this.cachedLogicalSize.width / 2;
    this.centerY = this.cachedLogicalSize.height / 2;
    this.cachedMaxDistance = Math.sqrt(
      this.cachedLogicalSize.width ** 2 + this.cachedLogicalSize.height ** 2
    ) / 2;
  }

  private getCanvasLogicalSize() {
    return this.cachedLogicalSize;
  }

  private createStars() {
    this.stars = [];
    this.updateCanvasCache();
    const { width, height } = this.cachedLogicalSize;
    const maxDistance = this.cachedMaxDistance;
    
    for (let i = 0; i < this.config.starCount; i++) {
      const rand = Math.random();
      let type: 'star' | 'accent-star' | 'nebula';
      
      if (rand < this.config.nebulaRatio) {
        type = 'nebula';
      } else if (rand < this.config.nebulaRatio + this.config.accentStarRatio) {
        type = 'accent-star';
      } else {
        type = 'star';
      }

      // Create spiral distribution
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxDistance * CONSTANTS.SPIRAL_DISTANCE_FACTOR;
      const spiralAngle = angle + (distance / maxDistance) * Math.PI * 2 * CONSTANTS.SPIRAL_TIGHTNESS;
      const cosSpiral = Math.cos(spiralAngle);
      const sinSpiral = Math.sin(spiralAngle);
      
      const x = this.centerX + cosSpiral * distance;
      const y = this.centerY + sinSpiral * distance;

      // Set size based on type
      let baseRadius: number;
      if (type === 'nebula') {
        baseRadius = Math.random() * 3 + 2;
      } else if (type === 'accent-star') {
        baseRadius = Math.random() * 1.5 + 1;
      } else {
        baseRadius = Math.random() * 1 + 0.5;
      }

      // Set rotation speed
      const rotationSpeed = (Math.random() - 0.5) * this.config.rotationSpeed;
      
      // Set orbital velocity
      const orbitalSpeed = this.config.speed * (0.5 + Math.random() * 0.5);
      const perpAngle = spiralAngle + Math.PI / 2;
      const vx = Math.cos(perpAngle) * orbitalSpeed;
      const vy = Math.sin(perpAngle) * orbitalSpeed;

      // Adjust opacity based on theme
      const baseOpacity = this.isLightMode 
        ? Math.random() * CONSTANTS.LIGHT_MODE_OPACITY_RANGE + CONSTANTS.LIGHT_MODE_OPACITY_MIN
        : Math.random() * CONSTANTS.DARK_MODE_OPACITY_RANGE + CONSTANTS.DARK_MODE_OPACITY_MIN;

      // Select color based on type
      let color: string;
      if (type === 'accent-star') {
        color = this.accentColor;
      } else if (type === 'nebula') {
        color = this.nebulaColors[Math.floor(Math.random() * this.nebulaColors.length)];
      } else {
        color = this.starColors[Math.floor(Math.random() * this.starColors.length)];
      }

      this.stars.push({
        x,
        y,
        vx,
        vy,
        radius: baseRadius,
        baseRadius,
        opacity: baseOpacity,
        baseOpacity,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: this.config.twinkleSpeed * (0.5 + Math.random() * 0.5),
        color,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        distanceFromCenter: distance,
        angle: spiralAngle,
      });
    }
  }

  private setupEventListeners() {
    // Track mouse position with throttling for performance
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const rect = this.canvas.getBoundingClientRect();
          const { width, height } = this.cachedLogicalSize;
          this.mouseX = ((e.clientX - rect.left) / rect.width) * width;
          this.mouseY = ((e.clientY - rect.top) / rect.height) * height;
          this.isMouseActive = true;
          rafId = null;
        });
      }
    };

    const handleMouseLeave = () => {
      this.isMouseActive = false;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Watch for theme changes
    const themeObserver = new MutationObserver(() => {
      const wasLightMode = this.isLightMode;
      this.updateThemeColors();
      
      // Update all stars when theme changes
      this.stars.forEach(star => {
        if (star.type === 'accent-star') {
          star.color = this.accentColor;
        } else if (star.type === 'nebula') {
          star.color = this.nebulaColors[Math.floor(Math.random() * this.nebulaColors.length)];
        } else {
          star.color = this.starColors[Math.floor(Math.random() * this.starColors.length)];
        }
        
        // Adjust opacity when switching themes
        if (wasLightMode !== this.isLightMode) {
          star.baseOpacity = this.isLightMode 
            ? Math.random() * CONSTANTS.LIGHT_MODE_OPACITY_RANGE + CONSTANTS.LIGHT_MODE_OPACITY_MIN
            : Math.random() * CONSTANTS.DARK_MODE_OPACITY_RANGE + CONSTANTS.DARK_MODE_OPACITY_MIN;
          star.opacity = star.baseOpacity;
        }
      });
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private updateStars() {
    const { width, height } = this.cachedLogicalSize;
    const maxDistance = this.cachedMaxDistance;
    
    // Update shooting stars
    const now = Date.now();
    if (now - this.lastShootingStarTime > this.shootingStarInterval) {
      this.createShootingStar();
      this.lastShootingStarTime = now;
      this.shootingStarInterval = 
        Math.random() * (CONSTANTS.SHOOTING_STAR_MAX_INTERVAL - CONSTANTS.SHOOTING_STAR_MIN_INTERVAL) + 
        CONSTANTS.SHOOTING_STAR_MIN_INTERVAL;
    }
    
    // Update shooting star positions and remove dead ones
    this.shootingStars = this.shootingStars.filter(shootingStar => {
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life++;
      
      // Remove if dead or out of bounds
      const isDead = shootingStar.life >= shootingStar.maxLife;
      const isOutOfBounds = 
        shootingStar.x < -CONSTANTS.SHOOTING_STAR_BOUNDS_OFFSET || 
        shootingStar.x > width + CONSTANTS.SHOOTING_STAR_BOUNDS_OFFSET ||
        shootingStar.y < -CONSTANTS.SHOOTING_STAR_BOUNDS_OFFSET || 
        shootingStar.y > height + CONSTANTS.SHOOTING_STAR_BOUNDS_OFFSET;
      
      return !isDead && !isOutOfBounds;
    });

    // Optimize: cache values used in loop
    const influenceRadius = Math.min(width, height) * CONSTANTS.MOUSE_INFLUENCE_RADIUS_FACTOR;
    const boundaryOffset = CONSTANTS.BOUNDARY_OFFSET;
    const widthWithOffset = width + boundaryOffset;
    const heightWithOffset = height + boundaryOffset;

    this.stars.forEach((star) => {
      // Update rotation
      star.rotation += star.rotationSpeed;
      
      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * CONSTANTS.TWINKLE_AMPLITUDE + CONSTANTS.TWINKLE_OFFSET;
      star.opacity = star.baseOpacity * twinkle;
      star.radius = star.baseRadius * (CONSTANTS.RADIUS_VARIATION_MIN + twinkle * CONSTANTS.RADIUS_VARIATION_MAX);

      // Handle mouse interaction
      if (this.isMouseActive) {
        const dx = this.mouseX - star.x;
        const dy = this.mouseY - star.y;
        const distanceSq = dx * dx + dy * dy;
        const influenceRadiusSq = influenceRadius * influenceRadius;

        if (distanceSq < influenceRadiusSq) {
          const distance = Math.sqrt(distanceSq);
          const influence = (1 - distance / influenceRadius) * this.config.mouseInfluence;
          const angle = Math.atan2(dy, dx);
          
          // Push away from mouse
          star.vx -= Math.cos(angle) * influence * CONSTANTS.MOUSE_INFLUENCE_MULTIPLIER;
          star.vy -= Math.sin(angle) * influence * CONSTANTS.MOUSE_INFLUENCE_MULTIPLIER;
          
          // Brighten near mouse
          star.opacity = Math.min(star.baseOpacity * CONSTANTS.BRIGHTNESS_MULTIPLIER, 1);
        }
      }

      // Update position
      star.x += star.vx;
      star.y += star.vy;

      // Maintain spiral structure
      const dx = star.x - this.centerX;
      const dy = star.y - this.centerY;
      const currentDistanceSq = dx * dx + dy * dy;
      const targetDistance = star.distanceFromCenter;
      const distanceDiff = Math.sqrt(currentDistanceSq) - targetDistance;
      
      if (Math.abs(distanceDiff) > CONSTANTS.DISTANCE_THRESHOLD) {
        const pullAngle = Math.atan2(dy, dx);
        const targetX = this.centerX + Math.cos(pullAngle) * targetDistance;
        const targetY = this.centerY + Math.sin(pullAngle) * targetDistance;
        
        star.vx += (targetX - star.x) * CONSTANTS.PULL_STRENGTH;
        star.vy += (targetY - star.y) * CONSTANTS.PULL_STRENGTH;
      }

      // Update spiral angle
      star.angle += star.rotationSpeed * 10;
      const spiralAngle = star.angle + (star.distanceFromCenter / maxDistance) * Math.PI * 2 * CONSTANTS.SPIRAL_TIGHTNESS;
      
      // Apply spiral correction
      const targetX = this.centerX + Math.cos(spiralAngle) * star.distanceFromCenter;
      const targetY = this.centerY + Math.sin(spiralAngle) * star.distanceFromCenter;
      star.vx += (targetX - star.x) * CONSTANTS.SPIRAL_CORRECTION_STRENGTH;
      star.vy += (targetY - star.y) * CONSTANTS.SPIRAL_CORRECTION_STRENGTH;

      // Wrap around boundaries
      if (star.x < -boundaryOffset) star.x = widthWithOffset;
      if (star.x > widthWithOffset) star.x = -boundaryOffset;
      if (star.y < -boundaryOffset) star.y = heightWithOffset;
      if (star.y > heightWithOffset) star.y = -boundaryOffset;

      // Apply damping
      star.vx *= CONSTANTS.DAMPING_FACTOR;
      star.vy *= CONSTANTS.DAMPING_FACTOR;
    });
  }

  private draw() {
    const { width, height } = this.cachedLogicalSize;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Cache theme-dependent values
    const isLight = this.isLightMode;
    const accentRgb = this.accentColorRgb;

    // Draw stars - optimized rendering
    for (const star of this.stars) {
      this.ctx.save();
      this.ctx.globalAlpha = star.opacity;
      
      if (star.type === 'nebula') {
        this.drawNebula(star, isLight, accentRgb);
      } else if (star.type === 'accent-star') {
        this.drawAccentStar(star, isLight, accentRgb);
      } else {
        this.drawRegularStar(star, isLight);
      }
      
      this.ctx.restore();
    }

    // Draw shooting stars
    for (const shootingStar of this.shootingStars) {
      this.drawShootingStar(shootingStar, isLight, accentRgb);
    }

    this.ctx.globalAlpha = 1;
  }

  private drawNebula(star: Star, isLight: boolean, accentRgb: string) {
    const glowRadius = star.radius * (isLight ? CONSTANTS.NEBULA_GLOW_LIGHT : CONSTANTS.NEBULA_GLOW_DARK);
    const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
    
    if (isLight) {
      gradient.addColorStop(0, `rgba(${accentRgb}, ${star.opacity * 0.8})`);
      gradient.addColorStop(0.3, `rgba(${accentRgb}, ${star.opacity * 0.5})`);
      gradient.addColorStop(0.6, `rgba(${accentRgb}, ${star.opacity * 0.2})`);
      gradient.addColorStop(1, 'transparent');
    } else {
      gradient.addColorStop(0, this.accentColor);
      gradient.addColorStop(0.5, this.adjustBrightness(this.accentColor, 0.5));
      gradient.addColorStop(1, 'transparent');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawAccentStar(star: Star, isLight: boolean, accentRgb: string) {
    const glowRadius = star.radius * (isLight ? CONSTANTS.ACCENT_STAR_GLOW_LIGHT : CONSTANTS.ACCENT_STAR_GLOW_DARK);
    const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
    
    if (isLight) {
      gradient.addColorStop(0, `rgba(${accentRgb}, ${star.opacity * 0.9})`);
      gradient.addColorStop(0.2, `rgba(${accentRgb}, ${star.opacity * 0.7})`);
      gradient.addColorStop(0.5, `rgba(${accentRgb}, ${star.opacity * 0.4})`);
      gradient.addColorStop(0.8, `rgba(${accentRgb}, ${star.opacity * 0.15})`);
      gradient.addColorStop(1, 'transparent');
    } else {
      gradient.addColorStop(0, this.accentColor);
      gradient.addColorStop(0.3, this.adjustBrightness(this.accentColor, 0.6));
      gradient.addColorStop(1, 'transparent');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw core
    this.ctx.fillStyle = isLight 
      ? `rgba(${accentRgb}, ${star.opacity})`
      : this.accentColor;
    this.ctx.beginPath();
    this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawRegularStar(star: Star, isLight: boolean) {
    const starRgb = this.hexToRgb(star.color);
    this.ctx.fillStyle = isLight 
      ? `rgba(${starRgb}, ${star.opacity})`
      : star.color;
    this.ctx.beginPath();
    this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add glow for larger stars
    if (star.radius > 1) {
      const glowRadius = star.radius * (isLight ? CONSTANTS.REGULAR_STAR_GLOW_LIGHT : CONSTANTS.REGULAR_STAR_GLOW_DARK);
      
      if (isLight) {
        this.ctx.globalAlpha = star.opacity * 0.2;
        const glowGradient = this.ctx.createRadialGradient(
          star.x, star.y, star.radius,
          star.x, star.y, glowRadius
        );
        glowGradient.addColorStop(0, `rgba(${starRgb}, ${star.opacity * 0.3})`);
        glowGradient.addColorStop(0.4, `rgba(${starRgb}, ${star.opacity * 0.1})`);
        glowGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGradient;
      } else {
        this.ctx.globalAlpha = star.opacity * 0.3;
        this.ctx.fillStyle = star.color;
      }
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawShootingStar(shootingStar: ShootingStar, isLight: boolean, accentRgb: string) {
    this.ctx.save();
    
    // Calculate tail end position
    const tailX = shootingStar.x - shootingStar.vx * shootingStar.length;
    const tailY = shootingStar.y - shootingStar.vy * shootingStar.length;
    
    // Tail opacity based on life
    const lifeRatio = shootingStar.life / shootingStar.maxLife;
    const opacity = shootingStar.opacity * (1 - lifeRatio);
    
    // Create gradient for tail
    const gradient = this.ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
    
    if (isLight) {
      gradient.addColorStop(0, `rgba(${accentRgb}, ${opacity * 0.2})`);
      gradient.addColorStop(0.5, `rgba(${accentRgb}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${accentRgb}, ${opacity * 0.7})`);
    } else {
      gradient.addColorStop(0, `rgba(${accentRgb}, ${opacity * 0.2})`);
      gradient.addColorStop(0.5, `rgba(${accentRgb}, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(${accentRgb}, ${opacity})`);
    }
    
    // Draw tail
    const tailWidth = Math.max(CONSTANTS.MIN_TAIL_WIDTH, shootingStar.headRadius * CONSTANTS.TAIL_WIDTH_FACTOR);
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = tailWidth;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(tailX, tailY);
    this.ctx.lineTo(shootingStar.x, shootingStar.y);
    this.ctx.stroke();
    
    // Draw head
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = isLight 
      ? `rgba(${accentRgb}, ${opacity})`
      : this.accentColor;
    this.ctx.beginPath();
    this.ctx.arc(shootingStar.x, shootingStar.y, shootingStar.headRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add glow to head
    const glowRadius = shootingStar.headRadius * (isLight ? CONSTANTS.SHOOTING_STAR_GLOW_LIGHT : CONSTANTS.SHOOTING_STAR_GLOW_DARK);
    const headGlow = this.ctx.createRadialGradient(
      shootingStar.x, shootingStar.y, 0,
      shootingStar.x, shootingStar.y, glowRadius
    );
    
    if (isLight) {
      headGlow.addColorStop(0, `rgba(${accentRgb}, ${opacity})`);
      headGlow.addColorStop(0.5, `rgba(${accentRgb}, ${opacity * 0.4})`);
      headGlow.addColorStop(1, 'transparent');
    } else {
      headGlow.addColorStop(0, `rgba(${accentRgb}, ${opacity})`);
      headGlow.addColorStop(0.5, `rgba(${accentRgb}, ${opacity * 0.3})`);
      headGlow.addColorStop(1, 'transparent');
    }
    
    this.ctx.fillStyle = headGlow;
    this.ctx.beginPath();
    this.ctx.arc(shootingStar.x, shootingStar.y, glowRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '255, 255, 255';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }

  private animate() {
    this.updateStars();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  public destroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.stars = [];
    this.shootingStars = [];
  }
}
