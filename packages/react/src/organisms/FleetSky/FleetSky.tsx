import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { statusLabels, type Status } from '../../atoms/Badge/Badge';
import { cx } from '../../internal/cx';
import { LiveRegion } from '../../internal/LiveRegion';
import './FleetSky.css';

export interface SkyAgent {
  id: string;
  name: string;
  status: Status;
  /** One short line, e.g. "4 steps in" or "wants to run npm install zod@3". */
  detail?: string | undefined;
}

export interface FleetSkyProps {
  agents: SkyAgent[];
  /** Makes each agent's name tag a button, e.g. to open its run. */
  onSelect?: (id: string) => void;
  /** Accessible name of the sky. */
  label?: string;
  /** Name of the anchor every line runs back to. */
  you?: string;
  className?: string;
}

interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sag: number;
}

const ANCHOR = { x: 0.5, y: 0.84 };

/** Where an agent wants to be, as a fraction of the sky, at time t (seconds). */
function target(agent: SkyAgent, index: number, count: number, t: number) {
  const phase = index * 2.1;
  const speed = 0.28 + (index % 3) * 0.07;
  switch (agent.status) {
    case 'waiting': {
      // Returning: hovers close to you, slightly offset so several requests don't overlap.
      const offset = (index - (count - 1) / 2) * 0.09;
      return { x: 0.5 + offset + Math.sin(t * 0.9 + phase) * 0.01, y: 0.58 + Math.cos(t * 1.1 + phase) * 0.012 };
    }
    case 'done':
      return { x: 0.5 + (index - (count - 1) / 2) * 0.16, y: 0.74 };
    case 'failed':
      return { x: 0.12 + (0.76 * (index + 0.5)) / count, y: 0.66 };
    case 'blocked':
      return { x: 0.12 + (0.76 * (index + 0.5)) / count, y: 0.34 + Math.sin(t * 0.6 + phase) * 0.01 };
    default:
      return {
        x: 0.12 + (0.76 * (index + 0.5)) / count + Math.cos(t * speed + phase) * 0.07,
        y: 0.24 + (index % 2) * 0.12 + Math.sin(t * speed * 1.3 + phase) * 0.06,
      };
  }
}

/**
 * The fleet as birds in a sky, each on a line back to you. A slack line is an agent flying on its
 * own; a taut, glowing line is one that needs you. The canvas is decorative; the name tags are real
 * elements (buttons when `onSelect` is set) and carry the status in text.
 */
