// Windows XP Authentic System Sounds Player
// Plays original 16-bit 44.1kHz Windows XP system WAV audio files

let audioCtx: AudioContext | null = null;
let isMuted = true; // Default muted according to design audit A24
const audioBufferCache = new Map<string, AudioBuffer>();
const audioLoading = new Map<string, Promise<AudioBuffer | null>>();

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isMuted = muted;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("amazi-xp-muted", muted ? "1" : "0");
  }
}

export function getMuted(): boolean {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("amazi-xp-muted");
    if (stored !== null) return stored === "1";
    return true; // default muted
  }
  return isMuted;
}

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;

  if (audioBufferCache.has(url)) {
    return audioBufferCache.get(url)!;
  }
  if (audioLoading.has(url)) {
    return audioLoading.get(url)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCache.set(url, decoded);
      return decoded;
    } catch {
      return null;
    }
  })();

  audioLoading.set(url, promise);
  return promise;
}

function playHtmlAudio(url: string, volume: number) {
  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {});
  } catch {
    // Autoplay restrictions
  }
}

function playWav(url: string, volume = 0.5) {
  if (getMuted()) return;
  if (typeof window === "undefined") return;

  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const cached = audioBufferCache.get(url);
    if (cached) {
      try {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        source.buffer = cached;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      } catch {
        // Fallback
      }
    }

    loadBuffer(url).then((buffer) => {
      if (!buffer || !ctx) {
        playHtmlAudio(url, volume);
        return;
      }
      try {
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
      } catch {
        playHtmlAudio(url, volume);
      }
    }).catch(() => {
      playHtmlAudio(url, volume);
    });
    return;
  }

  playHtmlAudio(url, volume);
}

// Preload most common sounds immediately once client initializes
export function preloadXpSounds() {
  if (typeof window === "undefined") return;
  const common = [
    "/sounds/click.wav",
    "/sounds/balloon.wav",
    "/sounds/startup.wav",
    "/sounds/ding.wav",
    "/sounds/minimize.wav",
    "/sounds/restore.wav",
  ];
  common.forEach((url) => {
    loadBuffer(url);
  });
}

export const xpSound = {
  // Original Windows XP Startup Sound (played at soft volume)
  startup(vol = 0.12) {
    playWav("/sounds/startup.wav", vol);
  },

  // Windows Navigation Start (Classic Windows XP click)
  click(vol = 0.45) {
    playWav("/sounds/click.wav", vol);
  },

  // Windows XP Open Window / Folder Navigation (Windows Navigation Start)
  open(vol = 0.45) {
    playWav("/sounds/click.wav", vol);
  },

  // Windows XP Minimize to Taskbar
  minimize(vol = 0.4) {
    playWav("/sounds/minimize.wav", vol);
  },

  // Windows XP Restore from Taskbar ("вших" вверх)
  restore(vol = 0.4) {
    playWav("/sounds/restore.wav", vol);
  },

  // Windows XP Balloon Notification
  balloon(vol = 0.5) {
    playWav("/sounds/balloon.wav", vol);
  },

  // Windows XP Ding
  ding(vol = 0.5) {
    playWav("/sounds/ding.wav", vol);
  },

  // Windows XP Critical Stop / Error
  error(vol = 0.5) {
    playWav("/sounds/error.wav", vol);
  },

  // Windows XP Recycle Bin Empty
  recycle(vol = 0.55) {
    playWav("/sounds/recycle.wav", vol);
  },

  // Windows XP Exclamation
  exclamation(vol = 0.5) {
    playWav("/sounds/exclamation.wav", vol);
  },

  // Windows XP Hardware Insert
  hardwareInsert(vol = 0.5) {
    playWav("/sounds/hardware_insert.wav", vol);
  },

  // Windows XP Hardware Remove
  hardwareRemove(vol = 0.5) {
    playWav("/sounds/hardware_remove.wav", vol);
  },
};

// Play startup sound immediately on site opening (or on the very first touch/click in capture phase)
let playedStartup = false;
export function tryPlayStartupOnFirstGesture() {
  if (playedStartup) return;
  if (typeof window === "undefined") return;
  if (getMuted()) return;

  preloadXpSounds();

  const playStartup = () => {
    if (playedStartup) return;
    playedStartup = true;
    xpSound.startup(0.12);
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("pointerdown", playStartup, { capture: true });
    window.removeEventListener("mousedown", playStartup, { capture: true });
    window.removeEventListener("keydown", playStartup, { capture: true });
    window.removeEventListener("touchstart", playStartup, { capture: true });
    document.removeEventListener("click", playStartup, { capture: true });
  };

  // 1. Try immediate playback with HTML5 Audio on page open
  try {
    const audio = new Audio("/sounds/startup.wav");
    audio.volume = 0.12;
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          playedStartup = true;
        })
        .catch(() => {
          // Autoplay policy suspended sound until gesture:
          // Listen in CAPTURE phase so stopPropagation cannot block it!
          window.addEventListener("pointerdown", playStartup, { capture: true, once: true });
          window.addEventListener("mousedown", playStartup, { capture: true, once: true });
          window.addEventListener("keydown", playStartup, { capture: true, once: true });
          window.addEventListener("touchstart", playStartup, { capture: true, once: true });
          document.addEventListener("click", playStartup, { capture: true, once: true });
        });
      return;
    }
  } catch {
    // Fallback to capture listeners
  }

  window.addEventListener("pointerdown", playStartup, { capture: true, once: true });
  window.addEventListener("mousedown", playStartup, { capture: true, once: true });
  window.addEventListener("keydown", playStartup, { capture: true, once: true });
  window.addEventListener("touchstart", playStartup, { capture: true, once: true });
  document.addEventListener("click", playStartup, { capture: true, once: true });
}
