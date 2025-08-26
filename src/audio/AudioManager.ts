// src/audio/AudioManager.ts

class AudioManager {
  private tracks: Record<string, HTMLAudioElement> = {};
  private current?: string;

  add(name: string, url: string) {
    if (this.tracks[name]) return;
    const a = new Audio(url);
    a.preload = "auto";
    a.loop = true;
    a.volume = 0;
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

    if (this.current && this.current !== name) {
        this.stop(this.current);
    }

    this.current = name;
    next.loop = loop;
    try {
        // Aggiungi un'interazione esplicita per attivare la riproduzione
        if (next.paused) {
            await next.play();
            console.log(`[AudioManager] Playing track "${name}" (unmuted)`);
            next.volume = volume;
        }
    } catch (err) {
      console.warn(`[AudioManager] Autoplay blocked for "${name}"`, err);
      // Rilancia l'errore per gestirlo nel componente App
      throw err;
    }

    // Il cross-fade può essere aggiunto qui, se necessario
  }

  stop(name: string) {
    const track = this.tracks[name];
    if (track) {
      track.pause();
      track.currentTime = 0;
      console.log(`[AudioManager] Track "${name}" fermata.`);
    }
  }

  stopAll() {
    for (const name in this.tracks) {
      this.stop(name);
    }
  }
}

export const audio = new AudioManager();