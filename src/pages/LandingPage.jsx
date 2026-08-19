import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleCreatePollClick = () => {
    navigate('/create');
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
