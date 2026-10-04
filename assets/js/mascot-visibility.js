// Animate between the real full/peek layouts; the final hit target stays native.
export function createMascotVisibilityMotion(root, onFinish) {
  const main = root.querySelector('.search-mascot-main');
  const art = root.querySelector('.search-mascot-art');
  let animations = [];
  let restore = null;
  let generation = 0;
  function stop() {
    generation++;
    animations.forEach((animation) => animation.cancel());
    animations = [];
    restore?.();
    restore = null;
    root.classList.remove('is-transitioning');
    delete root.dataset.visibilityMotion;
  }
  function run(change, reduced) {
    const before = { root: root.getBoundingClientRect(), main: main.getBoundingClientRect(), art: art.getBoundingClientRect() };
    stop();
    change();
    if (reduced || !root.animate || !before.art.width) { onFinish(); return; }
    const after = { root: root.getBoundingClientRect(), main: main.getBoundingClientRect(), art: art.getBoundingClientRect() };
    const id = ++generation;
    const styles = ['position', 'left', 'top', 'right'].map((name) => [name, art.style.getPropertyValue(name)]);
    const overflow = main.style.overflow;
    restore = () => {
      styles.forEach(([name, value]) => value ? art.style.setProperty(name, value) : art.style.removeProperty(name));
      main.style.overflow = overflow;
    };
    art.style.position = 'absolute';
    art.style.left = '0';
    art.style.top = '0';
    art.style.right = 'auto';
    main.style.overflow = 'hidden';
    root.classList.add('is-transitioning');
    root.dataset.visibilityMotion = root.classList.contains('is-tucked') ? 'hiding' : 'showing';
    const options = { duration: 440, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'both' };
    animations = [
      root.animate([{ transform: `translate3d(${before.root.left - after.root.left}px, ${before.root.top - after.root.top}px, 0)` },
        { transform: 'translate3d(0,0,0)' }], options),
      main.animate([{ width: `${before.main.width}px`, height: `${before.main.height}px` },
        { width: `${after.main.width}px`, height: `${after.main.height}px` }], options),
      art.animate([
        { transform: `translate(${before.art.left - before.main.left}px, ${before.art.top - before.main.top}px)`, width: `${before.art.width}px`, height: `${before.art.height}px` },
        { transform: `translate(${after.art.left - after.main.left}px, ${after.art.top - after.main.top}px)`, width: `${after.art.width}px`, height: `${after.art.height}px` },
      ], options),
    ];
    Promise.all(animations.map((animation) => animation.finished)).then(() => {
      if (id !== generation) return;
      stop();
      onFinish();
    }).catch(() => { /* A new drag, resize, or toggle may interrupt the transition. */ });
  }
  return { run, stop };
}
