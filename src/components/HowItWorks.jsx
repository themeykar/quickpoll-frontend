import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Share2, Activity } from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    icon: PlusCircle,
    title: 'Create a Poll',
    description:
      'Type your question and options in seconds. No account, email, or password required.',
    gradient: 'from-violet-500 to-indigo-500',
    iconColor: 'text-violet-400',
  },
  {
    stepNumber: '02',
    icon: Share2,
    title: 'Share the Link',
    description:
      'Copy your unique share link or QR code. Send it to your audience on any channel.',
    gradient: 'from-indigo-500 to-purple-500',
    iconColor: 'text-indigo-400',
  },
  {
    stepNumber: '03',
    icon: Activity,
    title: 'Watch Results Live',
    description:
      'See bar graphs update instantly in real-time as votes pour in over WebSocket channels.',
    gradient: 'from-purple-500 to-orange-500',
    iconColor: 'text-orange-400',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">
          Simple Workflow
        </h2>
        <h3 className="font-display font-semibold text-3xl sm:text-5xl text-white tracking-tight">
          How QuickPoll Works
        </h3>
        <p className="mt-4 text-slate-400 text-base sm:text-lg">
          Designed for maximum speed and zero friction. Three simple steps from question to live results.
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.stepNumber}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="glass-card rounded-2xl p-8 relative flex flex-col justify-between group hover:border-violet-500/30 transition-all duration-300"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-8">
                <div className={`p-3 rounded-xl bg-slate-900/80 border border-white/10 ${step.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-3xl font-bold text-slate-700 group-hover:text-slate-500 transition-colors">
                  {step.stepNumber}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="font-display font-semibold text-xl text-white mb-3">
                  {step.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Bottom Subtle Gradient Accent Line */}
              <div className={`mt-8 h-1 w-12 rounded-full bg-gradient-to-r ${step.gradient} group-hover:w-full transition-all duration-500`} />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
