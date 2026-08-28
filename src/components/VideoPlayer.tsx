"use client";

import { useEffect, useRef, useState } from "react";

type VideoPlayerProps = {
  src: string;
  poster?: string | null;
};

export default function VideoPlayer({
  src,
  poster,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);

      if (video.duration) {
        setDuration(video.duration);
        setProgress(
          (video.currentTime / video.duration) * 100
        );
      }
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    const handleFullscreen = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener(
        "loadedmetadata",
        updateTime
      );
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, []);

  function revealControls() {
    setShowControls(true);

    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    if (playing) {
      hideTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }

  async function togglePlay() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }

    revealControls();
  }

  function handleProgressChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    const value = Number(event.target.value);
    const newTime = (value / 100) * video.duration;

    video.currentTime = newTime;
    setProgress(value);
    setCurrentTime(newTime);
    revealControls();
  }

  function handleVolumeChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const video = videoRef.current;

    if (!video) return;

    const value = Number(event.target.value);

    video.volume = value;
    video.muted = value === 0;

    setVolume(value);
    setMuted(value === 0);
  }

  function toggleMute() {
    const video = videoRef.current;

    if (!video) return;

    if (video.muted || video.volume === 0) {
      video.muted = false;

      const newVolume = volume > 0 ? volume : 1;

      video.volume = newVolume;
      setVolume(newVolume);
      setMuted(false);
    } else {
      video.muted = true;
      setMuted(true);
    }

    revealControls();
  }

  async function toggleFullscreen() {
    const container = containerRef.current;

    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }

    revealControls();
  }

  function formatTime(time: number) {
    if (!Number.isFinite(time)) {
      return "0:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing) {
          setShowControls(false);
        }
      }}
      className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="aspect-video w-full cursor-pointer bg-black object-contain"
      />

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] shadow-[0_0_60px_rgba(255,255,255,0.12)] backdrop-blur-2xl transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-white/[0.15] active:scale-95 sm:h-24 sm:w-24"
        >
          <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[15px] border-y-transparent border-l-white sm:border-y-[12px] sm:border-l-[18px]" />
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-6 sm:pb-6 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        } transition-all duration-300`}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              style={{
                width: `${progress}%`,
              }}
            />

            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleProgressChange}
              aria-label="Video progress"
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/45 px-3 py-2 backdrop-blur-2xl sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause video" : "Play video"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-all duration-200 hover:scale-105 hover:bg-white/[0.14] active:scale-95"
          >
            {playing ? (
              <span className="flex gap-1">
                <span className="h-3.5 w-1 rounded-full bg-white" />
                <span className="h-3.5 w-1 rounded-full bg-white" />
              </span>
            ) : (
              <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.08] hover:text-white sm:flex"
          >
            {muted ? (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <path d="m17 9 4 6m0-6-4 6" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 6a9 9 0 0 1 0 12" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="hidden h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/15 accent-white md:block"
          />

          <span className="ml-1 text-[11px] font-medium tabular-nums text-white/45 sm:ml-2 sm:text-xs">
            {formatTime(currentTime)}
            <span className="mx-1.5 text-white/20">
              /
            </span>
            {formatTime(duration)}
          </span>

          <div className="ml-auto">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={
                fullscreen
                  ? "Exit fullscreen"
                  : "Fullscreen"
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-all duration-200 hover:scale-105 hover:bg-white/[0.14] hover:text-white active:scale-95"
            >
              {fullscreen ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M20 15v5h-5" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-3 py-1.5 backdrop-blur-xl">
        <span className="h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">
          3D PLATFORM
        </span>
      </div>
    </div>
  );
}