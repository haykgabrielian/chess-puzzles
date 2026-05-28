import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const CONFETTI_COLORS = ['#2e7d32', '#4caf50', '#81c784', '#ffd54f', '#ffb300', '#f0d9b5'];
const PARTICLE_COUNT = 70;
const DURATION_MS = 1400;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
};

const ConfettiLayer = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const createParticles = (originX: number, originY: number): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? '#4caf50',
      width: 5 + Math.random() * 5,
      height: 3 + Math.random() * 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      life: 1,
    };
  });

const runConfetti = (canvas: HTMLCanvasElement, originX: number, originY: number) => {
  const context = canvas.getContext('2d');

  if (!context) {
    return () => {};
  }

  const { width, height } = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles = createParticles(originX, originY);
  const startTime = performance.now();
  let frameId = 0;

  const draw = (now: number) => {
    const elapsed = now - startTime;
    context.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.vy += 0.18;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.rotation += particle.rotationSpeed;
      particle.life = Math.max(0, 1 - elapsed / DURATION_MS);

      if (particle.life <= 0) {
        continue;
      }

      context.save();
      context.globalAlpha = particle.life;
      context.fillStyle = particle.color;
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height,
      );
      context.restore();
    }

    if (elapsed < DURATION_MS) {
      frameId = requestAnimationFrame(draw);
      return;
    }

    context.clearRect(0, 0, width, height);
  };

  frameId = requestAnimationFrame(draw);

  return () => cancelAnimationFrame(frameId);
};

const getMoveSquareOrigin = (
  canvas: HTMLCanvasElement,
  squareId: string | null,
): { x: number; y: number } => {
  const container = canvas.parentElement;
  const containerRect = container?.getBoundingClientRect();

  if (!container || !containerRect) {
    return { x: 0, y: 0 };
  }

  const square = squareId
    ? container.querySelector<HTMLElement>(`[aria-label="${squareId}"]`)
    : null;

  if (square) {
    const squareRect = square.getBoundingClientRect();

    return {
      x: squareRect.left + squareRect.width / 2 - containerRect.left,
      y: squareRect.top + squareRect.height / 2 - containerRect.top,
    };
  }

  const grid = container.querySelector<HTMLElement>('[role="grid"]');

  if (grid) {
    const gridRect = grid.getBoundingClientRect();

    return {
      x: gridRect.left + gridRect.width / 2 - containerRect.left,
      y: gridRect.top + gridRect.height / 2 - containerRect.top,
    };
  }

  return {
    x: containerRect.width / 2,
    y: containerRect.height / 2,
  };
};

type SolveConfettiProps = {
  isSolved: boolean;
  lastMoveTo: string | null;
};

const SolveConfetti = ({ isSolved, lastMoveTo }: SolveConfettiProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wasSolvedRef = useRef(false);

  useEffect(() => {
    if (!isSolved || wasSolvedRef.current) {
      wasSolvedRef.current = isSolved;
      return;
    }

    wasSolvedRef.current = true;

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    let cleanup: (() => void) | undefined;
    const frameId = requestAnimationFrame(() => {
      const { x, y } = getMoveSquareOrigin(canvas, lastMoveTo);
      cleanup = runConfetti(canvas, x, y);
    });

    return () => {
      cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [isSolved, lastMoveTo]);

  useEffect(() => {
    if (!isSolved) {
      wasSolvedRef.current = false;
    }
  }, [isSolved]);

  return <ConfettiLayer ref={canvasRef} aria-hidden="true" />;
};

export default SolveConfetti;
