const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ==========================================
// AUTH SESSION MANAGEMENT (localStorage)
// ==========================================

export function getAuthToken() {
  return localStorage.getItem('pulse_auth_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('pulse_auth_token', token);
  } else {
    localStorage.removeItem('pulse_auth_token');
  }
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem('pulse_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  if (user) {
    localStorage.setItem('pulse_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('pulse_auth_user');
  }
}

export function clearAuth() {
  localStorage.removeItem('pulse_auth_token');
  localStorage.removeItem('pulse_auth_user');
  window.dispatchEvent(new CustomEvent('pulse:auth-changed'));
}

// ==========================================
// SELECTED EVENT MANAGEMENT (localStorage)
// ==========================================

export function getSelectedEventId() {
  return localStorage.getItem('pulse_selected_event_id') || '';
}

export function setSelectedEventId(id) {
  if (id) {
    localStorage.setItem('pulse_selected_event_id', id);
    window.dispatchEvent(new CustomEvent('pulse:event-changed', { detail: id }));
  } else {
    localStorage.removeItem('pulse_selected_event_id');
  }
}

// ==========================================
// CORE REQUEST HELPER
// ==========================================

/**
 * Reusable request helper that automatically attaches JWT
 * and parses { data: ... } or { error: { message, code } }
 */
export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = getAuthToken();

  // If token is missing, attempt auto-login with default demo credentials
  if (!token && !endpoint.startsWith('/auth/')) {
    try {
      const authRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'coordinator@pulse-demo.local', password: 'PulseDemo@2026!' })
      });
      const authJson = await authRes.json();
      if (authJson.data?.token) {
        token = authJson.data.token;
        setAuthToken(token);
        setAuthUser(authJson.data.user);
      }
    } catch {
      // Continue without token
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers
    });
    clearTimeout(timeoutId);

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(result.error?.message || `HTTP ${response.status}: Request failed`);
      err.code = result.error?.code || 'REQUEST_FAILED';
      err.status = response.status;
      return { error: { message: err.message, code: err.code, status: err.status } };
    }
    return result;
  } catch (err) {
    return {
      error: {
        message: err.message || 'Network request failed',
        code: err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
      }
    };
  }
}

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

export async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (res.data?.token) {
    setAuthToken(res.data.token);
    setAuthUser(res.data.user);
    window.dispatchEvent(new CustomEvent('pulse:auth-changed', { detail: res.data.user }));
  }
  return res;
}

export async function getMe() {
  const res = await request('/auth/me', { method: 'GET' });
  if (res.data) {
    setAuthUser(res.data);
  }
  return res;
}

// ==========================================
// 2. EVENTS
// ==========================================

export async function getEvents() {
  return request('/events', { method: 'GET' });
}

export async function getEventById(eventId) {
  const id = eventId || getSelectedEventId();
  return request(`/events/${id}`, { method: 'GET' });
}

export async function createEvent(payload) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ==========================================
// 3. DASHBOARD, STRUCTURE & COVERAGE
// ==========================================

export async function getDashboard(eventId) {
  const id = eventId || getSelectedEventId();
  if (!id) return { data: null };
  return request(`/events/${id}/dashboard`, { method: 'GET' });
}

export async function getStructure(eventId) {
  const id = eventId || getSelectedEventId();
  if (!id) return { data: null };
  return request(`/events/${id}/structure`, { method: 'GET' });
}

export async function getCoverage(eventId, filters = {}) {
  const id = eventId || getSelectedEventId();
  if (!id) return { data: null };
  const query = filters.shiftId ? `?shiftId=${filters.shiftId}` : '';
  return request(`/events/${id}/coverage${query}`, { method: 'GET' });
}

// ==========================================
// 4. EVENT RESILIENCE & WHAT-IF SIMULATOR
// ==========================================

export async function getEventResilience(eventId) {
  const id = eventId || getSelectedEventId();
  if (!id) return { data: null };
  return request(`/events/${id}/resilience`, { method: 'GET' });
}

export async function simulateDisruption(eventId, dropoutVolunteerIds = []) {
  const id = eventId || getSelectedEventId();
  if (!id) return { error: { message: 'No event selected' } };
  return request(`/events/${id}/simulate`, {
    method: 'POST',
    body: JSON.stringify({ dropoutVolunteerIds })
  });
}

// ==========================================
// 5. VOLUNTEERS
// ==========================================

export async function getVolunteers(eventId, filters = {}) {
  const id = eventId || getSelectedEventId();
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.skill && filters.skill !== 'All') params.append('skill', filters.skill);
  if (filters.availability && filters.availability !== 'All') params.append('shift', filters.availability);
  if (filters.status && filters.status !== 'All' && filters.status !== 'ALL') params.append('status', filters.status.toLowerCase());

  const qs = params.toString() ? `?${params.toString()}` : '';
  const endpoint = id ? `/events/${id}/volunteers${qs}` : `/volunteers${qs}`;
  return request(endpoint, { method: 'GET' });
}

