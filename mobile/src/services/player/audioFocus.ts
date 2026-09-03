type PauseFn = () => void;

const engines = new Map<string, PauseFn>();

export function registerAudioEngine(name: string, pause: PauseFn): () => void {
  engines.set(name, pause);
  return () => {
    engines.delete(name);
  };
}

// Now that the Mushaf engine survives navigation, both it and the Ruqyah
// engine can be loaded at the same time — whichever starts playing pauses
// the other so two recitations never sound at once.
export function claimAudioFocus(name: string): void {
  for (const [engineName, pause] of engines) {
    if (engineName !== name) {
      try {
        pause();
      } catch {}
    }
  }
}
