export function installChartHelpers(tk) {
  // Charts are inline SVG: sharp at any size, no library to vendor, and they cost
  // nothing to draw when the numbers change.
  const SVG_NS = 'http://www.w3.org/2000/svg';

  tk.svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  // Decorative measurement track; callers keep labelled numeric readings in HTML.
  // SVG geometry supports both a fill/peak and a signed-axis pointer without CSS writes.
  tk.gauge = (container, { marker = 'none', center = false } = {}) => {
    const axis = marker === 'dot';
    const element = tk.svgEl('svg', {
      class: `tool-gauge${axis ? ' tool-gauge-axis' : ''}`,
      'aria-hidden': 'true', focusable: 'false',
    });
    const fill = axis ? null : tk.svgEl('rect', { width: 0, height: '100%', class: 'tool-gauge-fill' });
    if (fill) element.append(fill);
    if (center) element.append(tk.svgEl('line', { x1: '50%', x2: '50%', y1: 0, y2: '100%', class: 'tool-gauge-center' }));
    let pointer;
    if (axis) {
      pointer = tk.svgEl('svg', { x: '50%', y: '50%', width: 14, height: 14, class: 'tool-gauge-dot' });
      pointer.append(tk.svgEl('circle', { cx: 0, cy: 0, r: 6 }));
    } else if (marker === 'line') {
      pointer = tk.svgEl('line', { x1: 0, x2: 0, y1: 0, y2: '100%', class: 'tool-gauge-marker' });
    }
    if (pointer) element.append(pointer);
    container.replaceChildren(element);
    const percent = (value) => {
      const number = Number(value);
      return `${Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0}%`;
    };
    return {
      element,
      set(value, peak = value) {
        if (fill) fill.setAttribute('width', percent(value));
        if (axis) pointer.setAttribute('x', percent(value));
        else if (pointer) {
          pointer.setAttribute('x1', percent(peak));
          pointer.setAttribute('x2', percent(peak));
        }
      },
    };
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
