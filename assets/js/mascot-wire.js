// Bend only the lower wire; the face stays anchored near the pointer's grip.
export function createFlexibleWire(root) {
  const outline = root.querySelector('.search-mascot-wire');
  const core = root.querySelector('.search-mascot-wire-core');
  const shine = root.querySelector('.search-mascot-wire-shine');
  const feet = root.querySelector('.search-mascot-feet');
  const original = [outline, core, shine].map((path) => path.getAttribute('d'));
  let previous = 0;
  let previousLift = 0;
  function bend(amount, lift = 0) {
    if (Math.abs(amount - previous) + Math.abs(lift - previousLift) < 0.025) return;
    previous = amount;
    previousLift = lift;
    const weight = (y) => {
      const t = Math.max(0, Math.min(1, (y - 36) / 54));
      return t * t * (3 - 2 * t);
    };
    const p = (x, y) => `${(x + amount * weight(y)).toFixed(2)} ${(y + lift * weight(y)).toFixed(2)}`;
    const wire = `M${p(31, 65)}C${p(31, 53)} ${p(31, 42)} ${p(31, 30)}`
      + `C${p(31, 19)} ${p(47, 19)} ${p(47, 30)}`
      + `C${p(47, 43)} ${p(47, 60)} ${p(47, 73)}`
      + `C${p(47, 90)} ${p(20, 90)} ${p(20, 73)}`
      + `C${p(20, 57)} ${p(20, 40)} ${p(20, 26)}`
      + `C${p(20, 3)} ${p(61, 3)} ${p(61, 26)}`
      + `C${p(61, 42)} ${p(61, 59)} ${p(61, 71)}`;
    outline.setAttribute('d', wire);
    core.setAttribute('d', wire);
    shine.setAttribute('d', `M${p(21, 58)}C${p(21, 46)} ${p(21, 37)} ${p(21, 26)}`
      + `C${p(21, 7)} ${p(58, 7)} ${p(59, 25)}`
      + `M${p(32, 61)}C${p(32, 50)} ${p(32, 40)} ${p(32, 31)}`
      + `C${p(32, 22)} ${p(45, 22)} ${p(45, 31)}`
      + `C${p(45, 45)} ${p(45, 59)} ${p(45, 72)}`);
    feet.setAttribute('transform', `translate(${(amount * weight(85)).toFixed(2)} ${(lift * weight(85)).toFixed(2)})`);
  }
  function reset() {
    [outline, core, shine].forEach((path, index) => path.setAttribute('d', original[index]));
    feet.removeAttribute('transform');
    previous = previousLift = 0;
  }
  return { bend, reset };
}
