// Canvas Confetti & Floating Hearts Engine for Next.js

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  isHeart: boolean;
  opacity: number;
  decay: number;
  gravity: number;
}

export class ConfettiCannon {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (document.getElementById('confetti-canvas')) {
      this.canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d');
      return;
    }

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'confetti-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(options: { count?: number; x?: number; y?: number } = {}) {
    if (!this.canvas) this.init();
    if (!this.ctx || !this.canvas) return;

    const count = options.count || 70;
    const originX = options.x !== undefined ? options.x : window.innerWidth / 2;
    const originY = options.y !== undefined ? options.y : window.innerHeight / 2;
    const colors = ['#ff4d79', '#ff758c', '#ff8fa3', '#ffd166', '#a1c4fd', '#c2e9fb', '#ffb7b2'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        isHeart: Math.random() > 0.35,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.008,
        gravity: 0.18,
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number, angle: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    const d = size;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
    ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.isHeart) {
        this.drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      } else {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.animId = null;
    }
  };
}

let instance: ConfettiCannon | null = null;
export const getConfetti = () => {
  if (!instance && typeof window !== 'undefined') {
    instance = new ConfettiCannon();
  }
  return instance;
};
