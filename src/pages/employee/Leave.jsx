import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { leaveAPI } from '../../services/api';

const LEAVE_TYPES = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY', 'UNPAID'];

const EmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'CASUAL', fromDate: '', toDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchLeaves = () => {
    leaveAPI.getMine()
      .then(res => setLeaves(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const numDays = () => {
    if (!form.fromDate || !form.toDate) return 0;
    const from = new Date(form.fromDate);
    const to = new Date(form.toDate);
    const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }
    if (new Date(form.toDate) < new Date(form.fromDate)) {
      setMessage({ type: 'error', text: 'To date cannot be before From date' });
      return;
    }
    setSubmitting(true);
    try {
      await leaveAPI.apply(form);
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
      setShowForm(false);
      setForm({ leaveType: 'CASUAL', fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit leave request' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    const map = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
  };

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-content">
        <TopNav title="Leave Management" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Leave Management</h2>
              <p>Apply and track your leave requests</p>
            </div>
            <button className="btn btn-primary" id="apply-leave-btn" onClick={() => { setShowForm(!showForm); setMessage({ type: '', text: '' }); }}>
              {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Apply for Leave</>}
            </button>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          {showForm && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '20px' }}>Apply for Leave</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Leave Type *</label>
                    <select name="leaveType" id="leave-type" className="form-control" value={form.leaveType} onChange={handleChange}>
                      {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Days</label>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#0f3460' }}>
                      {numDays()} days
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">From Date *</label>
                    <input type="date" name="fromDate" id="leave-from" className="form-control" value={form.fromDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Date *</label>
                    <input type="date" name="toDate" id="leave-to" className="form-control" value={form.toDate} onChange={handleChange} min={form.fromDate || new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <textarea name="reason" id="leave-reason" className="form-control" rows={3} value={form.reason} onChange={handleChange} placeholder="Describe the reason for your leave..." style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" id="submit-leave-btn" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </form>
            </div>
          )}

          <div className="table-container">
            <div className="table-header">
              <h3>My Leave Requests</h3>
              <span className="badge badge-secondary">{leaves.length} total</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : leaves.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} />
                  <h4>No leave requests</h4>
                  <p>Apply for your first leave using the button above</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id}>
                        <td><span className="badge badge-info">{l.leaveType}</span></td>
                        <td>{l.fromDate}</td>
                        <td>{l.toDate}</td>
                        <td style={{ fontWeight: 700 }}>{l.numberOfDays}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                        <td>{statusBadge(l.status)}</td>
                        <td style={{ color: '#64748b', fontSize: '12px' }}>{new Date(l.appliedAt).toLocaleDateString('en-IN')}</td>
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

export default EmployeeLeave;
