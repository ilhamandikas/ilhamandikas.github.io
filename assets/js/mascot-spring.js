import { createFlexibleWire } from './mascot-wire.js';

// Independent head/tail springs. Only native SVG transforms/path geometry change.
export function createMascotSpring(root, { reduced, dragging, onFrame }) {
  const view = root.ownerDocument.defaultView;
  const group = root.querySelector('.search-mascot-spring');
  const wire = createFlexibleWire(root);
  let frame = 0;
  let time = 0;
  let angle = 0;
  let velocity = 0;
  let target = 0;
  let tail = 0;
  let tailVelocity = 0;
  let lift = 0;
  let liftVelocity = 0;
  let targetLift = 0;
  let speed = 0;
  let lastMotion = 0;
  function reset() {
    view.cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove('is-wobbling');
    angle = velocity = target = speed = tail = tailVelocity = 0;
    lift = liftVelocity = targetLift = 0;
    wire.reset();
    group.removeAttribute('transform');
  }
  function step(now) {
    frame = 0;
    const dt = time ? Math.min(0.048, (now - time) / 1000) : 1 / 60;
    time = now;
    const moving = dragging() && now - lastMotion < 140;
    const frequency = 10 + Math.min(2, speed) * 3;
    const goal = moving ? target : 0;
    const steps = Math.ceil(dt / (1 / 120));
    const tick = dt / steps;
    for (let i = 0; i < steps; i++) {
      velocity += ((goal - angle) * frequency * frequency - velocity * frequency * 1.2) * tick;
      angle += velocity * tick;
      const tailFrequency = 8.5 + Math.min(2, speed);
      tailVelocity += ((-angle * 0.8 - tail) * tailFrequency * tailFrequency - tailVelocity * tailFrequency * 1.3) * tick;
      tail += tailVelocity * tick;
      liftVelocity += (((moving ? targetLift : 0) - lift) * tailFrequency * tailFrequency - liftVelocity * tailFrequency * 1.3) * tick;
      lift += liftVelocity * tick;
    }
    wire.bend(14 * Math.tanh(tail / 14), lift);
    group.setAttribute('transform', `rotate(${angle} 40 32)`);
    onFrame();
    if (Math.abs(angle - goal) > 0.08 || Math.abs(velocity) > 0.3 || Math.abs(tail) > 0.06
      || Math.abs(tailVelocity) > 0.25 || Math.abs(lift) > 0.04 || Math.abs(liftVelocity) > 0.2 || moving) {
      frame = view.requestAnimationFrame(step);
    } else reset();
  }
  function kick(impulse = 0) {
    velocity += impulse;
    if (reduced() || root.ownerDocument.hidden || frame) return;
    time = 0;
    root.classList.add('is-wobbling');
    frame = view.requestAnimationFrame(step);
  }
  function move(dx, dy, elapsed, now) {
    const blend = 1 - Math.exp(-elapsed / 65);
    speed += (Math.min(3, Math.hypot(dx, dy) / elapsed) - speed) * blend;
    target += (-18 * Math.tanh(dx / elapsed * 0.7) - target) * blend;
    targetLift += (-4 * Math.tanh(dy / elapsed * 0.6) - targetLift) * blend;
    lastMotion = now;
    kick();
  }
  return { kick, move, reset, release() { target = targetLift = 0; } };
}
