import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          let bgClass = 'bg-white/90 text-gray-800 border-gray-200';
          let icon = 'info';
          let iconColor = 'text-blue-500';
          
          if (t.type === 'success') {
            bgClass = 'bg-white/80 border-[#4c6548] text-gray-800';
            icon = 'check_circle';
            iconColor = 'text-[#4c6548]';
          } else if (t.type === 'error' || t.type === 'warning') {
            bgClass = 'bg-white/80 border-red-500 text-gray-800';
            icon = 'error';
            iconColor = 'text-red-500';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-slide-in ${bgClass}`}
              style={{
                animation: 'toast-slide-in 0.3s ease-out forwards',
              }}
            >
              <span className={`material-symbols-outlined ${iconColor} text-2xl`}>{icon}</span>
              <p className="text-sm font-semibold flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          );
        })}
      </div>
      
      {/* CSS Injection for Slide-in Animation */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
