"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-tertiary">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 border rounded-lg transition-all duration-200
              bg-background-secondary text-text-primary placeholder-text-tertiary
              ${icon ? "pl-10" : ""}
              ${
                error
                  ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                  : "border-border focus:border-accent focus:ring-accent/20"
              }
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
