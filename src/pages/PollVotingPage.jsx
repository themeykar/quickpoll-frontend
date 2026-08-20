import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2, Lock, Vote } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ResultsView from '../components/ResultsView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fixed vibrant Slido/Kahoot-style option card themes
const CARD_STYLES = [
  {
    bg: 'bg-gradient-to-r from-violet-950/60 to-indigo-950/60',
    border: 'border-violet-500/40 hover:border-violet-400',
    glow: 'hover:shadow-violet-500/20',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    text: 'text-violet-100',
    dot: 'bg-violet-400',
  },
  {
    bg: 'bg-gradient-to-r from-purple-950/60 to-pink-950/60',
    border: 'border-purple-500/40 hover:border-purple-400',
    glow: 'hover:shadow-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    text: 'text-purple-100',
    dot: 'bg-purple-400',
  },
  {
    bg: 'bg-gradient-to-r from-orange-950/60 to-amber-950/60',
    border: 'border-orange-500/40 hover:border-orange-400',
    glow: 'hover:shadow-orange-500/20',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    text: 'text-orange-100',
    dot: 'bg-orange-400',
  },
  {
    bg: 'bg-gradient-to-r from-emerald-950/60 to-teal-950/60',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    glow: 'hover:shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    text: 'text-emerald-100',
    dot: 'bg-emerald-400',
  },
  {
    bg: 'bg-gradient-to-r from-cyan-950/60 to-blue-950/60',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    glow: 'hover:shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    text: 'text-cyan-100',
    dot: 'bg-cyan-400',
  },
  {
    bg: 'bg-gradient-to-r from-rose-950/60 to-fuchsia-950/60',
    border: 'border-rose-500/40 hover:border-rose-400',
    glow: 'hover:shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    text: 'text-rose-100',
    dot: 'bg-rose-400',
  },
];

