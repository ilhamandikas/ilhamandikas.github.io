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
module.exports = { mockDialogs };
