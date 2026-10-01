import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { AddVolunteerModal } from '../../pages/Volunteers/AddVolunteerModal';
import { createVolunteer } from '../../lib/api';

export function AppShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addVolunteerModalOpen, setAddVolunteerModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState(() => new Date());
  const [syncFailed, setSyncFailed] = useState(false);
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    setLastSyncDate(new Date());
  }, []);

  const routeTitleMap = {
    '/': 'Command Overview',
    '/dashboard': 'Command Overview',
    '/overview': 'Command Overview',
    '/volunteers': 'Volunteers & Roster',
    '/assignments': 'Volunteer Matching',
    '/tasks': 'Live Tasks Board',
    '/incidents': 'Incident Command',
    '/announcements': 'Field Broadcasts',
    '/live-ops': 'Live Operations Center',
    '/event-setup': 'Event Configuration'
  };

  const currentTitle = routeTitleMap[location.pathname] || 'PULSE Command';

  const handleRefresh = async () => {
    setRefreshing(true);
    setSyncFailed(false);
    setTimeout(() => {
      setRefreshing(false);
      const now = new Date();
      setLastSyncDate(now);
      showToast('Operations telemetry synchronized with on-ground feed', 'success', 2500);
      window.dispatchEvent(new CustomEvent('pulse:refresh'));
    }, 600);
  };

  const handleVolunteerCreated = async (payload) => {
    const res = await createVolunteer(undefined, payload);
    if (res.data) {
      showToast(`Volunteer ${payload.name} added successfully.`, 'success');
      window.dispatchEvent(new CustomEvent('pulse:volunteer-added', { detail: res.data }));
      setAddVolunteerModalOpen(false);
    } else {
      showToast(res.error?.message || 'Failed to add volunteer', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', backgroundColor: 'var(--paper)' }}>
      {/* Persistent Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        lastSyncTime={lastSyncDate}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        syncFailed={syncFailed}
      />

      {/* Main Content Viewport */}
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: 'var(--paper)',
          transition: 'margin-left var(--dur-base) var(--ease-out)'
        }}
        className="pulse-main-viewport"
      >
        <TopBar
          pageTitle={currentTitle}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenAddVolunteer={() => setAddVolunteerModalOpen(true)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastSyncTime={lastSyncDate}
          syncFailed={syncFailed}
        />

        <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      {/* Global Add Volunteer Modal (accessible anywhere via TopBar button) */}
      <AddVolunteerModal
        isOpen={addVolunteerModalOpen}
        onClose={() => setAddVolunteerModalOpen(false)}
        onSubmit={handleVolunteerCreated}
      />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
}

export default AppShell;
