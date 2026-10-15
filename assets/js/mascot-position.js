// Native SVG geometry owns persistent coordinates. WAAPI is only a short-lived
// dock animation; cancelling it never leaves a stylesheet or inline style behind.
export function createMascotPosition(root) {
  const anchor = root.closest('.search-mascot-anchor');
  let x = 0;
  let y = 0;
  let animation = null;
  let generation = 0;
  function set(left, top) {
    x = left;
    y = top;
    anchor.setAttribute('x', String(x));
    anchor.setAttribute('y', String(y));
  }
  function stop(freeze = false) {
    const box = freeze && animation ? root.getBoundingClientRect() : null;
    generation++;
    animation?.cancel();
    animation = null;
    root.classList.remove('is-docking');
    if (box) set(box.left, box.top);
  }
  function dock(fromX, fromY, onFinish) {
    stop();
    if (!root.animate) { onFinish(); return; }
    const dx = fromX - x;
    const dy = fromY - y;
    const id = ++generation;
    root.classList.add('is-docking');
    animation = root.animate([
      { transform: `translate3d(${dx}px, ${dy}px, 0)` },
      { transform: 'translate3d(0, 0, 0)' },
    ], { duration: Math.min(850, 420 + Math.hypot(dx, dy) * 0.65), easing: 'cubic-bezier(.25,.8,.25,1)', fill: 'both' });
    animation.finished.then(() => {
      if (id !== generation) return;
      stop();
      onFinish();
    }).catch(() => { /* Interruption deliberately cancels the old dock. */ });
  }
  return { set, stop, dock, get: () => ({ x, y }), resize(width, height) {
    anchor.setAttribute('width', String(width));
    anchor.setAttribute('height', String(height));
  } };
}
