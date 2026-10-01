import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getEvents,
  getMe,
  getAuthUser,
  getAuthToken,
  setAuthUser,
  clearAuth,
  getSelectedEventId,
  setSelectedEventId as persistSelectedEventId
} from '../lib/api';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventIdState] = useState(() => getSelectedEventId());
  const [user, setUser] = useState(() => getAuthUser());
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Sync auth user from backend
  const refreshUser = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
      const res = await getMe();
      if (res.data) {
        setUser(res.data);
      }
    } else {
      setUser(null);
    }
  }, []);

  // Fetch events list
  const loadEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const res = await getEvents();
      if (res.data && res.data.length > 0) {
        setEvents(res.data);

        // Pick preferred event or fallback
        const savedId = getSelectedEventId();
        const foundSaved = res.data.find(e => (e._id || e.id) === savedId);

        if (foundSaved) {
          setSelectedEventIdState(savedId);
        } else {
          // Look for hero event or pick first
          const hero = res.data.find(e => e.name?.toLowerCase().includes('tech summit')) || res.data[0];
          const heroId = hero._id || hero.id;
          setSelectedEventIdState(heroId);
          persistSelectedEventId(heroId);
        }
      }
    } catch {
      // Continue
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    loadEvents();

    const handleAuthChange = () => {
      refreshUser();
      loadEvents();
    };

    const handleEventChange = (e) => {
      if (e.detail) {
        setSelectedEventIdState(e.detail);
      }
    };

    window.addEventListener('pulse:auth-changed', handleAuthChange);
    window.addEventListener('pulse:event-changed', handleEventChange);

    return () => {
      window.removeEventListener('pulse:auth-changed', handleAuthChange);
      window.removeEventListener('pulse:event-changed', handleEventChange);
    };
  }, [refreshUser, loadEvents]);

  const selectEvent = (id) => {
    setSelectedEventIdState(id);
    persistSelectedEventId(id);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const currentEvent = events.find(e => (e._id || e.id) === selectedEventId) || {
    id: selectedEventId,
    _id: selectedEventId,
    name: 'PULSE Command Center',
    venue: 'Event Grounds'
  };

  return (
    <EventContext.Provider
      value={{
        events,
        selectedEventId,
        currentEvent,
        selectEvent,
        refreshEvents: loadEvents,
        user,
        setUser,
        logout,
        loadingEvents
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return ctx;
}

export default EventContext;
