
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ThemeProvider } from '@/contexts/ThemeProvider.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';

import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import WorkLogApp from '@/pages/WorkLogApp.jsx';
import ScheduleView from '@/pages/ScheduleView.jsx';
import TimeAnalyticsPage from '@/pages/TimeAnalyticsPage.jsx';
import CalendarView from '@/pages/CalendarView.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/app" element={
              <ProtectedRoute>
                <WorkLogApp />
              </ProtectedRoute>
            } />

            <Route path="/schedule" element={
              <ProtectedRoute>
                <ScheduleView />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <TimeAnalyticsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
