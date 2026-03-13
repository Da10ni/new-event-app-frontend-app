import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        {destructive && (
          <div className="mb-4 p-3 rounded-full bg-red-50">
            <HiExclamationTriangle className="h-8 w-8 text-error" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-neutral-600 mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 mb-6 max-w-sm">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
