import { createContext, useContext } from 'react';
import useToast from '../hooks/useToast';
import Toast from '../components/common/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const { toast, showToast, hideToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

