import React, { useState, useEffect } from 'react';
import { Save, Edit2, X, User, CreditCard } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { employeeAPI, departmentAPI } from '../../services/api';

// Field is defined at module scope so React never re-creates its component type
// on re-render. Defining it inside the parent caused focus loss on every keystroke
// because React would unmount/remount the input whenever state changed.
const Field = ({ label, name, type = 'text', readOnly = false, editing, form, onChange, displayValue }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {editing && !readOnly ? (
      <input type={type} name={name} className="form-control" value={form[name] || ''} onChange={onChange} />
    ) : (
      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b' }}>
        {displayValue || <span style={{ color: '#94a3b8' }}>Not set</span>}
      </div>
    )}
  </div>
);

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([employeeAPI.getMe(), departmentAPI.getAll()])
      .then(([empRes, deptRes]) => {
        setProfile(empRes.data);
        setForm(empRes.data);
        setDepartments(deptRes.data);
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile' }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await employeeAPI.updateMe(form);
      setProfile(res.data);
      setForm(res.data);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile);
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-content">
        <TopNav title="My Profile" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>My Profile</h2>
              <p>View and update your personal information</p>
            </div>
            {!editing ? (
              <button className="btn btn-primary" id="edit-profile-btn" onClick={() => setEditing(true)}>
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-success" id="save-profile-btn" onClick={handleSave} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn btn-ghost" onClick={handleCancel}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Personal Information */}
              <div className="card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f3460', marginBottom: '20px' }}>
                  <User size={18} /> Personal Information
                </h3>
                <div className="form-row">
                  <Field label="Full Name" name="name" displayValue={profile?.name} readOnly editing={editing} form={form} onChange={handleChange} />
                  <Field label="Email" name="email" displayValue={profile?.email} readOnly editing={editing} form={form} onChange={handleChange} />
                  <Field label="Phone" name="phone" displayValue={form?.phone} editing={editing} form={form} onChange={handleChange} />
                  <Field label="Designation" name="designation" displayValue={form?.designation} editing={editing} form={form} onChange={handleChange} />
                  <Field label="Department" name="departmentName" displayValue={profile?.departmentName} readOnly editing={editing} form={form} onChange={handleChange} />
                  <Field label="Date of Joining" name="dateOfJoining" displayValue={profile?.dateOfJoining} type="date" readOnly editing={editing} form={form} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  {editing ? (
                    <textarea name="address" className="form-control" rows={3} value={form?.address || ''} onChange={handleChange} style={{ resize: 'vertical' }} />
                  ) : (
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b', minHeight: '60px' }}>
                      {profile?.address || <span style={{ color: '#94a3b8' }}>Not set</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f3460', marginBottom: '20px' }}>
                  <CreditCard size={18} /> Bank Details
                </h3>
                <div className="form-row">
                  <Field label="Bank Name" name="bankName" displayValue={form?.bankName} editing={editing} form={form} onChange={handleChange} />
                  <Field label="Account Number" name="accountNumber" displayValue={form?.accountNumber} editing={editing} form={form} onChange={handleChange} />
                  <Field label="IFSC Code" name="ifscCode" displayValue={form?.ifscCode} editing={editing} form={form} onChange={handleChange} />
                  <Field label="PAN Number" name="panNumber" displayValue={form?.panNumber} editing={editing} form={form} onChange={handleChange} />
                </div>
              </div>

              {/* Salary Info (read-only) */}
              <div className="card">
                <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Salary Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {[
                    ['Basic Salary', `₹ ${(profile?.basicSalary || 0).toLocaleString('en-IN')}`],
                    ['Allowances', `₹ ${(profile?.allowances || 0).toLocaleString('en-IN')}`],
                    ['Deductions', `₹ ${(profile?.deductions || 0).toLocaleString('en-IN')}`],
                    ['Net Salary', `₹ ${((profile?.basicSalary || 0) + (profile?.allowances || 0) - (profile?.deductions || 0)).toLocaleString('en-IN')}`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: '14px', background: '#f0f4f8', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f3460' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
