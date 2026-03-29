import { BREAKPOINTS } from '../core/constants';
import { logger } from '@/lib/logger';

export type ParticleMode = 'galaxy' | 'network' | 'flow' | 'data' | 'waves' | 'logic' | 'sys' | 'ai' | 'expand' | 'articles' | 'about';

interface Particle {
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
  type: 'star' | 'accent-star' | 'nebula' | 'node' | 'data-bit';
  shape: 'circle' | 'square' | 'star';
  rotation: number;
  rotationSpeed: number;
  distanceFromCenter: number;
  angle: number;
  pulsePhase?: number;
}

const CONSTANTS = {
  MOBILE_BREAKPOINT: BREAKPOINTS.SM,
  TABLET_BREAKPOINT: BREAKPOINTS.LG,

  // Galaxy specific
  SPIRAL_TIGHTNESS: 0.3,
  SPIRAL_CORRECTION_STRENGTH: 0.00005,
  
  // Physics/Interaction
  DAMPING_FACTOR: 0.99,
  MOUSE_INFLUENCE_RADIUS_FACTOR: 0.3,
  
  // Connections (Particles.js style)
  LINK_DISTANCE: 150,
  LINK_OPACITY_MAX: 0.4,
  
  BOUNDARY_OFFSET: 50,
} as const;

interface DeviceCapabilities {
  batteryLevel?: number;
  isLowEnd: boolean;
}

interface ConnectionInfoLike {
  effectiveType?: string;
}

interface BatteryLike {
  level: number;
  charging: boolean;
  addEventListener: (type: 'levelchange', listener: () => void) => void;
}

interface NavigatorCapabilities extends Navigator {
  deviceMemory?: number;
  connection?: ConnectionInfoLike;
  mozConnection?: ConnectionInfoLike;
  webkitConnection?: ConnectionInfoLike;
  getBattery?: () => Promise<BatteryLike>;
}

