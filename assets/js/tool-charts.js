export function installChartHelpers(tk) {
  // Charts are inline SVG: sharp at any size, no library to vendor, and they cost
  // nothing to draw when the numbers change.
  const SVG_NS = 'http://www.w3.org/2000/svg';

  tk.svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  // A stacked bar with a legend underneath. Every part carries its own value and
  // share, so the picture is never the only place a number lives.
  tk.stackBar = (container, parts, { height = 12, label = 'Breakdown' } = {}) => {
    const total = parts.reduce((sum, part) => sum + Math.max(0, part.value), 0);
    const bar = tk.svgEl('svg', {
      viewBox: '0 0 100 10',
      preserveAspectRatio: 'none',
      class: 'tool-chart-bar',
      height,
      role: 'img',
      'aria-label': label,
    });
    let x = 0;
    parts.forEach((part, index) => {
      const width = total > 0 ? (Math.max(0, part.value) / total) * 100 : 0;
      if (width <= 0) return;
      bar.append(tk.svgEl('rect', { x, y: 0, width, height: 10, class: `tool-chart-tone-${(index % 5) + 1}` }));
      x += width;
    });

    const legend = document.createElement('ul');
    legend.className = 'tool-chart-legend';
    parts.forEach((part, index) => {
      const item = document.createElement('li');
      const swatch = document.createElement('span');
      swatch.className = `tool-chart-swatch tool-chart-tone-${(index % 5) + 1}`;
      const name = document.createElement('span');
      name.className = 'tool-chart-label';
      name.textContent = part.label;
      const value = document.createElement('span');
      value.className = 'tool-chart-value';
      value.textContent = part.display === undefined ? String(part.value) : part.display;
      const share = document.createElement('span');
      share.className = 'tool-chart-share';
      share.textContent = total > 0 ? `${((Math.max(0, part.value) / total) * 100).toFixed(1)}%` : '0.0%';
      item.append(swatch, name, value, share);
      legend.append(item);
    });

    container.replaceChildren(bar, legend);
  };

  // One series over time, with the axis values written into the picture so the
  // numbers travel with it. `values` is a list of amounts, `xLabels` names them.
  tk.lineChart = (container, values, { format = (value) => String(value), xLabels = [], label = 'Over time' } = {}) => {
    const width = 640;
    const height = 220;
    const left = 62;
    const right = 10;
    const top = 12;
    const bottom = 26;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const max = Math.max(1, ...values);
    const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;
    const px = (index) => left + index * step;
    const py = (value) => top + plotHeight - (Math.max(0, value) / max) * plotHeight;

    const svg = tk.svgEl('svg', { viewBox: `0 0 ${width} ${height}`, class: 'tool-chart-line', role: 'img', 'aria-label': label });

    for (let tick = 0; tick <= 3; tick += 1) {
      const y = py((max / 3) * tick);
      svg.append(tk.svgEl('line', { x1: left, x2: width - right, y1: y, y2: y, class: 'tool-chart-grid' }));
      const text = tk.svgEl('text', { x: left - 8, y: y + 4, class: 'tool-chart-tick', 'text-anchor': 'end' });
      text.textContent = format((max / 3) * tick);
      svg.append(text);
    }

    const points = values.map((value, index) => `${px(index).toFixed(2)},${py(value).toFixed(2)}`);
    const base = py(0).toFixed(2);
    svg.append(tk.svgEl('path', { d: `M ${px(0).toFixed(2)},${base} L ${points.join(' L ')} L ${px(values.length - 1).toFixed(2)},${base} Z`, class: 'tool-chart-area' }));
    svg.append(tk.svgEl('path', { d: `M ${points.join(' L ')}`, class: 'tool-chart-stroke' }));

    const every = Math.max(1, Math.ceil(values.length / 6));
    xLabels.forEach((text, index) => {
      if (index % every !== 0 && index !== xLabels.length - 1) return;
      const anchor = index === 0 ? 'start' : index === xLabels.length - 1 ? 'end' : 'middle';
      const node = tk.svgEl('text', { x: px(index), y: height - 8, class: 'tool-chart-tick', 'text-anchor': anchor });
      node.textContent = text;
      svg.append(node);
    });

    container.replaceChildren(svg);
  };

}
