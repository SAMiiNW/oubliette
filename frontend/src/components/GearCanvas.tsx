'use client';

import { useEffect, useRef } from 'react';

interface GearCanvasProps {
  seeking?: boolean; // spins faster while the lock deliberates
  className?: string;
}

interface Gear {
  x: number;
  y: number;
  r: number;
  teeth: number;
  speed: number;
  dir: number;
  phase: number;
  color: string;
}

export default function GearCanvas({ seeking = false, className }: GearCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const seekingRef = useRef(seeking);
  seekingRef.current = seeking;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let visible = true;
    let gears: Gear[] = [];
    let W = 0;
    let H = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = W * 0.5;
      const cy = H * 0.46;
      const base = Math.min(W, H) * 0.17;
      gears = [
        { x: cx, y: cy, r: base, teeth: 16, speed: 0.18, dir: 1, phase: 0, color: '#d9a441' },
        {
          x: cx - base * 1.7,
          y: cy - base * 0.55,
          r: base * 0.66,
          teeth: 11,
          speed: 0.27,
          dir: -1,
          phase: 0.3,
          color: '#a87a2c',
        },
        {
          x: cx + base * 1.62,
          y: cy + base * 0.5,
          r: base * 0.78,
          teeth: 13,
          speed: 0.23,
          dir: -1,
          phase: 0.1,
          color: '#4e9a8f',
        },
        {
          x: cx + base * 0.2,
          y: cy + base * 1.55,
          r: base * 0.5,
          teeth: 9,
          speed: 0.34,
          dir: 1,
          phase: 0.5,
          color: '#8a6526',
        },
      ];
    };

    const drawGear = (g: Gear, angle: number) => {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(angle);
      const inner = g.r * 0.74;
      const toothH = g.r * 0.2;

      ctx.beginPath();
      for (let i = 0; i < g.teeth; i++) {
        const a0 = (i / g.teeth) * Math.PI * 2;
        const a1 = ((i + 0.5) / g.teeth) * Math.PI * 2;
        const a2 = ((i + 1) / g.teeth) * Math.PI * 2;
        ctx.lineTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
        ctx.lineTo(Math.cos(a0) * (g.r + toothH), Math.sin(a0) * (g.r + toothH));
        ctx.lineTo(Math.cos(a1) * (g.r + toothH), Math.sin(a1) * (g.r + toothH));
        ctx.lineTo(Math.cos(a1) * inner, Math.sin(a1) * inner);
        ctx.lineTo(Math.cos(a2) * inner, Math.sin(a2) * inner);
      }
      ctx.closePath();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = g.color;
      ctx.globalAlpha = 0.55;
      ctx.stroke();

      // inner etched ring
      ctx.beginPath();
      ctx.arc(0, 0, inner * 0.78, 0, Math.PI * 2);
      ctx.globalAlpha = 0.32;
      ctx.stroke();

      // hub spokes
      ctx.globalAlpha = 0.45;
      for (let s = 0; s < 5; s++) {
        const sa = (s / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * (g.r * 0.2), Math.sin(sa) * (g.r * 0.2));
        ctx.lineTo(Math.cos(sa) * inner * 0.7, Math.sin(sa) * inner * 0.7);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 0.16, 0, Math.PI * 2);
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const boost = seekingRef.current ? 3.1 : 1;
      for (const g of gears) {
        drawGear(g, g.phase + t * g.speed * g.dir * boost);
      }
      // central combination dial seeking ring
      const cx = W * 0.5;
      const cy = H * 0.46;
      const dialR = Math.min(W, H) * 0.07;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = '#f0c463';
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const len = i % 3 === 0 ? dialR * 0.22 : dialR * 0.12;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * dialR, Math.sin(a) * dialR);
        ctx.lineTo(Math.cos(a) * (dialR + len), Math.sin(a) * (dialR + len));
        ctx.stroke();
      }
      const seekAngle = t * (seekingRef.current ? 1.4 : 0.25);
      ctx.rotate(seekAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -dialR * 0.9);
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffdfa6';
      ctx.stroke();
      ctx.restore();

      t += 0.016;
      raf = requestAnimationFrame(render);
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && !raf) raf = requestAnimationFrame(render);
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    build();
    raf = requestAnimationFrame(render);
    const onResize = () => build();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
