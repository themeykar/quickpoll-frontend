import React from 'react';
import logoPlaceholder from '../assets/logo-placeholder.png';

export default function Navbar({ onCreatePollClick }) {
  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      <nav className="glass-pill rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-orange-500 opacity-40 blur-sm group-hover:opacity-75 transition duration-300"></div>
            <img
              src={logoPlaceholder}
              alt="QuickPoll Logo"
              className="relative h-8 w-8 object-contain rounded-full border border-white/10"
            />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            QuickPoll
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onCreatePollClick}
          className="btn-gradient px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white tracking-wide shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Create a Poll
        </button>
      </nav>
    </header>
  );
}
