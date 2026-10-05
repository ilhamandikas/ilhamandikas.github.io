// One decorative pass per page. No frame loop, sound, storage, or network requests.
export function createMascotCatPass(element, allowed, blocked, environment = window) {
  let timer = 0;
  let fallback = 0;
  let passed = false;
  function stop() {
    environment.clearTimeout(timer);
    environment.clearTimeout(fallback);
    timer = fallback = 0;
    if (!element) return;
    element.hidden = true;
    element.classList.remove('is-running');
  }
  function schedule(delay) {
    timer = environment.setTimeout(() => {
      timer = 0;
      if (!allowed()) { stop(); return; }
      // Let a drag or an open dialog finish before crossing the screen.
      if (blocked()) { schedule(5000); return; }
      passed = true;
      element.hidden = false;
      element.classList.add('is-running');
      fallback = environment.setTimeout(stop, 8500);
    }, delay);
  }
  function sync() {
    if (!element) return;
    if (!allowed()) { stop(); return; }
    if (passed || timer) return;
    schedule(60000);
  }
  element?.addEventListener('animationend', (event) => {
    if (event.animationName === 'nyan-cat-pass') stop();
  });
  return { sync, stop };
}
