import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={16} />
            </button>

            <div className="p-6 text-center">
              {/* Icon */}
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'
              }`}>
                <AlertTriangle size={28} className={
                  variant === 'danger' ? 'text-red-500' : 'text-amber-500'
                } />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{message}</p>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-text-muted hover:bg-gray-50 font-bold transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    variant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  }`}
                >
                  {isLoading ? 'กำลังดำเนินการ...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


