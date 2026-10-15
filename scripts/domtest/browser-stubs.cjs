// jsdom lacks the native dialog top layer. Browser checks cover focus trapping
// and fullscreen; DOM tests only need the open/close lifecycle.
function mockDialogs(window) {
  const prototype = window.HTMLDialogElement?.prototype;
  if (!prototype || prototype.showModal) return;
  prototype.showModal = function () {
    this.setAttribute('open', '');
    this.querySelector('[autofocus]')?.focus();
  };
  prototype.close = function (value = '') {
    if (!this.open) return;
    this.returnValue = value;
    this.removeAttribute('open');
    this.dispatchEvent(new window.Event('close'));
  };
}
// jsdom has no Canvas implementation. This color-page-only stub uses its CSS
// parser for basic serialization; actual Canvas acceptance is checked in Chromium.
function mockColorCanvas(window) {
  if (!window.document.querySelector('#color-input')) return;
  window.HTMLCanvasElement.prototype.getContext = function (type) {
    if (type !== '2d') return null;
    let color = '#000000';
    return {
      get fillStyle() { return color; },
      set fillStyle(value) {
        const probe = window.document.createElement('span');
        probe.style.color = value;
        if (!probe.style.color || /var\s*\(/i.test(value)) return;
        color = window.getComputedStyle(probe).color;
      },
    };
  };
}
module.exports = { mockDialogs, mockColorCanvas };
