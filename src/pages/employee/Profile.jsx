import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit2, X, User, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { employeeAPI, departmentAPI } from '../../services/api';

// ─── Validation rules for bank details ─────────────────────────────────────
const BANK_RULES = {
  bankName(v) {
    if (!v || !v.trim()) return '';  // optional field — only validate if non-empty
    if (v.trim().length < 2)   return 'Bank name must be at least 2 characters.';
    if (v.trim().length > 100) return 'Bank name must not exceed 100 characters.';
    return '';
  },
  accountNumber(v) {
    if (!v || !v.trim()) return '';  // optional
    if (!/^\d{9,18}$/.test(v.trim()))
      return 'Account number must contain only digits and be 9–18 digits long.';
    return '';
  },
  ifscCode(v) {
    if (!v || !v.trim()) return '';  // optional
    if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(v.trim()))
      return 'IFSC format: 4 letters + 0 + 6 alphanumeric characters (e.g. SBIN0001234).';
    return '';
  },
  panNumber(v) {
    if (!v || !v.trim()) return '';  // optional
    if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(v.trim()))
      return 'PAN format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).';
    return '';
  },
};

// ─── Field component — defined at MODULE SCOPE to prevent focus loss ────────
// Defining it inside EmployeeProfile would cause React to unmount/remount
// on every state change (keystroke), losing the input focus every character.
const Field = ({ label, name, type = 'text', readOnly = false, editing, form, onChange, displayValue, errorMsg, touched }) => {
  const hasError = touched && errorMsg;
  const isValid  = touched && !errorMsg && form[name] && !readOnly;
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {editing && !readOnly ? (
        <>
          <div style={{ position: 'relative' }}>
            <input
              type={type}
              name={name}
              className="form-control"
              value={form[name] || ''}
              onChange={onChange}
              style={{
                paddingRight: (hasError || isValid) ? '32px' : undefined,
                border: hasError ? '1.5px solid #ef4444' : isValid ? '1.5px solid #10b981' : undefined,
              }}
            />
            {isValid  && <CheckCircle2 size={14} style={{ color: '#10b981', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
            {hasError && <XCircle     size={14} style={{ color: '#ef4444', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
          </div>
          {hasError && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={12} /> {errorMsg}
            </p>
          )}
        </>
      ) : (
        <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#1e293b' }}>
          {displayValue || <span style={{ color: '#94a3b8' }}>Not set</span>}
        </div>
      )}
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────
const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Per-field bank-detail errors and touched flags
  const [bankErrs, setBankErrs] = useState({ bankName: '', accountNumber: '', ifscCode: '', panNumber: '' });
  const [bankTouched, setBankTouched] = useState({ bankName: false, accountNumber: false, ifscCode: false, panNumber: false });

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

  // Stable onChange reference — never changes identity → no focus loss
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
    // Live-validate bank fields once they've been touched
    if (BANK_RULES[name]) {
      setBankTouched(prev => ({ ...prev, [name]: true }));
      setBankErrs(prev => ({ ...prev, [name]: BANK_RULES[name](value) }));
    }
  }, []);

  // Validate all bank fields; return true if all pass
  const validateBankFields = () => {
    const fields = ['bankName', 'accountNumber', 'ifscCode', 'panNumber'];
    const newErrs = {};
    const newTouched = {};
    let valid = true;
    fields.forEach(f => {
      const msg = BANK_RULES[f] ? BANK_RULES[f](form[f]) : '';
      newErrs[f] = msg;
      newTouched[f] = true;
      if (msg) valid = false;
    });
    setBankErrs(newErrs);
    setBankTouched(newTouched);
    return valid;
  };

  const handleSave = async () => {
    if (!validateBankFields()) {
      setMessage({ type: 'error', text: 'Please fix the bank details errors before saving.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await employeeAPI.updateMe(form);
      setProfile(res.data);
      setForm(res.data);
      setEditing(false);
      setBankErrs({ bankName: '', accountNumber: '', ifscCode: '', panNumber: '' });
      setBankTouched({ bankName: false, accountNumber: false, ifscCode: false, panNumber: false });
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
    setBankErrs({ bankName: '', accountNumber: '', ifscCode: '', panNumber: '' });
    setBankTouched({ bankName: false, accountNumber: false, ifscCode: false, panNumber: false });
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
            <div className="loading-container"><div className="spinner" /></div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Personal Information */}
              <div className="card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f3460', marginBottom: '20px' }}>
                  <User size={18} /> Personal Information
                </h3>
                <div className="form-row">
                  <Field label="Full Name"     name="name"          displayValue={profile?.name}          readOnly editing={editing} form={form} onChange={handleChange} />
                  <Field label="Email"         name="email"         displayValue={profile?.email}         readOnly editing={editing} form={form} onChange={handleChange} />
                  <Field label="Phone"         name="phone"         displayValue={form?.phone}            editing={editing} form={form} onChange={handleChange} />
                  <Field label="Designation"   name="designation"   displayValue={form?.designation}      editing={editing} form={form} onChange={handleChange} />
                  <Field label="Department"    name="departmentName" displayValue={profile?.departmentName} readOnly editing={editing} form={form} onChange={handleChange} />
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
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f3460', marginBottom: '4px' }}>
                  <CreditCard size={18} /> Bank Details
                </h3>
                {editing && (
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                    IFSC format: SBIN0001234 &nbsp;|&nbsp; PAN format: ABCDE1234F &nbsp;|&nbsp; Account: 9–18 digits
                  </p>
                )}
                {!editing && <div style={{ marginBottom: '16px' }} />}
                <div className="form-row">
                  <Field
                    label="Bank Name" name="bankName"
                    displayValue={form?.bankName} editing={editing} form={form} onChange={handleChange}
                    errorMsg={bankErrs.bankName} touched={bankTouched.bankName}
                  />
                  <Field
                    label="Account Number" name="accountNumber"
                    displayValue={form?.accountNumber ? '••••' + form.accountNumber.slice(-4) : undefined}
                    editing={editing} form={form} onChange={handleChange}
                    errorMsg={bankErrs.accountNumber} touched={bankTouched.accountNumber}
                  />
                  <Field
                    label="IFSC Code" name="ifscCode"
                    displayValue={form?.ifscCode} editing={editing} form={form} onChange={handleChange}
                    errorMsg={bankErrs.ifscCode} touched={bankTouched.ifscCode}
                  />
                  <Field
                    label="PAN Number" name="panNumber"
                    displayValue={form?.panNumber} editing={editing} form={form} onChange={handleChange}
                    errorMsg={bankErrs.panNumber} touched={bankTouched.panNumber}
                  />
                </div>
              </div>

              {/* Salary Info (read-only) */}
              <div className="card">
                <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Salary Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  {[
                    ['Basic Salary', `₹ ${(profile?.basicSalary || 0).toLocaleString('en-IN')}`],
                    ['Allowances',   `₹ ${(profile?.allowances  || 0).toLocaleString('en-IN')}`],
                    ['Deductions',   `₹ ${(profile?.deductions   || 0).toLocaleString('en-IN')}`],
                    ['Net Salary',   `₹ ${((profile?.basicSalary || 0) + (profile?.allowances || 0) - (profile?.deductions || 0)).toLocaleString('en-IN')}`],
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
