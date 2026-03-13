import { useEffect, useRef } from 'react';
import { useThemeStore, themes } from '../../store/themeStore';

interface Orb {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  h: number; s: number; l: number;
  opacity: number;
  phase: number; phaseSpeed: number;
}

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const lit = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = lit > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(hue * 360), Math.round(sat * 100), Math.round(lit * 100)];
}

// FIX: convert hex bg color to rgba string with given opacity (0–1)
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function AnimatedCover({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const orbsRef   = useRef<Orb[]>([]);
  const themeName = useThemeStore(s => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const t = themes[themeName];

    const [aH, aS, aL] = hexToHsl(t.accent);
    const [hH, hS, hL] = hexToHsl(t.accentHover);
    const palette: Array<[number, number, number]> = [
      [aH, aS, aL],
      [hH, hS, hL],
      [(aH + 30) % 360, Math.max(aS - 15, 20), Math.min(aL + 10, 85)],
      [(aH - 40 + 360) % 360, Math.max(aS - 20, 15), Math.min(aL + 18, 90)],
      [(aH + 60) % 360, Math.max(aS - 10, 25), aL],
    ];

    const dpr = window.devicePixelRatio || 1;
    const bgH = t.bg;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // FIX: guard against zero dimensions at mount time
    const initW = W() || 800;
    const initH = H() || 200;

    orbsRef.current = Array.from({ length: 7 }, (_, i) => {
      const [oh, os, ol] = palette[i % palette.length];
      return {
        x: Math.random() * initW,
        y: Math.random() * initH,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.35,
        r: initW * (0.3 + Math.random() * 0.35),
        h: oh, s: os, l: ol,
        opacity: 0.28 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.004 + Math.random() * 0.006,
      };
    });

    const draw = () => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = bgH;
      ctx.fillRect(0, 0, w, h);

      for (const orb of orbsRef.current) {
        orb.phase += orb.phaseSpeed;
        const breathe = 1 + Math.sin(orb.phase) * 0.12;
        const r = orb.r * breathe;
        const op = orb.opacity * (0.85 + Math.sin(orb.phase * 0.7) * 0.15);

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        grad.addColorStop(0,    `hsla(${orb.h},${orb.s}%,${orb.l}%,${op})`);
        grad.addColorStop(0.45, `hsla(${orb.h},${orb.s}%,${orb.l}%,${op * 0.5})`);
        grad.addColorStop(1,    `hsla(${orb.h},${orb.s}%,${orb.l}%,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fill();

        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -r * 0.4) orb.vx =  Math.abs(orb.vx);
        if (orb.x > w + r * 0.4) orb.vx = -Math.abs(orb.vx);
        if (orb.y < -r * 0.4) orb.vy =  Math.abs(orb.vy);
        if (orb.y > h + r * 0.4) orb.vy = -Math.abs(orb.vy);
      }

      // FIX: use hexToRgba() instead of bgH + 'f0'
      const fadeGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      fadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      fadeGrad.addColorStop(1, hexToRgba(bgH, 0.94));
      ctx.fillStyle = fadeGrad;
      ctx.fillRect(0, 0, w, h);

      const vigL = ctx.createLinearGradient(0, 0, w * 0.25, 0);
      vigL.addColorStop(0, 'rgba(0,0,0,0.18)');
      vigL.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vigL;
      ctx.fillRect(0, 0, w, h);

      const vigR = ctx.createLinearGradient(w, 0, w * 0.75, 0);
      vigR.addColorStop(0, 'rgba(0,0,0,0.18)');
      vigR.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vigR;
      ctx.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [themeName]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
    />
  );
}
