import { createQuoteDeck } from './mascot-quotes.js';

// Only presentation preferences and public quotes are saved; never search terms.
export function initSearchMascot(openSearch) {
  const root = document.querySelector('#search-mascot');
  if (!root) return;
  const main = root.querySelector('.search-mascot-main');
  const bubble = root.querySelector('.search-mascot-bubble');
  const hint = root.querySelector('.search-mascot-hint');
  const art = root.querySelector('.search-mascot-art');
  const pupils = [...root.querySelectorAll('.search-mascot-pupil')];
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const key = 'ilham-search-companion-v1';
  let side = 'right';
  let level = 1;
  let tucked = false;
  let drag = null;
  let suppressClick = false;
  let hovered = false;
  let gaze = null;
  let gazeFrame = 0;
  let wobbleFrame = 0;
  let wobbleTime = 0;
  let angle = 0;
  let angularVelocity = 0;
  let targetAngle = 0;
  let dragSpeed = 0;
  let lastMotion = 0;
  let dizzyTimer = 0;
  let dockTimer = 0;
  let dockFrame = 0;
  let dragFrame = 0;
  let gazeTime = 0;
  const eyeOffsets = pupils.map(() => ({ x: 0, y: 0 }));
  let quoteStorage;
  try { quoteStorage = window.localStorage; } catch { /* Optional quote cache. */ }
  const quoteDeck = createQuoteDeck({ storage: quoteStorage, fetcher: window.fetch?.bind(window) });
  let idleQuote = null;
  let quotePhase = false;
  let idleTimer = 0;
  let quoteLoading = false;
  let active = true;
  let renderedMessage = '';
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      side = saved.side === 'left' ? 'left' : 'right';
      if (Number.isFinite(saved.level)) level = Math.max(0, Math.min(1, saved.level));
      tucked = saved.tucked === true;
    }
  } catch { /* Storage may be unavailable. The companion still works. */ }

  const width = () => tucked ? 44 : 96;
  const maxY = () => Math.max(8, window.innerHeight - 130);
  const clampX = (x) => Math.max(8, Math.min(Math.max(8, window.innerWidth - width() - 8), x));
  const clampY = (y) => Math.max(8, Math.min(maxY(), y));
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify({ side, level, tucked })); } catch { /* Optional preference. */ }
  };
  const keyboardFocused = () => document.activeElement === main && main.matches(':focus-visible');
  const isIdle = () => active && !document.hidden && !tucked && !hovered && !drag
    && !keyboardFocused() && !root.classList.contains('is-dizzy')
    && !root.classList.contains('is-docking');
  function syncIdle() {
    if (!isIdle()) {
      clearTimeout(idleTimer);
      idleTimer = 0;
      return;
    }
    if (idleTimer || quoteLoading) return;
    const delay = quotePhase && idleQuote ? Math.max(12000, idleQuote.quote.length * 70) : 8000;
    idleTimer = setTimeout(async () => {
      idleTimer = 0;
      if (!isIdle()) return;
      if (quotePhase) quotePhase = false;
      else {
        quoteLoading = true;
        await quoteDeck.load();
        quoteLoading = false;
        if (!isIdle()) { syncIdle(); return; }
        idleQuote = quoteDeck.next();
        quotePhase = Boolean(idleQuote);
      }
      say();
    }, delay);
  }
  function say() {
    const showingQuote = isIdle() && quotePhase && idleQuote;
    const text = tucked ? 'Psst… click to bring me back!' : drag?.hideSide ? 'Release to hide!' : root.classList.contains('is-dizzy')
      ? "Whoa... I'm dizzy!" : hovered || keyboardFocused()
        ? 'Click me!' : showingQuote ? `“${idleQuote.quote}”` : 'Want to search something?';
    const author = showingQuote ? `— ${idleQuote.author}` : '';
    const signature = text + author;
    root.classList.toggle('is-quote', Boolean(showingQuote));
    if (renderedMessage !== signature) {
      renderedMessage = signature;
      const message = document.createElement('span');
      message.className = 'search-mascot-message';
      message.textContent = text;
      bubble.replaceChildren(message);
      if (author) {
        const credit = document.createElement('span');
        credit.className = 'search-mascot-author';
        credit.textContent = author;
        bubble.append(credit);
      }
      bubble.title = author ? 'Quotes provided by DummyJSON' : '';
      const height = bubble.offsetHeight || (showingQuote ? 180 : 60);
      const top = drag?.currentY ?? parseFloat(root.style.top);
      const below = window.innerHeight - top - (tucked ? 64 : 100) - 12;
      root.classList.toggle('bubble-below', top < height + 12 && below > top - 12);
      if (!motion?.matches) message.animate?.([{ opacity: 0, transform: 'translateY(3px)' },
        { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
    }
    syncIdle();
  }
  function place() {
    root.dataset.side = side;
    root.classList.toggle('is-tucked', tucked);
    root.style.left = `${clampX(side === 'left' ? 8 : window.innerWidth - width() - 8)}px`;
    root.style.top = `${8 + level * (maxY() - 8)}px`;
    root.classList.toggle('bubble-below', parseFloat(root.style.top) < 80);
    main.setAttribute('aria-label', tucked ? 'Show search companion' : 'Search tools, guides, and posts');
    if (tucked) main.removeAttribute('aria-haspopup');
    else main.setAttribute('aria-haspopup', 'dialog');
    hint.textContent = tucked ? 'Click to show the search companion.'
      : 'Click to search. Drag outward past either screen edge to hide. Use arrow keys to move, or H to hide when focused.';
    say();
    scheduleGaze();
  }

  // A damped spring runs only during movement and its short settling tail.
  function kickWobble() {
    if (motion?.matches || document.hidden || wobbleFrame) return;
    art.style.animation = 'none';
    wobbleTime = 0;
    wobbleFrame = window.requestAnimationFrame(wobble);
  }
  function wobble(now) {
    wobbleFrame = 0;
    const dt = wobbleTime ? Math.min(0.048, (now - wobbleTime) / 1000) : 1 / 60;
    wobbleTime = now;
    const moving = drag && now - lastMotion < 140;
    const frequency = 10 + Math.min(2, dragSpeed) * 3;
    const target = moving ? targetAngle : 0;
    // Small integration steps keep the spring stable on slower displays.
    const steps = Math.ceil(dt / (1 / 120));
    const step = dt / steps;
    for (let i = 0; i < steps; i++) {
      angularVelocity += ((target - angle) * frequency * frequency - angularVelocity * frequency * 1.2) * step;
      angle += angularVelocity * step;
    }
    art.style.transform = `rotate(${angle}deg)`;
    scheduleGaze();
    if (Math.abs(angle - target) > 0.08 || Math.abs(angularVelocity) > 0.3 || moving) {
      wobbleFrame = window.requestAnimationFrame(wobble);
    } else resetWobble();
  }
  function resetWobble() {
    window.cancelAnimationFrame(wobbleFrame);
    wobbleFrame = 0;
    angle = angularVelocity = targetAngle = dragSpeed = 0;
    art.style.removeProperty('transform');
    art.style.removeProperty('animation');
  }
  function getDizzy() {
    root.classList.add('is-dizzy');
    clearTimeout(dizzyTimer);
    dizzyTimer = setTimeout(() => {
      root.classList.remove('is-dizzy');
      say();
    }, 2400);
    say();
  }

  // Follow in SVG coordinates (including rotation), with a short easing tail.
  function scheduleGaze() {
    if (!gaze || gazeFrame || document.hidden) return;
    gazeFrame = window.requestAnimationFrame(updateGaze);
  }
  function updateGaze(now) {
    gazeFrame = 0;
    const box = art.getBoundingClientRect();
    const bounds = root.getBoundingClientRect();
    const dx = Math.max(bounds.left - gaze.x, 0, gaze.x - bounds.right);
    const dy = Math.max(bounds.top - gaze.y, 0, gaze.y - bounds.bottom);
    root.classList.toggle('is-near', tucked && Math.hypot(dx, dy) < 110);
    if (motion?.matches || !box.width || !box.height) return;
    const dt = gazeTime ? Math.min(0.05, (now - gazeTime) / 1000) : 1 / 60;
    gazeTime = now;
    const blend = 1 - Math.exp(-dt * 20);
    let localX = (gaze.x - box.left) * 80 / box.width;
    let localY = (gaze.y - box.top) * 100 / box.height;
    const matrix = root.querySelector('.search-mascot-body').getScreenCTM?.();
    if (matrix && art.createSVGPoint) {
      const point = art.createSVGPoint();
      point.x = gaze.x;
      point.y = gaze.y;
      const local = point.matrixTransform(matrix.inverse());
      localX = local.x;
      localY = local.y;
    }
    let settling = false;
    pupils.forEach((pupil, index) => {
      const dx = localX - Number(pupil.dataset.cx);
      const dy = localY - Number(pupil.dataset.cy);
      const distance = Math.hypot(dx, dy);
      const direction = Math.atan2(dy, dx);
      const strength = Math.min(1, distance / 45);
      const x = Math.cos(direction) * 5.5 * strength;
      const y = Math.sin(direction) * 6 * strength;
      const offset = eyeOffsets[index];
      offset.x += (x - offset.x) * blend;
      offset.y += (y - offset.y) * blend;
      settling ||= Math.abs(x - offset.x) + Math.abs(y - offset.y) > 0.015;
      pupil.setAttribute('transform', `translate(${offset.x} ${offset.y})`);
    });
    if (settling || root.classList.contains('is-docking')) scheduleGaze();
    else gazeTime = 0;
  }
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    gaze = { x: event.clientX, y: event.clientY };
    scheduleGaze();
  }, { passive: true });
  motion?.addEventListener('change', () => {
    if (motion.matches) {
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      pupils.forEach((pupil, index) => {
        pupil.removeAttribute('transform');
        eyeOffsets[index].x = eyeOffsets[index].y = 0;
      });
      gazeTime = 0;
      resetWobble();
    } else scheduleGaze();
  });
  main.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    if (tucked) root.classList.add('is-near');
    say();
  });
  main.addEventListener('pointerleave', () => { hovered = false; say(); });
  main.addEventListener('focus', say);
  main.addEventListener('blur', say);
  place();
  root.hidden = false;

  main.addEventListener('click', (event) => {
    if (suppressClick && event.detail !== 0) {
      suppressClick = false;
      return;
    }
    if (tucked) {
      tucked = false;
      place();
      save();
    } else openSearch();
  });
  function stopDocking(freeze = false) {
    const box = freeze ? root.getBoundingClientRect() : null;
    clearTimeout(dockTimer);
    window.cancelAnimationFrame(dockFrame);
    dockFrame = 0;
    root.classList.remove('is-docking');
    root.style.removeProperty('transform');
    if (box) {
      root.style.left = `${box.left}px`;
      root.style.top = `${box.top}px`;
    }
    syncIdle();
  }
  root.addEventListener('transitionend', (event) => {
    if (event.target === root && event.propertyName === 'transform') { stopDocking(); say(); }
  });
  main.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary || tucked) return;
    if (root.classList.contains('is-docking')) stopDocking(true);
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: parseFloat(root.style.left), top: parseFloat(root.style.top), moved: false, hideSide: null,
      currentX: parseFloat(root.style.left), currentY: parseFloat(root.style.top),
      lastX: event.clientX, lastY: event.clientY, lastTime: window.performance.now(), heading: null, turns: 0 };
    main.setPointerCapture(event.pointerId);
  });
  main.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    const now = window.performance.now();
    const elapsed = Math.max(8, now - drag.lastTime);
    const stepX = event.clientX - drag.lastX;
    const stepY = event.clientY - drag.lastY;
    const distance = Math.hypot(stepX, stepY);
    const blend = 1 - Math.exp(-elapsed / 65);
    dragSpeed += (Math.min(3, distance / elapsed) - dragSpeed) * blend;
    targetAngle += (-18 * Math.tanh(stepX / elapsed * 0.7) - targetAngle) * blend;
    lastMotion = now;
    kickWobble();
    if (distance >= 4) {
      const heading = Math.atan2(stepY, stepX);
      if (elapsed > 450) { drag.heading = null; drag.turns = 0; }
      if (drag.heading !== null) {
        const turn = Math.atan2(Math.sin(heading - drag.heading), Math.cos(heading - drag.heading));
        drag.turns += turn;
        if (Math.abs(drag.turns) > Math.PI * 1.65) {
          getDizzy();
          drag.turns = 0;
        }
      }
      drag.heading = heading;
    }
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    const left = drag.left + dx;
    // Keep the hit area inside the viewport while measuring the unclamped drag.
    drag.hideSide = left < -24 || (dx < -6 && event.clientX <= 4) ? 'left'
      : left + width() > window.innerWidth + 24 || (dx > 6 && event.clientX >= window.innerWidth - 4) ? 'right' : null;
    root.classList.add('is-dragging');
    root.classList.toggle('will-hide', Boolean(drag.hideSide));
    drag.currentX = clampX(left);
    drag.currentY = clampY(drag.top + dy);
    if (!dragFrame) dragFrame = window.requestAnimationFrame(() => {
      dragFrame = 0;
      if (!drag) return;
      root.style.transform = `translate3d(${drag.currentX - drag.left}px, ${drag.currentY - drag.top}px, 0)`;
      root.dataset.side = drag.currentX + width() / 2 < window.innerWidth / 2 ? 'left' : 'right';
      root.classList.toggle('bubble-below', drag.currentY < 80);
      scheduleGaze();
    });
    say();
  });
  function finish(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved;
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    const fromX = drag.currentX;
    const fromY = drag.currentY;
    if (drag.moved) {
      side = fromX + width() / 2 < window.innerWidth / 2 ? 'left' : 'right';
      level = (fromY - 8) / Math.max(1, maxY() - 8);
      if (event.type === 'pointerup' && drag.hideSide) {
        side = drag.hideSide;
        tucked = true;
      }
    }
    const shouldDock = drag.moved && !tucked && event.type === 'pointerup';
    drag = null;
    root.classList.remove('is-dragging', 'will-hide');
    root.style.removeProperty('transform');
    targetAngle = 0;
    if (tucked || event.type !== 'pointerup') resetWobble();
    else kickWobble();
    place();
    if (shouldDock && !motion?.matches) {
      const offsetX = fromX - parseFloat(root.style.left);
      const offsetY = fromY - parseFloat(root.style.top);
      const duration = Math.min(850, 420 + Math.hypot(offsetX, offsetY) * 0.65);
      root.style.setProperty('--dock-duration', `${duration}ms`);
      root.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      // FLIP: anchor at the destination, animate only the composited offset.
      root.getBoundingClientRect();
      root.classList.add('is-docking');
      dockFrame = window.requestAnimationFrame(() => {
        dockFrame = 0;
        root.style.transform = 'translate3d(0, 0, 0)';
        scheduleGaze();
      });
      clearTimeout(dockTimer);
      dockTimer = setTimeout(() => { stopDocking(); say(); }, duration + 80);
    }
    syncIdle();
    save();
  }
  main.addEventListener('pointerup', finish);
  main.addEventListener('pointercancel', finish);
  main.addEventListener('lostpointercapture', finish);
  main.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      tucked = !tucked;
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'ArrowLeft') side = 'left';
      if (event.key === 'ArrowRight') side = 'right';
      if (event.key === 'ArrowUp') level = Math.max(0, level - 0.1);
      if (event.key === 'ArrowDown') level = Math.min(1, level + 0.1);
    } else return;
    stopDocking();
    if (tucked) resetWobble();
    place();
    save();
  });
  window.addEventListener('resize', () => {
    stopDocking();
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    drag = null;
    root.classList.remove('is-dragging', 'will-hide');
    resetWobble();
    place();
  });
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('is-paused', document.hidden);
    if (document.hidden) {
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      resetWobble();
      stopDocking();
    } else scheduleGaze();
    say();
  });
  window.addEventListener('pageshow', () => {
    active = true;
    say();
  });
  window.addEventListener('pagehide', () => {
    active = false;
    clearTimeout(idleTimer);
    idleTimer = 0;
    quoteDeck.stop();
    clearTimeout(dizzyTimer);
    stopDocking();
    root.classList.remove('is-dizzy', 'is-dragging', 'will-hide');
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    drag = null;
    window.cancelAnimationFrame(gazeFrame);
    gazeFrame = 0;
    resetWobble();
  });
}
