import React, { useState, useEffect } from 'react';
import { Users, Edit2, PowerOff, Power, Trash2, Search, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { employeeAPI, departmentAPI } from '../../services/api';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // Reset Password modal state
  const [resetPwd, setResetPwd] = useState({
    employeeId: null,
    employeeName: '',
    newPassword: '',
    confirmPassword: '',
    showNew: false,
    showConfirm: false,
    saving: false,
  });

  const openResetModal = (emp) => {
    setResetPwd({
      employeeId: emp.id,
      employeeName: emp.name,
      newPassword: '',
      confirmPassword: '',
      showNew: false,
      showConfirm: false,
      saving: false,
    });
    setMessage({ type: '', text: '' });
  };

  const closeResetModal = () => {
    setResetPwd(prev => ({ ...prev, employeeId: null, newPassword: '', confirmPassword: '' }));
  };

  const handleResetPassword = async () => {
    const { employeeId, newPassword, confirmPassword } = resetPwd;
    // Client-side validation before sending to backend
    if (!newPassword || newPassword.trim() === '') {
      setMessage({ type: 'error', text: 'New password must not be empty.' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setResetPwd(prev => ({ ...prev, saving: true }));
    setMessage({ type: '', text: '' });
    try {
      await employeeAPI.resetPassword(employeeId, { newPassword, confirmPassword });
      setMessage({ type: 'success', text: `Password reset successfully for ${resetPwd.employeeName}.` });
      closeResetModal();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setResetPwd(prev => ({ ...prev, saving: false }));
    }
  };

  // Password strength helper (visual only)
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: score, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { level: score, label: 'Moderate', color: '#f59e0b' };
    return { level: score, label: 'Strong', color: '#10b981' };
  };

  const fetchAll = () => {
    Promise.all([employeeAPI.getAll(), departmentAPI.getAll()])
      .then(([empRes, deptRes]) => {
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    e.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (emp) => {
    setEditing(emp.id);
    setForm({ ...emp });
    setMessage({ type: '', text: '' });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await employeeAPI.update(editing, form);
      setMessage({ type: 'success', text: 'Employee updated successfully!' });
      setEditing(null);
      fetchAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await employeeAPI.toggleStatus(id);
      fetchAll();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee? This cannot be undone.')) return;
    try {
      await employeeAPI.delete(id);
      setMessage({ type: 'success', text: 'Employee deleted' });
      fetchAll();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete employee' });
    }
  };

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Employees" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Employees</h2><p>Manage all employees</p></div>
            <div className="search-bar">
              <Search size={16} color="#64748b" />
              <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {message.text && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>{message.text}</div>}

          {/* Reset Password Modal */}
          {resetPwd.employeeId && (
            <div className="modal-overlay" onClick={closeResetModal}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
                <div className="modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0f3460, #1a5276)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <KeyRound size={18} color="white" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>Reset Password</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{resetPwd.employeeName}</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={closeResetModal}>✕</button>
                </div>
                <div className="modal-body">
                  {/* Security notice */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px 14px', background: '#f0fdf4',
                    border: '1px solid #86efac', borderRadius: '8px', marginBottom: '16px'
                  }}>
                    <ShieldCheck size={16} style={{ color: '#15803d', flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>
                      Passwords are <strong>BCrypt-hashed</strong> before being saved. Plain-text passwords are never stored or returned.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="form-group">
                    <label className="form-label">New Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={resetPwd.showNew ? 'text' : 'password'}
                        className="form-control"
                        id="reset-new-password"
                        placeholder="Minimum 8 characters"
                        value={resetPwd.newPassword}
                        autoComplete="new-password"
                        onChange={e => setResetPwd(prev => ({ ...prev, newPassword: e.target.value }))}
                        style={{ paddingRight: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setResetPwd(prev => ({ ...prev, showNew: !prev.showNew }))}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px'
                        }}
                        title={resetPwd.showNew ? 'Hide password' : 'Show password'}
                      >
                        {resetPwd.showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Strength indicator */}
                    {resetPwd.newPassword && (() => {
                      const s = getStrength(resetPwd.newPassword);
                      return (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            {[1,2,3,4,5].map(i => (
                              <div key={i} style={{
                                height: '4px', flex: 1, borderRadius: '2px',
                                background: i <= s.level ? s.color : '#e2e8f0',
                                transition: 'background 0.2s'
                              }} />
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', color: s.color, fontWeight: 600 }}>{s.label}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={resetPwd.showConfirm ? 'text' : 'password'}
                        className="form-control"
                        id="reset-confirm-password"
                        placeholder="Re-enter new password"
                        value={resetPwd.confirmPassword}
                        autoComplete="new-password"
                        onChange={e => setResetPwd(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        style={{ paddingRight: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setResetPwd(prev => ({ ...prev, showConfirm: !prev.showConfirm }))}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px'
                        }}
                        title={resetPwd.showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {resetPwd.showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {resetPwd.confirmPassword && (
                      <p style={{
                        margin: '6px 0 0 0', fontSize: '12px', fontWeight: 600,
                        color: resetPwd.newPassword === resetPwd.confirmPassword ? '#10b981' : '#ef4444'
                      }}>
                        {resetPwd.newPassword === resetPwd.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={closeResetModal} disabled={resetPwd.saving}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    id="confirm-reset-password-btn"
                    onClick={handleResetPassword}
                    disabled={resetPwd.saving || !resetPwd.newPassword || !resetPwd.confirmPassword}
                  >
                    {resetPwd.saving
                      ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div> Resetting...</>
                      : <><KeyRound size={14} /> Reset Password</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editing && (
            <div className="modal-overlay" onClick={() => setEditing(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Edit Employee</h3>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditing(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-control" value={form.departmentId || ''} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
                        <option value="">Select</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input className="form-control" value={form.designation || ''} onChange={e => setForm({ ...form, designation: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Basic Salary (₹)</label>
                      <input type="number" className="form-control" value={form.basicSalary || ''} onChange={e => setForm({ ...form, basicSalary: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Allowances (₹)</label>
                      <input type="number" className="form-control" value={form.allowances || ''} onChange={e => setForm({ ...form, allowances: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Deductions (₹)</label>
                      <input type="number" className="form-control" value={form.deductions || ''} onChange={e => setForm({ ...form, deductions: parseFloat(e.target.value) })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="table-container">
            <div className="table-header">
              <h3>Employee List</h3>
              <span className="badge badge-secondary">{filtered.length} employees</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state"><Users size={48} /><h4>No employees found</h4></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(emp => (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{emp.employeeId}</td>
                        <td style={{ fontWeight: 600 }}>{emp.name}</td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{emp.email}</td>
                        <td>{emp.departmentName || '—'}</td>
                        <td>{emp.designation}</td>
                        <td>₹ {((emp.basicSalary || 0) + (emp.allowances || 0) - (emp.deductions || 0)).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${emp.active ? 'badge-success' : 'badge-danger'}`}>
                            {emp.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-outline btn-sm" id={`edit-emp-${emp.id}`} onClick={() => handleEdit(emp)} title="Edit employee">
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="btn btn-sm"
                              id={`reset-pwd-${emp.id}`}
                              onClick={() => openResetModal(emp)}
                              title="Reset password"
                              style={{ background: '#0f3460', color: 'white', border: 'none' }}
                            >
                              <KeyRound size={12} />
                            </button>
                            <button
                              className={`btn btn-sm ${emp.active ? 'btn-warning' : 'btn-success'}`}
                              id={`toggle-emp-${emp.id}`}
                              onClick={() => handleToggleStatus(emp.id)}
                              title={emp.active ? 'Disable' : 'Enable'}
                            >
                              {emp.active ? <PowerOff size={12} /> : <Power size={12} />}
                            </button>
                            <button className="btn btn-danger btn-sm" id={`delete-emp-${emp.id}`} onClick={() => handleDelete(emp.id)} title="Delete employee">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployees;
