import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntroPage from './components/IntroPage';
import PlayerPicksPage from './components/PlayerPicksPage';
import AllPlayersPicksPage from './components/AllPlayersPicksPage';
import SpreadPage from './components/SpreadPage';
import WeeklyScoresPage from './components/WeeklyScoresPage';
import RosterPaymentsPage from './components/RosterPaymentsPage';
import AdminToolsPage from './components/AdminToolsPage';
import RulesPage from './components/RulesPage';
import ChatPage from './components/ChatPage';
import PotPage from './components/PotPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />

        {/* NEW: Default blank page after login */}
        <Route
          path="/home"
          element={
            <Layout>
              <div></div>
            </Layout>
          }
        />

        <Route
          path="/picks"
          element={
            <Layout>
              <PlayerPicksPage />
            </Layout>
          }
        />
        <Route
          path="/allpicks"
          element={
            <Layout>
              <AllPlayersPicksPage />
            </Layout>
          }
        />
        <Route
          path="/spread"
          element={
            <Layout>
              <SpreadPage />
            </Layout>
          }
        />
        <Route
          path="/weekly-scores"
          element={
            <Layout>
              <WeeklyScoresPage />
            </Layout>
          }
        />
        <Route
          path="/roster-payments"
          element={
            <Layout>
              <RosterPaymentsPage />
            </Layout>
          }
        />
        <Route
          path="/admin-tools"
          element={
            <Layout>
              <AdminToolsPage />
            </Layout>
          }
        />
        <Route
          path="/rules"
          element={
            <Layout>
              <RulesPage />
            </Layout>
          }
        />
        <Route
          path="/chat"
          element={
            <Layout>
              <ChatPage />
            </Layout>
          }
        />
        <Route
          path="/pot"
          element={
            <Layout>
              <PotPage />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;












