export class GalaxyParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private isMouseActive = false;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private resizeHandler: (() => void) | null = null;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseLeaveHandler: (() => void) | null = null;
  private centerX = 0;
  private centerY = 0;
  private mode: ParticleMode = 'galaxy';

  private deviceCapabilities: DeviceCapabilities;
  private qualityReductionTriggered = false;
  
  private isDisabled = false;

  private config = {
    particleCount: 0,
    speed: 0,
    rotationSpeed: 0,
    twinkleSpeed: 0,
    mouseInfluence: 0,
    lineLinked: false,
  };

  private accentColor = '#A3E635';
  private accentColorRgb: string = '';
  private particleColors: string[] = [];
  private isLightMode = false;
  private textPrimary = '#FFFFFF';
  private textSecondary = '#A0A0A0';
  
  private cachedLogicalSize = { width: 0, height: 0 };
  private cachedMaxDistance = 0;

  constructor(canvas: HTMLCanvasElement, mode: ParticleMode = 'galaxy') {
    this.canvas = canvas;
    this.mode = mode;
    this.deviceCapabilities = this.detectDeviceCapabilities();

    if (this.deviceCapabilities.isLowEnd) {
      this.isDisabled = true;
      logger.debug('[ParticleSystem] Disabled on low-end device');
      return;
    }

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.initializeConfig();
    this.setupCanvas();
    this.setupEventListeners();
    this.createParticles();
    this.animate();
    this.monitorBatteryStatus();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const browserNavigator = navigator as NavigatorCapabilities;
    const memory = browserNavigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency || 4;
    const connection =
      browserNavigator.connection ||
      browserNavigator.mozConnection ||
      browserNavigator.webkitConnection;
    const connectionType = connection?.effectiveType || 'unknown';
    const isLowEnd = memory < 4 || cores < 4 || connectionType === 'slow-2g' || connectionType === '2g';

    return { isLowEnd };
  }

  private async monitorBatteryStatus() {
    try {
      const browserNavigator = navigator as NavigatorCapabilities;
      if (typeof browserNavigator.getBattery === 'function') {
        const battery = await browserNavigator.getBattery();
        this.deviceCapabilities.batteryLevel = battery.level;

        if (battery.level < 0.2 && !battery.charging) this.reduceQuality('battery');

        battery.addEventListener('levelchange', () => {
          this.deviceCapabilities.batteryLevel = battery.level;
          if (battery.level < 0.2 && !battery.charging && !this.qualityReductionTriggered) {
            this.reduceQuality('battery');
          }
        });
      }
    } catch (e) {}
  }

  private initializeConfig() {
    const width = window.innerWidth;
    const isMobile = width < CONSTANTS.MOBILE_BREAKPOINT;
    const isTablet = width < CONSTANTS.TABLET_BREAKPOINT && width >= CONSTANTS.MOBILE_BREAKPOINT;

    // Default counts
    let baseCount = 200;
    if (isMobile) baseCount = 50;
    else if (isTablet) baseCount = 100;

    // Mode specific adjustments
    switch (this.mode) {
      case 'network':
      case 'ai':
        baseCount = Math.floor(baseCount * 0.7); // Lines are expensive
        this.config.lineLinked = true;
        break;
      case 'flow':
      case 'sys':
        baseCount = Math.floor(baseCount * 1.2);
        break;
      case 'data':
      case 'articles':
        baseCount = Math.floor(baseCount * 0.5); // Larger elements
        break;
      case 'about':
        baseCount = Math.floor(baseCount * 0.8);
        this.config.lineLinked = true;
        break;
    }

    this.config.particleCount = baseCount;
    this.config.speed = isMobile ? 0.1 : 0.2;
    this.config.rotationSpeed = 0.0002;
    this.config.twinkleSpeed = 0.03;
    this.config.mouseInfluence = isMobile ? 0.3 : 0.8;

    this.updateThemeColors();
  }

  private reduceQuality(reason: string) {
    if (this.qualityReductionTriggered) return;
    this.qualityReductionTriggered = true;
    this.config.particleCount = Math.floor(this.config.particleCount * 0.5);
    this.particles = this.particles.slice(0, this.config.particleCount);
    logger.debug(`[ParticleSystem] Quality reduced due to ${reason}`);
  }

  private updateThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    this.accentColor = computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
    this.textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#FFFFFF';
    this.textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#A0A0A0';
    this.isLightMode = root.classList.contains('light');
    this.accentColorRgb = this.hexToRgb(this.accentColor);

    this.particleColors = this.isLightMode 
      ? ['#1F2937', '#374151', '#4B5563'] 
      : [this.textPrimary, this.textSecondary, this.accentColor];
  }

  private setupCanvas() {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.updateCanvasCache();
    };

    resize();
    this.resizeHandler = resize;
    window.addEventListener('resize', resize, { passive: true });
    
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
    this.cachedMaxDistance = Math.sqrt(this.centerX ** 2 + this.centerY ** 2);
  }

  private createParticles() {
    this.particles = [];
    const { width, height } = this.cachedLogicalSize;
    
    for (let i = 0; i < this.config.particleCount; i++) {
      const rand = Math.random();
      let type: Particle['type'] = 'star';
      let shape: Particle['shape'] = 'circle';
      let color = this.particleColors[Math.floor(Math.random() * this.particleColors.length)];
      
      // Mode specific shapes and types
      if (this.mode === 'data') {
        shape = Math.random() > 0.7 ? 'square' : 'circle';
        type = 'data-bit';
      } else if (this.mode === 'articles') {
        shape = 'square'; // Document pages
        type = 'data-bit';
      } else if (this.mode === 'logic') {
        shape = 'star';
        type = 'node';
      } else if (this.mode === 'ai' || this.mode === 'about') {
        type = 'node';
        if (rand < 0.2) color = this.accentColor;
      } else if (this.mode === 'network') {
        type = 'node';
      }

      const x = Math.random() * width;
      const y = Math.random() * height;
      
      let baseRadius = Math.random() * 1.5 + 0.5;
      
      // Contextual radius adjustments
      if (this.mode === 'data') baseRadius = Math.random() * 3 + 1;
      if (this.mode === 'articles') baseRadius = Math.random() * 4 + 2;
      if ((this.mode === 'ai' || this.mode === 'about') && type === 'node') baseRadius = Math.random() * 2 + 1;
      if (this.mode === 'expand') baseRadius = Math.random() * 2 + 0.5;

      const orbitalSpeed = this.config.speed * (0.5 + Math.random() * 0.5);
      const angle = Math.random() * Math.PI * 2;

      // Special handling for galaxy spiral
      let startX = x;
      let startY = y;
      let distFromCenter = Math.sqrt((x - this.centerX)**2 + (y - this.centerY)**2);
      
      if (this.mode === 'galaxy') {
        const spiralAngle = angle + (distFromCenter / this.cachedMaxDistance) * Math.PI * 2 * CONSTANTS.SPIRAL_TIGHTNESS;
        startX = this.centerX + Math.cos(spiralAngle) * distFromCenter;
        startY = this.centerY + Math.sin(spiralAngle) * distFromCenter;
      } else if (this.mode === 'expand') {
        // Start near center
        startX = this.centerX + (Math.random() - 0.5) * 100;
        startY = this.centerY + (Math.random() - 0.5) * 100;
      } else if (this.mode === 'articles') {
        // Start from bottom
        startX = x;
        startY = height + Math.random() * 100;
      }

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * orbitalSpeed,
        vy: Math.sin(angle) * orbitalSpeed,
        radius: baseRadius,
        baseRadius,
        opacity: Math.random() * 0.5 + 0.2,
        baseOpacity: Math.random() * 0.5 + 0.2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: this.config.twinkleSpeed * (0.5 + Math.random() * 0.5),
        color,
        type,
        shape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * this.config.rotationSpeed,
        distanceFromCenter: distFromCenter,
        angle,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }

  private setupEventListeners() {
    this.mouseMoveHandler = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left);
      this.mouseY = (e.clientY - rect.top);
      this.isMouseActive = true;
    };
    this.mouseLeaveHandler = () => {
      this.isMouseActive = false;
    };

    document.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    document.addEventListener('mouseleave', this.mouseLeaveHandler);

    this.themeObserver = new MutationObserver(() => this.updateThemeColors());
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  private updateParticles() {
    const { width, height } = this.cachedLogicalSize;
    const influenceRadius = Math.min(width, height) * CONSTANTS.MOUSE_INFLUENCE_RADIUS_FACTOR;

    this.particles.forEach(p => {
      // 1. Base Movement Logic
      switch (this.mode) {
        case 'galaxy':
          p.angle += this.config.rotationSpeed * 5;
          const targetX = this.centerX + Math.cos(p.angle) * p.distanceFromCenter;
          const targetY = this.centerY + Math.sin(p.angle) * p.distanceFromCenter;
          p.vx += (targetX - p.x) * CONSTANTS.SPIRAL_CORRECTION_STRENGTH;
          p.vy += (targetY - p.y) * CONSTANTS.SPIRAL_CORRECTION_STRENGTH;
          break;
          
        case 'network':
          p.vx += (Math.random() - 0.5) * 0.01;
          p.vy += (Math.random() - 0.5) * 0.01;
          break;
          
        case 'flow':
          p.vx += 0.05;
          p.vy += Math.sin(p.x * 0.01) * 0.02;
          if (p.vx > 1.5) p.vx = 1.5;
          break;
          
        case 'data':
          p.vy += 0.1;
          p.vx = (Math.random() - 0.5) * 0.05;
          if (p.vy > 2) p.vy = 2;
          break;
          
        case 'waves':
          p.vx = 0.8;
          p.y += Math.sin(p.x * 0.005 + p.twinklePhase * 0.5) * 0.5;
          break;
          
        case 'logic':
          if (Math.random() < 0.02) {
            if (Math.random() > 0.5) {
              p.vx = (Math.random() > 0.5 ? 1 : -1) * 0.5;
              p.vy = 0;
            } else {
              p.vx = 0;
              p.vy = (Math.random() > 0.5 ? 1 : -1) * 0.5;
            }
          }
          break;
          
        case 'sys':
          const baseAngle = Math.atan2(p.y - this.centerY, p.x - this.centerX);
          p.vx = -Math.sin(baseAngle) * 0.5;
          p.vy = Math.cos(baseAngle) * 0.5;
          break;
          
        case 'ai':
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
          break;
          
        case 'expand':
          const originX = this.isMouseActive ? this.mouseX : this.centerX;
          const originY = this.isMouseActive ? this.mouseY : this.centerY;
          const dxExpand = p.x - originX;
          const dyExpand = p.y - originY;
          const distExpand = Math.sqrt(dxExpand * dxExpand + dyExpand * dyExpand);
          
          if (distExpand > 0) {
            p.vx += (dxExpand / distExpand) * 0.03;
            p.vy += (dyExpand / distExpand) * 0.03;
          }
          
          p.opacity = p.baseOpacity * Math.max(0, 1 - (distExpand / this.cachedMaxDistance));
          if (distExpand > this.cachedMaxDistance || distExpand === 0) {
            p.x = originX + (Math.random() - 0.5) * 20;
            p.y = originY + (Math.random() - 0.5) * 20;
            p.vx = 0; p.vy = 0;
          }
          break;
          
        case 'articles':
          // Pages drifting upwards like leaves the wind
          p.vy -= 0.02;
          p.vx += Math.sin(p.y * 0.01 + p.twinklePhase) * 0.01;
          if (p.vy < -1.5) p.vy = -1.5;
          p.rotationSpeed = (Math.random() - 0.5) * 0.02;
          p.rotation += p.rotationSpeed;
          break;
          
        case 'about':
          // Constellation-like gentle drifting
          p.vx += (Math.random() - 0.5) * 0.005;
          p.vy += (Math.random() - 0.5) * 0.005;
          const dxAbout = this.centerX - p.x;
          const dyAbout = this.centerY - p.y;
          p.vx += dxAbout * 0.00001;
          p.vy += dyAbout * 0.00001;
          break;
      }

      // 2. Mouse Interaction
      if (this.isMouseActive && this.mode !== 'expand') {
        const dx = this.mouseX - p.x;
        const dy = this.mouseY - p.y;
        const distSq = dx * dx + dy * dy;
        const influenceRadiusSq = influenceRadius * influenceRadius;
        
        if (distSq < influenceRadiusSq) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / influenceRadius) * this.config.mouseInfluence;
          const angle = Math.atan2(dy, dx);

          switch (this.mode) {
            case 'galaxy':
              // Black hole: suck in and swirl tangentially
              p.vx += Math.cos(angle) * force * 0.5;
              p.vy += Math.sin(angle) * force * 0.5;
              p.vx += Math.cos(angle + Math.PI/2) * force * 0.8;
              p.vy += Math.sin(angle + Math.PI/2) * force * 0.8;
              break;
              
            case 'network':
            case 'ai':
            case 'about':
              // Strong attraction
              p.vx += Math.cos(angle) * force * 0.8;
              p.vy += Math.sin(angle) * force * 0.8;
              break;
              
            case 'flow':
              // Slipstream: boost X velocity
              p.vx += force * 1.5;
              p.opacity = Math.min(1, p.baseOpacity + force);
              break;
              
            case 'data':
            case 'articles':
              // Deflector shield umbrella / scatter
              p.vx -= Math.cos(angle) * force * 2;
              p.vy -= Math.max(0, Math.sin(angle) * force * 2);
              if (this.mode === 'articles') {
                 p.rotationSpeed += (Math.random() - 0.5) * force;
              }
              break;
              
            case 'waves':
              // Resonance disruption
              p.y += Math.sin(p.x * 0.05 + p.twinklePhase) * force * 10;
              p.opacity = Math.min(1, p.baseOpacity * (1 + force * 2));
              break;
              
            case 'logic':
              // Avoidance (force orthogonal scatter)
              if (Math.abs(dx) > Math.abs(dy)) {
                p.vx = (dx > 0 ? -1 : 1) * force * 3;
                p.vy = 0;
              } else {
                p.vx = 0;
                p.vy = (dy > 0 ? -1 : 1) * force * 3;
              }
              break;
              
            case 'sys':
              // Orbit the mouse like a gear
              p.vx = -Math.sin(angle) * force * 3;
              p.vy = Math.cos(angle) * force * 3;
              break;
          }
        }
      }

      // 3. Apply Velocity
      p.x += p.vx;
      p.y += p.vy;

      // 4. Wrap-Around (excluding expand mode)
      if (this.mode !== 'expand') {
        this.applyBoundaryWrap(p, width, height);
      }

      // 5. Damping
      p.vx *= CONSTANTS.DAMPING_FACTOR;
      p.vy *= CONSTANTS.DAMPING_FACTOR;
      
      // 6. Natural Twinkle
      this.applyNaturalTwinkle(p);
    });
  }

  private draw() {
    const { width, height } = this.cachedLogicalSize;
    this.ctx.clearRect(0, 0, width, height);

    if (this.config.lineLinked) {
      this.drawLinks();
    }

    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      
      if (p.shape === 'square') {
        if (this.mode === 'articles') {
          // Draw floating rotated "pages"
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);
          this.ctx.fillRect(-p.radius, -p.radius * 1.5, p.radius * 2, p.radius * 3);
          // Inner page content representation
          this.ctx.fillStyle = this.isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
          this.ctx.fillRect(-p.radius * 0.6, -p.radius * 1.0, p.radius * 1.2, p.radius * 0.2);
          this.ctx.fillRect(-p.radius * 0.6, -p.radius * 0.5, p.radius * 1.2, p.radius * 0.2);
          this.ctx.fillRect(-p.radius * 0.6, 0, p.radius * 0.8, p.radius * 0.2);
        } else {
          this.ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
        }
      } else if (p.shape === 'star') {
        this.drawStar(p.x, p.y, 5, p.radius * 2, p.radius);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
  }

  private drawLinks() {
    this.ctx.save();
    
    // 1. Draw connections between particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONSTANTS.LINK_DISTANCE) {
          const opacity = (1 - dist / CONSTANTS.LINK_DISTANCE) * CONSTANTS.LINK_OPACITY_MAX;
          this.ctx.strokeStyle = this.getLinkStrokeStyle(opacity);
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    
    // 2. Draw active connections to the mouse cursor for relevant modes
    if (this.isMouseActive && (this.mode === 'network' || this.mode === 'ai' || this.mode === 'about')) {
      const { width, height } = this.cachedLogicalSize;
      const influenceRadius = Math.min(width, height) * CONSTANTS.MOUSE_INFLUENCE_RADIUS_FACTOR;
      
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const dx = this.mouseX - p.x;
        const dy = this.mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < influenceRadius) {
          const opacity = (1 - dist / influenceRadius) * (this.mode === 'ai' ? 0.8 : 0.5);
          this.ctx.strokeStyle = this.getLinkStrokeStyle(opacity, this.mode === 'ai');
          this.ctx.lineWidth = this.mode === 'ai' ? 1.5 : 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(this.mouseX, this.mouseY);
          this.ctx.lineTo(p.x, p.y);
          this.ctx.stroke();
        }
      }
    }
    
    this.ctx.restore();
  }

  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        this.ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        this.ctx.lineTo(x, y);
        rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private animate() {
    if (this.isDisabled) return;
    this.updateParticles();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
  }

  private applyBoundaryWrap(particle: Particle, width: number, height: number): void {
    if (particle.x < -CONSTANTS.BOUNDARY_OFFSET) {
      particle.x = width + CONSTANTS.BOUNDARY_OFFSET;
    }
    if (particle.x > width + CONSTANTS.BOUNDARY_OFFSET) {
      particle.x = -CONSTANTS.BOUNDARY_OFFSET;
    }
    if (particle.y < -CONSTANTS.BOUNDARY_OFFSET) {
      particle.y = height + CONSTANTS.BOUNDARY_OFFSET;
    }
    if (particle.y > height + CONSTANTS.BOUNDARY_OFFSET) {
      particle.y = -CONSTANTS.BOUNDARY_OFFSET;
    }
  }

  private applyNaturalTwinkle(particle: Particle): void {
    particle.twinklePhase += particle.twinkleSpeed;
    if (this.mode !== 'expand' && this.mode !== 'flow' && this.mode !== 'waves') {
      particle.opacity = particle.baseOpacity * (Math.sin(particle.twinklePhase) * 0.2 + 0.8);
    }
  }

  private getLinkStrokeStyle(opacity: number, preferAccentInLightMode: boolean = false): string {
    if (!this.isLightMode) {
      return `rgba(${this.accentColorRgb},${opacity})`;
    }

    return preferAccentInLightMode
      ? `rgba(${this.accentColorRgb},${opacity})`
      : `rgba(0,0,0,${opacity})`;
  }

  public destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }

    if (this.mouseLeaveHandler) {
      document.removeEventListener('mouseleave', this.mouseLeaveHandler);
      this.mouseLeaveHandler = null;
    }
  }
}
