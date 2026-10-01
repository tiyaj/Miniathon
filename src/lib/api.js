import {
  EVENT_ID,
  mockEvent,
  mockDashboard,
  mockZones,
  mockAttentionQueue,
  mockShifts,
  mockRecentActivities,
  mockVolunteers,
  mockRoles
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// In-memory mutable state for responsive mock demo interactions
let localVolunteers = [...mockVolunteers];
let localZones = [...mockZones];
let localRoles = [...mockRoles];
let localShifts = [...mockShifts];
let localDashboard = { ...mockDashboard };
let localEvent = { ...mockEvent };
let localRecentActivities = [...mockRecentActivities];

/**
 * Reusable request helper that complies with:
 * Success: { data: ... }
 * Error: { error: { message: "...", code: "..." } }
 * Automatically falls back to mock storage if backend is unreachable.
 */
async function request(endpoint, options = {}, mockFallbackFn) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || `HTTP error ${response.status}`);
    }
    return result;
  } catch (err) {
    // If backend is not running or network fails, gracefully execute the mock fallback
    if (mockFallbackFn) {
      // Simulate natural async response
      await new Promise(resolve => setTimeout(resolve, 80));
      const mockResult = await mockFallbackFn();
      return { data: mockResult };
    }
    return {
      error: {
        message: err.message || 'Network request failed',
        code: 'NETWORK_ERROR'
      }
    };
  }
}

// 1. getEvents
export async function getEvents() {
  return request('/events', { method: 'GET' }, () => [localEvent]);
}

// 2. getDashboard
export async function getDashboard(eventId = EVENT_ID) {
  return request(`/events/${eventId}/dashboard`, { method: 'GET' }, () => ({
    ...localDashboard,
    event: localEvent,
    zones: localZones,
    attentionQueue: mockAttentionQueue,
    shifts: localShifts,
    recentActivity: localRecentActivities,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));
}

// 3. getStructure
export async function getStructure(eventId = EVENT_ID) {
  return request(`/events/${eventId}/structure`, { method: 'GET' }, () => ({
    event: localEvent,
    zones: localZones,
    roles: localRoles,
    shifts: localShifts
  }));
}

// 4. getVolunteers
export async function getVolunteers(eventId = EVENT_ID, filters = {}) {
  return request(`/events/${eventId}/volunteers`, { method: 'GET' }, () => {
    let result = [...localVolunteers];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.skills && v.skills.some(s => s.toLowerCase().includes(q))) ||
        (v.assignedZone && v.assignedZone.toLowerCase().includes(q))
      );
    }
    if (filters.skill && filters.skill !== 'All') {
      result = result.filter(v => v.skills && v.skills.includes(filters.skill));
    }
    if (filters.availability && filters.availability !== 'All') {
      result = result.filter(v => v.availableShifts && v.availableShifts.includes(filters.availability));
    }
    if (filters.status && filters.status !== 'All') {
      result = result.filter(v => v.status === filters.status);
    }
    return result;
  });
}

// 5. createVolunteer
export async function createVolunteer(eventId = EVENT_ID, payload) {
  return request(
    `/events/${eventId}/volunteers`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    () => {
      const initials = payload.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'VO';

      const newVol = {
        id: `vol-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone || '+91 98000 00000',
        avatar: initials,
        skills: payload.skills || [],
        availableShifts: payload.availableShifts || ['Morning'],
        assignedZone: payload.preferredZone || 'Unassigned',
        assignedRole: 'General Support',
        hours: 0,
        maxHours: Number(payload.maxHours) || 6,
        status: 'Available',
        preferredZone: payload.preferredZone || 'None',
        attendanceHistory: [],
        notes: payload.notes || ''
      };

      localVolunteers = [newVol, ...localVolunteers];
      localDashboard.volunteersRegistered += 1;

      // Add activity
      localRecentActivities.unshift({
        id: `act-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `${newVol.name} registered as new volunteer`,
        category: 'volunteer',
        zone: newVol.preferredZone || 'General',
        badge: 'New Volunteer'
      });

      return newVol;
    }
  );
}

// 6. getCoverage
export async function getCoverage(eventId = EVENT_ID, filters = {}) {
  return request(`/events/${eventId}/coverage`, { method: 'GET' }, () => {
    return {
      zones: localZones,
      shifts: localShifts,
      overall: localDashboard.coverage
    };
  });
}

// 7. getAssignments
export async function getAssignments(eventId = EVENT_ID) {
  return request(`/events/${eventId}/assignments`, { method: 'GET' }, () => {
    return localVolunteers.filter(v => v.status === 'Assigned' || v.status === 'Checked In');
  });
}

// 8. getSuggestions
export async function getSuggestions(eventId = EVENT_ID, roleId) {
  return request(`/events/${eventId}/suggestions?roleId=${roleId}`, { method: 'GET' }, () => {
    return localVolunteers
      .filter(v => v.status === 'Available')
      .map(v => ({
        volunteer: v,
        matchScore: 94,
        reasons: ['Skills match', 'Available shift', 'No schedule conflicts']
      }));
  });
}

