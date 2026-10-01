import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  MapPin,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/Avatar';
import { Chip } from '../../components/ui/Chip';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
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

export function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeVolunteer, setActiveVolunteer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { showToast } = useToast();
  const debouncedSearch = useDebounce(searchTerm, 180);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVolunteers(undefined, {
        search: debouncedSearch,
        skill: selectedSkill,
        availability: selectedShift,
        status: selectedStatusFilter !== 'ALL' ? selectedStatusFilter : undefined
      });
      if (res.data) {
        setVolunteers(res.data);
      } else {
        setError(res.error?.message || 'Failed to load volunteers roster');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching volunteers');
      showToast('Error loading volunteers roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [debouncedSearch, selectedSkill, selectedShift, selectedStatusFilter]);

  // Global volunteer added listener
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

  // Compute status summary counts dynamically from loaded volunteers
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: volunteers.length,
      'CHECKED IN': 0,
      ASSIGNED: 0,
      AVAILABLE: 0,
      'ON BREAK': 0,
      ABSENT: 0
    };

    volunteers.forEach((v) => {
      const st = (v.status || '').toUpperCase();
      if (st === 'CHECKED IN') counts['CHECKED IN'] += 1;
      else if (st === 'ASSIGNED') counts['ASSIGNED'] += 1;
      else if (st === 'AVAILABLE') counts['AVAILABLE'] += 1;
      else if (st === 'ON BREAK' || st === 'BREAK') counts['ON BREAK'] += 1;
      else if (st === 'DROPOUT' || st === 'NO SHOW' || st === 'ABSENT') counts['ABSENT'] += 1;
    });

    return counts;
  }, [volunteers]);

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort and filter volunteers in memory
  const processedVolunteers = useMemo(() => {
    let list = [...volunteers];

    // Filter by status strip
    if (selectedStatusFilter !== 'ALL') {
      list = list.filter((v) => {
        const st = (v.status || '').toUpperCase();
        if (selectedStatusFilter === 'CHECKED IN') return st === 'CHECKED IN';
        if (selectedStatusFilter === 'ASSIGNED') return st === 'ASSIGNED';
        if (selectedStatusFilter === 'AVAILABLE') return st === 'AVAILABLE';
        if (selectedStatusFilter === 'ON BREAK') return st === 'ON BREAK' || st === 'BREAK';
        if (selectedStatusFilter === 'ABSENT') return st === 'DROPOUT' || st === 'NO SHOW' || st === 'ABSENT';
        return true;
      });
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (sortField === 'hours') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [volunteers, selectedStatusFilter, sortField, sortDirection]);

  const areFiltersActive =
    Boolean(searchTerm) ||
    selectedSkill !== 'All' ||
    selectedShift !== 'All' ||
    selectedStatusFilter !== 'ALL';

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSkill('All');
    setSelectedShift('All');
    setSelectedStatusFilter('ALL');
  };

  // Helper for Shift Pips (M · A · E)
  const renderShiftPips = (shifts = []) => {
    const shiftLetters = [
      { key: 'Morning', label: 'M' },
      { key: 'Afternoon', label: 'A' },
      { key: 'Evening', label: 'E' }
    ];

    const tooltip = `Available shifts: ${shifts.length > 0 ? shifts.join(', ') : 'None scheduled'}`;

    return (
      <div
        title={tooltip}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          userSelect: 'none'
        }}
      >
        <span className="sr-only">{tooltip}</span>
        {shiftLetters.map(({ key, label }) => {
          const isAvailable = shifts.includes(key);
          return (
            <span
              key={key}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: isAvailable ? 'var(--ink)' : 'var(--paper-sunken)',
                color: isAvailable ? 'var(--ink-inverse)' : 'var(--ink-3)',
                border: `1px solid ${isAvailable ? 'var(--line-strong)' : 'var(--line)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                lineHeight: 1
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  // Render sort arrow icon
  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="sort-indicator" opacity={0.4} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="sort-indicator" color="var(--vermilion)" />
    ) : (
      <ArrowDown size={12} className="sort-indicator" color="var(--vermilion)" />
    );
  };

  return (
    <div className="volunteers-page-container">
      {/* Header */}
      <div className="volunteers-page-header">
        <div className="volunteers-header-titles">
          <h1 className="volunteers-page-title">Volunteers & Field Personnel</h1>
          <p className="volunteers-page-subtitle">
            Manage availability, skills, sector assignments, and on-ground attendance across all event zones.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Volunteer
        </Button>
      </div>

      {error && (
        <ErrorBanner
          title="Roster Synchronization Error"
          message={error}
          onRetry={fetchVolunteers}
        />
      )}

      {/* Summary + Status Filter Strip */}
      <div className="volunteers-status-strip" role="group" aria-label="Filter roster by volunteer status">
        {['ALL', 'CHECKED IN', 'ASSIGNED', 'AVAILABLE', 'ON BREAK', 'ABSENT'].map((statusKey) => {
          const isActive = selectedStatusFilter === statusKey;
          const count = statusCounts[statusKey] || 0;

          return (
            <button
              key={statusKey}
              type="button"
              onClick={() => setSelectedStatusFilter(statusKey)}
              aria-pressed={isActive}
              className={`status-strip-chip ${isActive ? 'active' : ''}`}
            >
              <span>{statusKey}</span>
              <span className="status-strip-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="volunteers-filter-bar">
        <div className="volunteers-filter-controls">
          {/* Search Input with / shortcut */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search volunteers by name, email, or skill..."
          />

          {/* Skill Filter */}
          <Select
            label="Skill"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            options={SKILL_OPTIONS}
          />

          {/* Shift Filter */}
          <Select
            label="Shift"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            options={SHIFT_OPTIONS}
          />

          {/* Clear Filters Button */}
          {areFiltersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Result Count Live Region */}
        <div className="volunteers-result-count" aria-live="polite">
          Showing {processedVolunteers.length} of {volunteers.length}
        </div>
      </div>

      {/* Main Roster Table */}
      {loading ? (
        <div className="volunteers-table-container">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                  gap: '24px',
                  borderBottom: '1px solid var(--line)',
                  backgroundColor: 'var(--paper-raised)'
                }}
              >
                <Skeleton width="36px" height="36px" variant="circle" />
                <Skeleton width="180px" height="16px" />
                <Skeleton width="140px" height="16px" />
                <Skeleton width="80px" height="16px" />
                <Skeleton width="100px" height="16px" />
                <Skeleton width="40px" height="16px" />
                <Skeleton width="90px" height="24px" />
              </div>
            ))}
          </div>
        </div>
      ) : processedVolunteers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No volunteers match these filters"
          description="Try broadening your search term or clearing active skill and shift filters."
          actionLabel="Add Volunteer"
          onAction={() => setIsAddModalOpen(true)}
          secondaryActionLabel={areFiltersActive ? 'Clear Filters' : undefined}
          onSecondaryAction={clearAllFilters}
        />
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="volunteers-table-container">
            <table className="volunteers-table" aria-label="Volunteers and personnel roster">
              <thead>
                <tr>
                  <th
                    scope="col"
                    style={{ width: '28%' }}
                    className="sortable"
                    onClick={() => handleSort('name')}
                    aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Volunteer {renderSortIndicator('name')}
                  </th>
                  <th scope="col" style={{ width: '22%' }}>
                    Skills
                  </th>
                  <th scope="col" style={{ width: '14%' }}>
                    Available Shift
                  </th>
                  <th
                    scope="col"
                    style={{ width: '14%' }}
                    className="sortable"
                    onClick={() => handleSort('assignedZone')}
                    aria-sort={sortField === 'assignedZone' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Assigned Zone {renderSortIndicator('assignedZone')}
                  </th>
                  <th
                    scope="col"
                    style={{ width: '7%', textAlign: 'right' }}
                    className="sortable"
                    onClick={() => handleSort('hours')}
                    aria-sort={sortField === 'hours' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    title="Total hours logged by volunteer"
                  >
                    Hours {renderSortIndicator('hours')}
                  </th>
                  <th
                    scope="col"
                    style={{ width: '10%' }}
                    className="sortable"
                    onClick={() => handleSort('status')}
                    aria-sort={sortField === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Status {renderSortIndicator('status')}
                  </th>
                  <th scope="col" style={{ width: '5%', textAlign: 'right' }}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedVolunteers.map((vol) => {
                  const isActiveRow = activeVolunteer?.id === vol.id && isDrawerOpen;
                  const skills = vol.skills || [];
                  const displayedSkills = skills.slice(0, 2);
                  const remainingSkillsCount = skills.length - 2;

                  return (
                    <tr
                      key={vol.id}
                      onClick={() => handleOpenDrawer(vol)}
                      className={isActiveRow ? 'active-row' : ''}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleOpenDrawer(vol);
                      }}
                      role="button"
                      aria-label={`View profile for ${vol.name}`}
                    >
                      {/* Column 1: Volunteer (~28%) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar name={vol.name} initials={vol.avatar} size={36} />
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '13px', lineHeight: 1.2 }}>
                              {vol.name}
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--ink-3)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {vol.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Skills (~22%) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                          {displayedSkills.map((skill) => (
                            <Chip key={skill}>{skill}</Chip>
                          ))}
                          {remainingSkillsCount > 0 && (
                            <Chip title={`Additional skills: ${skills.slice(2).join(', ')}`}>
                              +{remainingSkillsCount}
                            </Chip>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Available Shift (~14%) */}
                      <td>
                        {renderShiftPips(vol.availableShifts)}
                      </td>

                      {/* Column 4: Assigned Zone (~14%) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin
                            size={13}
                            color={vol.assignedZone ? 'var(--vermilion)' : 'var(--ink-3)'}
                            aria-hidden="true"
                          />
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: vol.assignedZone ? 600 : 400,
                              color: vol.assignedZone ? 'var(--ink)' : 'var(--ink-3)'
                            }}
                          >
                            {vol.assignedZone || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Hours (~7%) */}
                      <td style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: 'var(--ink)',
                            fontVariantNumeric: 'tabular-nums'
                          }}
                        >
                          {vol.hours}h
                        </span>
                      </td>

                      {/* Column 6: Status (~10%) */}
                      <td>
                        <StatusBadge status={vol.status} size="sm" />
                      </td>

                      {/* Column 7: Action (~5%) */}
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(vol);
                          }}
                          style={{
                            height: '44px',
                            padding: '0 10px',
                            fontSize: '11px'
                          }}
                          aria-label={`Open profile for ${vol.name}`}
                        >
                          <span>PROFILE</span>
                          <ChevronRight size={13} aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="volunteers-table-footer">
              <span>
                1–{processedVolunteers.length} of {volunteers.length} volunteers
              </span>
              <span style={{ color: 'var(--ink-3)', fontSize: '10px' }}>
                Sorted by {sortField} ({sortDirection.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Mobile Card List (< 900px) */}
          <div className="volunteers-mobile-cards">
            {processedVolunteers.map((vol) => (
              <div
                key={vol.id}
                className="volunteers-card-item"
                onClick={() => handleOpenDrawer(vol)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={vol.name} initials={vol.avatar} size={38} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '14px' }}>
                        {vol.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                        {vol.email}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={vol.status} size="sm" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={12} color="var(--vermilion)" />
                    {vol.assignedZone || 'Unassigned'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {vol.hours}h logged
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {renderShiftPips(vol.availableShifts)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDrawer(vol);
                    }}
                  >
                    <span>Profile</span>
                    <ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
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

export default Volunteers;
