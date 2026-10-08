import { useId, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

/*
 * Liquid Glass refraction: content behind a glass element bends near its rounded edges, like a lens.
 * Done with an SVG displacement filter used as a backdrop-filter. Chromium is the only engine that
 * supports url() filters in backdrop-filter, and it needs the filter sized in pixels to the element,
 * so each glass element gets its own filter with a displacement map generated for its exact size and
 * corner radius. Elsewhere this hook renders nothing and the glass is blur, tint and highlights only.
 */

const cache = new Map<string, string>();

/** Encodes, per pixel, the outward edge normal scaled by closeness to the edge: R = x, G = y, 128 = none. */
function lensMap(w: number, h: number, r: number, depth: number): string {
  const key = `${w}x${h}x${r}x${depth}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(w, h);
  const bx = w / 2 - r;
  const by = h / 2 - r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - w / 2;
      const py = y + 0.5 - h / 2;
      const qx = Math.abs(px) - bx;
      const qy = Math.abs(py) - by;
      let nx: number;
      let ny: number;
      let inside: number;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy);
        nx = qx / len;
        ny = qy / len;
        inside = r - len;
      } else if (qx > qy) {
        nx = 1;
        ny = 0;
        inside = r - qx;
      } else {
        nx = 0;
        ny = 1;
        inside = r - qy;
      }
      const t = Math.max(0, Math.min(1, 1 - inside / depth));
      const strength = t * t;
      const i = (y * w + x) * 4;
      img.data[i] = 128 + Math.sign(px || 1) * nx * strength * 127;
      img.data[i + 1] = 128 + Math.sign(py || 1) * ny * strength * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL();
  // ponytail: unbounded growth is bounded in practice by the number of distinct glass sizes on screen.
  if (cache.size > 200) cache.clear();
  cache.set(key, url);
  return url;
}

let supported: boolean | undefined;
function supportsLens(): boolean {
  if (supported === undefined) {
    supported =
      typeof navigator !== 'undefined' &&
      typeof document !== 'undefined' &&
      /\bChrome\//.test(navigator.userAgent) &&
      !!document.createElement('canvas').getContext;
  }
  return supported;
}

interface Box {
  w: number;
  h: number;
  r: number;
}

/**
 * Adds refraction to a `.cr-glass` element. Returns the filter markup to render inside the element.
 * The element reads it through `--cr-glass-lens`; reduced transparency or contrast turns it off in CSS.
 */
export function useLiquidGlass<T extends HTMLElement>(ref: RefObject<T | null>, enabled = true): ReactNode {
  const id = `cr-lens-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !supportsLens() || typeof ResizeObserver === 'undefined') return;
    const measure = (w: number, h: number) => {
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      const next = { w: Math.round(w), h: Math.round(h), r: Math.min(radius, w / 2, h / 2) };
      setBox((prev) => (prev && prev.w === next.w && prev.h === next.h && prev.r === next.r ? prev : next));
    };
    const observer = new ResizeObserver(([entry]) => {
      const size = entry?.borderBoxSize?.[0];
      if (size) measure(size.inlineSize, size.blockSize);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (box && box.w > 0 && box.h > 0) el.style.setProperty('--cr-glass-lens', `url(#${id})`);
    else el.style.removeProperty('--cr-glass-lens');
  }, [ref, box, id]);

  if (!box || box.w < 2 || box.h < 2) return null;
  const depth = Math.max(4, Math.min(18, box.h / 2.4, box.w / 2.4));
  const href = lensMap(box.w, box.h, box.r, Math.round(depth));
  if (!href) return null;
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <filter
        id={id}
        x="0"
        y="0"
        width={box.w}
        height={box.h}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={href} x="0" y="0" width={box.w} height={box.h} result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={-depth * 1.4} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
