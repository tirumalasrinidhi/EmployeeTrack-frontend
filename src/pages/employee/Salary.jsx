import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { payrollAPI, employeeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeSalary = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch employee profile to check if salary is configured
      const [profileRes, payrollRes] = await Promise.all([
        employeeAPI.getMe(),
        payrollAPI.getMy(),
      ]);
      setProfile(profileRes.data);
      setPayrolls(payrollRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Employee profile not found. Please contact your administrator.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view salary information.');
      } else {
        setError('Failed to load salary data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if employee salary is configured (basicSalary > 0)
  const isSalaryConfigured = profile && (profile.basicSalary > 0);

  // Latest payroll record for the summary card
  const latestPayroll = payrolls.length > 0
    ? [...payrolls].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      })[0]
    : null;

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-content">
        <TopNav title="Salary Details" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Salary Details</h2>
              <p>View your monthly salary breakdown and payroll history</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={fetchData}
              disabled={loading}
              id="refresh-salary-btn"
              title="Refresh"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Salary not configured warning */}
          {!loading && !error && !isSalaryConfigured && (
            <div className="alert" style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #f59e0b',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#92400e',
              marginBottom: '20px'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong>Salary Not Configured</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                  Your salary details have not been set up yet. Please contact your administrator or HR team to configure your basic salary, allowances, and deductions. Once configured and payroll is processed, your salary records will appear here.
                </p>
              </div>
            </div>
          )}

          {/* Summary cards — only if salary is configured */}
          {!loading && !error && isSalaryConfigured && profile && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f3460, #1a5276)', color: 'white', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.8 }}>Basic Salary</span>
                  <DollarSign size={18} style={{ opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>{fmt(profile.basicSalary)}</div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>per month</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #065f46, #047857)', color: 'white', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.8 }}>Allowances</span>
                  <TrendingUp size={18} style={{ opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>+{fmt(profile.allowances)}</div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>per month</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', color: 'white', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.8 }}>Deductions</span>
                  <TrendingDown size={18} style={{ opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>-{fmt(profile.deductions)}</div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>per month</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #312e81, #4338ca)', color: 'white', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.8 }}>Net Salary</span>
                  <DollarSign size={18} style={{ opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>
                  {fmt((profile.basicSalary || 0) + (profile.allowances || 0) - (profile.deductions || 0))}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>take-home</div>
              </div>
            </div>
          )}

          {/* Payroll History table */}
          <div className="table-container">
            <div className="table-header">
              <h3>Payroll History</h3>
              <span className="badge badge-secondary">{payrolls.length} records</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : payrolls.length === 0 ? (
                <div className="empty-state">
                  <DollarSign size={48} />
                  <h4>No payroll records yet</h4>
                  <p>
                    {isSalaryConfigured
                      ? 'Your salary is configured. Payroll records will appear here once the Admin processes the monthly payroll.'
                      : 'Please ask your administrator to configure your salary and process payroll.'}
                  </p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Basic Salary</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Gross</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...payrolls]
                      .sort((a, b) => {
                        if (b.year !== a.year) return b.year - a.year;
                        return b.month - a.month;
                      })
                      .map(p => {
                        const gross = (p.basicSalary || 0) + (p.allowances || 0);
                        const hasZeroSalary = !p.basicSalary || p.basicSalary === 0;
                        return (
                          <tr key={p.id} style={hasZeroSalary ? { background: '#fffbeb' } : {}}>
                            <td style={{ fontWeight: 600 }}>{MONTHS[p.month]}</td>
                            <td>{p.year}</td>
                            <td>
                              {hasZeroSalary
                                ? <span style={{ color: '#f59e0b', fontStyle: 'italic' }}>Not set</span>
                                : fmt(p.basicSalary)}
                            </td>
                            <td style={{ color: '#10b981' }}>
                              {hasZeroSalary ? '—' : `+${fmt(p.allowances)}`}
                            </td>
                            <td style={{ color: '#ef4444' }}>
                              {hasZeroSalary ? '—' : `-${fmt(p.deductions)}`}
                            </td>
                            <td>{hasZeroSalary ? '—' : fmt(gross)}</td>
                            <td style={{ fontWeight: 700, color: hasZeroSalary ? '#f59e0b' : '#0f3460' }}>
                              {hasZeroSalary
                                ? <span title="Salary was not configured when payroll was processed">₹0.00 ⚠</span>
                                : fmt(p.netSalary)}
                            </td>
                            <td>
                              <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-info'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Explain zero records */}
          {!loading && payrolls.some(p => !p.basicSalary || p.basicSalary === 0) && (
            <div style={{
              marginTop: '12px',
              padding: '12px 16px',
              background: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#92400e',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                <strong>⚠ Records showing ₹0.00</strong> were processed before your salary was configured.
                Ask your administrator to re-process payroll for those months — the system will automatically correct the values.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalary;
