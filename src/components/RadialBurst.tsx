/**
 * RadialBurst — a Stripe-style "rays + nodes" canvas animation.
 *
 * Reads --color-accent and --color-bg directly from CSS variables so it
 * automatically adapts to every theme (Dawn, Morning, Noon, …, Night).
 *
 * Props
 *  originX   – 0-1 fraction of canvas width  (default 0.5)
 *  originY   – 0-1 fraction of canvas height (default 1.05, just below bottom)
 *  opacity   – overall canvas opacity        (default 1)
 *  rayCount  – target number of live rays    (default 80)
 */

import { useEffect, useRef } from 'react';

interface Props {
  originX?: number;
  originY?: number;
  opacity?: number;
  rayCount?: number;
  style?: React.CSSProperties;
  className?: string;
}

// ---------- colour helpers ----------

/** Parse any CSS colour into [r, g, b] 0-255 via a throwaway canvas pixel. */
function parseColor(raw: string): [number, number, number] {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = raw.trim();
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  } catch {
    return [255, 92, 0]; // fallback orange
  }
}

/** Read a CSS variable from :root, resolving nested var() one level. */
function getCSSVar(name: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  // resolve a single nested var() reference
  const nested = raw.match(/^var\((--[^)]+)\)$/);
  if (nested) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(nested[1])
      .trim();
  }
  return raw;
}

// ---------- ray type ----------

interface Ray {
  angle: number;
  length: number;
  targetLength: number;
  speed: number;
  baseOpacity: number;
  width: number;
  /** 0–1 colour mix: 0 = accent, 1 = accent-shifted slightly */
  hueShift: number;
  nodes: { t: number; r: number; phase: number }[];
  life: number;
  maxLife: number;
  born: boolean; // has finished growing?
}

function makeRay(W: number, H: number): Ray {
  const spread = Math.PI * 0.9; // 162° fan
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
  const diag = Math.sqrt(W * W + H * H);
  return {
    angle,
    length: 0,
    targetLength: diag * (0.3 + Math.random() * 0.6),
    speed: 3 + Math.random() * 5,
    baseOpacity: 0.15 + Math.random() * 0.3,
    width: 0.4 + Math.random() * 1.2,
    hueShift: Math.random(),
    nodes: Array.from({ length: Math.floor(1 + Math.random() * 5) }, () => ({
      t: 0.05 + Math.random() * 0.88,
      r: 1.5 + Math.random() * 3.5,
      phase: Math.random() * Math.PI * 2,
    })),
    life: 0,
    maxLife: 150 + Math.random() * 200,
    born: false,
  };
}

// ---------- component ----------

export default function RadialBurst({
  originX = 0.5,
  originY = 1.05,
  opacity = 1,
  rayCount = 80,
  style,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // ---- resize ----
    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---- seed rays at random life stages so the screen isn't empty on load ----
    const rays: Ray[] = Array.from({ length: rayCount }, () => {
      const r = makeRay(canvas.width, canvas.height);
      r.life = Math.random() * r.maxLife * 0.8;
      r.length = Math.min(r.targetLength, r.speed * r.life);
      r.born = r.length >= r.targetLength;
      return r;
    });

    let raf = 0;
    let tick = 0;

    // cache colours every 60 frames so we catch theme changes
    let accentRGB: [number, number, number] = [255, 92, 0];
    let bgRGB: [number, number, number] = [10, 10, 10];

    function refreshColors() {
      accentRGB = parseColor(getCSSVar('--color-accent'));
      bgRGB = parseColor(getCSSVar('--color-bg'));
    }
    refreshColors();

    function accentAlpha(a: number, shift = 0) {
      // blend accent slightly toward orange-amber for variety
      const [r, g, b] = accentRGB;
      // shift adds a tiny warm push
      const rs = Math.min(255, r + shift * 30);
      const gs = Math.min(255, g + shift * 10);
      return `rgba(${Math.round(rs)},${Math.round(gs)},${Math.round(b)},${a.toFixed(3)})`;
    }

    function draw() {
      tick++;
      if (tick % 60 === 0) refreshColors();

      const W = canvas!.width;
      const H = canvas!.height;
      const ox = W * originX;
      const oy = H * originY;

      ctx.clearRect(0, 0, W, H);

      // ---- radial glow at origin ----
      const glowR = Math.min(W, H) * 0.4;
      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
      glow.addColorStop(0, accentAlpha(0.07));
      glow.addColorStop(1, accentAlpha(0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        ray.life++;

        // grow phase
        if (!ray.born) {
          ray.length = Math.min(ray.length + ray.speed, ray.targetLength);
          if (ray.length >= ray.targetLength) ray.born = true;
        }

        // life envelope: fade-in 0→15%, sustain, fade-out 75→100%
        const p = ray.life / ray.maxLife;
        const fadeIn = Math.min(p / 0.15, 1);
        const fadeOut = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1;
        // subtle flicker
        const flicker = 0.9 + 0.1 * Math.sin(tick * 0.13 + i * 1.7);
        const alpha = ray.baseOpacity * fadeIn * fadeOut * flicker;

        if (alpha < 0.003 || ray.length < 2) {
          if (ray.life >= ray.maxLife) rays[i] = makeRay(W, H);
          continue;
        }

        const ex = ox + Math.cos(ray.angle) * ray.length;
        const ey = oy + Math.sin(ray.angle) * ray.length;

        // ---- ray line ----
        const grad = ctx.createLinearGradient(ox, oy, ex, ey);
        grad.addColorStop(0, accentAlpha(alpha * 1.1, ray.hueShift));
        grad.addColorStop(0.45, accentAlpha(alpha * 0.55, ray.hueShift));
        grad.addColorStop(1, accentAlpha(0));

        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = ray.width;
        ctx.globalAlpha = 1;
        ctx.stroke();

        // ---- nodes ----
        for (const nd of ray.nodes) {
          if (nd.t > ray.length / ray.targetLength) continue; // not grown yet
          const nx = ox + Math.cos(ray.angle) * ray.length * nd.t;
          const ny = oy + Math.sin(ray.angle) * ray.length * nd.t;
          const pulse = 0.65 + 0.35 * Math.sin(nd.phase + tick * 0.04);
          const nodeAlpha = alpha * pulse * 1.6;

          ctx.beginPath();
          ctx.arc(nx, ny, nd.r * pulse, 0, Math.PI * 2);
          ctx.fillStyle = accentAlpha(Math.min(nodeAlpha, 0.9), ray.hueShift);
          ctx.fill();
        }

        // recycle
        if (ray.life >= ray.maxLife) rays[i] = makeRay(W, H);
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [originX, originY, rayCount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', opacity, ...style }}
    />
  );
}
