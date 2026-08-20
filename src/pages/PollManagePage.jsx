import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Lock,
  Share2,
  ShieldAlert,
  ShieldCheck,
  PowerOff,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ResultsView from '../components/ResultsView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function PollManagePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const adminToken = searchParams.get('token') || '';

  const [poll, setPoll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [copiedVotingLink, setCopiedVotingLink] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState(null);
  const [authError, setAuthError] = useState(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const votingUrl = `${origin}/poll/${id}`;

  // Fetch initial poll data on mount
  useEffect(() => {
    let isMounted = true;

    const fetchPollData = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/polls/${id}/`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Poll not found');
          }
          throw new Error(`Failed to load poll (Status ${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setPoll(data);
        }
      } catch (err) {
        console.error('Error fetching poll data for management:', err);
        if (isMounted) {
          setFetchError(err.message || 'Unable to fetch poll.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchPollData();
    }
  }, [id]);

  const handleCopyVotingLink = () => {
    navigator.clipboard.writeText(votingUrl);
    setCopiedVotingLink(true);
    setTimeout(() => setCopiedVotingLink(false), 2000);
  };

  const handleClosePoll = async () => {
    if (!adminToken || isClosing) return;

    setIsClosing(true);
    setCloseError(null);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/polls/${id}/close/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_token: adminToken }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          setAuthError("You don't have permission to manage this poll");
          setShowCloseModal(false);
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.detail || errData.message || `Failed to close voting (Status ${res.status})`
        );
      }

      // Success - update poll state to closed
      setPoll((prev) => (prev ? { ...prev, is_closed: true } : prev));
      setShowCloseModal(false);
    } catch (err) {
      console.error('Error closing poll:', err);
      setCloseError(err.message || 'Something went wrong while closing the poll.');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans relative selection:bg-violet-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center flex flex-col justify-center">
        {/* Navigation / Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Creator Dashboard</span>
          </div>
        </div>

        {/* 1. Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-white/10"
          >
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
            <p className="text-slate-300 font-medium text-base">Loading poll details...</p>
          </motion.div>
        )}

        {/* 2. Error / Not Found State (404) */}
        {!isLoading && fetchError && (
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
              {fetchError === 'Poll not found'
                ? 'This poll does not exist or may have been deleted.'
                : fetchError}
            </p>
            <Link
              to="/"
              className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white shadow-lg"
            >
              <span>Go to QuickPoll Home</span>
            </Link>
          </motion.div>
        )}

        {/* 3. Loaded Poll Content */}
        {!isLoading && poll && (
          <div className="space-y-6 text-left">
            {/* Missing Token Banner (Req #5) */}
            {!adminToken && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 sm:p-6 border border-amber-500/40 bg-amber-950/20 text-amber-200"
              >
                <div className="flex items-start gap-3.5">
                  <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-base text-amber-300 mb-1">
                      Creator Management Link Required
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                      This page requires the creator's secret management link with a valid token (e.g.{' '}
                      <code className="bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-100 font-mono text-xs">
                        ?token=...
                      </code>
                      ). Management controls such as closing voting are disabled.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Auth / Permission Error Banner (403 on Close) */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5 sm:p-6 border border-red-500/40 bg-red-950/20 text-red-200"
              >
                <div className="flex items-start gap-3.5">
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-base text-red-300 mb-1">
                      Access Denied
                    </h3>
                    <p className="text-xs sm:text-sm text-red-200/90 leading-relaxed">
                      {authError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Management Controls Bar & Voting Status Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {poll.is_closed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Lock className="w-3.5 h-3.5" />
                        Voting Closed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Poll Active
                      </span>
                    )}
                  </div>
                  <h1 className="font-display font-semibold text-2xl sm:text-3xl text-white">
                    Manage Poll
                  </h1>
                </div>

                {/* Close Voting Button (Req #4) */}
                {adminToken && !poll.is_closed && !authError && (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 border border-red-400/30"
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>Close Voting</span>
                  </button>
                )}

                {poll.is_closed && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Voting closed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shareable Voting Link Card (Req #3) */}
            <div className="glass-card rounded-2xl p-6 sm:p-7 border border-violet-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-orange-400" />
                  <span>Shareable Voting Link</span>
                </label>
                <Link
                  to={`/poll/${id}`}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Share this public link with your participants to cast votes in real-time.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 text-sm font-mono truncate select-all">
                  {votingUrl}
                </div>
                <button
                  onClick={handleCopyVotingLink}
                  className="btn-gradient px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {copiedVotingLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Results Stream View (Req #3) */}
            <div className="pt-2">
              <ResultsView pollId={id} initialPollData={poll} />
            </div>
          </div>
        )}

        {/* Confirmation Modal for Closing Poll (Req #4) */}
        <AnimatePresence>
          {showCloseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card rounded-2xl p-6 sm:p-8 border border-red-500/40 bg-[#0a0c16] max-w-md w-full text-left shadow-2xl relative"
              >
                <button
                  onClick={() => setShowCloseModal(false)}
                  disabled={isClosing}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mb-4">
                  <PowerOff className="w-6 h-6" />
                </div>

                <h3 className="font-display font-semibold text-xl text-white mb-2">
                  Close Voting?
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Are you sure? This cannot be undone. Once closed, voters will no longer be able to cast new votes.
                </p>

                {closeError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{closeError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCloseModal(false)}
                    disabled={isClosing}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClosePoll}
                    disabled={isClosing}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isClosing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Closing...</span>
                      </>
                    ) : (
                      <span>Confirm Close</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
