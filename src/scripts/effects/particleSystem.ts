import { BREAKPOINTS } from '../core/constants';
import { logger } from '@/lib/logger';

export type ParticleMode =
  | 'galaxy'
  | 'network'
  | 'flow'
  | 'data'
  | 'waves'
  | 'logic'
  | 'sys'
  | 'ai'
  | 'expand'
  | 'articles'
  | 'about';

type ParticleShape = 'circle' | 'square' | 'diamond' | 'bar' | 'page';
type SpawnPattern =
  | 'rings'
  | 'grid'
  | 'left'
  | 'columns'
  | 'bands'
  | 'cluster'
  | 'center'
  | 'bottom';

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
  shape: ParticleShape;
  rotation: number;
  rotationSpeed: number;
  distanceFromCenter: number;
  angle: number;
  anchorX: number;
  anchorY: number;
  speed: number;
  isAccent: boolean;
  pulsePhase: number;
  stepAxis: 'x' | 'y';
  stepDirection: 1 | -1;
  clusterIndex: number;
}

interface ModeSettings {
  accentProbability: number;
  baseSpeed: number;
  countScale: number;
  lineLinked: boolean;
  linkDistance: number;
  maxLinks: number;
  mouseInfluence: number;
  opacity: [min: number, max: number];
  radius: [min: number, max: number];
  shapes: readonly ParticleShape[];
  spawn: SpawnPattern;
}

const CONSTANTS = {
  BOUNDARY_OFFSET: 56,
  DAMPING_FACTOR: 0.94,
  MAX_DPR: 1.75,
  MOBILE_BREAKPOINT: BREAKPOINTS.SM,
  MOUSE_INFLUENCE_RADIUS_FACTOR: 0.24,
  TABLET_BREAKPOINT: BREAKPOINTS.LG,
} as const;

const MODE_SETTINGS: Record<ParticleMode, ModeSettings> = {
  galaxy: {
    accentProbability: 0.16,
    baseSpeed: 0.22,
    countScale: 1,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.42,
    opacity: [0.12, 0.34],
    radius: [0.7, 2.2],
    shapes: ['circle', 'diamond'],
    spawn: 'rings',
  },
  network: {
    accentProbability: 0.08,
    baseSpeed: 0.11,
    countScale: 0.7,
    lineLinked: true,
    linkDistance: 118,
    maxLinks: 2,
    mouseInfluence: 0.34,
    opacity: [0.16, 0.32],
    radius: [1, 2.4],
    shapes: ['circle', 'diamond'],
    spawn: 'grid',
  },
  flow: {
    accentProbability: 0.12,
    baseSpeed: 0.28,
    countScale: 0.74,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.28,
    opacity: [0.12, 0.3],
    radius: [0.9, 2],
    shapes: ['circle', 'bar'],
    spawn: 'left',
  },
  data: {
    accentProbability: 0.18,
    baseSpeed: 0.17,
    countScale: 0.56,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.2,
    opacity: [0.18, 0.34],
    radius: [1.4, 3.2],
    shapes: ['square', 'bar'],
    spawn: 'columns',
  },
  waves: {
    accentProbability: 0.1,
    baseSpeed: 0.14,
    countScale: 0.52,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.18,
    opacity: [0.16, 0.28],
    radius: [1, 2.1],
    shapes: ['circle'],
    spawn: 'bands',
  },
  logic: {
    accentProbability: 0.12,
    baseSpeed: 0.1,
    countScale: 0.48,
    lineLinked: true,
    linkDistance: 92,
    maxLinks: 1,
    mouseInfluence: 0.28,
    opacity: [0.16, 0.3],
    radius: [1.1, 2.5],
    shapes: ['square', 'diamond'],
    spawn: 'grid',
  },
  sys: {
    accentProbability: 0.14,
    baseSpeed: 0.18,
    countScale: 0.62,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.24,
    opacity: [0.14, 0.3],
    radius: [1, 2.5],
    shapes: ['circle', 'diamond', 'bar'],
    spawn: 'rings',
  },
  ai: {
    accentProbability: 0.24,
    baseSpeed: 0.12,
    countScale: 0.68,
    lineLinked: true,
    linkDistance: 104,
    maxLinks: 2,
    mouseInfluence: 0.42,
    opacity: [0.16, 0.34],
    radius: [1, 2.7],
    shapes: ['circle', 'diamond'],
    spawn: 'cluster',
  },
  expand: {
    accentProbability: 0.16,
    baseSpeed: 0.15,
    countScale: 0.44,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.16,
    opacity: [0.18, 0.34],
    radius: [1, 2.4],
    shapes: ['circle', 'diamond'],
    spawn: 'center',
  },
  articles: {
    accentProbability: 0.1,
    baseSpeed: 0.13,
    countScale: 0.34,
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0.18,
    opacity: [0.16, 0.28],
    radius: [2, 3.8],
    shapes: ['page'],
    spawn: 'bottom',
  },
  about: {
    accentProbability: 0.1,
    baseSpeed: 0.08,
    countScale: 0.58,
    lineLinked: true,
    linkDistance: 124,
    maxLinks: 1,
    mouseInfluence: 0.2,
    opacity: [0.16, 0.3],
    radius: [1, 2.3],
    shapes: ['circle', 'diamond'],
    spawn: 'cluster',
  },
} as const;

