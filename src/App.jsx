import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreatePollPage from './pages/CreatePollPage';
import PollCreatedPage from './pages/PollCreatedPage';
import PollVotingPage from './pages/PollVotingPage';
import PollManagePage from './pages/PollManagePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreatePollPage />} />
      <Route path="/poll/:id/created" element={<PollCreatedPage />} />
      <Route path="/poll/:id/manage" element={<PollManagePage />} />
      <Route path="/poll/:id" element={<PollVotingPage />} />
    </Routes>
  );
}

