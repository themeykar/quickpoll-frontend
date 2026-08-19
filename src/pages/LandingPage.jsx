import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

export default function LandingPage() {
  const handleCreatePollClick = () => {
    alert('Poll creation will be built in the next step!');
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans relative selection:bg-violet-500 selection:text-white">
      <Navbar onCreatePollClick={handleCreatePollClick} />
      <main className="flex-1">
        <Hero onCreatePollClick={handleCreatePollClick} />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
