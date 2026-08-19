import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, ShieldCheck, Users } from 'lucide-react';

export default function Hero({ onCreatePollClick }) {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (onCreatePollClick) {
      onCreatePollClick();
    } else {
      navigate('/create');
    }
  };

  // Live mock poll state to create an authentic live feel
  const [mockVotes, setMockVotes] = useState({
    vite: 215,
    react: 142,
    next: 89,
  });
  const [activeVotedOption, setActiveVotedOption] = useState('vite');

  useEffect(() => {
    // Simulate real-time votes coming in
    const interval = setInterval(() => {
      const options = ['vite', 'react', 'next'];
      const randomOpt = options[Math.floor(Math.random() * options.length)];
      setMockVotes((prev) => ({
        ...prev,
        [randomOpt]: prev[randomOpt] + 1,
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalMockVotes = mockVotes.react + mockVotes.next + mockVotes.vite;

  const handleVote = (opt) => {
    setActiveVotedOption(opt);
    setMockVotes((prev) => ({
      ...prev,
      [opt]: prev[opt] + 1,
    }));
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
      {/* Background Subtle Atmospheric Light Rays & Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/30 via-indigo-600/20 to-orange-500/20 rounded-full blur-[110px] animate-pulse-glow" />
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="25%" r="1.5" fill="white" className="animate-ping" style={{ animationDuration: '4s' }} />
          <circle cx="80%" cy="20%" r="2" fill="white" className="animate-ping" style={{ animationDuration: '6s' }} />
          <circle cx="70%" cy="65%" r="1.5" fill="#f97316" className="animate-ping" style={{ animationDuration: '5s' }} />
          <circle cx="15%" cy="70%" r="2" fill="#8b5cf6" />
        </svg>
      </div>

      {/* Feature Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-950/40 text-violet-300 text-xs font-medium backdrop-blur-md mb-8 shadow-inner"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>Instant Real-Time WebSocket Polling</span>
        <span className="h-1 w-1 rounded-full bg-violet-400" />
        <span className="text-violet-400/80">No Auth Needed</span>
      </motion.div>

      {/* Display Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.08] text-white max-w-4xl"
      >
        Ask. Vote. Watch it{' '}
        <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-orange-400 bg-clip-text text-transparent italic font-normal">
          happen live.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-sans font-normal leading-relaxed"
      >
        Create instant interactive polls without creating an account. Share a single link and stream live votes second by second with total privacy.
      </motion.p>

      {/* Primary CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-9 flex flex-col sm:flex-row items-center gap-4"
      >
        <button
          onClick={handleCtaClick}
          className="btn-gradient group px-8 py-4 rounded-full text-base font-semibold text-white tracking-wide shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <span>Create a Poll</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Subtle Highlights list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium"
      >
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span>Sub-second live sync</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
          <span>Zero login friction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Unlimited voters</span>
        </div>
      </motion.div>

      {/* Live Interactive Poll Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-16 w-full max-w-xl glass-card rounded-2xl p-6 sm:p-8 text-left border border-white/10 relative shadow-2xl overflow-hidden group"
      >
        {/* Subtle decorative glow accent inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Live indicator badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Live Preview
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {totalMockVotes} votes cast
          </span>
        </div>

        {/* Question Title */}
        <h3 className="font-display font-medium text-lg sm:text-xl text-white mb-6">
          What matters most when asking for instant audience feedback?
        </h3>

        {/* Poll Options */}
        <div className="space-y-3.5">
          {[
            { id: 'vite', label: 'Zero signups or friction for voters', votes: mockVotes.vite },
            { id: 'react', label: 'Seeing results update in real time', votes: mockVotes.react },
            { id: 'next', label: 'Clean, distraction-free design', votes: mockVotes.next },
          ].map((opt) => {
            const pct = Math.round((opt.votes / totalMockVotes) * 100) || 0;
            const isSelected = activeVotedOption === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                className={`w-full relative overflow-hidden rounded-xl p-3.5 text-left border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-violet-500/60 bg-violet-950/30'
                    : 'border-white/5 bg-slate-900/40 hover:border-white/20'
                }`}
              >
                {/* Animated Percentage Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out rounded-r-lg ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600/30 to-orange-500/30 border-r border-orange-400/40'
                      : 'bg-white/5'
                  }`}
                  style={{ width: `${pct}%` }}
                />

                {/* Option Content */}
                <div className="relative flex items-center justify-between text-sm font-medium z-10">
                  <span className={isSelected ? 'text-white font-semibold' : 'text-slate-300'}>
                    {opt.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{opt.votes}</span>
                    <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-orange-400' : 'text-slate-300'}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 italic">
          Click any option above to test simulated live vote streaming!
        </p>
      </motion.div>
    </section>
  );
}