// 9. createAssignment
export async function createAssignment(eventId = EVENT_ID, payload) {
  return request(`/events/${eventId}/assignments`, { method: 'POST', body: JSON.stringify(payload) }, () => {
    return { success: true, assignmentId: `asg-${Date.now()}` };
  });
}

// 10. dropoutAssignment
export async function dropoutAssignment(eventId = EVENT_ID, volunteerId) {
  return request(`/events/${eventId}/assignments/${volunteerId}/dropout`, { method: 'POST' }, () => {
    const vol = localVolunteers.find(v => v.id === volunteerId);
    if (vol) {
      vol.status = 'Dropout';
      localRecentActivities.unshift({
        id: `act-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `${vol.name} marked as dropout`,
        category: 'dropout',
        zone: vol.assignedZone || 'General',
        badge: 'Dropout'
      });
    }
    return { success: true, volunteer: vol };
  });
}

// 11. checkIn
export async function checkIn(eventId = EVENT_ID, volunteerId) {
  return request(`/events/${eventId}/volunteers/${volunteerId}/check-in`, { method: 'POST' }, () => {
    const vol = localVolunteers.find(v => v.id === volunteerId);
    if (vol) {
      vol.status = 'Checked In';
      vol.attendanceHistory.unshift({
        shift: vol.availableShifts[0] || 'Morning',
        status: 'Checked In',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      localDashboard.checkedIn += 1;
      localRecentActivities.unshift({
        id: `act-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `${vol.name} checked in at ${vol.assignedZone || 'Main Venue'}`,
        category: 'checkin',
        zone: vol.assignedZone || 'General',
        badge: 'Checked In'
      });
    }
    return { success: true, volunteer: vol };
  });
}

// 12. checkOut
export async function checkOut(eventId = EVENT_ID, volunteerId) {
  return request(`/events/${eventId}/volunteers/${volunteerId}/check-out`, { method: 'POST' }, () => {
    const vol = localVolunteers.find(v => v.id === volunteerId);
    if (vol) {
      vol.status = 'Checked Out';
      vol.attendanceHistory.unshift({
        shift: vol.availableShifts[0] || 'Morning',
        status: 'Checked Out',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      localDashboard.checkedIn = Math.max(0, localDashboard.checkedIn - 1);
      localRecentActivities.unshift({
        id: `act-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `${vol.name} checked out`,
        category: 'checkout',
        zone: vol.assignedZone || 'General',
        badge: 'Checked Out'
      });
    }
    return { success: true, volunteer: vol };
  });
}

// 13. getTasks
export async function getTasks(eventId = EVENT_ID) {
  return request(`/events/${eventId}/tasks`, { method: 'GET' }, () => [
    { id: 'task-1', title: 'Barricade inspection at Entry Gate', done: true, priority: 'high' },
    { id: 'task-2', title: 'Badge printers ribbon replacement', done: true, priority: 'medium' },
    { id: 'task-3', title: 'First Aid radio connectivity check', done: true, priority: 'critical' },
    { id: 'task-4', title: 'Green room refreshments delivery', done: true, priority: 'low' },
    { id: 'task-5', title: 'Stage speaker sound test', done: true, priority: 'high' },
    { id: 'task-6', title: 'Parking shuttle route signage', done: false, priority: 'medium' },
    { id: 'task-7', title: 'Evening shift meal packet distribution', done: false, priority: 'high' },
    { id: 'task-8', title: 'Auditorium overflow crowd guide briefing', done: false, priority: 'high' }
  ]);
}

// 14. getIncidents
export async function getIncidents(eventId = EVENT_ID) {
  return request(`/events/${eventId}/incidents`, { method: 'GET' }, () => [
    {
      id: 'inc-1',
      title: 'Crowd surge at Entry Gate North Gate',
      severity: 'critical',
      zone: 'Entry Gate',
      status: 'investigating',
      timestamp: '22m ago'
    }
  ]);
}

// 15. getAnnouncements
export async function getAnnouncements(eventId = EVENT_ID) {
  return request(`/events/${eventId}/announcements`, { method: 'GET' }, () => [
    {
      id: 'ann-1',
      title: 'Morning shift briefing concluded',
      timestamp: '08:30 AM',
      author: 'Lead Coordinator'
    }
  ]);
}

// Save event setup helper
export async function saveEventSetup(eventId = EVENT_ID, setupPayload) {
  return request(`/events/${eventId}/setup`, { method: 'PUT', body: JSON.stringify(setupPayload) }, () => {
    localEvent = { ...localEvent, ...setupPayload.event };
    if (setupPayload.zones) localZones = [...setupPayload.zones];
    if (setupPayload.roles) localRoles = [...setupPayload.roles];
    if (setupPayload.shifts) localShifts = [...setupPayload.shifts];
    return { success: true };
  });
}
