// Galaxy particle system

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

export class GalaxyParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private isMouseActive = false;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private centerX = 0;
  private centerY = 0;
  
  // Configuration
  private config = {
    starCount: 0,
    accentStarRatio: 0.15,
    nebulaRatio: 0.05,
    speed: 0,
    rotationSpeed: 0,
    twinkleSpeed: 0,
    mouseInfluence: 0,
  };

  // Theme colors
  private accentColor = '#A3E635';
  private starColors = ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0'];
  private nebulaColors: string[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    this.initializeConfig();
    this.setupCanvas();
    this.createStars();
    this.setupEventListeners();
    this.animate();
  }

  private initializeConfig() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024 && window.innerWidth >= 768;

    // Set config based on device
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
  }

  private updateThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    this.accentColor = computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
    
    // Create nebula colors from accent color
    this.nebulaColors = [
      this.accentColor,
      this.adjustBrightness(this.accentColor, 0.7),
      this.adjustBrightness(this.accentColor, 0.5),
      this.adjustBrightness(this.accentColor, 0.3),
    ];
  }

  private adjustBrightness(color: string, factor: number): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate adjusted brightness
    const newR = Math.floor(r * factor);
    const newG = Math.floor(g * factor);
    const newB = Math.floor(b * factor);
    
    // Return hex color
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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
      
      // Update center position
      const logicalSize = this.getCanvasLogicalSize();
      this.centerX = logicalSize.width / 2;
      this.centerY = logicalSize.height / 2;
    };

    resize();
    window.addEventListener('resize', resize);
    
    // Watch container size changes
    if (this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private getCanvasLogicalSize() {
    const dpr = window.devicePixelRatio || 1;
    return {
      width: this.canvas.width / dpr,
      height: this.canvas.height / dpr,
    };
  }

  private createStars() {
    this.stars = [];
    const logicalSize = this.getCanvasLogicalSize();
    this.centerX = logicalSize.width / 2;
    this.centerY = logicalSize.height / 2;
    
    const maxDistance = Math.sqrt(logicalSize.width ** 2 + logicalSize.height ** 2) / 2;
    
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
      const distance = Math.random() * maxDistance * 0.8;
      const spiralTightness = 0.3;
      const spiralAngle = angle + (distance / maxDistance) * Math.PI * 2 * spiralTightness;
      
      const x = this.centerX + Math.cos(spiralAngle) * distance;
      const y = this.centerY + Math.sin(spiralAngle) * distance;

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

      const star: Star = {
        x,
        y,
        vx,
        vy,
        radius: baseRadius,
        baseRadius,
        opacity: Math.random() * 0.4 + 0.3,
        baseOpacity: Math.random() * 0.4 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: this.config.twinkleSpeed * (0.5 + Math.random() * 0.5),
        color: type === 'accent-star' 
          ? this.accentColor 
          : type === 'nebula'
          ? this.nebulaColors[Math.floor(Math.random() * this.nebulaColors.length)]
          : this.starColors[Math.floor(Math.random() * this.starColors.length)],
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed,
        distanceFromCenter: distance,
        angle: spiralAngle,
      };

      this.stars.push(star);
    }
  }

  private setupEventListeners() {
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const logicalSize = this.getCanvasLogicalSize();
      this.mouseX = ((e.clientX - rect.left) / rect.width) * logicalSize.width;
      this.mouseY = ((e.clientY - rect.top) / rect.height) * logicalSize.height;
      this.isMouseActive = true;
    };

    const handleMouseLeave = () => {
      this.isMouseActive = false;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Watch for theme changes
    const themeObserver = new MutationObserver(() => {
      this.updateThemeColors();
      this.stars.forEach(star => {
        if (star.type === 'accent-star') {
          star.color = this.accentColor;
        } else if (star.type === 'nebula') {
          star.color = this.nebulaColors[Math.floor(Math.random() * this.nebulaColors.length)];
        }
      });
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private updateStars() {
    const logicalSize = this.getCanvasLogicalSize();
    this.centerX = logicalSize.width / 2;
    this.centerY = logicalSize.height / 2;
    const maxDistance = Math.sqrt(logicalSize.width ** 2 + logicalSize.height ** 2) / 2;

    this.stars.forEach((star) => {
      // Update rotation
      star.rotation += star.rotationSpeed;
      
      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
      star.opacity = star.baseOpacity * twinkle;
      star.radius = star.baseRadius * (0.8 + twinkle * 0.2);

      // Handle mouse interaction
      if (this.isMouseActive) {
        const dx = this.mouseX - star.x;
        const dy = this.mouseY - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = Math.min(logicalSize.width, logicalSize.height) * 0.3;

        if (distance < influenceRadius) {
          const influence = (1 - distance / influenceRadius) * this.config.mouseInfluence;
          const angle = Math.atan2(dy, dx);
          
          // Push away from mouse
          star.vx -= Math.cos(angle) * influence * 0.01;
          star.vy -= Math.sin(angle) * influence * 0.01;
          
          // Brighten near mouse
          star.opacity = Math.min(star.baseOpacity * 1.5, 1);
        }
      }

      // Update position
      star.x += star.vx;
      star.y += star.vy;

      // Maintain spiral structure
      const dx = star.x - this.centerX;
      const dy = star.y - this.centerY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const targetDistance = star.distanceFromCenter;
      
      if (Math.abs(currentDistance - targetDistance) > 10) {
        const pullStrength = 0.0001;
        const pullAngle = Math.atan2(dy, dx);
        const targetX = this.centerX + Math.cos(pullAngle) * targetDistance;
        const targetY = this.centerY + Math.sin(pullAngle) * targetDistance;
        
        star.vx += (targetX - star.x) * pullStrength;
        star.vy += (targetY - star.y) * pullStrength;
      }

      // Update spiral angle
      star.angle += star.rotationSpeed * 10;
      const spiralTightness = 0.3;
      const spiralAngle = star.angle + (star.distanceFromCenter / maxDistance) * Math.PI * 2 * spiralTightness;
      
      // Apply spiral correction
      const targetX = this.centerX + Math.cos(spiralAngle) * star.distanceFromCenter;
      const targetY = this.centerY + Math.sin(spiralAngle) * star.distanceFromCenter;
      star.vx += (targetX - star.x) * 0.00005;
      star.vy += (targetY - star.y) * 0.00005;

      // Wrap around boundaries
      if (star.x < -50) star.x = logicalSize.width + 50;
      if (star.x > logicalSize.width + 50) star.x = -50;
      if (star.y < -50) star.y = logicalSize.height + 50;
      if (star.y > logicalSize.height + 50) star.y = -50;

      // Apply damping
      star.vx *= 0.99;
      star.vy *= 0.99;
    });
  }

  private draw() {
    const logicalSize = this.getCanvasLogicalSize();

    // Clear canvas
    this.ctx.clearRect(0, 0, logicalSize.width, logicalSize.height);

    // Draw stars
    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.globalAlpha = star.opacity;
      
      if (star.type === 'nebula') {
        // Draw nebula with glow
        const gradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 2
        );
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(0.5, this.adjustBrightness(star.color, 0.5));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (star.type === 'accent-star') {
        // Draw accent star with glow
        const gradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 3
        );
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(0.3, this.adjustBrightness(star.color, 0.6));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw core
        this.ctx.fillStyle = star.color;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Draw regular star
        this.ctx.fillStyle = star.color;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow for larger stars
        if (star.radius > 1) {
          this.ctx.globalAlpha = star.opacity * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      
      this.ctx.restore();
    });

    this.ctx.globalAlpha = 1;
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
  }
}
