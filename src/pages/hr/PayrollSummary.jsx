import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import HRSidebar from '../../components/hr/HRSidebar';
import TopNav from '../../components/common/TopNav';
import { reportAPI } from '../../services/api';

const HRPayrollSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.payrollSummary()
      .then(res => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="app-layout">
      <HRSidebar />
      <div className="main-content">
        <TopNav title="Payroll Summary" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Payroll Summary</h2><p>Organization-wide payroll overview</p></div>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : !summary ? (
            <div className="empty-state"><DollarSign size={48} /><h4>No data available</h4></div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-icon blue"><DollarSign size={24} /></div>
                  <div className="stat-info"><h3>{summary.totalEmployees}</h3><p>Total Employees</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><DollarSign size={24} /></div>
                  <div className="stat-info"><h3>{summary.activeEmployees}</h3><p>Active Employees</p></div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '20px' }}>Salary Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    ['Total Basic Salary', fmt(summary.totalBasicSalary), '#3b82f6'],
                    ['Total Allowances', fmt(summary.totalAllowances), '#10b981'],
                    ['Total Deductions', fmt(summary.totalDeductions), '#ef4444'],
                    ['Total Net Payroll', fmt(summary.totalNetPayroll), '#0f3460'],
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>{label}</p>
                      <p style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRPayrollSummary;
