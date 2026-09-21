import { registerSW } from 'virtual:pwa-register';

/**
 * Registrace service workeru.
 *
 * Nová verze se nikdy nenasadí uprostřed úlohy — čeká, až bude dítě na
 * rozcestníku. Aktualizace aplikace během počítání je přesně ten druh věci,
 * která pětiletého rozhodí a rodič pak neví proč.
 */
let applyUpdate: (() => void) | null = null;
let pending = false;

export function setupServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      pending = true;
    },
  });

  applyUpdate = () => void update(true);
}

export const updateWaiting = (): boolean => pending;

/** Volá se, jakmile je bezpečné aplikaci restartovat. */
export function applyPendingUpdate(): void {
  if (pending && applyUpdate) {
    pending = false;
    applyUpdate();
  }
}
