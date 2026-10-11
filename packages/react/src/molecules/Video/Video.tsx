'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { ExpandIcon, MutedIcon, PauseBarsIcon, PlayIcon, VolumeIcon } from '../../internal/icons';
import './Video.css';

export interface VideoProps {
  src: string;
  /** WebVTT captions. Shown by default: recordings of agents are mostly read, not heard. */
  captions?: { src: string; label?: string; lang?: string };
  poster?: string;
  /** Names the player, such as "Run 41 recording". */
  label: string;
  caption?: ReactNode;
  className?: string;
}

const time = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

/**
 * A video with glass controls: play, seek, time, captions, mute and full screen. It never autoplays,
 * starts muted, and shows captions when they exist.
 */
export function Video({ src, captions, poster, label, caption, className }: VideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [cc, setCc] = useState(!!captions);
  const [now, setNow] = useState(0);
  const [length, setLength] = useState(0);

  useEffect(() => {
    const track = video.current?.textTracks[0];
    if (track) track.mode = cc ? 'showing' : 'hidden';
  }, [cc]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };

  return (
    <figure ref={frame} className={cx('cr-video', className)} aria-label={label}>
      <div className="cr-video__stage">
        {/* Captions are a track when provided; the control bar is the keyboard path. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={video}
          className="cr-video__media"
          src={src}
          poster={poster}
          muted={muted}
          playsInline
          preload="metadata"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
        >
          {captions && <track kind="captions" src={captions.src} label={captions.label ?? 'Captions'} srcLang={captions.lang ?? 'en'} default />}
        </video>
        {!playing && (
          <button type="button" className="cr-video__big-play" aria-label={`Play ${label}`} onClick={toggle}>
            <PlayIcon />
          </button>
        )}
        <div className="cr-video__bar">
          <button type="button" className="cr-video__button" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle}>
            {playing ? <PauseBarsIcon /> : <PlayIcon />}
          </button>
          <span className="cr-video__time">
            {time(now)} / {time(length)}
          </span>
          <input
            type="range"
            className="cr-video__seek"
            aria-label="Seek"
            aria-valuetext={`${time(now)} of ${time(length)}`}
            min={0}
            max={length || 0}
            step={0.1}
            value={now}
            onChange={(e) => {
              if (video.current) video.current.currentTime = Number(e.currentTarget.value);
            }}
          />
          {captions && (
            <button type="button" className="cr-video__button cr-video__cc" aria-pressed={cc} onClick={() => setCc(!cc)}>
              CC<span className="cr-visually-hidden"> captions</span>
            </button>
          )}
          <button type="button" className="cr-video__button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted(!muted)}>
            {muted ? <MutedIcon /> : <VolumeIcon />}
          </button>
          <button
            type="button"
            className="cr-video__button"
            aria-label="Full screen"
            onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void frame.current?.requestFullscreen?.())}
          >
            <ExpandIcon />
          </button>
        </div>
      </div>
      {caption && <figcaption className="cr-video__caption">{caption}</figcaption>}
    </figure>
  );
}