export default function PollVotingPage() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [isLoadingPoll, setIsLoadingPoll] = useState(true);
  const [pollFetchError, setPollFetchError] = useState(null);

  // Flow states: 'name_entry' | 'voting' | 'already_voted' | 'closed'
  const [flowStep, setFlowStep] = useState('name_entry');

  const [voterName, setVoterName] = useState('');
  const [voterNameError, setVoterNameError] = useState(null);
  const [voterId, setVoterId] = useState(null);

  const [submittingOptionId, setSubmittingOptionId] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);

  // Generate UUID helper
  const generateVoterId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'voter_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  };

  // Fetch Poll Data on mount
  useEffect(() => {
    const fetchPoll = async () => {
      setIsLoadingPoll(true);
      setPollFetchError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/polls/${id}/`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Poll not found');
          }
          throw new Error(`Failed to load poll (Status ${res.status})`);
        }

        const data = await res.json();
        setPoll(data);

        // Check if poll is closed
        if (data.is_closed) {
          setFlowStep('closed');
          return;
        }

        // Check localStorage for existing voter_id_{id}
        const existingVoterId = localStorage.getItem(`voter_id_${id}`);
        if (existingVoterId) {
          setVoterId(existingVoterId);
          setFlowStep('already_voted');
        } else {
          setFlowStep('name_entry');
        }
      } catch (err) {
        console.error('Error fetching poll:', err);
        setPollFetchError(err.message || 'Unable to fetch poll. Please try again.');
      } finally {
        setIsLoadingPoll(false);
      }
    };

    if (id) {
      fetchPoll();
    }
  }, [id]);

  // Step 1: Submit Voter Name and move to Voting step
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!voterName.trim()) {
      setVoterNameError('Please enter your name to join the poll.');
      return;
    }

    setVoterNameError(null);
    const newId = generateVoterId();
    setVoterId(newId);
    setFlowStep('voting');
  };

  // Step 2: Cast Vote
  const handleCastVote = async (optionId) => {
    if (submittingOptionId !== null) return; // Prevent double taps

    setSubmittingOptionId(optionId);
    setVoteError(null);

    try {
      const payload = {
        option_id: optionId,
        voter_id: voterId,
        voter_name: voterName.trim() || 'Anonymous Voter',
      };

      const res = await fetch(`${API_BASE_URL}/api/polls/${id}/vote/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || 'Voting failed. The poll may be closed or invalid.'
        );
      }

      const updatedPollData = await res.json().catch(() => null);
      if (updatedPollData && updatedPollData.options) {
        setPoll(updatedPollData);
      }

      // Store voter_id in localStorage under voter_id_{id}
      try {
        localStorage.setItem(`voter_id_${id}`, voterId);
      } catch (err) {
        console.warn('Could not save voter_id to localStorage', err);
      }

      // Show brief vote success state, then set already voted state
      setShowVoteSuccess(true);
      setTimeout(() => {
        setShowVoteSuccess(false);
        setFlowStep('already_voted');
      }, 1500);
    } catch (err) {
      console.error('Failed to cast vote:', err);
      setVoteError(err.message || 'Something went wrong casting your vote. Please try again.');
    } finally {
      setSubmittingOptionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans relative selection:bg-violet-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center flex flex-col justify-center">
        {/* Back Link */}
        <div className="mb-6 text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* 1. Loading State */}
        {isLoadingPoll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-white/10"
          >
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
            <p className="text-slate-300 font-medium text-base">Loading poll details...</p>
          </motion.div>
        )}

        {/* 2. Error / Not Found State */}
        {!isLoadingPoll && pollFetchError && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-red-500/30 max-w-lg mx-auto"
          >
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-display font-semibold text-2xl text-white mb-2">
              Poll Not Found
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {pollFetchError === 'Poll not found'
                ? 'This poll does not exist or may have been deleted.'
                : pollFetchError}
            </p>
            <Link
              to="/"
              className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white shadow-lg"
            >
              <span>Go to QuickPoll Home</span>
            </Link>
          </motion.div>
        )}

        {/* Loaded Poll Content */}
        {!isLoadingPoll && poll && (
          <AnimatePresence mode="wait">
            {/* 3. Closed Poll State */}
            {flowStep === 'closed' && (
              <motion.div
                key="closed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full"
              >
                <ResultsView pollId={id} initialPollData={poll} />
              </motion.div>
            )}

            {/* 4. Already Voted State / Live Results View */}
            {flowStep === 'already_voted' && !showVoteSuccess && (
              <motion.div
                key="already_voted"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full"
              >
                <ResultsView pollId={id} initialPollData={poll} />
              </motion.div>
            )}

            {/* Success Overlay Animation */}
            {showVoteSuccess && (
              <motion.div
                key="success_overlay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-10 text-center border border-emerald-500/40 max-w-md mx-auto shadow-2xl bg-emerald-950/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-950/60"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h2 className="font-display font-semibold text-2xl text-white mb-2">
                  Vote Submitted!
                </h2>
                <p className="text-emerald-200/80 text-sm">
                  Loading real-time live results...
                </p>
              </motion.div>
            )}

            {/* 5. Join Flow - Step 1: Display Name Entry */}
            {flowStep === 'name_entry' && !showVoteSuccess && (
              <motion.div
                key="name_entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-card rounded-2xl p-8 sm:p-12 text-left border border-white/10 max-w-xl mx-auto shadow-2xl relative overflow-hidden"
              >
                {/* Background glow accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-medium mb-4">
                  <Vote className="w-3.5 h-3.5 text-orange-400" />
                  <span>Join Live Poll</span>
                </div>

                <h1 className="font-display font-semibold text-2xl sm:text-4xl text-white mb-6 leading-tight">
                  "{poll.question}"
                </h1>

                <form onSubmit={handleNameSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="voter-name" className="block text-sm font-semibold text-slate-200 mb-2">
                      Enter your name to join <span className="text-orange-400">*</span>
                    </label>
                    <input
                      id="voter-name"
                      type="text"
                      value={voterName}
                      onChange={(e) => {
                        setVoterName(e.target.value);
                        if (voterNameError) setVoterNameError(null);
                      }}
                      placeholder="e.g. Alex"
                      autoFocus
                      className={`w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-base outline-none transition-all ${
                        voterNameError
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                      }`}
                    />
                    {voterNameError && (
                      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {voterNameError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-gradient py-3.5 rounded-xl font-semibold text-white text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Continue to Vote
                  </button>
                </form>
              </motion.div>
            )}

            {/* 6. Join Flow - Step 2: Voting Option Cards */}
            {flowStep === 'voting' && !showVoteSuccess && (
              <motion.div
                key="voting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto text-left"
              >
                {/* Voter Identity Bar */}
                <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Voting as <strong className="text-white">{voterName}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFlowStep('name_entry')}
                    className="text-violet-400 hover:underline cursor-pointer"
                  >
                    Change name
                  </button>
                </div>

                {/* Poll Question */}
                <h1 className="font-display font-semibold text-3xl sm:text-5xl text-white mb-8 leading-tight text-center sm:text-left">
                  "{poll.question}"
                </h1>

                {/* Vote Error Alert */}
                {voteError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 flex items-start gap-3 text-red-200 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-300">Vote Submission Failed</p>
                      <p className="mt-0.5 opacity-90">{voteError}</p>
                    </div>
                  </div>
                )}

                {/* Kahoot / Slido Style Option Cards */}
                <div className="space-y-4">
                  {poll.options.map((opt, index) => {
                    const style = CARD_STYLES[index % CARD_STYLES.length];
                    const isSubmittingThis = submittingOptionId === opt.id;
                    const isAnySubmitting = submittingOptionId !== null;

                    return (
                      <motion.button
                        key={opt.id}
                        whileHover={!isAnySubmitting ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isAnySubmitting ? { scale: 0.98 } : {}}
                        onClick={() => handleCastVote(opt.id)}
                        disabled={isAnySubmitting}
                        className={`w-full p-5 sm:p-6 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 shadow-xl cursor-pointer ${
                          style.bg
                        } ${style.border} ${style.glow} ${
                          isAnySubmitting && !isSubmittingThis ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${style.badge}`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className={`font-display font-medium text-lg sm:text-xl ${style.text}`}>
                            {opt.text}
                          </span>
                        </div>

                        {/* Spinner or Arrow Indicator */}
                        <div className="ml-4 shrink-0">
                          {isSubmittingThis ? (
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          ) : (
                            <div className={`w-3 h-3 rounded-full ${style.dot} opacity-70`} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}
