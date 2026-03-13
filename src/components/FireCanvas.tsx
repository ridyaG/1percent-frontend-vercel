import { useEffect, useRef } from 'react';

interface Props {
  opacity?: number;
  sparkFreq?: number;
  floorFrac?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── colour helper ───────────────────────────────────────────────

function parseAccentRGB(): [number, number, number] {
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent')
      .trim();
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = 1;
    const c = tmp.getContext('2d')!;
    c.fillStyle = raw;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  } catch {
    return [255, 92, 0];
  }
}

// ─── Spark class ─────────────────────────────────────────────────

interface SparkConfig {
  meanSparkSize: number;
  meanSparkLife: number;
  meanSparkVelocity: [number, number];
  sparkSizeVariation: number;
  sparkBlink: number;
  accentRGB: [number, number, number];
}

class Spark {
  ctx: CanvasRenderingContext2D;
  pos: [number, number];
  size: number;
  v: [number, number];
  c: [number, number, number];
  life: number;
  lifeOrig: number;
  config: SparkConfig;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number, cfg: SparkConfig) {
    this.ctx = ctx;
    this.config = cfg;
    this.pos = [x, y];
    this.size = cfg.meanSparkSize + (Math.random() - 0.5) * cfg.sparkSizeVariation;
    this.v = [
      cfg.meanSparkVelocity[0] * (Math.random() - 0.5),
      -1 * cfg.meanSparkVelocity[1] * Math.random(),
    ];

    // Derive spark colour from accent — keep hue, vary brightness
    const [ar, ag, ab] = cfg.accentRGB;
    this.c = [
      Math.min(255, Math.floor(ar * (0.6 + Math.random() * 0.8))),
      Math.min(255, Math.floor(ag * (0.4 + Math.random() * 0.9))),
      Math.min(255, Math.floor(ab * (0.2 + Math.random() * 0.6))),
    ];

    this.life = this.lifeOrig = Math.floor(cfg.meanSparkLife * Math.random());
  }

  move() {
    const t = 1 - this.life / this.lifeOrig;
    this.pos[0] += this.v[0] * t;
    this.pos[1] += this.v[1] * t;
  }

  getAlpha(): number {
    return (
      Math.sqrt(this.life / this.lifeOrig) +
      (Math.random() - 0.5) / this.config.sparkBlink
    );
  }

  /** Returns true when dead */
  update(): boolean {
    this.move();
    if (!this.life--) return true;
    const { ctx, pos, size, c } = this;
    ctx.beginPath();
    ctx.rect(pos[0], pos[1], size, size);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${this.getAlpha()})`;
    ctx.fill();
    return false;
  }
}

// ─── Fire class ──────────────────────────────────────────────────

class Fire {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  y: number;
  sparks: Spark[];
  floorAlpha: number;
  config: SparkConfig;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    y: number,
    cfg: SparkConfig,
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.y = y;
    this.sparks = [];
    this.floorAlpha = 0.9;
    this.config = cfg;
  }

  addSpark(x: number) {
    this.sparks.push(new Spark(this.ctx, x, this.y, this.config));
  }

  updateFloor() {
    // Pulsing floor bar in accent colour
    this.floorAlpha = Math.min(1, Math.max(0.6, this.floorAlpha + (Math.random() - 0.5) * 0.08));
    const [r, g, b] = this.config.accentRGB;
    this.ctx.beginPath();
    this.ctx.rect(0, this.y, this.canvas.width, this.config.meanSparkSize * 1.2);
    this.ctx.fillStyle = `rgba(${Math.round(r * 0.35)},${Math.round(g * 0.18)},${Math.round(b * 0.05)},${this.floorAlpha})`;
    this.ctx.fill();
  }

  update() {
    this.updateFloor();
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      if (this.sparks[i].update()) this.sparks.splice(i, 1);
    }
  }
}

// ─── React component ─────────────────────────────────────────────

export default function FireCanvas({
  opacity = 1,
  sparkFreq = 2,
  floorFrac = 0.08,
  className,
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let raf = 0;
    let fire: Fire | null = null;
    let accentRGB: [number, number, number] = parseAccentRGB();
    let tick = 0;

    function buildConfig(w: number): SparkConfig {
      return {
        meanSparkSize: Math.max(2, w * 0.008),
        meanSparkLife: 220,
        meanSparkVelocity: [2.5, 7],
        sparkSizeVariation: 4,
        sparkBlink: 8,
        accentRGB,
      };
    }

    function init() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      const cfg = buildConfig(canvas!.width);
      const floorY = canvas!.height - canvas!.height * floorFrac;
      fire = new Fire(ctx, canvas!, floorY, cfg);
    }

    init();

    const ro = new ResizeObserver(() => {
      init();
    });
    ro.observe(canvas);

    function loop() {
      tick++;
      // Refresh accent colour every 90 frames to track theme changes
      if (tick % 90 === 0) {
        accentRGB = parseAccentRGB();
        if (fire) fire.config.accentRGB = accentRGB;
      }

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      if (fire) {
        fire.update();
        for (let i = 0; i < sparkFreq; i++) {
          fire.addSpark(Math.random() * canvas!.width);
        }
      }
      raf = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sparkFreq, floorFrac]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', opacity, ...style }}
    />
  );
}
