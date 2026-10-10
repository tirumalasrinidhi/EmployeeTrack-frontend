import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { attendanceAPI } from '../../services/api';

// Format "HH:mm:ss" ISO time string → "HH:mm", safely handles null/array
const fmtTime = (t) => {
  if (!t) return '—';
  // Backend may return array [H,M,S] if Jackson wasn't configured — guard it
  if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1]).padStart(2,'0')}`;
  return String(t).slice(0, 5);
};

const EmployeeAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchRecords = () => {
    attendanceAPI.getMine()
      .then(res => setRecords(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  const todayRecord = records.find(r => r.date === new Date().toISOString().split('T')[0]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await attendanceAPI.checkIn();
      setMessage({ type: 'success', text: 'Checked in successfully!' });
      fetchRecords();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await attendanceAPI.checkOut();
      setMessage({ type: 'success', text: 'Checked out successfully!' });
      fetchRecords();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      PRESENT: 'badge-success',
      ABSENT: 'badge-danger',
      HALF_DAY: 'badge-warning',
      LEAVE: 'badge-info',
    };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const isCheckedIn = todayRecord?.checkIn != null;
  const isCheckedOut = todayRecord?.checkOut != null;

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-content">
        <TopNav title="Attendance" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Attendance</h2>
              <p>Track your daily attendance</p>
            </div>
            <span className="badge badge-info">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#0f3460' }}>Today's Attendance</h3>
            <div className="attendance-actions">
              <button
                className="check-btn check-in"
                id="check-in-btn"
                onClick={handleCheckIn}
                disabled={isCheckedIn || actionLoading}
              >
                <LogIn size={20} />
                {isCheckedIn ? `Checked In at ${fmtTime(todayRecord?.checkIn)}` : 'Check In'}
              </button>
              <button
                className="check-btn check-out"
                id="check-out-btn"
                onClick={handleCheckOut}
                disabled={!isCheckedIn || isCheckedOut || actionLoading}
              >
                <LogOut size={20} />
                {isCheckedOut ? `Checked Out at ${fmtTime(todayRecord?.checkOut)}` : 'Check Out'}
              </button>
            </div>
            {todayRecord && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ padding: '10px 16px', background: '#f0f4f8', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Working Hours</p>
                  <p style={{ fontWeight: 700, color: '#0f3460' }}>{todayRecord?.workingHours != null ? `${todayRecord.workingHours}h` : '—'}</p>
                </div>
                <div style={{ padding: '10px 16px', background: '#f0f4f8', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Status</p>
                  {statusBadge(todayRecord?.status)}
                </div>
              </div>
            )}
          </div>

          <div className="table-container">
            <div className="table-header">
              <h3>Attendance History</h3>
              <span className="badge badge-secondary">{records.length} records</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : records.length === 0 ? (
                <div className="empty-state">
                  <Clock size={48} />
                  <h4>No attendance records</h4>
                  <p>Start by checking in today</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.date}</td>
                        <td>{fmtTime(r.checkIn)}</td>
                        <td>{fmtTime(r.checkOut)}</td>
                        <td>{r.workingHours != null ? `${r.workingHours}h` : '—'}</td>
                        <td>{statusBadge(r.status)}</td>
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

export default EmployeeAttendance;
