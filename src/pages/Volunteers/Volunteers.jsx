import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
  UserMinus,
  RefreshCw
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { AddVolunteerModal } from './AddVolunteerModal';
import { VolunteerDrawer } from './VolunteerDrawer';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import {
  getVolunteers,
  createVolunteer,
  checkIn,
  checkOut,
  dropoutAssignment
} from '../../lib/api';
import './Volunteers.css';

const SKILL_OPTIONS = [
  'All',
  'Crowd Management',
  'Communication',
  'First Aid',
  'Registration',
  'Stage Support',
  'Logistics',
  'Parking Logistics',
  'Crisis Support',
  'Runner'
];

const SHIFT_OPTIONS = ['All', 'Morning', 'Afternoon', 'Evening'];

const STATUS_OPTIONS = [
  'All',
  'Available',
  'Assigned',
  'Checked In',
  'Checked Out',
  'Dropout',
  'No Show'
];

export function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeVolunteer, setActiveVolunteer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { showToast } = useToast();
  const debouncedSearch = useDebounce(searchTerm, 200);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await getVolunteers(undefined, {
        search: debouncedSearch,
        skill: selectedSkill,
        availability: selectedShift,
        status: selectedStatus
      });
      if (res.data) {
        setVolunteers(res.data);
      }
    } catch (err) {
      showToast('Error loading volunteers roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [debouncedSearch, selectedSkill, selectedShift, selectedStatus]);

  // Listen for global volunteer added event
  useEffect(() => {
    const handleVolunteerAdded = () => {
      fetchVolunteers();
    };
    window.addEventListener('pulse:volunteer-added', handleVolunteerAdded);
    return () => {
      window.removeEventListener('pulse:volunteer-added', handleVolunteerAdded);
    };
  }, []);

  const handleCreateVolunteer = async (payload) => {
    const res = await createVolunteer(undefined, payload);
    if (res.data) {
      showToast(`Volunteer ${payload.name} added successfully.`, 'success');
      fetchVolunteers();
      setIsAddModalOpen(false);
    } else {
      showToast(res.error?.message || 'Failed to add volunteer', 'error');
    }
  };

  const handleOpenDrawer = (vol) => {
    setActiveVolunteer(vol);
    setIsDrawerOpen(true);
  };

  const handleCheckIn = async (volId) => {
    const res = await checkIn(undefined, volId);
    if (res.data) {
      showToast('Volunteer successfully checked in on-ground.', 'success');
      fetchVolunteers();
      if (activeVolunteer?.id === volId) {
        setActiveVolunteer((prev) => ({ ...prev, status: 'Checked In' }));
      }
    }
  };

  const handleCheckOut = async (volId) => {
    const res = await checkOut(undefined, volId);
    if (res.data) {
      showToast('Volunteer checked out from shift.', 'info');
      fetchVolunteers();
      if (activeVolunteer?.id === volId) {
        setActiveVolunteer((prev) => ({ ...prev, status: 'Checked Out' }));
      }
    }
  };

  const handleMarkDropout = async (volId) => {
    const res = await dropoutAssignment(undefined, volId);
    if (res.data) {
      showToast('Volunteer marked as dropout. Coverage deficit alerted.', 'warning');
      fetchVolunteers();
      if (activeVolunteer?.id === volId) {
        setActiveVolunteer((prev) => ({ ...prev, status: 'Dropout' }));
      }
    }
  };

  const handleMarkNoShow = async (volId) => {
    // In-memory update
    const target = volunteers.find((v) => v.id === volId);
    if (target) {
      target.status = 'No Show';
      showToast(`${target.name} marked as No Show.`, 'error');
      setVolunteers([...volunteers]);
      if (activeVolunteer?.id === volId) {
        setActiveVolunteer((prev) => ({ ...prev, status: 'No Show' }));
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked In':
        return <Badge variant="healthy" size="sm" dot pulseDot>{status}</Badge>;
      case 'Assigned':
        return <Badge variant="info" size="sm">{status}</Badge>;
      case 'Available':
        return <Badge variant="accent" size="sm">{status}</Badge>;
      case 'Dropout':
        return <Badge variant="warning" size="sm">{status}</Badge>;
      case 'No Show':
        return <Badge variant="critical" size="sm">{status}</Badge>;
      case 'Checked Out':
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="volunteers-container animate-fade-up">
      {/* Header */}
      <SectionHeader
        title="Volunteers & Field Personnel"
        subtitle="Manage availability, skills, assignments, and on-ground attendance across all event zones."
        badge={
          <Badge variant="accent" size="md" icon={Users}>
            {volunteers.length} Total Roster
          </Badge>
        }
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Volunteer
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="volunteers-filter-bar">
        {/* Search */}
        <div className="volunteers-search-box">
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Search volunteers by name, email, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="volunteers-search-input"
          />
        </div>

        {/* Skill Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Skill:</span>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="volunteers-select-filter"
          >
            {SKILL_OPTIONS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shift:</span>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="volunteers-select-filter"
          >
            {SHIFT_OPTIONS.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="volunteers-select-filter"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button if active */}
        {(searchTerm || selectedSkill !== 'All' || selectedShift !== 'All' || selectedStatus !== 'All') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedSkill('All');
              setSelectedShift('All');
              setSelectedStatus('All');
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Main Table View */}
      {loading ? (
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Skeleton width="40px" height="40px" variant="circle" />
                <Skeleton width="220px" height="18px" />
                <Skeleton width="180px" height="18px" />
                <Skeleton width="120px" height="18px" />
              </div>
            ))}
          </div>
        </Card>
      ) : volunteers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No volunteers match your filters"
          description="Try broadening your search term or resetting the active skill, shift, and status filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedSkill('All');
            setSelectedShift('All');
            setSelectedStatus('All');
          }}
        />
      ) : (
        <div className="volunteers-table-wrapper">
          <table className="volunteers-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Skills</th>
                <th>Available Shift</th>
                <th>Assigned Zone</th>
                <th>Hours</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((vol) => (
                <tr
                  key={vol.id}
                  onClick={() => handleOpenDrawer(vol)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Name + Avatar */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        {vol.avatar || 'VO'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {vol.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {vol.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Skills */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                      {vol.skills?.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="neutral" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {vol.skills?.length > 2 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{vol.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Available Shift */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} color="var(--color-primary-light)" />
                      <span>{vol.availableShifts?.join(', ') || 'Flexible'}</span>
                    </div>
                  </td>

                  {/* Assigned Zone */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span style={{ fontWeight: 500, color: vol.assignedZone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {vol.assignedZone || 'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* Hours */}
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {vol.hours}h
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    {getStatusBadge(vol.status)}
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDrawer(vol);
                      }}
                      icon={ChevronRight}
                      iconPosition="right"
                    >
                      Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Volunteer Modal */}
      <AddVolunteerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateVolunteer}
      />

      {/* Volunteer Details Drawer */}
      <VolunteerDrawer
        volunteer={activeVolunteer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onMarkDropout={handleMarkDropout}
        onMarkNoShow={handleMarkNoShow}
      />
    </div>
  );
}
