// Move existing nodes without CSS order, then restore their original positions.
// Anchors preserve headings, whitespace, and other siblings owned by the caller.
export function createDomOrder(nodes) {
  const positions = new Map(nodes.map((node) => {
    const anchor = node.ownerDocument.createComment('original position');
    node.before(anchor);
    return [node, { anchor, parent: node.parentElement }];
  }));
  function move(action) {
    const active = nodes[0]?.ownerDocument.activeElement;
    const focused = active && nodes.some((node) => node.contains(active));
    action();
    if (focused) active.focus({ preventScroll: true });
  }
  return {
    set(ordered, parent = null) {
      move(() => {
        for (const node of ordered) (parent || positions.get(node).parent).append(node);
      });
    },
    restore() {
      move(() => {
        for (const [node, { anchor, parent }] of positions) parent.insertBefore(node, anchor.nextSibling);
      });
    },
  };
}
