import { Modal } from './Modal';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Delete',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            variant === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
