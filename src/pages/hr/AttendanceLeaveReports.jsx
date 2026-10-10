import React, { useState, useEffect } from 'react';
import { FileBarChart } from 'lucide-react';
import HRSidebar from '../../components/hr/HRSidebar';
import TopNav from '../../components/common/TopNav';
import { attendanceAPI, leaveAPI } from '../../services/api';

const HRAttendanceLeaveReports = () => {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tab, setTab] = useState('attendance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([attendanceAPI.getAll(), leaveAPI.getAll()])
      .then(([attRes, leaveRes]) => {
        setAttendance(attRes.data);
        setLeaves(leaveRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      PRESENT: 'badge-success', ABSENT: 'badge-danger', HALF_DAY: 'badge-warning', LEAVE: 'badge-info',
      PENDING: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger',
    };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
  };

  return (
    <div className="app-layout">
      <HRSidebar />
      <div className="main-content">
        <TopNav title="Attendance & Leave Reports" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Attendance & Leave Reports</h2><p>Monitor employee attendance and leave patterns</p></div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button className={`btn ${tab === 'attendance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('attendance')}>
              Attendance ({attendance.length})
            </button>
            <button className={`btn ${tab === 'leaves' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('leaves')}>
              Leaves ({leaves.length})
            </button>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : tab === 'attendance' ? (
            <div className="table-container">
              <div className="table-header"><h3>Attendance Records</h3><span className="badge badge-secondary">{attendance.length}</span></div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Emp ID</th><th>Employee</th><th>Department</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Duration</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {attendance.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{r.employeeId}</td>
                        <td style={{ fontWeight: 600 }}>{r.employeeName}</td>
                        <td style={{ color: '#64748b' }}>{r.departmentName || '—'}</td>
                        <td>{r.date}</td>
                        <td>{r.checkIn || '—'}</td>
                        <td>
                          {r.checkOut
                            ? r.checkOut
                            : r.checkIn
                              ? <span style={{ color: '#f59e0b', fontStyle: 'italic', fontSize: '12px' }}>Not checked out</span>
                              : '—'}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {r.checkOut ? (r.workingDuration ?? '—') : '—'}
                        </td>
                        <td>{statusBadge(r.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-header"><h3>Leave Requests</h3><span className="badge badge-secondary">{leaves.length}</span></div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Employee</th><th>Department</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{l.employeeName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{l.employeeIdCode}</div>
                        </td>
                        <td style={{ color: '#64748b' }}>{l.departmentName || '—'}</td>
                        <td><span className="badge badge-info">{l.leaveType}</span></td>
                        <td>{l.fromDate}</td>
                        <td>{l.toDate}</td>
                        <td>{l.numberOfDays}</td>
                        <td>{statusBadge(l.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRAttendanceLeaveReports;
