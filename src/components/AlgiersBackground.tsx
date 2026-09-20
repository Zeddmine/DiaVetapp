import React, { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface AlgiersBackgroundProps {
  theme: Theme;
}

export default function AlgiersBackground({ theme }: AlgiersBackgroundProps) {
  // Panoramic Algiers Bay & Medical Veterinary atmosphere
  const algiersBayUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2400";
  const algiersBackupUrl = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=2400";
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated particle & bio-constellation system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    interface ParticleNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      symbol?: string;
      alpha: number;
      pulse: number;
    }

    const symbols = ['🐾', '✚', '✨', '✦', '🩺'];
    const colors = ['#00d2ff', '#0066ff', '#10b981', '#f59e0b', '#38bdf8'];
    const particles: ParticleNode[] = Array.from({ length: 32 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45 - 0.15, // Slight upward drift
      radius: Math.random() * 2 + 1.2,
      color: colors[i % colors.length],
      symbol: i % 4 === 0 ? symbols[i % symbols.length] : undefined,
      alpha: Math.random() * 0.5 + 0.25,
      pulse: Math.random() * Math.PI * 2
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw interactive gentle connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 210, 255, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw floating nodes & symbols
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        // Wrap around borders
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

        if (p.symbol) {
          ctx.save();
          ctx.font = '13px sans-serif';
          ctx.globalAlpha = currentAlpha * 0.65;
          ctx.fillStyle = p.color;
          ctx.fillText(p.symbol, p.x - 6, p.y + 5);
          ctx.restore();
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Background Image: Panoramic Bay of Algiers */}
      <img
        src={algiersBayUrl}
        alt="La Baie d'Alger panoramique"
        referrerPolicy="no-referrer"
        onError={(e) => {
          if ((e.currentTarget as HTMLImageElement).src !== algiersBackupUrl) {
            (e.currentTarget as HTMLImageElement).src = algiersBackupUrl;
          }
        }}
        className={`w-full h-full object-cover object-center scale-105 animate-slow-pan transition-all duration-1000 ${
          theme === 'dark'
            ? 'opacity-40 filter brightness-90 contrast-125 saturate-125'
            : 'opacity-20 filter brightness-95 contrast-110 saturate-110'
        }`}
      />

      {/* Atmospheric Balancer - High contrast readability */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#020617]/90 via-[#020617]/75 to-[#020617]/95'
            : 'bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950/95'
        }`}
      />

      {/* Modern Mesh Aura & Glow Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,180,255,0.2),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

      {/* Ambient Pulsing Orbs */}
      <div 
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-cyan-500/15 blur-[100px] animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full bg-blue-600/15 blur-[120px] animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '3s' }}
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full bg-emerald-500/12 blur-[100px] animate-pulse"
        style={{ animationDuration: '9s', animationDelay: '5s' }}
      />

      {/* Canvas for animated particle network & animal symbols */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Algerian Flag subtle luminescent header bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-white to-rose-500 opacity-80 shadow-md shadow-emerald-500/40" />

      {/* High-tech Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"
      />
    </div>
  );
}
