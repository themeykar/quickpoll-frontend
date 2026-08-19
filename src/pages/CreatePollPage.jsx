import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CreatePollPage() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Handle question change
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    if (errors.question) {
      setErrors((prev) => ({ ...prev, question: null }));
    }
  };

  // Handle option input change
  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);

    if (errors.options && errors.options[index]) {
      const updatedErrOptions = { ...errors.options };
      delete updatedErrOptions[index];
      setErrors((prev) => ({ ...prev, options: updatedErrOptions }));
    }
  };

  // Add new option input (up to 6)
  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  // Remove option input (only if > 2)
  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
      
      // Clean up error state if any
      if (errors.options) {
        const updatedErrOptions = {};
        Object.keys(errors.options).forEach((key) => {
          const k = parseInt(key, 10);
          if (k < index) updatedErrOptions[k] = errors.options[k];
          else if (k > index) updatedErrOptions[k - 1] = errors.options[k];
        });
        setErrors((prev) => ({ ...prev, options: updatedErrOptions }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!question.trim()) {
      newErrors.question = 'Please enter a poll question.';
      isValid = false;
    }

    const optionErrors = {};
    options.forEach((opt, idx) => {
      if (!opt.trim()) {
        optionErrors[idx] = 'Option cannot be empty.';
        isValid = false;
      }
    });

    if (Object.keys(optionErrors).length > 0) {
      newErrors.options = optionErrors;
    }

    if (options.length < 2) {
      newErrors.general = 'A poll requires at least 2 options.';
      isValid = false;
    } else if (options.length > 6) {
      newErrors.general = 'A poll can have at most 6 options.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        question: question.trim(),
        options: options.map((opt) => opt.trim()),
      };

      const res = await fetch(`${API_BASE_URL}/api/polls/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `Server returned error ${res.status}`
        );
      }

      const data = await res.json();

      // Store admin token in localStorage keyed by admin_token_{id}
      if (data.id && data.admin_token) {
        try {
          localStorage.setItem(`admin_token_${data.id}`, data.admin_token);
        } catch (err) {
          console.warn('Unable to write admin token to localStorage', err);
        }
      }

      // Navigate to confirmation route
      navigate(`/poll/${data.id}/created`, { state: { pollData: data } });
    } catch (err) {
      console.error('Failed to create poll:', err);
      setApiError(err.message || 'Something went wrong while creating your poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans relative selection:bg-violet-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-left mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Instant Poll Creator</span>
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-5xl text-white tracking-tight">
            Create a New Poll
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            No signup needed. Enter your question and options, then launch instantly.
          </p>
        </motion.div>

        {/* Form Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Decorative Glow Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Poll Creation Failed</p>
                <p className="mt-0.5 opacity-90">{apiError}</p>
              </div>
            </div>
          )}

          {/* General Form Error Alert */}
          {errors.general && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2.5 text-amber-200 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Question Field */}
            <div>
              <label htmlFor="poll-question" className="block text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
                <span>Poll Question <span className="text-orange-400">*</span></span>
                <span className="text-xs font-normal text-slate-500">Required</span>
              </label>
              <input
                id="poll-question"
                type="text"
                value={question}
                onChange={handleQuestionChange}
                placeholder="e.g. Which feature should we build next week?"
                className={`w-full px-4 py-3.5 rounded-xl bg-slate-900/70 border text-white placeholder-slate-500 text-sm sm:text-base outline-none transition-all duration-200 ${
                  errors.question
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                }`}
              />
              {errors.question && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.question}
                </p>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-200">
                  Poll Options <span className="text-orange-400">*</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  {options.length} / 6 options
                </span>
              </div>

              {options.map((opt, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-500 w-5 text-right shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className={`flex-1 px-4 py-3 rounded-xl bg-slate-900/70 border text-white placeholder-slate-500 text-sm outline-none transition-all duration-200 ${
                        errors.options && errors.options[idx]
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                      }`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        title="Remove option"
                        className="p-2.5 rounded-xl border border-white/5 bg-slate-900/40 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {errors.options && errors.options[idx] && (
                    <p className="ml-7 text-xs text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.options[idx]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Button */}
            {options.length < 6 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/30 bg-violet-950/30 text-violet-300 text-xs sm:text-sm font-semibold hover:bg-violet-900/40 hover:border-violet-400/50 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span>Add another option</span>
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 pt-6" />

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>You will receive an admin management link upon creation.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gradient px-8 py-3.5 rounded-full font-semibold text-white text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Poll...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-orange-300" />
                    <span>Publish Poll</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
