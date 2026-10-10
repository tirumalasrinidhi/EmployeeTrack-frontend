import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, DollarSign } from 'lucide-react';
import HRSidebar from '../../components/hr/HRSidebar';
import TopNav from '../../components/common/TopNav';
import { dashboardAPI } from '../../services/api';

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.hr()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const summary = data?.payrollSummary;

  return (
    <div className="app-layout">
      <HRSidebar />
      <div className="main-content">
        <TopNav title="HR Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>HR Dashboard</h2><p>Human Resources Management Overview</p></div>
            <span className="badge badge-info">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-icon blue"><Users size={24} /></div>
                  <div className="stat-info"><h3>{data?.totalEmployees ?? '—'}</h3><p>Total Employees</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><Users size={24} /></div>
                  <div className="stat-info"><h3>{data?.presentToday ?? '—'}</h3><p>Present Today</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><Calendar size={24} /></div>
                  <div className="stat-info"><h3>{data?.pendingLeaves ?? '—'}</h3><p>Pending Leaves</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple"><DollarSign size={24} /></div>
                  <div className="stat-info">
                    <h3 style={{ fontSize: '18px' }}>{fmt(summary?.totalNetPayroll)}</h3>
                    <p>Total Net Payroll</p>
                  </div>
                </div>
              </div>

              {summary && (
                <div className="card">
                  <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Payroll Overview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    {[
                      ['Active Employees', summary.activeEmployees],
                      ['Total Basic', fmt(summary.totalBasicSalary)],
                      ['Total Allowances', fmt(summary.totalAllowances)],
                      ['Total Deductions', fmt(summary.totalDeductions)],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f3460' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
