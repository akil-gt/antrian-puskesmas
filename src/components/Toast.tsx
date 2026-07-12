"use client";

import { useState, useEffect } from "react";
import type { ToastType } from "@/types";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles: Record<ToastType, string> = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-primary-500",
    warning: "bg-amber-500",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2"
      }`}
    >
      <div
        className={`${styles[type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center space-x-2`}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-white/80 hover:text-white"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
