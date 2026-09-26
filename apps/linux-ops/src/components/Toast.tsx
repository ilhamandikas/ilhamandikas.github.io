import type { Toast } from '../hooks/useToasts';

export function ToastHost({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="rounded-lg border border-edge2 bg-panel2 px-4 py-2 text-sm text-fg"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
