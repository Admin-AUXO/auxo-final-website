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
    accentStarRatio: 0.15,
    nebulaRatio: 0.05,
    speed: 0,
    rotationSpeed: 0,
    twinkleSpeed: 0,
    mouseInfluence: 0,
  };

  // Theme colors
  private accentColor = '#A3E635';
  private starColors: string[] = [];
  private nebulaColors: string[] = [];
  private isLightMode = false;
  private textPrimary = '#FFFFFF';
  private textSecondary = '#A0A0A0';

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
    
    // Set shooting star interval (random between 2-5 seconds)
    this.shootingStarInterval = (Math.random() * 3000 + 2000);
  }
  
  private initializeShootingStars() {
    // Create initial shooting stars
    this.shootingStars = [];
    this.lastShootingStarTime = Date.now();
  }
  
  private createShootingStar() {
    const logicalSize = this.getCanvasLogicalSize();
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    
    let x: number, y: number, vx: number, vy: number;
    const speed = 0.5 + Math.random() * 0.5; // Speed variation
    const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.25; // Diagonal angles
    
    switch (side) {
      case 0: // Top
        x = Math.random() * logicalSize.width;
        y = -20;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        break;
      case 1: // Right
        x = logicalSize.width + 20;
        y = Math.random() * logicalSize.height;
        vx = -Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        break;
      case 2: // Bottom
        x = Math.random() * logicalSize.width;
        y = logicalSize.height + 20;
        vx = Math.cos(angle) * speed;
        vy = -Math.sin(angle) * speed;
        break;
      default: // Left
        x = -20;
        y = Math.random() * logicalSize.height;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        break;
    }
    
    // Fixed ranges for shooting star sizes
    const minTailLength = 80;
    const maxTailLength = 150;
    const minHeadRadius = 3;
    const maxHeadRadius = 5;
    const minLife = 150;
    const maxLife = 250;
    
    const length = minTailLength + Math.random() * (maxTailLength - minTailLength);
    const headRadius = minHeadRadius + Math.random() * (maxHeadRadius - minHeadRadius);
    const maxLifeValue = minLife + Math.random() * (maxLife - minLife);
    
    // Use accent color for shooting stars
    const color = this.accentColor;
    
    this.shootingStars.push({
      x,
      y,
      vx,
      vy,
      length,
      opacity: 1,
      color,
      life: 0,
      maxLife: maxLifeValue,
      headRadius, // Add head radius to interface
    });
  }

  private updateThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    this.accentColor = computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
    this.textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || '#FFFFFF';
    this.textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || '#A0A0A0';
    
    // Detect light mode
    this.isLightMode = root.classList.contains('light');
    
    // Set star colors based on theme
    if (this.isLightMode) {
      // For light mode: use subtle dark colors for galaxy effect
      // Mix dark grays and subtle blues for depth
      this.starColors = [
        '#1F2937', // Dark gray
        '#374151', // Medium-dark gray
        '#4B5563', // Medium gray
        '#6B7280', // Lighter gray
        '#374151', // Repeat for variety
        '#1F2937', // Darker for depth
      ];
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
        this.accentColor, // Base accent (forest green in light mode)
        this.adjustBrightness(this.accentColor, 0.8), // Slightly lighter
        this.adjustBrightness(this.accentColor, 0.6), // Medium
        this.blendColors(this.accentColor, '#6B7280', 0.3), // Blended with gray for subtlety
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
  
  private lightenColor(color: string, factor: number): string {
    // Lighten a color by blending with white
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Blend with white (255, 255, 255)
    const newR = Math.floor(r + (255 - r) * factor);
    const newG = Math.floor(g + (255 - g) * factor);
    const newB = Math.floor(b + (255 - b) * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  private getGlowColor(baseColor: string, isLightMode: boolean): string {
    if (isLightMode) {
      // For light mode, lighten the color instead of darkening to avoid grey
      return this.lightenColor(baseColor, 0.3);
    } else {
      // For dark mode, use original brightness adjustment
      return this.adjustBrightness(baseColor, 0.6);
    }
  }

  private blendColors(color1: string, color2: string, ratio: number): string {
    // Blend two colors together
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.floor(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.floor(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.floor(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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

      // Adjust opacity based on theme
      const baseOpacity = this.isLightMode 
        ? Math.random() * 0.3 + 0.4  // Moderate opacity for light mode visibility (0.4-0.7)
        : Math.random() * 0.4 + 0.3; // Lower opacity for dark mode subtlety

      const star: Star = {
        x,
        y,
        vx,
        vy,
        radius: baseRadius,
        baseRadius,
        opacity: baseOpacity,
        baseOpacity: baseOpacity,
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
      const wasLightMode = this.isLightMode;
      this.updateThemeColors();
      
      // Update all stars when theme changes
      this.stars.forEach(star => {
        if (star.type === 'accent-star') {
          star.color = this.accentColor;
        } else if (star.type === 'nebula') {
          star.color = this.nebulaColors[Math.floor(Math.random() * this.nebulaColors.length)];
        } else {
          // Update regular star colors
          star.color = this.starColors[Math.floor(Math.random() * this.starColors.length)];
        }
        
        // Adjust opacity when switching themes
        if (wasLightMode !== this.isLightMode) {
          star.baseOpacity = this.isLightMode 
            ? Math.random() * 0.3 + 0.4  // Moderate opacity for light mode (0.4-0.7)
            : Math.random() * 0.4 + 0.3; // Lower opacity for dark mode
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
    const logicalSize = this.getCanvasLogicalSize();
    this.centerX = logicalSize.width / 2;
    this.centerY = logicalSize.height / 2;
    const maxDistance = Math.sqrt(logicalSize.width ** 2 + logicalSize.height ** 2) / 2;
    
    // Update shooting stars
    const now = Date.now();
    if (now - this.lastShootingStarTime > this.shootingStarInterval) {
      this.createShootingStar();
      this.lastShootingStarTime = now;
      this.shootingStarInterval = (Math.random() * 3000 + 2000); // Next star in 2-5 seconds
    }
    
    // Update shooting star positions and remove dead ones
    this.shootingStars = this.shootingStars.filter(shootingStar => {
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life++;
      
      // Remove if dead or out of bounds
      const isDead = shootingStar.life >= shootingStar.maxLife;
      const isOutOfBounds = shootingStar.x < -50 || shootingStar.x > logicalSize.width + 50 ||
                            shootingStar.y < -50 || shootingStar.y > logicalSize.height + 50;
      
      return !isDead && !isOutOfBounds;
    });

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
        // Draw nebula with glow using accent color
        const glowRadius = star.radius * (this.isLightMode ? 3 : 2);
        const gradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowRadius
        );
        
        if (this.isLightMode) {
          // For light mode: softer, more transparent nebula effect
          const rgb = this.hexToRgb(this.accentColor);
          gradient.addColorStop(0, `rgba(${rgb}, ${star.opacity * 0.8})`);
          gradient.addColorStop(0.3, `rgba(${rgb}, ${star.opacity * 0.5})`);
          gradient.addColorStop(0.6, `rgba(${rgb}, ${star.opacity * 0.2})`);
          gradient.addColorStop(1, 'transparent');
        } else {
          // For dark mode: use accent color variations
          gradient.addColorStop(0, this.accentColor);
          gradient.addColorStop(0.5, this.adjustBrightness(this.accentColor, 0.5));
          gradient.addColorStop(1, 'transparent');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (star.type === 'accent-star') {
        // Draw accent star with glow using accent color
        const glowRadius = star.radius * (this.isLightMode ? 4 : 3);
        const gradient = this.ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowRadius
        );
        
        if (this.isLightMode) {
          // For light mode: softer glow with accent color
          const rgb = this.hexToRgb(this.accentColor);
          gradient.addColorStop(0, `rgba(${rgb}, ${star.opacity * 0.9})`);
          gradient.addColorStop(0.2, `rgba(${rgb}, ${star.opacity * 0.7})`);
          gradient.addColorStop(0.5, `rgba(${rgb}, ${star.opacity * 0.4})`);
          gradient.addColorStop(0.8, `rgba(${rgb}, ${star.opacity * 0.15})`);
          gradient.addColorStop(1, 'transparent');
        } else {
          // For dark mode: use accent color variations
          gradient.addColorStop(0, this.accentColor);
          gradient.addColorStop(0.3, this.adjustBrightness(this.accentColor, 0.6));
          gradient.addColorStop(1, 'transparent');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw core using accent color with adjusted opacity
        if (this.isLightMode) {
          const rgb = this.hexToRgb(this.accentColor);
          this.ctx.fillStyle = `rgba(${rgb}, ${star.opacity})`;
        } else {
          this.ctx.fillStyle = this.accentColor;
        }
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Draw regular star
        if (this.isLightMode) {
          // For light mode: use star color with opacity
          const rgb = this.hexToRgb(star.color);
          this.ctx.fillStyle = `rgba(${rgb}, ${star.opacity})`;
        } else {
          this.ctx.fillStyle = star.color;
        }
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow for larger stars - theme-aware
        if (star.radius > 1) {
          if (this.isLightMode) {
            // Subtle glow for light mode
            const rgb = this.hexToRgb(star.color);
            this.ctx.globalAlpha = star.opacity * 0.2;
            const glowGradient = this.ctx.createRadialGradient(
              star.x, star.y, star.radius,
              star.x, star.y, star.radius * 2.5
            );
            glowGradient.addColorStop(0, `rgba(${rgb}, ${star.opacity * 0.3})`);
            glowGradient.addColorStop(0.4, `rgba(${rgb}, ${star.opacity * 0.1})`);
            glowGradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glowGradient;
          } else {
            // Original glow for dark mode
            this.ctx.globalAlpha = star.opacity * 0.3;
            this.ctx.fillStyle = star.color;
          }
          this.ctx.beginPath();
          this.ctx.arc(star.x, star.y, star.radius * (this.isLightMode ? 2.5 : 2), 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      
      this.ctx.restore();
    });

    // Draw shooting stars
    this.shootingStars.forEach(shootingStar => {
      this.ctx.save();
      
      // Calculate tail end position
      const tailX = shootingStar.x - shootingStar.vx * shootingStar.length;
      const tailY = shootingStar.y - shootingStar.vy * shootingStar.length;
      
      // Create gradient for tail
      const gradient = this.ctx.createLinearGradient(
        tailX, tailY,
        shootingStar.x, shootingStar.y
      );
      
      // Tail opacity based on life
      const lifeRatio = shootingStar.life / shootingStar.maxLife;
      const opacity = shootingStar.opacity * (1 - lifeRatio);
      
      // Use accent color for tail
      if (this.isLightMode) {
        // For light mode: visible but subtle tail using accent color
        const rgb = this.hexToRgb(this.accentColor);
        gradient.addColorStop(0, `rgba(${rgb}, ${opacity * 0.2})`);
        gradient.addColorStop(0.5, `rgba(${rgb}, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${rgb}, ${opacity * 0.7})`);
      } else {
        // For dark mode: bright tail using accent color
        gradient.addColorStop(0, `rgba(${this.hexToRgb(this.accentColor)}, ${opacity * 0.2})`);
        gradient.addColorStop(0.5, `rgba(${this.hexToRgb(this.accentColor)}, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${this.hexToRgb(this.accentColor)}, ${opacity})`);
      }
      
      // Draw tail with varying width based on head size
      const tailWidth = Math.max(2, shootingStar.headRadius * 0.8);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = tailWidth;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(shootingStar.x, shootingStar.y);
      this.ctx.stroke();
      
      // Draw bright head using headRadius and accent color
      this.ctx.globalAlpha = opacity;
      if (this.isLightMode) {
        const rgb = this.hexToRgb(this.accentColor);
        this.ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
      } else {
        this.ctx.fillStyle = this.accentColor;
      }
      this.ctx.beginPath();
      this.ctx.arc(shootingStar.x, shootingStar.y, shootingStar.headRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add glow to head - use accent color
      const glowRadius = shootingStar.headRadius * (this.isLightMode ? 3 : 2.5);
      const headGlow = this.ctx.createRadialGradient(
        shootingStar.x, shootingStar.y, 0,
        shootingStar.x, shootingStar.y, glowRadius
      );
      if (this.isLightMode) {
        const rgb = this.hexToRgb(this.accentColor);
        headGlow.addColorStop(0, `rgba(${rgb}, ${opacity})`);
        headGlow.addColorStop(0.5, `rgba(${rgb}, ${opacity * 0.4})`);
        headGlow.addColorStop(1, 'transparent');
      } else {
        headGlow.addColorStop(0, `rgba(${this.hexToRgb(this.accentColor)}, ${opacity})`);
        headGlow.addColorStop(0.5, `rgba(${this.hexToRgb(this.accentColor)}, ${opacity * 0.3})`);
        headGlow.addColorStop(1, 'transparent');
      }
      this.ctx.fillStyle = headGlow;
      this.ctx.beginPath();
      this.ctx.arc(shootingStar.x, shootingStar.y, glowRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });

    this.ctx.globalAlpha = 1;
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
