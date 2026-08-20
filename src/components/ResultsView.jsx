import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Lock, RefreshCw, Trophy, Users, BarChart3, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

const OPTION_THEMES = [
  {
    barBg: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500',
    border: 'border-violet-500/40',
    badgeBg: 'bg-violet-950/60 text-violet-300 border-violet-500/40',
    pctText: 'text-violet-300',
  },
  {
    barBg: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-500',
    border: 'border-purple-500/40',
    badgeBg: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    pctText: 'text-purple-300',
  },
  {
    barBg: 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500',
    border: 'border-orange-500/40',
    badgeBg: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
    pctText: 'text-orange-300',
  },
  {
    barBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500',
    border: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    pctText: 'text-emerald-300',
  },
  {
    barBg: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500',
    border: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    pctText: 'text-cyan-300',
  },
  {
    barBg: 'bg-gradient-to-r from-rose-600 via-fuchsia-600 to-rose-500',
    border: 'border-rose-500/40',
    badgeBg: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    pctText: 'text-rose-300',
  },
];

export default function ResultsView({ pollId, initialPollData }) {
  const [poll, setPoll] = useState(initialPollData || null);
  const [isLoading, setIsLoading] = useState(!initialPollData);
  const [fetchError, setFetchError] = useState(null);

  const [wsConnected, setWsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // 1. Fetch initial poll state via HTTP GET
  useEffect(() => {
    let isMounted = true;

    const fetchInitialState = async () => {
      if (initialPollData) {
        setPoll(initialPollData);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/polls/${pollId}/`);
        if (!res.ok) {
          throw new Error(`Failed to load poll results (Status ${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setPoll(data);
        }
      } catch (err) {
        console.error('Error fetching poll results:', err);
        if (isMounted) {
          setFetchError(err.message || 'Unable to load results.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialState();

    return () => {
      isMounted = false;
    };
  }, [pollId, initialPollData]);

  // 2. Establish WebSocket connection for live updates
  useEffect(() => {
    let isComponentMounted = true;

    const connectWebSocket = () => {
      if (!pollId) return;

      try {
        const wsUrl = `${WS_BASE_URL}/ws/polls/${pollId}/`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isComponentMounted) {
            setWsConnected(true);
            setIsReconnecting(false);
          }
        };

        ws.onmessage = (event) => {
          if (!isComponentMounted) return;
          try {
            const data = JSON.parse(event.data);
            const updateData = data.poll || data;

            if (updateData && updateData.options) {
              setPoll((prev) => {
                if (!prev) return updateData;
                return {
                  ...prev,
                  ...updateData,
                  options: updateData.options,
                  is_closed: updateData.is_closed ?? prev.is_closed,
                };
              });
            }
          } catch (err) {
            console.warn('Error parsing WS message:', err);
          }
        };

        ws.onerror = (err) => {
          console.warn('WebSocket error encountered:', err);
          if (isComponentMounted) {
            setWsConnected(false);
          }
        };

        ws.onclose = () => {
          if (isComponentMounted) {
            setWsConnected(false);
            // Attempt reconnect after 3 seconds if poll is not closed
            reconnectTimerRef.current = setTimeout(() => {
              if (isComponentMounted) {
                setIsReconnecting(true);
                connectWebSocket();
              }
            }, 3000);
          }
        };
      } catch (err) {
        console.error('Failed to instantiate WebSocket:', err);
      }
    };

    connectWebSocket();

    return () => {
      isComponentMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [pollId]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-white/10 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mb-3" />
        <p className="text-slate-300 text-sm">Loading live results...</p>
      </div>
    );
  }

  if (fetchError || !poll) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center border border-red-500/30">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h3 className="text-white font-semibold text-lg mb-1">Results Unavailable</h3>
        <p className="text-slate-400 text-sm">{fetchError || 'Could not load poll data.'}</p>
      </div>
    );
  }

  const totalVotes = poll.options.reduce(
    (acc, opt) => acc + (opt.vote_count || 0),
    0
  );

  // Sort options descending by vote_count
  const sortedOptions = [...poll.options].sort(
    (a, b) => (b.vote_count || 0) - (a.vote_count || 0)
  );

  const highestVoteCount = sortedOptions[0]?.vote_count || 0;

  return (
    <div className="w-full max-w-2xl mx-auto text-left space-y-6">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live / Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          {poll.is_closed ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Voting Closed</span>
            </div>
          ) : wsConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Results</span>
            </div>
          ) : isReconnecting ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Reconnecting...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 opacity-50" />
              <span>Static View</span>
            </div>
          )}

          {/* Total Votes Counter */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            <span>
              <strong className="text-white text-sm">{totalVotes}</strong> total votes
            </span>
          </div>
        </div>

        {/* Question Title */}
        <h1 className="font-display font-semibold text-2xl sm:text-4xl text-white leading-tight">
          "{poll.question}"
        </h1>
      </div>

      {/* Animated Live Results List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedOptions.map((opt, rankIndex) => {
            const votes = opt.vote_count || 0;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isWinner = votes > 0 && votes === highestVoteCount;

            // Map option ID or index to fixed theme
            const theme = OPTION_THEMES[(opt.id || rankIndex) % OPTION_THEMES.length];

            return (
              <motion.div
                key={opt.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{
                  layout: { type: 'spring', damping: 25, stiffness: 200 },
                  duration: 0.4,
                }}
                className={`glass-card rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 ${theme.border} ${
                  isWinner ? 'shadow-lg shadow-violet-950/40' : ''
                }`}
              >
                {/* Option Header Info */}
                <div className="flex items-center justify-between gap-3 mb-3 z-10 relative">
                  <div className="flex items-center gap-2.5">
                    {isWinner && totalVotes > 0 && (
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" style={{ animationDuration: '3s' }} />
                    )}
                    <span className="font-display font-medium text-base sm:text-lg text-white">
                      {opt.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400">
                      {votes} {votes === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className={`font-mono text-sm font-bold ${theme.pctText}`}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Animated Horizontal Progress Bar Track */}
                <div className="w-full h-3.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/10 relative">
                  <motion.div
                    className={`h-full rounded-full ${theme.barBg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Subtext Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500 font-sans flex items-center justify-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
          <span>Results stream live in real-time over WebSockets</span>
        </p>
      </div>
    </div>
  );
}
