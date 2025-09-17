
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ProblemPage from '@/pages/ProblemPage';
import DashboardPage from '@/pages/DashboardPage';
import PracticePage from '@/pages/PracticePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Layout>
  );
}

export default App;