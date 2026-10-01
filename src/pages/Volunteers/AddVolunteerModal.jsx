import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Check, AlertCircle } from 'lucide-react';

const AVAILABLE_SKILLS = [
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

const AVAILABLE_SHIFTS = ['Morning', 'Afternoon', 'Evening'];

const AVAILABLE_ZONES = [
  'Entry Gate',
  'Registration',
  'Main Stage',
  'Parking',
  'First Aid'
];

export function AddVolunteerModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSkills, setSelectedSkills] = useState(['Communication']);
  const [selectedShifts, setSelectedShifts] = useState(['Morning']);
  const [preferredZone, setPreferredZone] = useState('Entry Gate');
  const [maxHours, setMaxHours] = useState('6');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleShift = (shift) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide the volunteer’s full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill or capability.');
      return;
    }
    if (selectedShifts.length === 0) {
      setError('Please select at least one available shift window.');
      return;
    }

    try {
      setSaving(true);
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98000 00000',
        skills: selectedSkills,
        availableShifts: selectedShifts,
        preferredZone,
        maxHours: parseInt(maxHours, 10) || 6,
        notes: notes.trim()
      });

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setSelectedSkills(['Communication']);
      setSelectedShifts(['Morning']);
      setPreferredZone('Entry Gate');
      setMaxHours('6');
      setNotes('');
    } catch (err) {
      setError(err.message || 'Error creating volunteer record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Event Volunteer"
      subtitle="Register a new volunteer profile with their skills, shift availability, and zone preference."
      maxWidth="620px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
          >
            {saving ? 'Saving volunteer...' : 'Register Volunteer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Name & Email Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Full Name <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Diya Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Email Contact <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="diya.m@tsec.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Phone & Max Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98200 11223"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Max Working Hours
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Skills Multi-select */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Skills & Competencies <span style={{ color: '#fb7185' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVAILABLE_SKILLS.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                    background: selected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: selected ? '#c7d2fe' : 'var(--text-secondary)',
                    border: selected ? '1px solid #6366f1' : '1px solid var(--border-subtle)'
                  }}
                >
                  {selected && <Check size={12} color="#a5b4fc" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shifts Multi-select */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Available Shifts <span style={{ color: '#fb7185' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {AVAILABLE_SHIFTS.map((shift) => {
              const selected = selectedShifts.includes(shift);
              return (
                <button
                  type="button"
                  key={shift}
                  onClick={() => toggleShift(shift)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: selected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: selected ? '#38bdf8' : 'var(--text-secondary)',
                    border: selected ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)'
                  }}
                >
                  {shift}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Zone */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Preferred Zone
          </label>
          <select
            value={preferredZone}
            onChange={(e) => setPreferredZone(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(20, 28, 48, 0.9)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          >
            {AVAILABLE_ZONES.map((zone) => (
              <option key={zone} value={zone} style={{ background: '#0e1526', color: '#f8fafc' }}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Operational Notes / Certifications
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Red Cross certified, previous fest head, fluent in Marathi/Hindi"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
