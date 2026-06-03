"use client";

import { useEffect, useState } from "react";

const SKILLS = [
  { label: "Code", angle: 0, delay: "0.9s", icon: "</>" },
  { label: "Design", angle: 60, delay: "1.05s", icon: "◆" },
  { label: "Data", angle: 120, delay: "1.2s", icon: "▤" },
  { label: "Business", angle: 180, delay: "1.35s", icon: "◈" },
  { label: "AI", angle: 240, delay: "1.5s", icon: "◎" },
  { label: "Cloud", angle: 300, delay: "1.65s", icon: "☁" },
];

const RADIUS = 118;

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: 160 + radius * Math.cos(rad),
    y: 160 + radius * Math.sin(rad),
  };
}

function ProgressCounter() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(78);
      return;
    }

    const startDelay = 1700;
    const timeout = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const next = Math.min(78, Math.round((elapsed / duration) * 78));
        setValue(next);
        if (next < 78) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, []);

  return <span className="hero-progress-count text-xs font-semibold text-text-primary tabular-nums">{value}%</span>;
}

export function HeroLearningVisual() {
  const center = { x: 160, y: 160 };

  return (
    <div className="hero-visual relative mx-auto w-full max-w-[340px] sm:max-w-[380px] aspect-square select-none pointer-events-none">
      <div className="hero-glow-ring absolute inset-[12%] rounded-full border border-white/5" />
      <div className="hero-glow-ring-delay absolute inset-[22%] rounded-full border border-white/5" />

      <svg
        viewBox="0 0 320 320"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <circle
          cx={center.x}
          cy={center.y}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="hero-orbit-track"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="hero-orbit-draw"
          style={{
            strokeDasharray: `${2 * Math.PI * RADIUS}`,
            strokeDashoffset: `${2 * Math.PI * RADIUS}`,
          }}
        />

        {SKILLS.map((skill) => {
          const node = polarToCartesian(skill.angle, RADIUS);
          return (
            <line
              key={`line-${skill.label}`}
              x1={center.x}
              y1={center.y}
              x2={node.x}
              y2={node.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              className="hero-line-draw"
              style={{ animationDelay: skill.delay }}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0">
        {SKILLS.map((skill) => {
          const pctX = 50 + (RADIUS / 160) * 50 * Math.cos(((skill.angle - 90) * Math.PI) / 180);
          const pctY = 50 + (RADIUS / 160) * 50 * Math.sin(((skill.angle - 90) * Math.PI) / 180);
          return (
            <div
              key={skill.label}
              className="hero-skill-node absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${pctX}%`,
                top: `${pctY}%`,
                animationDelay: skill.delay,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-border-subtle bg-surface/90 backdrop-blur-sm flex items-center justify-center text-xs sm:text-sm font-mono text-text-primary shadow-lg">
                  {skill.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-text-tertiary whitespace-nowrap">
                  {skill.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hero-center-hub absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-border bg-surface/95 backdrop-blur-md flex items-center justify-center shadow-xl">
          <svg className="w-9 h-9 sm:w-10 sm:h-10 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" />
          </svg>
          <div className="hero-center-pulse absolute inset-0 rounded-2xl border border-white/20" />
        </div>
      </div>

      <div className="hero-progress-card absolute -bottom-1 left-0 right-0 mx-auto w-[88%] rounded-xl border border-border-subtle bg-surface/90 backdrop-blur-md px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-secondary">Skill path</span>
          <ProgressCounter />
        </div>
        <div className="h-1.5 rounded-full bg-background-secondary overflow-hidden">
          <div className="hero-progress-bar h-full rounded-full bg-linear-to-r from-white/40 to-white" />
        </div>
      </div>

      <div className="hero-cert-badge absolute -top-1 -right-1 sm:right-2 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface/95 backdrop-blur-md px-3 py-2 shadow-lg">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] text-text-tertiary leading-none">Earned</p>
          <p className="text-xs font-semibold text-text-primary leading-tight">Certificate</p>
        </div>
      </div>

      <div className="hero-float-particle hero-particle-1 absolute w-1.5 h-1.5 rounded-full bg-white/30" />
      <div className="hero-float-particle hero-particle-2 absolute w-1 h-1 rounded-full bg-white/20" />
      <div className="hero-float-particle hero-particle-3 absolute w-2 h-2 rounded-full bg-white/15" />
    </div>
  );
}
