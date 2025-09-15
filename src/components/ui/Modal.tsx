"use client";

import React, { PropsWithChildren } from "react";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({ open, title, onClose, footer, size = "lg", children }: PropsWithChildren<ModalProps>) {
  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-start sm:items-center justify-center p-4">
          <div className={`w-full ${sizeClass} bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl`}
            role="dialog" aria-modal="true">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="px-5 py-4">
              {children}
            </div>
            {footer && (
              <div className="px-5 py-4 border-t border-gray-800 flex justify-end gap-2">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