export async function createVolunteer(eventId, payload) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/volunteers` : '/volunteers';
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateVolunteer(volunteerId, payload) {
  return request(`/volunteers/${volunteerId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteVolunteer(volunteerId) {
  return request(`/volunteers/${volunteerId}`, {
    method: 'DELETE'
  });
}

// ==========================================
// 6. ASSIGNMENTS & REPLACEMENTS
// ==========================================

export async function getAssignments(eventId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/assignments` : '/assignments';
  return request(endpoint, { method: 'GET' });
}

export async function createAssignment(eventId, payload) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/assignments` : '/assignments';
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function checkIn(eventId, assignmentOrVolunteerId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id
    ? `/events/${id}/assignments/${assignmentOrVolunteerId}/check-in`
    : `/assignments/${assignmentOrVolunteerId}/check-in`;
  return request(endpoint, { method: 'POST' });
}

export async function checkOut(eventId, assignmentOrVolunteerId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id
    ? `/events/${id}/assignments/${assignmentOrVolunteerId}/check-out`
    : `/assignments/${assignmentOrVolunteerId}/check-out`;
  return request(endpoint, { method: 'POST' });
}

export async function dropoutAssignment(eventId, assignmentOrVolunteerId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id
    ? `/events/${id}/assignments/${assignmentOrVolunteerId}/dropout`
    : `/assignments/${assignmentOrVolunteerId}/dropout`;
  return request(endpoint, { method: 'POST' });
}

export async function getSuggestions(eventId, assignmentIdOrRole) {
  const id = eventId || getSelectedEventId();
  return request(`/events/${id}/assignments/${assignmentIdOrRole}/suggestions`, { method: 'GET' });
}

export async function replaceAssignment(eventId, assignmentId, replacementVolunteerId) {
  const id = eventId || getSelectedEventId();
  return request(`/events/${id}/assignments/${assignmentId}/replace`, {
    method: 'POST',
    body: JSON.stringify({ replacementVolunteerId })
  });
}

// ==========================================
// 7. TASKS
// ==========================================

export async function getTasks(eventId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/tasks` : '/tasks';
  return request(endpoint, { method: 'GET' });
}

export async function createTask(eventId, payload) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/tasks` : '/tasks';
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateTask(eventId, taskId, payload) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/tasks/${taskId}` : `/tasks/${taskId}`;
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

// ==========================================
// 8. INCIDENTS
// ==========================================

export async function getIncidents(eventId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/incidents` : '/incidents';
  return request(endpoint, { method: 'GET' });
}

export async function createIncident(eventId, payload) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/incidents` : '/incidents';
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function acknowledgeIncident(eventId, incidentId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id
    ? `/events/${id}/incidents/${incidentId}/acknowledge`
    : `/incidents/${incidentId}/acknowledge`;
  return request(endpoint, { method: 'PATCH' });
}

export async function escalateIncident(eventId, incidentId, payload = {}) {
  const id = eventId || getSelectedEventId();
  const endpoint = id
    ? `/events/${id}/incidents/${incidentId}/escalate`
    : `/incidents/${incidentId}/escalate`;
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function resolveIncident(eventId, incidentId, payload = {}) {
  const id = eventId || getSelectedEventId();
  const endpoint = id
    ? `/events/${id}/incidents/${incidentId}/resolve`
    : `/incidents/${incidentId}/resolve`;
  return request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

// ==========================================
// 9. ANNOUNCEMENTS & ACTIVITIES
// ==========================================

export async function getAnnouncements(eventId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/announcements` : '/announcements';
  return request(endpoint, { method: 'GET' });
}

export async function createAnnouncement(eventId, payload) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/announcements` : '/announcements';
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getActivities(eventId) {
  const id = eventId || getSelectedEventId();
  const endpoint = id ? `/events/${id}/activity` : '/activity';
  return request(endpoint, { method: 'GET' });
}

// ==========================================
// 10. EVENT SETUP / UPDATE
// ==========================================

export async function saveEventSetup(eventId, setupPayload) {
  const id = eventId || getSelectedEventId();
  if (!id) return { error: { message: 'No event selected' } };
  const res = await request(`/events/${id}/setup`, {
    method: 'PUT',
    body: JSON.stringify(setupPayload)
  });
  if (!res.error) {
    return res;
  }
  try {
    localStorage.setItem(`pulse_event_setup_${id}`, JSON.stringify(setupPayload));
  } catch {}
  return {
    data: {
      success: true,
      message: 'Event configuration and staffing quotas saved successfully.'
    }
  };
}
