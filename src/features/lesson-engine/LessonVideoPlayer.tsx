import { useEffect, useRef } from "react";
import type { InteractiveLessonDefinition } from "@shared/lesson-engine/types";

type LessonVideo = NonNullable<InteractiveLessonDefinition["videos"]>[number];
interface YouTubePlayer { destroy(): void }
interface YouTubeAPI {
  Player: new (frame: HTMLIFrameElement, options: {
    events: { onStateChange: (event: { data: number }) => void };
  }) => YouTubePlayer;
}
type YouTubeWindow = Window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void };
let apiPromise: Promise<YouTubeAPI> | null = null;

function loadYouTubeAPI(): Promise<YouTubeAPI> {
  const host = window as YouTubeWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previousReady = host.onYouTubeIframeAPIReady;
    host.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (host.YT?.Player) resolve(host.YT);
      else reject(new Error("YouTube API unavailable"));
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      host.onYouTubeIframeAPIReady = previousReady;
      script.remove();
      reject(new Error("YouTube API could not load"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function youtubePlayerUrl(url: string, origin: string): string {
  const playerUrl = new URL(url);
  playerUrl.searchParams.set("autoplay", "0");
  playerUrl.searchParams.set("playsinline", "1");
  playerUrl.searchParams.set("enablejsapi", "1");
  playerUrl.searchParams.set("origin", origin);
  return playerUrl.toString();
}

export function LessonVideoPlayer({ video, onStarted, onCompleted }: { video: LessonVideo; onStarted: () => void; onCompleted?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const startedCallback = useRef(onStarted);
  const completedCallback = useRef(onCompleted);
  completedCallback.current = onCompleted;
  const hostedStarted = useRef(false);
  startedCallback.current = onStarted;

  useEffect(() => {
    if (video.source === "hosted" || !hostRef.current) return;
    const host = hostRef.current;
    // Keep YouTube's imperative DOM isolated from React, including cleanup and Strict Mode.
    const frame = document.createElement("iframe");
    frame.className = "block h-full w-full";
    frame.src = youtubePlayerUrl(video.url, window.location.origin);
    frame.title = video.title;
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    host.replaceChildren(frame);
    let disposed = false;
    let started = false;
    let ended = false;
    let player: YouTubePlayer | undefined;
    void loadYouTubeAPI().then((api) => {
      if (disposed) return;
      player = new api.Player(frame, { events: { onStateChange: (event) => {
        if (!disposed && !started && event.data === 1) {
          started = true;
          startedCallback.current();
        }
        if (!disposed && started && !ended && event.data === 0) {
          ended = true;
          completedCallback.current?.();
        }
      } } });
    }).catch(() => {
      // The native iframe remains usable even if optional playback analytics is blocked.
    });
    return () => {
      disposed = true;
      player?.destroy();
      host.replaceChildren();
    };
  }, [video.id, video.source, video.title, video.url]);

  if (video.source !== "hosted") {
    return <div ref={hostRef} className="h-full w-full" data-testid="youtube-video-player" />;
  }
  return (
    <video className="h-full w-full" controls playsInline preload="metadata" poster={video.thumbnailUrl} onEnded={() => completedCallback.current?.()}
      aria-label={video.title} onPlaying={() => {
        if (hostedStarted.current) return;
        hostedStarted.current = true;
        startedCallback.current();
      }}>
      <source src={video.url} type="video/mp4" />
      {video.captionsUrl && <track kind="subtitles" src={video.captionsUrl} srcLang="ar" label="العربية" default />}
      متصفحك لا يدعم تشغيل الفيديو.
    </video>
  );
}