interface DeviceCapabilities {
  isLowEnd: boolean;
}

interface ConnectionInfoLike {
  effectiveType?: string;
  saveData?: boolean;
}

interface NavigatorCapabilities extends Navigator {
  connection?: ConnectionInfoLike;
  deviceMemory?: number;
  mozConnection?: ConnectionInfoLike;
  webkitConnection?: ConnectionInfoLike;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export class GalaxyParticleSystem {
  private animationId: number | null = null;
  private cachedLogicalSize = { height: 0, width: 0 };
  private cachedMaxDistance = 0;
  private canvas: HTMLCanvasElement;
  private centerX = 0;
  private centerY = 0;
  private config = {
    lineLinked: false,
    linkDistance: 0,
    maxLinks: 0,
    mouseInfluence: 0,
    particleCount: 0,
    rotationSpeed: 0,
    speed: 0,
    twinkleSpeed: 0,
  };
  private ctx!: CanvasRenderingContext2D;
  private deviceCapabilities: DeviceCapabilities;
  private isDisabled = false;
  private isLightMode = false;
  private isMouseActive = false;
  private mode: ParticleMode = 'galaxy';
  private modeSettings: ModeSettings;
  private mouseLeaveHandler: (() => void) | null = null;
  private mouseMoveHandler: ((event: MouseEvent) => void) | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private particleColors: string[] = [];
  private particles: Particle[] = [];
  private pointerFine = false;
  private resizeHandler: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private textPrimary = '#FFFFFF';
  private textSecondary = '#A0A0A0';
  private themeObserver: MutationObserver | null = null;
  private visibilityHandler: (() => void) | null = null;
  private accentColor = '#A3E635';
  private accentColorRgb = '163, 230, 53';

  constructor(canvas: HTMLCanvasElement, mode: ParticleMode = 'galaxy') {
    this.canvas = canvas;
    this.mode = mode;
    this.modeSettings = MODE_SETTINGS[mode];
    this.deviceCapabilities = this.detectDeviceCapabilities();

    if (this.deviceCapabilities.isLowEnd) {
      this.isDisabled = true;
      logger.debug('[ParticleSystem] Disabled on constrained device');
      return;
    }

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.updateThemeColors();
    this.initializeConfig();
    this.setupCanvas();
    this.setupEventListeners();
    this.animate();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const browserNavigator = navigator as NavigatorCapabilities;
    const connection =
      browserNavigator.connection ||
      browserNavigator.mozConnection ||
      browserNavigator.webkitConnection;
    const memory = browserNavigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency || 4;
    const connectionType = connection?.effectiveType || 'unknown';
    const saveData = connection?.saveData === true;

    const isLowEnd =
      saveData ||
      memory < 4 ||
      cores < 4 ||
      connectionType === 'slow-2g' ||
      connectionType === '2g';

    return { isLowEnd };
  }

  private initializeConfig(): void {
    const width = window.innerWidth;
    const height = window.innerHeight || 900;
    const isMobile = width < CONSTANTS.MOBILE_BREAKPOINT;
    const isTablet =
      width < CONSTANTS.TABLET_BREAKPOINT && width >= CONSTANTS.MOBILE_BREAKPOINT;
    const areaFactor = clamp((width * height) / (1440 * 900), 0.78, 1.12);

    let baseCount = 78;
    if (isMobile) baseCount = 32;
    else if (isTablet) baseCount = 54;

    this.config.particleCount = Math.max(
      16,
      Math.floor(baseCount * this.modeSettings.countScale * areaFactor),
    );
    this.config.speed = this.modeSettings.baseSpeed * (isMobile ? 0.88 : 1);
    this.config.rotationSpeed = this.config.speed * 0.035;
    this.config.twinkleSpeed = 0.012;
    this.config.mouseInfluence = this.modeSettings.mouseInfluence * (isMobile ? 0.72 : 1);
    this.config.lineLinked = this.modeSettings.lineLinked;
    this.config.linkDistance = this.modeSettings.linkDistance * (isMobile ? 0.86 : 1);
    this.config.maxLinks = isMobile
      ? Math.max(1, this.modeSettings.maxLinks - 1)
      : this.modeSettings.maxLinks;
  }

  private updateThemeColors(): void {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    this.accentColor =
      computedStyle.getPropertyValue('--accent-green').trim() || '#A3E635';
    this.textPrimary =
      computedStyle.getPropertyValue('--text-primary').trim() || '#FFFFFF';
    this.textSecondary =
      computedStyle.getPropertyValue('--text-secondary').trim() || '#A0A0A0';
    this.isLightMode = root.classList.contains('light');
    this.accentColorRgb = this.hexToRgb(this.accentColor);

    this.particleColors = this.isLightMode
      ? ['#1F2937', '#334155', '#475569']
      : [this.textPrimary, this.textSecondary, 'rgba(255,255,255,0.7)'];
  }

  private setupCanvas(): void {
    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const logicalWidth = Math.floor(rect.width);
      const logicalHeight = Math.floor(rect.height);

      if (!logicalWidth || !logicalHeight) return;

      const previousWidth = this.cachedLogicalSize.width;
      const previousHeight = this.cachedLogicalSize.height;
      const dpr = Math.min(window.devicePixelRatio || 1, CONSTANTS.MAX_DPR);
      this.canvas.width = Math.round(logicalWidth * dpr);
      this.canvas.height = Math.round(logicalHeight * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.updateCanvasCache();
      this.initializeConfig();

      const sizeChanged =
        !this.particles.length ||
        Math.abs(previousWidth - this.cachedLogicalSize.width) > 2 ||
        Math.abs(previousHeight - this.cachedLogicalSize.height) > 2;

      if (sizeChanged) {
        this.createParticles();
      }
    };

    this.resizeHandler = resize;
    resize();

    window.addEventListener('resize', resize, { passive: true });

    if (this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  private updateCanvasCache(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, CONSTANTS.MAX_DPR);
    this.cachedLogicalSize = {
      height: this.canvas.height / dpr,
      width: this.canvas.width / dpr,
    };
    this.centerX = this.cachedLogicalSize.width / 2;
    this.centerY = this.cachedLogicalSize.height / 2;
    this.cachedMaxDistance = Math.sqrt(this.centerX ** 2 + this.centerY ** 2);
  }

  private setupEventListeners(): void {
    this.pointerFine = window.matchMedia('(pointer: fine)').matches;

    if (this.pointerFine) {
      this.mouseMoveHandler = (event: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        this.isMouseActive =
          this.mouseX >= 0 &&
          this.mouseY >= 0 &&
          this.mouseX <= rect.width &&
          this.mouseY <= rect.height;
      };

      this.mouseLeaveHandler = () => {
        this.isMouseActive = false;
      };

      document.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
      document.addEventListener('mouseleave', this.mouseLeaveHandler);
    }

    this.themeObserver = new MutationObserver(() => {
      this.updateThemeColors();
      this.applyThemeToParticles();
    });
    this.themeObserver.observe(document.documentElement, {
      attributeFilter: ['class'],
      attributes: true,
    });

    this.visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        if (this.animationId !== null) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
        return;
      }

      if (this.animationId === null && !this.isDisabled) {
        this.animate();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private createParticles(): void {
    const { width, height } = this.cachedLogicalSize;
    if (!width || !height) return;

    this.particles = [];

    for (let index = 0; index < this.config.particleCount; index += 1) {
      const spawn = this.getSpawnPoint(index, this.config.particleCount);
      const shape = this.pickShape(this.modeSettings.shapes);
      const baseRadius = randomInRange(
        this.modeSettings.radius[0],
        this.modeSettings.radius[1],
      );
      const isAccent = Math.random() < this.modeSettings.accentProbability;
      const speed = randomInRange(0.8, 1.25);
      const angle = Math.random() * Math.PI * 2;
      const rotation = Math.random() * Math.PI * 2;
      const distanceFromCenter = Math.sqrt(
        (spawn.x - this.centerX) ** 2 + (spawn.y - this.centerY) ** 2,
      );

      const particle: Particle = {
        anchorX: spawn.anchorX,
        anchorY: spawn.anchorY,
        angle,
        baseOpacity: randomInRange(
          this.modeSettings.opacity[0],
          this.modeSettings.opacity[1],
        ),
        baseRadius,
        clusterIndex: spawn.clusterIndex,
        color: this.getParticleColor(isAccent),
        distanceFromCenter,
        isAccent,
        opacity: randomInRange(
          this.modeSettings.opacity[0],
          this.modeSettings.opacity[1],
        ),
        pulsePhase: Math.random() * Math.PI * 2,
        radius: baseRadius,
        rotation,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        shape,
        speed,
        stepAxis: Math.random() > 0.5 ? 'x' : 'y',
        stepDirection: Math.random() > 0.5 ? 1 : -1,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: this.config.twinkleSpeed * randomInRange(0.8, 1.3),
        vx: Math.cos(angle) * this.config.speed * 0.12,
        vy: Math.sin(angle) * this.config.speed * 0.12,
        x: spawn.x,
        y: spawn.y,
      };

      this.seedModeSpecificState(particle, width, height);
      this.particles.push(particle);
    }
  }

  private seedModeSpecificState(
    particle: Particle,
    width: number,
    height: number,
  ): void {
    switch (this.mode) {
      case 'galaxy': {
        particle.distanceFromCenter = randomInRange(
          this.cachedMaxDistance * 0.12,
          this.cachedMaxDistance * 0.92,
        );
        particle.angle = Math.random() * Math.PI * 2;
        particle.x = this.centerX + Math.cos(particle.angle) * particle.distanceFromCenter;
        particle.y =
          this.centerY +
          Math.sin(particle.angle) * particle.distanceFromCenter * 0.82;
        particle.anchorX = particle.x;
        particle.anchorY = particle.y;
        break;
      }

      case 'sys': {
        particle.distanceFromCenter = randomInRange(
          this.cachedMaxDistance * 0.16,
          this.cachedMaxDistance * 0.52,
        );
        particle.angle = Math.random() * Math.PI * 2;
        particle.x = this.centerX + Math.cos(particle.angle) * particle.distanceFromCenter;
        particle.y =
          this.centerY +
          Math.sin(particle.angle) * particle.distanceFromCenter * 0.68;
        particle.anchorX = particle.x;
        particle.anchorY = particle.y;
        break;
      }

      case 'flow': {
        particle.x = randomInRange(-width * 0.22, width * 0.15);
        particle.y = randomInRange(0, height);
        particle.anchorY = particle.y;
        particle.vx = randomInRange(0.18, 0.4);
        particle.vy = 0;
        break;
      }

      case 'data': {
        particle.x = particle.anchorX + randomInRange(-6, 6);
        particle.y = randomInRange(-height * 0.08, height * 1.08);
        particle.vx = 0;
        particle.vy = randomInRange(0.08, 0.22);
        break;
      }

      case 'waves': {
        particle.x = randomInRange(-CONSTANTS.BOUNDARY_OFFSET, width + CONSTANTS.BOUNDARY_OFFSET);
        particle.y = particle.anchorY;
        particle.vx = 0;
        particle.vy = 0;
        break;
      }

      case 'expand': {
        particle.x = this.centerX + randomInRange(-24, 24);
        particle.y = this.centerY + randomInRange(-24, 24);
        particle.anchorX = this.centerX;
        particle.anchorY = this.centerY;
        particle.vx = 0;
        particle.vy = 0;
        break;
      }

      case 'articles': {
        particle.y = height + randomInRange(24, 140);
        particle.vx = randomInRange(-0.05, 0.05);
        particle.vy = randomInRange(-0.35, -0.16);
        break;
      }

      default:
        break;
    }
  }

  private getSpawnPoint(
    index: number,
    count: number,
  ): { anchorX: number; anchorY: number; clusterIndex: number; x: number; y: number } {
    const { width, height } = this.cachedLogicalSize;
    let x = Math.random() * width;
    let y = Math.random() * height;
    let anchorX = x;
    let anchorY = y;
    let clusterIndex = 0;

    switch (this.modeSettings.spawn) {
      case 'rings': {
        const angle = Math.random() * Math.PI * 2;
        const radiusFactor =
          this.mode === 'sys'
            ? randomInRange(0.16, 0.54)
            : randomInRange(0.14, 0.92);
        const radius = this.cachedMaxDistance * radiusFactor;
        anchorX = this.centerX + Math.cos(angle) * radius;
        anchorY =
          this.centerY +
          Math.sin(angle) * radius * (this.mode === 'sys' ? 0.68 : 0.82);
        x = anchorX;
        y = anchorY;
        break;
      }

      case 'grid': {
        const columns = Math.max(4, Math.round(Math.sqrt(count * 1.4)));
        const rows = Math.max(3, Math.ceil(count / columns));
        const cellWidth = width / columns;
        const cellHeight = height / rows;
        const column = index % columns;
        const row = Math.floor(index / columns);
        anchorX =
          (column + 0.5) * cellWidth + randomInRange(-cellWidth * 0.22, cellWidth * 0.22);
        anchorY =
          (row + 0.5) * cellHeight + randomInRange(-cellHeight * 0.22, cellHeight * 0.22);
        x = anchorX;
        y = anchorY;
        break;
      }

      case 'left': {
        anchorX = randomInRange(-width * 0.22, width * 0.15);
        anchorY = randomInRange(height * 0.14, height * 0.86);
        x = anchorX;
        y = anchorY;
        break;
      }

      case 'columns': {
        const columnCount = width < CONSTANTS.MOBILE_BREAKPOINT ? 4 : 7;
        const column = Math.floor(Math.random() * columnCount);
        const cellWidth = width / columnCount;
        anchorX =
          (column + 0.5) * cellWidth + randomInRange(-cellWidth * 0.12, cellWidth * 0.12);
        anchorY = randomInRange(-height * 0.06, height * 1.06);
        x = anchorX;
        y = anchorY;
        break;
      }

      case 'bands': {
        const bands = [height * 0.34, height * 0.5, height * 0.68];
        clusterIndex = index % bands.length;
        anchorX = randomInRange(-CONSTANTS.BOUNDARY_OFFSET, width + CONSTANTS.BOUNDARY_OFFSET);
        anchorY = bands[clusterIndex] + randomInRange(-18, 18);
        x = anchorX;
        y = anchorY;
        break;
      }

      case 'cluster': {
        const clusters =
          this.mode === 'about'
            ? [
                { x: width * 0.22, y: height * 0.24 },
                { x: width * 0.78, y: height * 0.22 },
                { x: width * 0.34, y: height * 0.68 },
                { x: width * 0.72, y: height * 0.62 },
              ]
            : [
                { x: width * 0.28, y: height * 0.26 },
                { x: width * 0.72, y: height * 0.24 },
                { x: width * 0.52, y: height * 0.62 },
              ];
        clusterIndex = index % clusters.length;
        anchorX = clusters[clusterIndex].x + randomInRange(-28, 28);
        anchorY = clusters[clusterIndex].y + randomInRange(-28, 28);
        x = anchorX;
        y = anchorY;
        break;
      }

      case 'center': {
        anchorX = this.centerX;
        anchorY = this.centerY;
        x = this.centerX + randomInRange(-24, 24);
        y = this.centerY + randomInRange(-24, 24);
        break;
      }

      case 'bottom': {
        anchorX = randomInRange(0, width);
        anchorY = height + randomInRange(24, 140);
        x = anchorX;
        y = anchorY;
        break;
      }
    }

    return { anchorX, anchorY, clusterIndex, x, y };
  }

  private updateParticles(): void {
    const { width, height } = this.cachedLogicalSize;
    const influenceRadius = Math.min(width, height) * CONSTANTS.MOUSE_INFLUENCE_RADIUS_FACTOR;
    const influenceRadiusSq = influenceRadius * influenceRadius;

    for (const particle of this.particles) {
      particle.twinklePhase += particle.twinkleSpeed;
      particle.pulsePhase += 0.01 * particle.speed;

      switch (this.mode) {
        case 'galaxy': {
          particle.angle += this.config.rotationSpeed * particle.speed;
          const targetX =
            this.centerX + Math.cos(particle.angle) * particle.distanceFromCenter;
          const targetY =
            this.centerY +
            Math.sin(particle.angle) * particle.distanceFromCenter * 0.82;
          particle.vx += (targetX - particle.x) * 0.012;
          particle.vy += (targetY - particle.y) * 0.012;
          break;
        }

        case 'network': {
          particle.vx +=
            (particle.anchorX - particle.x) * 0.018 + (Math.random() - 0.5) * 0.01;
          particle.vy +=
            (particle.anchorY - particle.y) * 0.018 + (Math.random() - 0.5) * 0.01;
          break;
        }

        case 'flow': {
          const targetY =
            particle.anchorY +
            Math.sin(particle.x * 0.018 + particle.pulsePhase) * (12 + particle.baseRadius * 3);
          particle.vx += this.config.speed * 0.12 * particle.speed;
          particle.vy += (targetY - particle.y) * 0.024;
          break;
        }

        case 'data': {
          particle.vx += (particle.anchorX - particle.x) * 0.04;
          particle.vy += this.config.speed * 0.09 * particle.speed;
          particle.rotation += particle.rotationSpeed;
          break;
        }

        case 'waves': {
          particle.x += this.config.speed * 2.1 * particle.speed;
          particle.y =
            particle.anchorY +
            Math.sin(particle.x * 0.014 + particle.pulsePhase) *
              (12 + particle.baseRadius * 4);
          particle.vx = 0;
          particle.vy = 0;
          break;
        }

        case 'logic': {
          if (Math.random() < 0.012) {
            particle.stepAxis = particle.stepAxis === 'x' ? 'y' : 'x';
            particle.stepDirection = particle.stepDirection === 1 ? -1 : 1;
          }

          const stepAmplitude = 18 + particle.baseRadius * 6;
          const targetX =
            particle.stepAxis === 'x'
              ? particle.anchorX +
                Math.sin(particle.pulsePhase * 1.4) * stepAmplitude * particle.stepDirection
              : particle.anchorX;
          const targetY =
            particle.stepAxis === 'y'
              ? particle.anchorY +
                Math.cos(particle.pulsePhase * 1.4) * stepAmplitude * particle.stepDirection
              : particle.anchorY;
          particle.vx += (targetX - particle.x) * 0.045;
          particle.vy += (targetY - particle.y) * 0.045;
          break;
        }

        case 'sys': {
          particle.angle += this.config.rotationSpeed * (0.78 + particle.speed);
          const orbitRadius =
            particle.distanceFromCenter + Math.sin(particle.pulsePhase) * 8;
          const targetX = this.centerX + Math.cos(particle.angle) * orbitRadius;
          const targetY =
            this.centerY + Math.sin(particle.angle) * orbitRadius * 0.68;
          particle.vx += (targetX - particle.x) * 0.02;
          particle.vy += (targetY - particle.y) * 0.02;
          break;
        }

        case 'ai': {
          const pulseOffset = 10 + Math.sin(particle.pulsePhase) * 12;
          const targetX =
            particle.anchorX + Math.cos(particle.pulsePhase) * pulseOffset;
          const targetY =
            particle.anchorY + Math.sin(particle.pulsePhase) * pulseOffset;
          particle.vx +=
            (targetX - particle.x) * 0.02 + (Math.random() - 0.5) * 0.012;
          particle.vy +=
            (targetY - particle.y) * 0.02 + (Math.random() - 0.5) * 0.012;
          break;
        }

        case 'expand': {
          const originX = this.isMouseActive ? this.mouseX : this.centerX;
          const originY = this.isMouseActive ? this.mouseY : this.centerY;
          const dx = particle.x - originX;
          const dy = particle.y - originY;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          particle.vx += (dx / distance) * 0.03 * particle.speed;
          particle.vy += (dy / distance) * 0.03 * particle.speed;
          particle.opacity = clamp(
            particle.baseOpacity * (1 - distance / (this.cachedMaxDistance * 0.9)),
            0.02,
            particle.baseOpacity,
          );

          if (distance > this.cachedMaxDistance * 0.82) {
            this.reseedExpandingParticle(particle, originX, originY);
          }
          break;
        }

        case 'articles': {
          particle.vx += Math.sin(particle.pulsePhase) * 0.01;
          particle.vy -= this.config.speed * 0.06 * particle.speed;
          particle.rotation += particle.rotationSpeed * 1.4;
          break;
        }

        case 'about': {
          const targetX =
            particle.anchorX + Math.cos(particle.pulsePhase * 0.8) * 10;
          const targetY =
            particle.anchorY + Math.sin(particle.pulsePhase * 0.7) * 10;
          particle.vx +=
            (targetX - particle.x) * 0.018 + (Math.random() - 0.5) * 0.004;
          particle.vy +=
            (targetY - particle.y) * 0.018 + (Math.random() - 0.5) * 0.004;
          break;
        }
      }

      if (this.isMouseActive && this.pointerFine && this.mode !== 'expand') {
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < influenceRadiusSq) {
          const distance = Math.sqrt(distanceSq) || 1;
          const force =
            (1 - distance / influenceRadius) * this.config.mouseInfluence;
          const angle = Math.atan2(dy, dx);

          switch (this.mode) {
            case 'galaxy':
              particle.vx += Math.cos(angle + Math.PI / 2) * force * 0.22;
              particle.vy += Math.sin(angle + Math.PI / 2) * force * 0.22;
              break;

            case 'network':
            case 'about':
              particle.vx += Math.cos(angle) * force * 0.18;
              particle.vy += Math.sin(angle) * force * 0.18;
              break;

            case 'flow':
              particle.vx += force * 0.3;
              particle.opacity = Math.min(1, particle.baseOpacity + force * 0.35);
              break;

            case 'data':
            case 'articles':
              particle.vx -= Math.cos(angle) * force * 0.36;
              particle.vy -= Math.sin(angle) * force * 0.22;
              break;

            case 'waves':
              particle.y += Math.sin(particle.x * 0.05 + particle.pulsePhase) * force * 4;
              break;

            case 'logic':
              if (Math.abs(dx) > Math.abs(dy)) {
                particle.vx -= Math.sign(dx) * force * 0.34;
              } else {
                particle.vy -= Math.sign(dy) * force * 0.34;
              }
              break;

            case 'sys':
              particle.vx += -Math.sin(angle) * force * 0.24;
              particle.vy += Math.cos(angle) * force * 0.24;
              break;

            case 'ai':
              particle.vx += Math.cos(angle) * force * 0.26;
              particle.vy += Math.sin(angle) * force * 0.26;
              break;
          }
        }
      }

      if (this.mode !== 'waves') {
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      this.recycleParticleIfNeeded(particle, width, height);
      particle.vx *= this.mode === 'logic' ? 0.82 : CONSTANTS.DAMPING_FACTOR;
      particle.vy *= this.mode === 'logic' ? 0.82 : CONSTANTS.DAMPING_FACTOR;
      this.applyNaturalTwinkle(particle);
    }
  }

  private recycleParticleIfNeeded(
    particle: Particle,
    width: number,
    height: number,
  ): void {
    switch (this.mode) {
      case 'flow':
        if (particle.x > width + CONSTANTS.BOUNDARY_OFFSET) {
          particle.x = -CONSTANTS.BOUNDARY_OFFSET;
          particle.y = randomInRange(0, height);
          particle.anchorY = particle.y;
          particle.vx = randomInRange(0.12, 0.24);
          particle.vy = 0;
        }
        break;

      case 'data':
        if (particle.y > height + CONSTANTS.BOUNDARY_OFFSET) {
          particle.y = -CONSTANTS.BOUNDARY_OFFSET;
          particle.x = particle.anchorX + randomInRange(-6, 6);
          particle.vx = 0;
          particle.vy = randomInRange(0.08, 0.18);
        }
        break;

      case 'waves':
        if (particle.x > width + CONSTANTS.BOUNDARY_OFFSET) {
          particle.x = -CONSTANTS.BOUNDARY_OFFSET;
        }
        break;

      case 'articles':
        if (particle.y < -CONSTANTS.BOUNDARY_OFFSET) {
          particle.y = height + randomInRange(24, 140);
          particle.x = randomInRange(0, width);
        }
        break;

      case 'expand':
        break;

      default:
        if (
          particle.x < -width * 0.25 ||
          particle.x > width * 1.25 ||
          particle.y < -height * 0.25 ||
          particle.y > height * 1.25
        ) {
          particle.x = particle.anchorX;
          particle.y = particle.anchorY;
          particle.vx = 0;
          particle.vy = 0;
        }
        break;
    }
  }

  private reseedExpandingParticle(
    particle: Particle,
    originX: number,
    originY: number,
  ): void {
    particle.x = originX + randomInRange(-20, 20);
    particle.y = originY + randomInRange(-20, 20);
    particle.vx = 0;
    particle.vy = 0;
    particle.opacity = particle.baseOpacity;
  }

  private applyNaturalTwinkle(particle: Particle): void {
    const twinkle = Math.sin(particle.twinklePhase);

    switch (this.mode) {
      case 'flow':
        particle.opacity = particle.baseOpacity * (0.78 + Math.abs(twinkle) * 0.26);
        break;

      case 'waves':
        particle.opacity = particle.baseOpacity * (0.86 + twinkle * 0.08);
        break;

      case 'sys':
      case 'ai':
        particle.opacity = particle.baseOpacity * (0.74 + twinkle * 0.18);
        break;

      case 'expand':
        break;

      default:
        particle.opacity = particle.baseOpacity * (0.78 + twinkle * 0.18);
        break;
    }
  }

  private draw(): void {
    const { width, height } = this.cachedLogicalSize;
    this.ctx.clearRect(0, 0, width, height);

    if (this.config.lineLinked) {
      this.drawLinks();
    }

    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = clamp(particle.opacity, 0, 1);
      this.ctx.fillStyle = particle.color;

      switch (particle.shape) {
        case 'square':
          this.ctx.fillRect(
            particle.x - particle.radius,
            particle.y - particle.radius,
            particle.radius * 2,
            particle.radius * 2,
          );
          break;

        case 'diamond':
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(Math.PI / 4 + particle.rotation * 0.25);
          this.ctx.fillRect(
            -particle.radius,
            -particle.radius,
            particle.radius * 2,
            particle.radius * 2,
          );
          break;

        case 'bar':
          this.ctx.translate(particle.x, particle.y);
          this.ctx.rotate(particle.rotation * 0.45);
          this.ctx.fillRect(
            -particle.radius * 1.8,
            -particle.radius * 0.32,
            particle.radius * 3.6,
            particle.radius * 0.64,
          );
          break;

        case 'page':
          this.drawPageParticle(particle);
          break;

        default:
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          this.ctx.fill();
          break;
      }

      this.ctx.restore();
    }
  }

  private drawPageParticle(particle: Particle): void {
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);
    this.ctx.fillRect(
      -particle.radius,
      -particle.radius * 1.35,
      particle.radius * 2,
      particle.radius * 2.7,
    );
    this.ctx.fillStyle = this.isLightMode
      ? 'rgba(15, 23, 42, 0.18)'
      : 'rgba(255, 255, 255, 0.16)';
    this.ctx.fillRect(
      -particle.radius * 0.6,
      -particle.radius * 0.8,
      particle.radius * 1.2,
      particle.radius * 0.18,
    );
    this.ctx.fillRect(
      -particle.radius * 0.6,
      -particle.radius * 0.36,
      particle.radius * 1.2,
      particle.radius * 0.18,
    );
    this.ctx.fillRect(
      -particle.radius * 0.6,
      particle.radius * 0.08,
      particle.radius * 0.78,
      particle.radius * 0.18,
    );
  }

  private drawLinks(): void {
    if (!this.config.lineLinked || this.config.linkDistance <= 0) return;

    const maxDistanceSq = this.config.linkDistance ** 2;
    this.ctx.save();

    for (let index = 0; index < this.particles.length; index += 1) {
      const particle = this.particles[index];
      let connections = 0;

      for (
        let otherIndex = index + 1;
        otherIndex < this.particles.length && connections < this.config.maxLinks;
        otherIndex += 1
      ) {
        const other = this.particles[otherIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq > maxDistanceSq) continue;

        const opacity =
          (1 - distanceSq / maxDistanceSq) * (this.mode === 'ai' ? 0.34 : 0.22);
        this.ctx.strokeStyle = this.getLinkStrokeStyle(
          opacity,
          this.mode === 'ai',
        );
        this.ctx.lineWidth = this.mode === 'ai' ? 1 : 0.7;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(other.x, other.y);
        this.ctx.stroke();
        connections += 1;
      }
    }

    if (
      this.isMouseActive &&
      (this.mode === 'network' || this.mode === 'ai' || this.mode === 'about')
    ) {
      const { width, height } = this.cachedLogicalSize;
      const influenceRadius =
        Math.min(width, height) * CONSTANTS.MOUSE_INFLUENCE_RADIUS_FACTOR;

      for (const particle of this.particles) {
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= influenceRadius) continue;

        const opacity =
          (1 - distance / influenceRadius) * (this.mode === 'ai' ? 0.42 : 0.26);
        this.ctx.strokeStyle = this.getLinkStrokeStyle(
          opacity,
          this.mode === 'ai',
        );
        this.ctx.lineWidth = this.mode === 'ai' ? 1.15 : 0.8;
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouseX, this.mouseY);
        this.ctx.lineTo(particle.x, particle.y);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  private animate(): void {
    if (this.isDisabled) return;
    this.updateParticles();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private applyThemeToParticles(): void {
    for (const particle of this.particles) {
      particle.color = this.getParticleColor(particle.isAccent);
    }
  }

  private pickShape(shapes: readonly ParticleShape[]): ParticleShape {
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private getParticleColor(isAccent: boolean): string {
    if (isAccent) return this.accentColor;

    return this.particleColors[
      Math.floor(Math.random() * this.particleColors.length)
    ];
  }

  private hexToRgb(hex: string): string {
    const normalized = hex.replace('#', '');
    const isShort = normalized.length === 3;
    const value = isShort
      ? normalized
          .split('')
          .map((part) => part + part)
          .join('')
      : normalized;
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);

    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  }

  private getLinkStrokeStyle(
    opacity: number,
    preferAccentInLightMode = false,
  ): string {
    if (!this.isLightMode) {
      return `rgba(${this.accentColorRgb}, ${opacity})`;
    }

    return preferAccentInLightMode
      ? `rgba(${this.accentColorRgb}, ${opacity})`
      : `rgba(15, 23, 42, ${opacity})`;
  }

  public destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

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

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
