import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { leaveAPI } from '../../services/api';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [processing, setProcessing] = useState(null);

  const fetchLeaves = () => {
    leaveAPI.getAll()
      .then(res => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await leaveAPI.approve(id);
      setMessage({ type: 'success', text: 'Leave approved successfully!' });
      fetchLeaves();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to approve' });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    setProcessing(id);
    try {
      await leaveAPI.reject(id);
      setMessage({ type: 'success', text: 'Leave rejected.' });
      fetchLeaves();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reject' });
    } finally {
      setProcessing(null);
    }
  };

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter);

  const statusBadge = (status) => {
    const map = { PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
  };

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Leave Approvals" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Leave Approvals</h2><p>Review and manage leave requests</p></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {message.text && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>{message.text}</div>}

          <div className="table-container">
            <div className="table-header">
              <h3>Leave Requests</h3>
              <span className="badge badge-secondary">{filtered.length} records</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : filtered.length === 0 ? (
                <div className="empty-state"><Calendar size={48} /><h4>No leave requests</h4></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{l.employeeName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{l.employeeIdCode}</div>
                        </td>
                        <td style={{ color: '#64748b' }}>{l.departmentName || '—'}</td>
                        <td><span className="badge badge-info">{l.leaveType}</span></td>
                        <td>{l.fromDate}</td>
                        <td>{l.toDate}</td>
                        <td style={{ fontWeight: 700 }}>{l.numberOfDays}</td>
                        <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b' }}>{l.reason}</td>
                        <td>{statusBadge(l.status)}</td>
                        <td>
                          {l.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-success btn-sm"
                                id={`approve-leave-${l.id}`}
                                onClick={() => handleApprove(l.id)}
                                disabled={processing === l.id}
                              >
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                id={`reject-leave-${l.id}`}
                                onClick={() => handleReject(l.id)}
                                disabled={processing === l.id}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          )}
                          {l.status !== 'PENDING' && (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              By: {l.approvedBy || 'N/A'}
                            </span>
                          )}
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

export default AdminLeaves;
