import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, UserPlus, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { authAPI, departmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ─── Validation rules (mirror backend) ────────────────────────────────────────
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX  = /^[\p{L} .'-]+$/u;

const RULES = {
  name(v)            {
    if (!v.trim())                      return 'Full name is required';
    if (v.trim().length < 2)            return 'Name must be at least 2 characters';
    if (v.trim().length > 100)          return 'Name must not exceed 100 characters';
    if (!NAME_REGEX.test(v.trim()))     return 'Name must contain only letters, spaces, hyphens, or apostrophes';
    return '';
  },
  phone(v)           {
    if (!v.trim())                      return 'Phone number is required';
    if (/[^0-9]/.test(v.trim()))        return 'Phone number must contain only digits (no spaces, dashes, or letters)';
    if (v.trim().length !== 10)         return 'Phone number must be exactly 10 digits';
    if (!PHONE_REGEX.test(v.trim()))    return 'Must start with 6, 7, 8, or 9 (valid Indian mobile number)';
    return '';
  },
  email(v)           {
    if (!v.trim())                      return 'Email address is required';
    if (!EMAIL_REGEX.test(v.trim()))    return 'Enter a valid email address (e.g. name@company.com)';
    return '';
  },
  department(v)      {
    if (!v)                             return 'Please select a department';
    return '';
  },
  designation(v)     {
    if (!v.trim())                      return 'Designation is required';
    if (v.trim().length < 2)            return 'Designation must be at least 2 characters';
    if (v.trim().length > 100)          return 'Designation must not exceed 100 characters';
    return '';
  },
  password(v)        {
    if (!v)                             return 'Password is required';
    if (v.length < 8)                   return 'Password must be at least 8 characters';
    return '';
  },
  confirmPassword(v, pw) {
    if (!v)                             return 'Please confirm your password';
    if (v !== pw)                       return 'Passwords do not match';
    return '';
  },
};

// ─── Password strength meter ───────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: score, label: 'Weak',     color: '#ef4444' };
  if (score <= 3) return { level: score, label: 'Moderate', color: '#f59e0b' };
  return           { level: score, label: 'Strong',   color: '#10b981' };
};

// ─── Inline field-error component ─────────────────────────────────────────────
const FieldError = ({ msg }) => msg ? (
  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
    <XCircle size={12} /> {msg}
  </p>
) : null;

const FieldOk = ({ show }) => show ? (
  <CheckCircle2 size={14} style={{ color: '#10b981', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
) : null;

// ─── Component ────────────────────────────────────────────────────────────────
const Register = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', designation: '', phone: '',
  });
  // Per-field error strings — empty string = no error
  const [errs, setErrs] = useState({
    name: '', email: '', phone: '', department: '',
    designation: '', password: '', confirmPassword: '',
  });
  // Whether a field has been touched (blurred or submitted)
  const [touched, setTouched] = useState({});

  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [success,     setSuccess]     = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    departmentAPI.getAll()
      .then(res => setDepartments(res.data))
      .catch((err) => {
        // Log so it's visible in DevTools — previously silent, hiding CORS/network errors
        console.error('Failed to load departments:', err?.response?.status, err?.message);
        setServerError('Could not load departments. Please refresh the page or try again.');
      });
  }, []);

  // Validate a single field and update errs state
  const validateField = (name, value) => {
    let msg = '';
    if (name === 'confirmPassword') {
      msg = RULES.confirmPassword(value, form.password);
    } else if (RULES[name]) {
      msg = RULES[name](value);
    }
    setErrs(prev => ({ ...prev, [name]: msg }));
    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setServerError('');
    // Re-validate live if already touched
    if (touched[name]) {
      let msg = '';
      if (name === 'confirmPassword') {
        msg = RULES.confirmPassword(value, form.password);
      } else if (name === 'password') {
        // Also re-check confirmPassword if it was touched
        msg = RULES.password(value);
        if (touched.confirmPassword) {
          setErrs(prev => ({ ...prev, confirmPassword: RULES.confirmPassword(form.confirmPassword, value) }));
        }
      } else if (RULES[name]) {
        msg = RULES[name](value);
      }
      setErrs(prev => ({ ...prev, [name]: msg }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Validate all fields; return true if form is valid
  const validateAll = () => {
    const fields = ['name', 'email', 'phone', 'department', 'designation', 'password', 'confirmPassword'];
    const newErrs = {};
    let valid = true;
    fields.forEach(f => {
      const val = form[f];
      let msg = '';
      if (f === 'confirmPassword') {
        msg = RULES.confirmPassword(val, form.password);
      } else {
        msg = RULES[f] ? RULES[f](val) : '';
      }
      newErrs[f] = msg;
      if (msg) valid = false;
    });
    setErrs(newErrs);
    // Mark all as touched so errors are visible
    const allTouched = {};
    fields.forEach(f => { allTouched[f] = true; });
    setTouched(allTouched);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    setServerError('');
    try {
      const payload = {
        ...form,
        name:        form.name.trim(),
        email:       form.email.trim().toLowerCase(),
        phone:       form.phone.trim(),
        designation: form.designation.trim(),
      };
      const res = await authAPI.register(payload);
      const { token, email, name, role, employeeId } = res.data;
      setSuccess('Account created successfully! Redirecting to your dashboard…');
      login({ email, name, role, employeeId }, token);
      setTimeout(() => navigate('/employee/dashboard'), 1800);
    } catch (err) {
      // Backend may return { message: '...' } for RuntimeException, or { messages: {...} } for @Valid errors
      const data = err.response?.data;
      if (data?.messages && typeof data.messages === 'object') {
        // Bean Validation field errors — pick first message
        const firstMsg = Object.values(data.messages)[0];
        setServerError(firstMsg || 'Validation failed. Please check your inputs.');
      } else {
        setServerError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);

  // Helper: border color for a field
  const borderFor = (field) => {
    if (!touched[field]) return '';
    return errs[field] ? '1.5px solid #ef4444' : '1.5px solid #10b981';
  };

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-logo">
          <div className="logo-mark">
            <Building2 size={28} color="white" />
          </div>
          <h1>EmployeeTrack</h1>
          <p>Employee Payroll Management System</p>
        </div>

        <h2 className="auth-title">Create Employee Account</h2>

        {/* Server-level error banner */}
        {serverError && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{serverError}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Row: Full Name + Phone ── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="name"
                  id="reg-name"
                  className="form-control"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ paddingRight: '34px', border: borderFor('name') }}
                  autoComplete="name"
                />
                <FieldOk show={touched.name && !errs.name && form.name} />
              </div>
              <FieldError msg={touched.name ? errs.name : ''} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  id="reg-phone"
                  className="form-control"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  style={{ paddingRight: '34px', border: borderFor('phone') }}
                  autoComplete="tel"
                />
                <FieldOk show={touched.phone && !errs.phone && form.phone} />
              </div>
              <FieldError msg={touched.phone ? errs.phone : ''} />
              {!errs.phone && !touched.phone && (
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                  10 digits starting with 6, 7, 8, or 9
                </p>
              )}
            </div>
          </div>

          {/* ── Email ── */}
          <div className="form-group">
            <label className="form-label">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                id="reg-email"
                className="form-control"
                placeholder="priya@company.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ paddingRight: '34px', border: borderFor('email') }}
                autoComplete="email"
              />
              <FieldOk show={touched.email && !errs.email && form.email} />
            </div>
            <FieldError msg={touched.email ? errs.email : ''} />
          </div>

          {/* ── Row: Department + Designation ── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                name="department"
                id="reg-department"
                className="form-control"
                value={form.department}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ border: borderFor('department') }}
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <FieldError msg={touched.department ? errs.department : ''} />
            </div>

            <div className="form-group">
              <label className="form-label">Designation <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="designation"
                  id="reg-designation"
                  className="form-control"
                  placeholder="e.g. Software Engineer"
                  value={form.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ paddingRight: '34px', border: borderFor('designation') }}
                />
                <FieldOk show={touched.designation && !errs.designation && form.designation} />
              </div>
              <FieldError msg={touched.designation ? errs.designation : ''} />
            </div>
          </div>

          {/* ── Row: Password + Confirm ── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  id="reg-password"
                  className="form-control"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ paddingRight: '44px', border: borderFor('password') }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={touched.password ? errs.password : ''} />
              {/* Strength meter */}
              {form.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        height: '4px', flex: 1, borderRadius: '2px',
                        background: i <= strength.level ? strength.color : '#e2e8f0',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  id="reg-confirm-password"
                  className="form-control"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ paddingRight: '44px', border: borderFor('confirmPassword') }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError msg={touched.confirmPassword ? errs.confirmPassword : ''} />
              {/* Match indicator */}
              {form.confirmPassword && (
                <p style={{
                  margin: '5px 0 0 0', fontSize: '12px', fontWeight: 600,
                  color: form.password === form.confirmPassword ? '#10b981' : '#ef4444',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {form.password === form.confirmPassword
                    ? <><CheckCircle2 size={12} /> Passwords match</>
                    : <><XCircle size={12} /> Passwords do not match</>}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            id="reg-submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Creating account…</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
