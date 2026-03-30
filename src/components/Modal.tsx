import type { ReactNode, MouseEvent } from 'react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  description?: string;
  footer?: ReactNode;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  description,
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      document.body.style.overflow = '';
      previouslyFocusedRef.current?.focus();
      return;
    }

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !contentRef.current) return;

      const focusable = Array.from(
        contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    if (!wasOpenRef.current) {
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => {
        const firstFocusable = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
        firstFocusable?.focus() ?? contentRef.current?.focus();
      }, 0);
      wasOpenRef.current = true;
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/64 p-0 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? 'modal-description' : undefined}
        >
          <motion.div
            ref={contentRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`gt-panel-strong flex max-h-[min(100dvh,48rem)] w-full flex-col overflow-hidden rounded-t-[1.75rem] outline-none sm:max-h-[min(92dvh,48rem)] sm:rounded-[1.75rem] ${maxWidth}`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b gt-hairline bg-[var(--surface-strong)]/95 px-5 py-4 backdrop-blur md:px-6">
              <div className="min-w-0 pr-4">
                <h3 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  {title}
                </h3>
                {description ? (
                  <p id="modal-description" className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {children}
            </div>
            {footer ? (
              <div className="sticky bottom-0 z-10 border-t gt-hairline bg-[var(--surface-strong)]/96 px-5 py-4 backdrop-blur md:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
