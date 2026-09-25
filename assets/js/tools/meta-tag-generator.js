// Build SEO / Open Graph / Twitter meta tags from a small form.
const { tk } = window;

const fields = {
  title: document.querySelector('#meta-title'),
  desc: document.querySelector('#meta-desc'),
  url: document.querySelector('#meta-url'),
  image: document.querySelector('#meta-image'),
  type: document.querySelector('#meta-type'),
  twitter: document.querySelector('#meta-twitter'),
  locale: document.querySelector('#meta-locale'),
};

const escapeAttr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function render() {
  const tag = (attr, name, content) => (content ? `  <meta ${attr}="${name}" content="${escapeAttr(content)}">` : null);
  const lines = [
    tag('name', 'title', fields.title.value),
    tag('name', 'description', fields.desc.value),
    tag('name', 'robots', 'index, follow'),
    tag('property', 'og:type', fields.type.value),
    tag('property', 'og:title', fields.title.value),
    tag('property', 'og:description', fields.desc.value),
    tag('property', 'og:url', fields.url.value),
    tag('property', 'og:image', fields.image.value),
    tag('property', 'og:locale', fields.locale.value),
    tag('name', 'twitter:card', 'summary_large_image'),
    tag('name', 'twitter:site', fields.twitter.value),
    tag('name', 'twitter:title', fields.title.value),
    tag('name', 'twitter:description', fields.desc.value),
    tag('name', 'twitter:image', fields.image.value),
  ].filter(Boolean);

  document.querySelector('#meta-output').value = `${lines.join('\n')}\n`;
}

tk.live(Object.values(fields), render);
