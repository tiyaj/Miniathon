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

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--paper-raised)',
    border: '1px solid var(--line-strong)',
    color: 'var(--ink)',
    fontSize: '13px',
    fontFamily: 'var(--font-ui)',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-2)',
    marginBottom: '6px'
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
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--coral-bg)',
              border: '1px solid var(--coral)',
              color: 'var(--coral-ink)',
              fontSize: '13px',
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
            <label style={labelStyle}>
              Full Name <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Diya Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Email Contact <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              type="email"
              placeholder="diya.m@tsec.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Phone & Max Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={labelStyle}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98200 11223"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Max Working Hours
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={maxHours}
              onChange={(e) => setMaxHours(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Skills Multi-select */}
        <div>
          <label style={labelStyle}>
            Skills & Competencies <span style={{ color: 'var(--coral)' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {AVAILABLE_SKILLS.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    backgroundColor: selected ? 'var(--ink)' : 'var(--paper-sunken)',
                    color: selected ? 'var(--ink-inverse)' : 'var(--ink)',
                    border: `1px solid ${selected ? 'var(--line-strong)' : 'var(--line)'}`
                  }}
                >
                  {selected && <Check size={12} color="var(--ink-inverse)" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Shifts Multi-select */}
        <div>
          <label style={labelStyle}>
            Available Shifts <span style={{ color: 'var(--coral)' }}>*</span>
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
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: selected ? 'var(--ink)' : 'var(--paper-sunken)',
                    color: selected ? 'var(--ink-inverse)' : 'var(--ink)',
                    border: `1px solid ${selected ? 'var(--line-strong)' : 'var(--line)'}`
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
          <label style={labelStyle}>
            Preferred Zone
          </label>
          <select
            value={preferredZone}
            onChange={(e) => setPreferredZone(e.target.value)}
            style={{
              ...inputStyle,
              height: '42px',
              cursor: 'pointer'
            }}
          >
            {AVAILABLE_ZONES.map((zone) => (
              <option key={zone} value={zone} style={{ background: '#fbfaf5', color: '#15130f' }}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>
            Operational Notes / Certifications
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Red Cross certified, previous fest head, fluent in Marathi/Hindi"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              ...inputStyle,
              resize: 'vertical'
            }}
          />
        </div>
      </form>
    </Modal>
  );
}

export default AddVolunteerModal;
