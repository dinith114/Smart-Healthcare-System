import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({ 
  open, 
  title, 
  message, 
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm, 
  onCancel,
  type = "warning" // warning, danger, info
}) {
  const typeStyles = {
    warning: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700"
    },
    danger: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      confirmButton: "bg-red-600 hover:bg-red-700"
    },
    info: {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      confirmButton: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const style = typeStyles[type];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Icon */}
            <div className="p-6 pb-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                className={`${style.bgColor} ${style.iconColor} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                {style.icon}
              </motion.div>

              {/* Title */}
              <motion.h3 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold text-gray-900 text-center mb-2"
              >
                {title}
              </motion.h3>

              {/* Message */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-center text-sm"
              >
                {message}
              </motion.p>
            </div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gray-50 px-6 py-4 flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 ${style.confirmButton} text-white rounded-lg font-semibold transition-colors`}
              >
                {confirmText}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

