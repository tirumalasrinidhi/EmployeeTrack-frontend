import React, { useState, useEffect } from 'react';
import {
  Clock, Calendar, DollarSign, TrendingUp, TrendingDown,
  LogIn, LogOut, Minus, AlertCircle, Info
} from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { dashboardAPI, payrollAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.employee(),
      payrollAPI.getMySalaryInsights(),
    ])
      .then(([dashRes, insRes]) => {
        setData(dashRes.data);
        setInsights(insRes.data);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (val) =>
    val != null ? `₹ ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  const diffColor = (v) => (v > 0 ? '#10b981' : v < 0 ? '#ef4444' : '#64748b');
  const diffIcon  = (v) =>
    v > 0 ? <TrendingUp size={14} /> : v < 0 ? <TrendingDown size={14} /> : <Minus size={14} />;
  const diffLabel = (v, prefix = '₹') =>
    v === 0 ? '—' : `${v > 0 ? '+' : ''}${prefix}${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // Today's attendance from dashboard API
  const today = data?.todayAttendance;
  const checkedIn  = today?.checkIn  != null;
  const checkedOut = today?.checkOut != null;

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
            <span className="badge badge-info">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* ── Stat Cards ── */}
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
                    <h3 style={{ fontSize: '18px' }}>{fmt(data?.netSalary)}</h3>
                    <p>Net Salary</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple"><TrendingUp size={24} /></div>
                  <div className="stat-info">
                    <h3 style={{ fontSize: '18px' }}>{fmt(data?.basicSalary)}</h3>
                    <p>Basic Salary</p>
                  </div>
                </div>
              </div>

              {/* ── Today's Attendance card ── */}
              <div className="card" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#0f3460', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} /> Today's Attendance
                </h3>
                {!today ? (
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>No attendance record yet for today.</p>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '10px 16px', background: '#f0f4f8', borderRadius: '8px', minWidth: '130px' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LogIn size={12} /> Check In
                      </p>
                      <p style={{ fontWeight: 700, color: '#0f3460' }}>
                        {today.checkIn ?? '—'}
                      </p>
                    </div>
                    <div style={{ padding: '10px 16px', background: '#f0f4f8', borderRadius: '8px', minWidth: '130px' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LogOut size={12} /> Check Out
                      </p>
                      <p style={{ fontWeight: 700, color: checkedOut ? '#0f3460' : '#94a3b8' }}>
                        {checkedOut ? today.checkOut : 'Not checked out'}
                      </p>
                    </div>
                    <div style={{ padding: '10px 16px', background: '#f0f4f8', borderRadius: '8px', minWidth: '140px' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Working Duration</p>
                      <p style={{ fontWeight: 700, color: '#0f3460', fontFamily: 'monospace' }}>
                        {/* workingDuration is already "HH:mm:ss" from the backend */}
                        {today.workingDuration ?? '—'}
                      </p>
                    </div>
                    <div style={{ padding: '10px 16px', background: '#f0f4f8', borderRadius: '8px' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Status</p>
                      <span className={`badge ${today.status === 'PRESENT' ? 'badge-success' : today.status === 'ABSENT' ? 'badge-danger' : 'badge-info'}`}>
                        {today.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── My Information ── */}
              <div className="card" style={{ marginTop: '8px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#0f3460' }}>My Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    ['Employee ID',  data?.employeeId],
                    ['Department',   data?.department],
                    ['Designation',  data?.designation],
                    ['Email',        user?.email],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Salary Insights ── */}
              {insights && (
                <div className="card" style={{ marginTop: '8px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '4px', color: '#0f3460', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={18} /> Salary Insights
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Comparing your last two payroll records from the database
                  </p>

                  {!insights.hasInsights ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                      <Info size={16} />{insights.message}
                    </div>
                  ) : (
                    <>
                      {/* Current vs Previous period headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[['Previous', insights.previous], ['Current', insights.current]].map(([label, period]) => (
                          <div key={label} style={{ padding: '14px', background: label === 'Current' ? 'linear-gradient(135deg,#0f3460,#1a5276)' : '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', color: label === 'Current' ? 'white' : '#1e293b' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, marginBottom: '6px' }}>
                              {label} — {period ? period.label : 'No Record'}
                            </p>
                            {period ? (
                              <>
                                <p style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{fmt(period.netSalary)}</p>
                                {!period.salaryConfigured && (
                                  <span style={{ fontSize: '11px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px' }}>
                                    ₹0 — salary not configured
                                  </span>
                                )}
                              </>
                            ) : (
                              <p style={{ fontSize: '14px', opacity: 0.6 }}>No payroll record</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Component-level differences */}
                      {insights.hasPrevious && insights.diff && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Component Differences
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                            {[
                              ['Basic Salary',   insights.diff.basicSalary],
                              ['Allowances',     insights.diff.allowances],
                              ['Deductions',     insights.diff.deductions],
                              ['Net Salary',     insights.diff.netSalary],
                            ].map(([label, val]) => (
                              <div key={label} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: `1px solid ${val > 0 ? '#d1fae5' : val < 0 ? '#fee2e2' : '#e2e8f0'}` }}>
                                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>{label}</p>
                                <p style={{ fontWeight: 700, color: diffColor(val), display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {diffIcon(val)} {diffLabel(val)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Plain language explanation */}
                          <div style={{ padding: '12px 14px', background: insights.diff.direction === 'INCREASE' ? '#f0fdf4' : insights.diff.direction === 'DECREASE' ? '#fef2f2' : '#f8fafc', border: `1px solid ${insights.diff.direction === 'INCREASE' ? '#86efac' : insights.diff.direction === 'DECREASE' ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            {insights.diff.direction === 'INCREASE'
                              ? <TrendingUp size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
                              : insights.diff.direction === 'DECREASE'
                              ? <TrendingDown size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                              : <Info size={16} style={{ color: '#64748b', flexShrink: 0, marginTop: '1px' }} />}
                            <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>{insights.explanation}</p>
                          </div>
                        </>
                      )}

                      {/* Only one record exists */}
                      {!insights.hasPrevious && insights.message && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '13px' }}>
                          <AlertCircle size={15} />{insights.message}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
