const list = document.querySelector('[data-infinite-list]');
const pager = document.querySelector('[data-infinite-pager]');
const nextLink = pager && pager.querySelector('[data-infinite-next]');
const status = pager && pager.querySelector('[data-infinite-status]');

if (list && pager && nextLink) {
  let nextUrl = nextLink.href;
  let loading = false;
  let done = false;
  let failed = false;

  const sentinel = document.createElement('div');
  sentinel.className = 'infinite-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  pager.append(sentinel);

  const setStatus = (message) => {
    if (status) status.textContent = message || '';
  };

  const resolveUrl = (href, base) => {
    try {
      return href ? new URL(href, base || window.location.href).href : '';
    } catch (_) {
      return '';
    }
  };

  async function loadMore() {
    if (loading || done || failed || !nextUrl) return;
    loading = true;
    nextLink.setAttribute('aria-disabled', 'true');
    nextLink.textContent = 'Loading…';
    setStatus('Loading more posts…');

    try {
      const response = await fetch(nextUrl, {
        headers: { Accept: 'text/html' },
        credentials: 'same-origin',
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const nextList = doc.querySelector('[data-infinite-list]') || doc.querySelector('.post-list');
      const items = nextList ? [...nextList.querySelectorAll('.post-item')] : [];
      if (!items.length) throw new Error('No posts found on next page');

      const fragment = document.createDocumentFragment();
      items.forEach((item, index) => {
        const node = document.importNode(item, true);
        node.classList.add('infinite-new-item');
        node.style.setProperty('--infinite-i', String(Math.min(index, 5)));
        fragment.append(node);
      });
      list.append(fragment);

      const newNext = doc.querySelector('[data-infinite-next]');
      nextUrl = newNext ? resolveUrl(newNext.getAttribute('href'), response.url) : '';
      done = !nextUrl;

      if (done) {
        nextLink.remove();
        setStatus('All posts loaded.');
        observer.disconnect();
      } else {
        nextLink.href = nextUrl;
        nextLink.removeAttribute('aria-disabled');
        nextLink.textContent = 'Load more posts';
        setStatus('');
      }
    } catch (error) {
      failed = true;
      observer.disconnect();
      nextLink.removeAttribute('aria-disabled');
      nextLink.textContent = 'Open next page';
      setStatus('Could not load more posts automatically. Open the next page instead.');
    } finally {
      loading = false;
    }
  }

  nextLink.addEventListener('click', (event) => {
    if (failed) return;
    event.preventDefault();
    loadMore();
  });

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadMore();
  }, { rootMargin: '600px 0px' });

  observer.observe(sentinel);
}
