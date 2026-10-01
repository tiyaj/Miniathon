import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useToast } from '../../hooks/useToast';
import { useEvent } from '../../context/EventContext';
import { getTasks, createTask, updateTask, getStructure } from '../../lib/api';
import { CheckSquare, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TasksPlaceholder() {
  const navigate = useNavigate();
  const { selectedEventId, currentEvent } = useEvent();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!selectedEventId) return;
    try {
      setLoading(true);
      setError(null);
      const [taskRes, structRes] = await Promise.all([
        getTasks(selectedEventId),
        getStructure(selectedEventId)
      ]);

      if (taskRes.data) {
        setTasks(taskRes.data);
      } else if (taskRes.error) {
        setError(taskRes.error.message || 'Failed to load live tasks');
      }

      if (structRes.data?.zones) {
        setZones(structRes.data.zones);
        if (!zoneId && structRes.data.zones.length > 0) {
          setZoneId(structRes.data.zones[0]._id || structRes.data.zones[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Network error loading tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchTasks();
    const handleRefresh = () => fetchTasks();
    window.addEventListener('pulse:refresh', handleRefresh);
    window.addEventListener('pulse:event-changed', handleRefresh);
    return () => {
      window.removeEventListener('pulse:refresh', handleRefresh);
      window.removeEventListener('pulse:event-changed', handleRefresh);
    };
  }, [fetchTasks]);

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' || currentStatus === 'Resolved' ? 'Open' : 'Completed';
    try {
      const res = await updateTask(selectedEventId, taskId, { status: nextStatus });
      if (res.data) {
        showToast(`Task updated to ${nextStatus}`, 'success');
        fetchTasks();
      } else {
        showToast(res.error?.message || 'Failed to update task', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating task', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title is required', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await createTask(selectedEventId, {
        title: title.trim(),
        description: description.trim(),
        zoneId: zoneId || (zones[0]?._id || zones[0]?.id),
        priority
      });

      if (res.data) {
        showToast('New task dispatched to on-ground feed.', 'success');
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchTasks();
      } else {
        showToast(res.error?.message || 'Failed to create task', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <SectionHeader
        title="Live Tasks Board"
        subtitle={`Real-time dispatch, priority routing, and verified field completion for ${currentEvent?.name || 'Current Event'}`}
        badge={
          <Badge variant="healthy" size="md" icon={CheckSquare}>
            {activeCount} Active Tasks
          </Badge>
        }
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Dispatch Task
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Command Overview
            </Button>
          </div>
        }
      />

      {error && (
        <ErrorBanner
          title="Task Ledger Advisory"
          message={error}
          onRetry={fetchTasks}
        />
      )}

      <Card padding="lg" style={{ border: '1px solid var(--line-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Ground Operations Task Ledger
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--ink-2)', margin: '4px 0 0 0' }}>
              Connected to backend MongoDB task collections
            </p>
          </div>
          <Badge variant="accent" size="sm">Live Task Feed</Badge>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="48px" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-2)' }}>
            No tasks logged for this event. Click "Dispatch Task" to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.map((t) => {
              const taskId = t._id || t.id;
              const isDone = t.status === 'Completed' || t.status === 'Resolved';
              const zoneName = t.zone?.name || t.zoneName || 'General Concourse';
              const assigneeName = t.assignedVolunteer?.name || t.assignee || 'Unassigned';

              return (
                <div
                  key={taskId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 140px 110px 120px 100px',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isDone ? 'var(--paper-sunken)' : 'var(--paper-raised)',
                    gap: '12px',
                    opacity: isDone ? 0.75 : 1
                  }}
                  className="font-mono"
                >
                  <span style={{ fontWeight: 700, color: 'var(--ink-3)', fontSize: '0.8rem' }}>
                    #{String(taskId).slice(-4).toUpperCase()}
                  </span>

                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--ink)' }}>
                    {t.title}
                  </span>

                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)' }}>
                    {zoneName}
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: t.priority === 'Urgent' || t.priority === 'High' ? 'var(--coral)' : 'var(--ink-2)',
                      fontWeight: t.priority === 'Urgent' || t.priority === 'High' ? 700 : 500
                    }}
                  >
                    {t.priority}
                  </span>

                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>
                    {assigneeName}
                  </span>

                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(taskId, t.status)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs)',
                        border: `1px solid ${isDone ? 'var(--mint)' : 'var(--line-strong)'}`,
                        backgroundColor: isDone ? 'var(--mint-bg)' : 'var(--paper)',
                        color: isDone ? 'var(--mint-ink)' : 'var(--ink)',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isDone ? 'RESOLVED ✓' : 'COMPLETE'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal: Dispatch Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dispatch Operational Task"
        subtitle="Create a task assignment routed to field coordinators."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleCreateTask}>
              Dispatch Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Turnstile scanner ribbon replenishment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Zone
            </label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            >
              {zones.map((z) => (
                <option key={z._id || z.id} value={z._id || z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
              Description
            </label>
            <textarea
              rows="2"
              placeholder="Instructions for on-ground team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--line-strong)', backgroundColor: 'var(--paper)', color: 'var(--ink)', boxSizing: 'border-box' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TasksPlaceholder;
