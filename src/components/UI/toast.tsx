// Toast.tsx
import React, { useEffect, useMemo } from "react";

// Expanded props for more control
export type ToastProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
  duration?: number; // Duration in milliseconds
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
};

// SVG Icons for different types
const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
};

const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  onClose,
  type = "success",
  duration = 4000,
  position = "top-right",
}) => {

  // Auto-close toast after the specified duration
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);
  
  // Memoize class strings for performance and readability
  const typeClasses = useMemo(() => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-300",
          icon: "text-red-500",
          progress: "bg-red-500",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-300",
          icon: "text-blue-500",
          progress: "bg-blue-500",
        };
      case "success":
      default:
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-300",
          icon: "text-emerald-500",
          progress: "bg-emerald-500",
        };
    }
  }, [type]);

  const positionClasses = useMemo(() => {
    switch (position) {
      case "top-center":
        return "items-center";
      case "bottom-right":
        return "items-end justify-end";
      case "bottom-center":
        return "items-end justify-center";
      case "top-right":
      default:
        return "items-start justify-end";
    }
  }, [position]);

  // We don't render anything if the toast is not open.
  // The parent component is responsible for mounting/unmounting.
  // The CSS transitions handle the visual appearance/disappearance.
  if (!isOpen) return null;

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed inset-0 z-[10000] pointer-events-none flex p-4 sm:p-6 ${positionClasses}`}
    >
      <div
        role="alert"
        className={[
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl",
          "bg-white/80 backdrop-blur-md dark:bg-neutral-900/80",
          "shadow-lg ring-1 ring-black ring-opacity-5",
          // Smooth enter/exit animation
          "transition-all transform ease-in-out duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
        ].join(" ")}
      >
        <div className="p-4">
          <div className="flex items-start">
            {/* Accent Icon */}
            <div className={`flex-shrink-0 ${typeClasses.icon}`}>
              {icons[type]}
            </div>

            {/* Message */}
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {message}
              </p>
            </div>

            {/* Close Button */}
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-1 w-full bg-black/10 dark:bg-white/10">
          <div
            className={`h-1 ${typeClasses.progress}`}
            style={{ animation: `deplete ${duration}ms linear forwards` }}
          />
        </div>
      </div>
      {/* We need to inject the keyframes animation into the document */}
      <style>
        {`
          @keyframes deplete {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;