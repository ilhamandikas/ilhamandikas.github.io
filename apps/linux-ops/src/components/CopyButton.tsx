interface Props {
  text: string;
  notify: (message: string) => void;
  label?: string;
  className?: string;
}

// Copy with a clipboard fallback, because navigator.clipboard is unavailable on
// insecure origins (and in some embedded browsers).
export function CopyButton({ text, notify, label = 'Copy', className = 'lo-btn' }: Props) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied to clipboard');
      return;
    } catch {
      /* fall through to the legacy path */
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    try {
      document.execCommand('copy');
      notify('Copied to clipboard');
    } catch {
      notify('Copy failed — select the text manually');
    }
    area.remove();
  };

  return (
    <button type="button" className={className} onClick={copy}>
      {label}
    </button>
  );
}
