import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Layer 1: Cinematic Editorial Landing Experience
import { Landing } from './pages/Landing';

// Layer 2: Operations Application
import { Overview } from './pages/Overview/Overview';
import { Volunteers } from './pages/Volunteers/Volunteers';
import { EventSetup } from './pages/EventSetup/EventSetup';
import { AssignmentsPlaceholder } from './pages/Assignments/AssignmentsPlaceholder';
import { TasksPlaceholder } from './pages/Tasks/TasksPlaceholder';
import { IncidentsPlaceholder } from './pages/Incidents/IncidentsPlaceholder';
import { AnnouncementsPlaceholder } from './pages/Announcements/AnnouncementsPlaceholder';
import { LiveOpsPlaceholder } from './pages/LiveOps/LiveOpsPlaceholder';
import { NotFound } from './pages/NotFound/NotFound';

export function App() {
  return (
    <Routes>
      {/* Layer 1: Landing Experience — rendered WITHOUT app chrome (no Sidebar/Topbar) */}
      <Route path="/" element={<Landing />} />

      {/* Layer 2: Operations Application — rendered INSIDE AppShell */}
      <Route
        path="/dashboard"
        element={
          <AppShell>
            <Overview />
          </AppShell>
        }
      />
      <Route
        path="/overview"
        element={
          <AppShell>
            <Overview />
          </AppShell>
        }
      />
      <Route
        path="/volunteers"
        element={
          <AppShell>
            <Volunteers />
          </AppShell>
        }
      />
      <Route
        path="/assignments"
        element={
          <AppShell>
            <AssignmentsPlaceholder />
          </AppShell>
        }
      />
      <Route
        path="/tasks"
        element={
          <AppShell>
            <TasksPlaceholder />
          </AppShell>
        }
      />
      <Route
        path="/incidents"
        element={
          <AppShell>
            <IncidentsPlaceholder />
          </AppShell>
        }
      />
      <Route
        path="/announcements"
        element={
          <AppShell>
            <AnnouncementsPlaceholder />
          </AppShell>
        }
      />
      <Route
        path="/live-ops"
        element={
          <AppShell>
            <LiveOpsPlaceholder />
          </AppShell>
        }
      />
      <Route
        path="/event-setup"
        element={
          <AppShell>
            <EventSetup />
          </AppShell>
        }
      />

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <AppShell>
            <NotFound />
          </AppShell>
        }
      />
    </Routes>
  );
}

export default App;
