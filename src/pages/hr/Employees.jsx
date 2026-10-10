import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import HRSidebar from '../../components/hr/HRSidebar';
import TopNav from '../../components/common/TopNav';
import { employeeAPI } from '../../services/api';

const HREmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeAPI.getAll()
      .then(res => setEmployees(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <HRSidebar />
      <div className="main-content">
        <TopNav title="Employee Records" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Employee Records</h2><p>View all employee information</p></div>
            <span className="badge badge-secondary">{employees.length} employees</span>
          </div>

          <div className="table-container">
            <div className="table-header"><h3>All Employees</h3></div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : employees.length === 0 ? (
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
                      <th>Phone</th>
                      <th>Joining Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{emp.employeeId}</td>
                        <td style={{ fontWeight: 600 }}>{emp.name}</td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{emp.email}</td>
                        <td>{emp.departmentName || '—'}</td>
                        <td>{emp.designation}</td>
                        <td>{emp.phone || '—'}</td>
                        <td style={{ color: '#64748b' }}>{emp.dateOfJoining || '—'}</td>
                        <td>
                          <span className={`badge ${emp.active ? 'badge-success' : 'badge-danger'}`}>
                            {emp.active ? 'Active' : 'Inactive'}
                          </span>
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

export default HREmployees;
