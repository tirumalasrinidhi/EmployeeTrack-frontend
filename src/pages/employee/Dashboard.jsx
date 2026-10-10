import React, { useState, useEffect } from 'react';
import { Clock, Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.employee()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) =>
    val != null ? `₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-content">
        <TopNav title="Employee Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Welcome, {user?.name?.split(' ')[0]} 👋</h2>
              <p>Here's your summary for today</p>
            </div>
            <span className="badge badge-info">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-icon blue"><Clock size={24} /></div>
                  <div className="stat-info">
                    <h3>{data?.myAttendanceCount ?? '—'}</h3>
                    <p>Days Present</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><Calendar size={24} /></div>
                  <div className="stat-info">
                    <h3>{data?.myPendingLeaves ?? '—'}</h3>
                    <p>Pending Leaves</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><DollarSign size={24} /></div>
                  <div className="stat-info">
                    <h3 style={{ fontSize: '18px' }}>{formatCurrency(data?.netSalary)}</h3>
                    <p>Net Salary</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple"><TrendingUp size={24} /></div>
                  <div className="stat-info">
                    <h3 style={{ fontSize: '18px' }}>{formatCurrency(data?.basicSalary)}</h3>
                    <p>Basic Salary</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: '8px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#0f3460' }}>My Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    ['Employee ID', data?.employeeId],
                    ['Department', data?.department],
                    ['Designation', data?.designation],
                    ['Email', user?.email],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
