class AudioManager {
  private tracks: Record<string, HTMLAudioElement> = {};
  private current?: string;

  add(name: string, url: string) {
    if (this.tracks[name]) return;
    const a = new Audio(url);
    a.preload = "auto";
    a.loop = true;
    a.volume = 0;
    a.muted = true; // 👈 trucco: partire muted
    this.tracks[name] = a;
    console.log(`[AudioManager] Added track "${name}" -> ${url}`);
  }

  async play(name: string, opts: { loop?: boolean; volume?: number; fadeMs?: number } = {}) {
    const { loop = true, volume = 0.6, fadeMs = 600 } = opts;
    const next = this.tracks[name];
    if (!next) {
      console.error(`[AudioManager] Track "${name}" not found!`);
      return;
    }

    next.loop = loop;
    try {
      if (next.paused) {
        await next.play();
        console.log(`[AudioManager] Playing track "${name}" (muted-first OK)`);
      }
      // smuta subito dopo per sbloccare
      setTimeout(() => {
        next.muted = false;
        console.log(`[AudioManager] Track "${name}" unmuted`);
      }, 0);
    } catch (err) {
      console.warn(`[AudioManager] Autoplay blocked for "${name}"`, err);
      throw err; // rilancia, così gli unlockers in App.tsx intervengono
    }

    // qui puoi mettere la logica di cross-fade (omessa per brevità)
  }
}

export const audio = new AudioManager();
