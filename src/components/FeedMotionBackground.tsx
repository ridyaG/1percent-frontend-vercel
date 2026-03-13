import { useEffect, useRef } from 'react';

function parseColor(value: string, fallback: [number, number, number]) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fallback;
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2]] as [number, number, number];
  } catch {
    return fallback;
  }
}

function cssRgb(variable: string, fallback: [number, number, number]) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return parseColor(raw, fallback);
}

export default function FeedMotionBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;

    const colors = {
      accent: cssRgb('--color-accent', [255, 122, 24]),
      gold: cssRgb('--color-gold', [255, 191, 71]),
      secondary: cssRgb('--color-secondary', [93, 214, 192]),
    };

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawOrb = (
      x: number,
      y: number,
      radius: number,
      color: [number, number, number],
      alpha: number,
    ) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
      gradient.addColorStop(0.45, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.35})`);
      gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      frame += 1;
      const t = frame * 0.008;

      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.52;
      const centerY = 320;

      drawOrb(
        centerX,
        centerY + Math.sin(t * 0.8) * 18,
        Math.min(width * 0.42, 420),
        colors.gold,
        0.2,
      );
      drawOrb(
        centerX - width * 0.18 + Math.cos(t * 0.9) * 18,
        centerY + 90 + Math.sin(t) * 20,
        Math.min(width * 0.26, 260),
        colors.secondary,
        0.16,
      );
      drawOrb(
        centerX + width * 0.22 + Math.sin(t * 0.6) * 22,
        centerY - 30 + Math.cos(t * 0.7) * 16,
        Math.min(width * 0.3, 320),
        colors.accent,
        0.18,
      );

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(t * 0.16);

      for (let i = 0; i < 90; i += 1) {
        const angle = (Math.PI * 2 * i) / 90;
        const inner = 22 + (i % 5) * 4;
        const outer = 180 + (i % 9) * 28 + Math.sin(t + i * 0.2) * 10;
        const x1 = Math.cos(angle) * inner;
        const y1 = Math.sin(angle) * inner;
        const x2 = Math.cos(angle) * outer;
        const y2 = Math.sin(angle) * outer;

        ctx.strokeStyle =
          i % 3 === 0
            ? `rgba(${colors.accent[0]}, ${colors.accent[1]}, ${colors.accent[2]}, 0.18)`
            : `rgba(${colors.secondary[0]}, ${colors.secondary[1]}, ${colors.secondary[2]}, 0.12)`;
        ctx.lineWidth = i % 7 === 0 ? 1.8 : 0.9;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle =
          i % 4 === 0
            ? `rgba(${colors.gold[0]}, ${colors.gold[1]}, ${colors.gold[2]}, 0.7)`
            : `rgba(${colors.accent[0]}, ${colors.accent[1]}, ${colors.accent[2]}, 0.45)`;
        ctx.beginPath();
        ctx.arc(x2, y2, i % 8 === 0 ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="feed-motion-canvas" aria-hidden="true" />;
}
