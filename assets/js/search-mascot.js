import { createQuoteDeck } from './mascot-quotes.js';
import { createFlexibleWire } from './mascot-wire.js';
import { createMascotVisibilityMotion } from './mascot-visibility.js';
import { createMascotCatPass } from './mascot-cat.js';

export function chooseGuideInvitation(toolName, previousIndex = -1, random = Math.random) {
  const name = toolName?.trim() || 'this tool';
  const prompts = [
    `Using ${name}? Here’s a quick guide to get you started.`,
    `First time with ${name}? Let’s walk through it.`,
    `Want to get more out of ${name}? Take a look at its guide.`,
    `Need a hand with ${name}? Let’s go through the steps.`,
    `Trying ${name}? Want a quick walkthrough?`,
    `Not sure where to start with ${name}? Try the guide.`,
    `Getting to know ${name}? Its guide is a good place to start.`,
    `A little help with ${name}? The guide is right here.`,
    `Before you dive into ${name}, want to see the steps?`,
    `Exploring ${name}? Here’s something to read alongside it.`,
    `There’s a walkthrough for ${name}, if you’d like one.`,
    `The ${name} guide is handy if you want a little direction.`,
    `You can try ${name} on your own, or follow its guide.`,
    `Want to see how to use ${name}? I’ve got a guide for you.`,
    `Let’s make a start with ${name}. Want the walkthrough?`,
    `Need a starting point for ${name}? Have a look at the guide.`,
    `You’ve found ${name}. Want a little tour?`,
    `${name} has its own guide. Want to take a look?`,
    `Want some pointers for ${name}? Start here.`,
    `If ${name} is new to you, this guide can help.`,
    `Ready to try ${name}? You can follow along with its guide.`,
    `I can point you to the ${name} guide, if that helps.`,
    `A walkthrough might help with ${name}. Shall we?`,
    `Working through ${name}? Keep its guide close by.`,
  ];
  const choices = prompts.map((_, index) => index).filter((index) => index !== previousIndex);
  const index = choices[Math.floor(random() * choices.length)];
  return { index, text: prompts[index] };
}