export function FleetSky({ agents, onSelect, label = 'Your agents', you = 'You', className }: FleetSkyProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagRefs = useRef(new Map<string, HTMLElement>());
  const birds = useRef(new Map<string, Bird>());
  const agentsRef = useRef(agents);
  const redrawRef = useRef<(() => void) | undefined>(undefined);
  useLayoutEffect(() => {
    agentsRef.current = agents;
  }, [agents]);
  const headingId = useId();

  // Announce agents as they start needing the person.
  const [announcement, setAnnouncement] = useState('');
  const seenWaiting = useRef(new Set<string>());
  useEffect(() => {
    const newly = agents.filter((a) => a.status === 'waiting' && !seenWaiting.current.has(a.id));
    agents.forEach((a) => (a.status === 'waiting' ? seenWaiting.current.add(a.id) : seenWaiting.current.delete(a.id)));
    if (newly.length) setAnnouncement(`${newly.map((a) => a.name).join(', ')} ${newly.length > 1 ? 'need' : 'needs'} you`);
  }, [agents]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !ctx) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const dpr = window.devicePixelRatio || 1;
    const stars = Array.from({ length: 70 }, (_, i) => [((i * 97) % 100) / 100, ((i * 53) % 55) / 100, i]);
    let width = 0;
    let height = 0;
    let colors: Record<string, string> = {};
    let frame = 0;
    let raf = 0;

    const readColors = () => {
      const cs = getComputedStyle(root);
      const v = (name: string) => cs.getPropertyValue(name).trim();
      colors = {
        slack: v('--cr-color-tether-slack'),
        taut: v('--cr-color-tether-taut'),
        done: v('--cr-color-status-done-fg'),
        failed: v('--cr-color-status-failed-fg'),
        blocked: v('--cr-color-status-blocked-fg'),
        bird: v('--cr-color-text-default'),
        star: v('--cr-color-sky-star'),
      };
    };
    const resize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // Resizing clears the canvas; under reduced motion nothing else would repaint it.
      redraw();
    };

    const draw = (ms: number) => {
      const t = reduce ? 0 : ms / 1000;
      if (frame++ % 30 === 0) readColors();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (const [sx, sy, i] of stars) {
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.5 + (i as number)));
        ctx.fillStyle = colors.star ?? 'transparent';
        ctx.fillRect((sx as number) * width, (sy as number) * height, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      const ax = ANCHOR.x * width;
      const ay = ANCHOR.y * height;
      const list = agentsRef.current;
      list.forEach((agent, i) => {
        const goal = target(agent, i, list.length, t);
        const gx = goal.x * width;
        const gy = goal.y * height;
        let b = birds.current.get(agent.id);
        if (!b) {
          b = { x: gx, y: gy, vx: 0, vy: 0, sag: 1 };
          birds.current.set(agent.id, b);
        }
        if (reduce) {
          b.x = gx;
          b.y = gy;
        } else {
          // A soft spring, so a change of status reads as the bird flying somewhere new.
          b.vx = (b.vx + (gx - b.x) * 0.02) * 0.86;
          b.vy = (b.vy + (gy - b.y) * 0.02) * 0.86;
          b.x += b.vx;
          b.y += b.vy;
        }
        const taut = agent.status === 'waiting';
        b.sag += ((taut ? 0 : 1) - b.sag) * (reduce ? 1 : 0.05);

        // The line back to you.
        const line =
          agent.status === 'done'
            ? colors.done
            : agent.status === 'failed'
              ? colors.failed
              : agent.status === 'blocked'
                ? colors.blocked
                : taut
                  ? colors.taut
                  : colors.slack;
        ctx.save();
        ctx.strokeStyle = line ?? '';
        ctx.lineWidth = taut ? 2.4 : 1.3;
        if (agent.status === 'failed') ctx.setLineDash([5, 6]);
        if (taut) {
          ctx.shadowColor = colors.taut ?? '';
          ctx.shadowBlur = 16;
        }
        const dist = Math.hypot(b.x - ax, b.y - ay);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo((ax + b.x) / 2, Math.max(ay, b.y) + b.sag * dist * 0.35, b.x, b.y);
        ctx.stroke();
        ctx.restore();

        // The bird: wings flap in flight, fold when done, droop when failed.
        const resting = agent.status === 'done' || agent.status === 'failed';
        const flap = resting ? 2 : Math.sin(t * (taut ? 6 : 9) + i) * 6;
        const s = taut ? 1.35 : 1;
        ctx.save();
        ctx.translate(b.x, b.y);
        if (agent.status === 'failed') ctx.rotate(0.5);
        ctx.strokeStyle = taut ? (colors.taut ?? '') : (colors.bird ?? '');
        ctx.lineWidth = 2.2 * s;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-14 * s, -flap);
        ctx.quadraticCurveTo(-6 * s, -3 * s, 0, 0);
        ctx.quadraticCurveTo(6 * s, -3 * s, 14 * s, -flap);
        ctx.stroke();
        ctx.restore();

        const tag = tagRefs.current.get(agent.id);
        if (tag) tag.style.transform = `translate(${Math.round(b.x)}px, ${Math.round(b.y + 14 * s)}px) translateX(-50%)`;
      });

      // You.
      ctx.fillStyle = colors.taut ?? '';
      ctx.beginPath();
      ctx.arc(ax, ay, 5, 0, Math.PI * 2);
      ctx.fill();

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    // Reduced motion draws on demand: on resize, on a theme change, and when agents change.
    redrawRef.current = () => {
      readColors();
      redraw();
    };
    const theme = new MutationObserver(redrawRef.current);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-transparency'] });
    const scheme = window.matchMedia?.('(prefers-color-scheme: dark)');
    scheme?.addEventListener('change', redrawRef.current);

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();
    readColors();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      theme.disconnect();
      if (redrawRef.current) scheme?.removeEventListener('change', redrawRef.current);
      redrawRef.current = undefined;
    };
  }, []);

  useEffect(() => redrawRef.current?.(), [agents]);

  // Forget birds for agents that left.
  useEffect(() => {
    const ids = new Set(agents.map((a) => a.id));
    for (const id of birds.current.keys()) if (!ids.has(id)) birds.current.delete(id);
  }, [agents]);

  return (
    <section ref={rootRef} className={cx('cr-sky', className)} aria-labelledby={headingId}>
      <h2 id={headingId} className="cr-visually-hidden">
        {label}
      </h2>
      <canvas ref={canvasRef} className="cr-sky__canvas" aria-hidden="true" />
      <ul className="cr-sky__tags">
        {agents.map((agent) => {
          const text = (
            <>
              <span className="cr-sky__name">{agent.name}</span>
              <span className="cr-sky__status">
                {agent.status === 'waiting' ? 'needs you' : statusLabels[agent.status].toLowerCase()}
                {agent.detail && <span className="cr-sky__detail">, {agent.detail}</span>}
              </span>
            </>
          );
          return (
            <li
              key={agent.id}
              ref={(el) => {
                if (el) tagRefs.current.set(agent.id, el);
                else tagRefs.current.delete(agent.id);
              }}
              className="cr-sky__tag"
              data-status={agent.status}
            >
              {onSelect ? (
                <button type="button" className="cr-sky__tag-button" onClick={() => onSelect(agent.id)}>
                  {text}
                </button>
              ) : (
                <span className="cr-sky__tag-button">{text}</span>
              )}
            </li>
          );
        })}
      </ul>
      <span className="cr-sky__you" aria-hidden="true">
        {you}
      </span>
      <LiveRegion message={announcement} />
    </section>
  );
}
