import { useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error"
  });

  const showToast = (message, severity = "error") => {
    setToast({
      open: true,
      message,
      severity
    });
  };

  const hideToast = () => {
    setToast((prev) => ({
      ...prev,
      open: false
    }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
}