// Floating search companion. It stays deliberately self-contained:
//   - presentation only: public tool titles can personalize invitations; no user input is read or stored;
//   - persistence: localStorage `ilham-search-companion-v1` stores { side, level, tucked };
//   - quotes: public-only, cached in mascot-quotes.js, never tied to a search;
//   - state classes: is-tucked/is-near/is-peeking, is-dragging/is-docking/is-transitioning,
//     is-dizzy/is-excited, is-wobbling, is-arriving, is-paused, plus data-expression;
//   - animation budget: rAF springs run only while moving or settling and stop on
//     pagehide or a hidden tab, so an idle page schedules no animation frames.
// Priority for the bubble: drag/dizzy/hide, then hover/focus, then idle prompts/quotes.
//
// Only presentation preferences and public quotes are saved; never search terms.
export function initSearchMascot(openSearch) {
  const root = document.querySelector('#search-mascot');
  if (!root) return;
  const main = root.querySelector('.search-mascot-main');
  const bubble = root.querySelector('.search-mascot-bubble');
  const messageEl = bubble.querySelector('.search-mascot-message');
  const authorEl = bubble.querySelector('.search-mascot-author');
  const guideLink = bubble.querySelector('.search-mascot-guide-link');
  const hint = root.querySelector('.search-mascot-hint');
  const art = root.querySelector('.search-mascot-art');
  const pupils = [...root.querySelectorAll('.search-mascot-pupil')];
  const wire = createFlexibleWire(root);
  const searchDialog = document.querySelector('#global-search');
  const helpDialog = document.querySelector('#kbd-help');
  const guide = root.dataset.guideUrl
    ? { url: root.dataset.guideUrl, title: root.dataset.guideTitle || '' } : null;
  let guidePrompt = '';
  if (guide) {
    const invitationKey = 'ilham-companion-invitation-v1';
    let previousIndex = -1;
    try { previousIndex = Number(window.sessionStorage.getItem(invitationKey) ?? -1); } catch { /* Optional presentation state. */ }
    const invitation = chooseGuideInvitation(root.dataset.toolName, previousIndex);
    guidePrompt = invitation.text;
    // Only the wording index survives navigation within this tab, never the tool name.
    try { window.sessionStorage.setItem(invitationKey, String(invitation.index)); } catch { /* Random wording still works without storage. */ }
  }
  const contextMessages = {
    home: ['Tools, guides, and a few engineering stories.', 'Something to explore?'],
    guides: ['Looking for an explanation?', 'Need a guide for your next step?'],
    posts: ['Looking for another engineering story?', 'There may be another post worth a look.'],
    tools: ['Need another tool?', 'Looking for something to help with the next step?'],
    page: ['Looking for something else?', 'Tools, guides, and posts are a search away.'],
  };
  const messages = contextMessages[root.dataset.pageKind] || contextMessages.page;
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const key = 'ilham-search-companion-v1';
  let side = 'right';
  let level = window.innerWidth <= 480 ? 0.68 : 1;
  let tucked = false;
  let drag = null;
  let suppressClick = false;
  let hovered = false;
  let bubbleHovered = false;
  let bubbleFocused = false;
  let gaze = null;
  let gazeFrame = 0;
  let wobbleFrame = 0;
  let wobbleTime = 0;
  let angle = 0;
  let angularVelocity = 0;
  let targetAngle = 0;
  let tailAngle = 0;
  let tailVelocity = 0;
  let tailLift = 0;
  let liftVelocity = 0;
  let targetLift = 0;
  let dragSpeed = 0;
  let lastMotion = 0;
  let dizzyTimer = 0;
  let dockTimer = 0;
  let dockFrame = 0;
  let dragFrame = 0;
  let gazeTime = 0;
  let peekTimer = 0;
  let excitementTimer = 0;
  let arrivalTimer = 0;
  let sleepTimer = 0;
  let drowsyTimer = 0;
  let hopTimer = 0;
  let hopFallback = 0;
  let sleepy = false;
  let drowsy = false;
  let scrollLook = 0;
  let scrollLookTarget = 0;
  let scrollLookTimer = 0;
  let lastScrollY = window.scrollY || 0;
  // Only interaction with the companion resets its drowsiness, not page scrolling.
  let lastActivity = window.performance.now();
  const eyeOffsets = pupils.map(() => ({ x: 0, y: 0 }));
  let quoteStorage;
  try { quoteStorage = window.localStorage; } catch { /* Optional quote cache. */ }
  const quoteDeck = createQuoteDeck({ storage: quoteStorage, fetcher: window.fetch?.bind(window) });
  let idleQuote = null;
  let idlePhase = guide ? 'guide' : 'search';
  let contextIndex = 0;
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

  const viewport = () => {
    const view = window.visualViewport;
    return { left: view?.offsetLeft || 0, top: view?.offsetTop || 0,
      width: view?.width || window.innerWidth, height: view?.height || window.innerHeight };
  };
  const compact = () => window.innerWidth <= 480;
  const width = () => tucked ? 44 : compact() ? 80 : 96;
  const height = () => tucked ? 64 : compact() ? 88 : 100;
  let safeBottom = parseFloat(window.getComputedStyle(root).getPropertyValue('--companion-safe-bottom')) || 0;
  const minY = () => viewport().top + 8;
  const maxY = () => Math.max(minY(), viewport().top + viewport().height - height() - safeBottom - 24);
  const clampX = (x) => Math.max(viewport().left + 8,
    Math.min(Math.max(viewport().left + 8, viewport().left + viewport().width - width() - 8), x));
  const clampY = (y) => Math.max(minY(), Math.min(maxY(), y));
  const visibilityMotion = createMascotVisibilityMotion(root, () => { say(); scheduleGaze(); });
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify({ side, level, tucked })); } catch { /* Optional preference. */ }
  };
  const keyboardFocused = () => document.activeElement === main && main.matches(':focus-visible');
  const searchOpen = () => Boolean(searchDialog && !searchDialog.hidden);
  const overlayOpen = () => searchOpen() || Boolean(helpDialog && !helpDialog.hidden);
  const isIdle = () => active && !document.hidden && !tucked && !hovered && !bubbleHovered && !bubbleFocused && !drag
    && !keyboardFocused() && !overlayOpen() && !root.classList.contains('is-dizzy')
    && !root.classList.contains('is-docking') && !root.classList.contains('is-transitioning');
  const catPass = createMascotCatPass(document.querySelector('#nyan-cat'),
    () => active && !document.hidden && !motion?.matches,
    () => Boolean(drag) || overlayOpen());
  function syncSleep() {
    if (!isIdle()) {
      clearTimeout(sleepTimer);
      clearTimeout(drowsyTimer);
      sleepTimer = 0;
      drowsyTimer = 0;
      return;
    }
    const idleFor = window.performance.now() - lastActivity;
    // A softer stage first: the eyelids droop, then the companion fully dozes.
    if (!drowsyTimer && !drowsy && !sleepy) {
      drowsyTimer = setTimeout(() => {
        drowsyTimer = 0;
        if (isIdle() && window.performance.now() - lastActivity >= 22000) {
          drowsy = true;
          say();
        } else syncSleep();
      }, Math.max(500, 22000 - idleFor));
    }
    if (sleepTimer || sleepy) return;
    const remaining = Math.max(1000, 45000 - idleFor);
    sleepTimer = setTimeout(() => {
      sleepTimer = 0;
      if (isIdle() && window.performance.now() - lastActivity >= 45000) {
        drowsy = false;
        sleepy = true;
        say();
      } else syncSleep();
    }, remaining);
  }
  // A small hop now and then, but only after the page has been still for a bit.
  function scheduleHop() {
    clearTimeout(hopTimer);
    hopTimer = 0;
    if (motion?.matches || !active || document.hidden || tucked || sleepy || drowsy) return;
    hopTimer = setTimeout(() => {
      hopTimer = 0;
      if (!isIdle() || sleepy || drowsy || document.hidden) { scheduleHop(); return; }
      root.classList.add('is-hopping');
      clearTimeout(hopFallback);
      hopFallback = setTimeout(stopHop, 900);
    }, 14000 + Math.random() * 6000);
  }
  function stopHop() {
    clearTimeout(hopFallback);
    hopFallback = 0;
    root.classList.remove('is-hopping');
    scheduleHop();
  }
  function noteActivity() {
    lastActivity = window.performance.now();
    if (sleepy || drowsy) { sleepy = false; drowsy = false; say(); }
    else syncSleep();
    scheduleHop();
  }
  function setNear(near) {
    near = tucked && (near || keyboardFocused());
    if (root.classList.contains('is-near') === near) return;
    clearTimeout(peekTimer);
    peekTimer = 0;
    root.classList.toggle('is-near', near);
    root.classList.remove('is-peeking');
    if (near) {
      peekTimer = setTimeout(() => {
        peekTimer = 0;
        if (!tucked || !root.classList.contains('is-near') || !active || document.hidden) return;
        root.classList.add('is-peeking');
        scheduleGaze();
      }, motion?.matches ? 0 : 180);
    }
    say();
  }
  function updateExpression() {
    root.dataset.expression = root.classList.contains('is-dizzy') ? 'dizzy'
      : !tucked && (searchOpen() || root.classList.contains('is-excited')) ? 'excited'
        : hovered || keyboardFocused() || root.classList.contains('is-near') ? 'curious'
          : sleepy && isIdle() ? 'sleepy' : drowsy && isIdle() ? 'drowsy' : 'neutral';
  }
  function syncIdle() {
    catPass.sync();
    syncSleep();
    if (!isIdle()) {
      clearTimeout(idleTimer);
      idleTimer = 0;
      return;
    }
    if (idleTimer || quoteLoading) return;
    const delay = idlePhase === 'quote' && idleQuote ? Math.max(12000, idleQuote.quote.length * 70) : 8000;
    idleTimer = setTimeout(async () => {
      idleTimer = 0;
      if (!isIdle()) return;
      if (idlePhase === 'quote') {
        idlePhase = 'context';
        contextIndex = (contextIndex + 1) % messages.length;
      } else if (idlePhase === 'context') idlePhase = guide ? 'guide' : 'search';
      else if (idlePhase === 'guide') idlePhase = 'search';
      else {
        quoteLoading = true;
        await quoteDeck.load();
        quoteLoading = false;
        if (!isIdle()) { syncIdle(); return; }
        idleQuote = quoteDeck.next();
        idlePhase = idleQuote ? 'quote' : 'context';
      }
      say();
    }, delay);
  }
  function say() {
    updateExpression();
    const showingQuote = isIdle() && idlePhase === 'quote' && idleQuote;
    const idlePrompt = idlePhase === 'context' ? messages[contextIndex] : 'Want to search something?';
    const linkFocused = Boolean(guideLink) && document.activeElement === guideLink;
    // The invitation stays while the bubble is hovered or the link is focused so
    // the anchor is never pulled out from under the pointer or the keyboard.
    const guideActive = Boolean(guide) && !tucked && !drag && !overlayOpen()
      && !root.classList.contains('is-dizzy')
      && ((idlePhase === 'guide' && (isIdle() || bubbleHovered || bubbleFocused))
        || keyboardFocused() || linkFocused);
    const text = tucked ? 'Psst… click to bring me back!' : drag?.hideSide ? 'Release to hide!' : root.classList.contains('is-dizzy')
      ? "Whoa... I'm dizzy!" : searchOpen() ? "Let's find it!" : guideActive
        ? guidePrompt : hovered || keyboardFocused()
          ? 'Click me!' : showingQuote ? `“${idleQuote.quote}”` : isIdle() ? idlePrompt : 'Want to search something?';
    const author = showingQuote ? `— ${idleQuote.author}` : '';
    const signature = text + author + (guideActive ? '|guide' : '');
    root.classList.toggle('is-quote', Boolean(showingQuote));
    root.classList.toggle('has-guide-link', guideActive);
    bubble.setAttribute('aria-hidden', String(!guideActive));
    if (renderedMessage !== signature) {
      renderedMessage = signature;
      messageEl.textContent = text;
      authorEl.hidden = !author;
      authorEl.textContent = author;
      if (guideLink) guideLink.hidden = !guideActive;
      bubble.title = author ? 'Quotes provided by DummyJSON' : '';
      const height = bubble.offsetHeight || (showingQuote ? 180 : 60);
      const top = drag?.currentY ?? parseFloat(root.style.top);
      const view = viewport();
      const below = view.top + view.height - top - (tucked ? 64 : compact() ? 88 : 100) - 12;
      const above = top - view.top - 12;
      root.classList.toggle('bubble-below', above < height && below > above);
      if (!motion?.matches) messageEl.animate?.([{ opacity: 0, transform: 'translateY(3px)' },
        { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
    }
    syncIdle();
  }
  function place() {
    root.dataset.side = side;
    root.classList.toggle('is-tucked', tucked);
    if (!tucked) setNear(false);
    const view = viewport();
    root.style.left = `${clampX(side === 'left' ? view.left + 8 : view.left + view.width - width() - 8)}px`;
    root.style.top = `${minY() + level * (maxY() - minY())}px`;
    root.classList.toggle('bubble-below', parseFloat(root.style.top) < 80);
    main.setAttribute('aria-label', tucked ? 'Show search companion' : 'Search tools, guides, and posts');
    if (tucked) main.removeAttribute('aria-haspopup');
    else main.setAttribute('aria-haspopup', 'dialog');
    hint.textContent = tucked ? 'Activate to show the search companion.'
      : 'Activate to search. Drag outward past either screen edge to hide. Use arrow keys to move, or H to hide when focused.';
    say();
    scheduleGaze();
  }

  // One-off entrance: slide/fade in from the docked edge, then let the spring
  // settle. The CSS animation owns the root transform, so any interaction or
  // layout change cancels it before it can fight a drag or dock.
  function cancelArrival() {
    clearTimeout(arrivalTimer);
    arrivalTimer = 0;
    root.classList.remove('is-arriving');
  }
  function requestArrival(fromCache = false) {
    cancelArrival();
    if (motion?.matches) return;
    void root.offsetWidth; // Restart the animation when returning via bfcache.
    root.classList.add('is-arriving');
    angularVelocity += side === 'left' ? (fromCache ? -15 : -24) : (fromCache ? 15 : 24);
    kickWobble();
    arrivalTimer = setTimeout(cancelArrival, 700);
  }

  // A damped spring runs only during movement and its short settling tail.
  function kickWobble() {
    if (motion?.matches || document.hidden || wobbleFrame) return;
    art.style.animation = 'none';
    wobbleTime = 0;
    root.classList.add('is-wobbling');
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
      // A softer second spring lets the tail lag behind the head.
      const tailFrequency = 8.5 + Math.min(2, dragSpeed);
      tailVelocity += ((-angle * 0.8 - tailAngle) * tailFrequency * tailFrequency
        - tailVelocity * tailFrequency * 1.3) * step;
      tailAngle += tailVelocity * step;
      liftVelocity += (((moving ? targetLift : 0) - tailLift) * tailFrequency * tailFrequency
        - liftVelocity * tailFrequency * 1.3) * step;
      tailLift += liftVelocity * step;
    }
    wire.bend(14 * Math.tanh(tailAngle / 14), tailLift);
    art.style.transform = `rotate(${angle}deg)`;
    scheduleGaze();
    if (Math.abs(angle - target) > 0.08 || Math.abs(angularVelocity) > 0.3
      || Math.abs(tailAngle) > 0.06 || Math.abs(tailVelocity) > 0.25
      || Math.abs(tailLift) > 0.04 || Math.abs(liftVelocity) > 0.2 || moving) {
      wobbleFrame = window.requestAnimationFrame(wobble);
    } else resetWobble();
  }
  function resetWobble() {
    window.cancelAnimationFrame(wobbleFrame);
    wobbleFrame = 0;
    root.classList.remove('is-wobbling');
    angle = angularVelocity = targetAngle = dragSpeed = tailAngle = tailVelocity = 0;
    tailLift = liftVelocity = targetLift = 0;
    wire.reset();
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
    if ((!gaze && !scrollLookTarget && Math.abs(scrollLook) < 0.01) || gazeFrame || document.hidden) return;
    gazeFrame = window.requestAnimationFrame(updateGaze);
  }
  function updateGaze(now) {
    gazeFrame = 0;
    const box = art.getBoundingClientRect();
    const bounds = root.getBoundingClientRect();
    const target = gaze || { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
    const dx = Math.max(bounds.left - target.x, 0, target.x - bounds.right);
    const dy = Math.max(bounds.top - target.y, 0, target.y - bounds.bottom);
    setNear(Math.hypot(dx, dy) < (root.classList.contains('is-near') ? 125 : 105));
    if (motion?.matches || !box.width || !box.height) return;
    // Hidden body: proximity is still tracked above, but there are no visible
    // pupils to move, so skip the SVG matrix work until it peeks out.
    if (tucked && !root.classList.contains('is-peeking')) { gazeTime = 0; return; }
    const dt = gazeTime ? Math.min(0.05, (now - gazeTime) / 1000) : 1 / 60;
    gazeTime = now;
    const blend = 1 - Math.exp(-dt * 20);
    scrollLook += (scrollLookTarget - scrollLook) * (1 - Math.exp(-dt * 12));
    let localX = (target.x - box.left) * 80 / box.width;
    let localY = (target.y - box.top) * 100 / box.height;
    const matrix = root.querySelector('.search-mascot-face').getScreenCTM?.();
    if (matrix && art.createSVGPoint) {
      const point = art.createSVGPoint();
      point.x = target.x;
      point.y = target.y;
      const local = point.matrixTransform(matrix.inverse());
      localX = local.x;
      localY = local.y;
    }
    // Scrolling pulls the gaze down or up, then it eases back to the pointer.
    let settling = scrollLookTarget !== 0 || Math.abs(scrollLook - scrollLookTarget) > 0.01;
    pupils.forEach((pupil, index) => {
      const dx = localX - Number(pupil.dataset.cx);
      const dy = localY - Number(pupil.dataset.cy);
      const distance = Math.hypot(dx, dy);
      const direction = Math.atan2(dy, dx);
      const strength = Math.min(1, distance / 45);
      const x = Math.cos(direction) * 5.5 * strength;
      const y = Math.max(-6.5, Math.min(6.5, Math.sin(direction) * 6 * strength + scrollLook * 4));
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
  // Scrolling makes the eyes glance down or up in the direction of travel.
  window.addEventListener('scroll', () => {
    const y = window.scrollY || window.pageYOffset || 0;
    const delta = y - lastScrollY;
    lastScrollY = y;
    if (Math.abs(delta) < 2 || !active || document.hidden || motion?.matches) return;
    scrollLookTarget = delta > 0 ? 1 : -1;
    clearTimeout(scrollLookTimer);
    scrollLookTimer = setTimeout(() => { scrollLookTarget = 0; scheduleGaze(); }, 320);
    scheduleGaze();
  }, { passive: true });
  motion?.addEventListener('change', () => {
    catPass.sync();
    if (motion.matches) {
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      pupils.forEach((pupil, index) => {
        pupil.removeAttribute('transform');
        eyeOffsets[index].x = eyeOffsets[index].y = 0;
      });
      gazeTime = 0;
      clearTimeout(scrollLookTimer);
      scrollLookTimer = 0;
      stopHop();
      scrollLook = 0;
      scrollLookTarget = 0;
      resetWobble();
      stopDocking();
      visibilityMotion.stop();
      clearTimeout(peekTimer);
      peekTimer = 0;
      root.classList.toggle('is-peeking', tucked && root.classList.contains('is-near'));
    } else scheduleGaze();
  });
  main.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    noteActivity();
    hovered = true;
    if (tucked) setNear(true);
    say();
  });
  main.addEventListener('pointerleave', () => { hovered = false; say(); });
  main.addEventListener('focus', () => { noteActivity(); if (tucked) setNear(true); say(); });
  main.addEventListener('blur', () => {
    // During blur, activeElement can still be body. Wait for Tab's focus handoff.
    setTimeout(() => {
      if (!active) return;
      if (tucked) setNear(false);
      say();
    }, 0);
  });
  bubble.addEventListener('pointerenter', () => { if (!guide) return; bubbleHovered = true; noteActivity(); say(); });
  bubble.addEventListener('pointerleave', () => { if (!bubbleHovered) return; bubbleHovered = false; say(); });
  bubble.addEventListener('focusin', () => { bubbleFocused = true; noteActivity(); say(); });
  bubble.addEventListener('focusout', () => { bubbleFocused = false; say(); });
  for (const event of ['pointerdown', 'keydown']) {
    document.addEventListener(event, (event) => {
      if (root.contains(event.target)) noteActivity();
    }, { passive: true });
  }
  const dialogObserver = new window.MutationObserver(() => { noteActivity(); say(); });
  for (const dialog of [searchDialog, helpDialog]) {
    if (dialog) dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['hidden'] });
  }
  place();
  root.hidden = false;
  requestArrival();
  scheduleHop();

  main.addEventListener('click', (event) => {
    if (suppressClick && event.detail !== 0) {
      suppressClick = false;
      return;
    }
    if (tucked) {
      stopDocking();
      resetWobble();
      visibilityMotion.run(() => { tucked = false; place(); }, motion?.matches);
      say();
      save();
    } else {
      visibilityMotion.stop();
      noteActivity();
      if (!motion?.matches) { angularVelocity += 28; kickWobble(); }
      root.classList.add('is-excited');
      clearTimeout(excitementTimer);
      excitementTimer = setTimeout(() => { root.classList.remove('is-excited'); say(); }, 1100);
      openSearch();
      say();
    }
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
  root.addEventListener('animationend', (event) => {
    if (event.target === root && event.animationName === 'companion-arrive') cancelArrival();
  });
  main.addEventListener('animationend', (event) => {
    if (event.animationName === 'companion-hop') stopHop();
  });
  main.addEventListener('pointerdown', (event) => {
    cancelArrival();
    stopHop();
    noteActivity();
    // A genuine new tap is not the compatibility click emitted after a drag.
    if (event.button === 0 && event.isPrimary) suppressClick = false;
    if (event.button !== 0 || !event.isPrimary || tucked) return;
    visibilityMotion.stop();
    if (root.classList.contains('is-docking')) stopDocking(true);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: parseFloat(root.style.left), top: parseFloat(root.style.top), moved: false, hideSide: null,
      currentX: parseFloat(root.style.left), currentY: parseFloat(root.style.top),
      lastX: event.clientX, lastY: event.clientY, lastTime: window.performance.now(), heading: null, turns: 0 };
    main.setPointerCapture(event.pointerId);
    say();
  });
  main.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    noteActivity();
    const now = window.performance.now();
    const elapsed = Math.max(8, now - drag.lastTime);
    const stepX = event.clientX - drag.lastX;
    const stepY = event.clientY - drag.lastY;
    const distance = Math.hypot(stepX, stepY);
    const blend = 1 - Math.exp(-elapsed / 65);
    dragSpeed += (Math.min(3, distance / elapsed) - dragSpeed) * blend;
    targetAngle += (-18 * Math.tanh(stepX / elapsed * 0.7) - targetAngle) * blend;
    targetLift += (-4 * Math.tanh(stepY / elapsed * 0.6) - targetLift) * blend;
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
    const view = viewport();
    const edgeZone = event.pointerType === 'touch' ? 24 : 4;
    drag.hideSide = left < view.left - 24 || (dx < -6 && event.clientX <= view.left + edgeZone) ? 'left'
      : left + width() > view.left + view.width + 24 || (dx > 6 && event.clientX >= view.left + view.width - edgeZone) ? 'right' : null;
    root.classList.add('is-dragging');
    root.classList.toggle('will-hide', Boolean(drag.hideSide));
    drag.currentX = clampX(left);
    drag.currentY = clampY(drag.top + dy);
    if (!dragFrame) dragFrame = window.requestAnimationFrame(() => {
      dragFrame = 0;
      if (!drag) return;
      root.style.transform = `translate3d(${drag.currentX - drag.left}px, ${drag.currentY - drag.top}px, 0)`;
      root.dataset.side = drag.currentX + width() / 2 < viewport().left + viewport().width / 2 ? 'left' : 'right';
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
    const willHide = event.type === 'pointerup' && drag.moved && drag.hideSide;
    if (drag.moved) {
      side = fromX + width() / 2 < viewport().left + viewport().width / 2 ? 'left' : 'right';
      level = (fromY - minY()) / Math.max(1, maxY() - minY());
      if (event.type === 'pointerup' && drag.hideSide) {
        side = drag.hideSide;
      }
    }
    const shouldDock = drag.moved && !willHide && !tucked && event.type === 'pointerup';
    drag = null;
    root.classList.remove('is-dragging', 'will-hide');
    root.style.removeProperty('transform');
    targetAngle = targetLift = 0;
    if (willHide) {
      resetWobble();
      // Start at the release position, then fold into the true peek layout.
      root.style.left = `${fromX}px`;
      root.style.top = `${fromY}px`;
      visibilityMotion.run(() => { tucked = true; place(); }, motion?.matches);
    } else {
      if (tucked || event.type !== 'pointerup') resetWobble();
      else kickWobble();
      place();
    }
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
    cancelArrival();
    if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      stopDocking();
      resetWobble();
      visibilityMotion.run(() => { tucked = !tucked; place(); }, motion?.matches);
      say();
      save();
      return;
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'ArrowLeft') side = 'left';
      if (event.key === 'ArrowRight') side = 'right';
      if (event.key === 'ArrowUp') level = Math.max(0, level - 0.1);
      if (event.key === 'ArrowDown') level = Math.min(1, level + 0.1);
    } else return;
    stopDocking();
    visibilityMotion.stop();
    if (tucked) resetWobble();
    place();
    save();
  });
  function resizeCompanion() {
    cancelArrival();
    visibilityMotion.stop();
    safeBottom = parseFloat(window.getComputedStyle(root).getPropertyValue('--companion-safe-bottom')) || 0;
    stopDocking();
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    drag = null;
    root.classList.remove('is-dragging', 'will-hide');
    resetWobble();
    place();
  }
  window.addEventListener('resize', resizeCompanion);
  window.visualViewport?.addEventListener('resize', resizeCompanion);
  window.visualViewport?.addEventListener('scroll', resizeCompanion);
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('is-paused', document.hidden);
    if (document.hidden) {
      clearTimeout(hopTimer);
      hopTimer = 0;
      stopHop();
      clearTimeout(scrollLookTimer);
      scrollLookTimer = 0;
      scrollLook = scrollLookTarget = 0;
      clearTimeout(peekTimer);
      peekTimer = 0;
      setNear(false);
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      resetWobble();
      stopDocking();
      visibilityMotion.stop();
    } else { noteActivity(); scheduleGaze(); }
    say();
  });
  window.addEventListener('pageshow', (event) => {
    active = true;
    noteActivity();
    if (event.persisted) requestArrival(true);
    say();
  });
  window.addEventListener('pagehide', () => {
    active = false;
    catPass.stop();
    cancelArrival();
    clearTimeout(idleTimer);
    clearTimeout(sleepTimer);
    clearTimeout(drowsyTimer);
    clearTimeout(hopTimer);
    clearTimeout(scrollLookTimer);
    stopHop();
    scrollLook = scrollLookTarget = 0;
    clearTimeout(peekTimer);
    clearTimeout(excitementTimer);
    idleTimer = sleepTimer = drowsyTimer = hopTimer = scrollLookTimer = peekTimer = excitementTimer = 0;
    quoteDeck.stop();
    visibilityMotion.stop();
    clearTimeout(dizzyTimer);
    stopDocking();
    root.classList.remove('is-dizzy', 'is-dragging', 'will-hide', 'is-near', 'is-peeking', 'is-excited');
    window.cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    drag = null;
    window.cancelAnimationFrame(gazeFrame);
    gazeFrame = 0;
    resetWobble();
  });
}
