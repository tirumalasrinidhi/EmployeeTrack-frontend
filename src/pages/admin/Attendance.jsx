import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { attendanceAPI } from '../../services/api';

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getAll()
      .then(res => setRecords(res.data))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = { PRESENT: 'badge-success', ABSENT: 'badge-danger', HALF_DAY: 'badge-warning', LEAVE: 'badge-info' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status}</span>;
  };

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Attendance Records" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Attendance Records</h2><p>View all employee attendance</p></div>
            <span className="badge badge-info">Today: {new Date().toLocaleDateString('en-IN')}</span>
          </div>

          <div className="table-container">
            <div className="table-header">
              <h3>All Attendance</h3>
              <span className="badge badge-secondary">{records.length} records</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : records.length === 0 ? (
                <div className="empty-state"><Clock size={48} /><h4>No attendance records</h4></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Employee</th>
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
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{r.employee?.employeeId}</td>
                        <td style={{ fontWeight: 600 }}>{r.employee?.user?.name}</td>
                        <td>{r.date}</td>
                        <td>{r.checkIn || '—'}</td>
                        <td>{r.checkOut || '—'}</td>
                        <td>{r.workingHours ? `${r.workingHours}h` : '—'}</td>
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

export default AdminAttendance;
