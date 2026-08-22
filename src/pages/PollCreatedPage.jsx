import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, Lock, ExternalLink, ArrowRight, Share2, Sparkles, ShieldAlert, Download, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PollCreatedPage() {
  const { id } = useParams();
  const location = useLocation();

  const [copiedVoteLink, setCopiedVoteLink] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  // Retrieve poll data from router state or localStorage
  const pollData = location.state?.pollData || null;

  // Retrieve admin token from location state or localStorage
  const [adminToken, setAdminToken] = useState(() => {
    if (pollData?.admin_token) return pollData.admin_token;
    try {
      return localStorage.getItem(`admin_token_${id}`) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (pollData?.admin_token && id) {
      try {
        localStorage.setItem(`admin_token_${id}`, pollData.admin_token);
        setAdminToken(pollData.admin_token);
      } catch (err) {
        console.warn('Unable to store admin token in localStorage', err);
      }
    }
  }, [pollData, id]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const votingUrl = `${origin}/poll/${id}`;
  const adminUrl = `${origin}/poll/${id}/manage?token=${adminToken}`;

  // Copy voting link to clipboard
  const handleCopyVotingLink = () => {
    navigator.clipboard.writeText(votingUrl);
    setCopiedVoteLink(true);
    setTimeout(() => setCopiedVoteLink(false), 2000);
  };

  // Copy admin link to clipboard
  const handleCopyAdminLink = () => {
    navigator.clipboard.writeText(adminUrl);
    setCopiedAdminLink(true);
    setTimeout(() => setCopiedAdminLink(false), 2000);
  };

  // Download QR code as PNG image
  const handleDownloadQR = () => {
    const canvas = document.getElementById('poll-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `poll-${id}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans relative selection:bg-violet-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
        {/* Confident Success Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Poll Published Successfully</span>
          </div>

          <h1 className="font-display font-semibold text-3xl sm:text-5xl text-white tracking-tight">
            Your poll is live!
          </h1>
          <p className="mt-3 text-slate-300 text-base sm:text-lg max-w-xl font-normal">
            {pollData?.question ? (
              <span className="text-white font-medium italic">"{pollData.question}"</span>
            ) : (
              'Share the link with your audience to start streaming live votes.'
            )}
          </p>
        </motion.div>

        {/* Links Container */}
        <div className="mt-10 space-y-6 text-left">
          {/* Shareable Voting Link Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-card rounded-2xl p-6 sm:p-7 border border-violet-500/30 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-orange-400" />
                <span>Shareable Voting Link</span>
              </label>
              <span className="text-xs text-slate-400 font-medium">Public URL</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Send this link to anyone you want to vote in your poll.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 text-sm font-mono truncate select-all">
                {votingUrl}
              </div>
              <button
                onClick={handleCopyVotingLink}
                className="btn-gradient px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {copiedVoteLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Voting Link</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Code Option */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-violet-400" />
                <span>Or scan to vote</span>
              </span>

              <div className="p-3.5 bg-white rounded-2xl shadow-xl border border-white/20 inline-block mb-3">
                <QRCodeCanvas
                  id="poll-qr-canvas"
                  value={votingUrl}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>

              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-violet-500/30 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-violet-400" />
                <span>Download QR Code</span>
              </button>
            </div>
          </motion.div>

          {/* Private Admin Management Link Card */}
          {adminToken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="glass-card rounded-2xl p-6 sm:p-7 border border-amber-500/30 bg-amber-950/10 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Creator Admin Control Link</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] font-semibold text-amber-300 uppercase tracking-widest">
                  Private
                </span>
              </div>

              <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Keep this link private! It contains your <strong>admin_token</strong> required to close voting or manage poll settings.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1 px-4 py-3 rounded-xl bg-slate-950/90 border border-amber-500/20 text-amber-100/80 text-xs font-mono truncate select-all">
                  {adminUrl}
                </div>
                <button
                  onClick={handleCopyAdminLink}
                  className="px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-xs sm:text-sm font-semibold text-amber-200 shadow-md flex items-center justify-center gap-2 hover:bg-amber-950/40 transition-all cursor-pointer shrink-0"
                >
                  {copiedAdminLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied Admin URL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      <span>Copy Admin Link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left"
          >
            <Link
              to="/create"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all"
            >
              <span>Create Another Poll</span>
            </Link>

            <Link
              to={`/poll/${id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-violet-500/30 bg-violet-950/40 hover:bg-violet-900/50 text-violet-200 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all"
            >
              <span>Preview Voting Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
