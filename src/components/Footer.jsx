import React from 'react';
import logoPlaceholder from '../assets/logo-placeholder.png';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-950/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src={logoPlaceholder}
            alt="QuickPoll Logo"
            className="h-6 w-6 object-contain rounded-full border border-white/10"
          />
          <span className="font-display font-bold text-base text-white">
            QuickPoll
          </span>
        </div>

        <p className="text-xs text-slate-500 font-sans">
          &copy; {new Date().getFullYear()} QuickPoll. Real-time opinion polling. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
