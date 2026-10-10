import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Play, AlertTriangle, CheckCircle, Settings,
  Users, RefreshCw, Save, X
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { payrollAPI, employeeAPI } from '../../services/api';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const AdminPayroll = () => {
  const [activeTab, setActiveTab] = useState('process'); // 'process' | 'configure'
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [salaryConfigStatus, setSalaryConfigStatus] = useState(null);
  const now = new Date();
  const [form, setForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  // Salary configuration state
  const [editingSalary, setEditingSalary] = useState(null);
  const [salaryForm, setSalaryForm] = useState({ basicSalary: '', allowances: '', deductions: '' });
  const [savingSalary, setSavingSalary] = useState(false);
  const [correcting, setCorrecting] = useState(false);

  const fetchPayrolls = useCallback(async () => {
    try {
      const res = await payrollAPI.getAll();
      setPayrolls(res.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data.filter(e => e.active));
    } catch {
      // ignore
    }
  }, []);

  const fetchSalaryConfigStatus = useCallback(async () => {
    try {
      const res = await payrollAPI.getSalaryConfigStatus();
      setSalaryConfigStatus(res.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPayrolls(), fetchEmployees(), fetchSalaryConfigStatus()]);
    setLoading(false);
  }, [fetchPayrolls, fetchEmployees, fetchSalaryConfigStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleProcess = async () => {
    setProcessing(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await payrollAPI.process({ month: parseInt(form.month), year: parseInt(form.year) });
      const data = res.data;
      const payrollList = data.payrolls || data;
      const warning = data.warning || '';
      const zeroCount = data.zeroSalaryCount || 0;

      let text = `Payroll processed for ${MONTHS[form.month]} ${form.year}! ${Array.isArray(payrollList) ? payrollList.length : '?'} employees processed.`;
      if (warning) text += ` ⚠ ${warning}`;

      setMessage({
        type: zeroCount > 0 ? 'warning' : 'success',
        text
      });
      await fetchAll();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Failed to process payroll';
      setMessage({ type: 'error', text: typeof errMsg === 'string' ? errMsg : 'Failed to process payroll' });
    } finally {
      setProcessing(false);
    }
  };

  const handleCorrect = async (month, year, forcePaid = false) => {
    if (forcePaid) {
      const confirmed = window.confirm(
        `⚠ Warning: You are about to correct a PAID payroll record for ${MONTHS[month]} ${year}.\n\n` +
        `This is an authorized override. The record will be updated with the employee's current configured salary.\n\n` +
        `Are you sure you want to proceed?`
      );
      if (!confirmed) return;
    }
    setCorrecting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await payrollAPI.correct({ month, year, forcePaid });
      const data = res.data;
      const correctedCount = data.correctedCount || 0;
      const skippedCount = data.skippedCount || 0;
      const alreadyCorrectCount = data.alreadyCorrectCount || 0;

      let text = `Correction complete for ${MONTHS[month]} ${year}: `;
      if (correctedCount > 0) text += `${correctedCount} record(s) corrected with actual salary values. `;
      if (alreadyCorrectCount > 0) text += `${alreadyCorrectCount} already had correct values. `;
      if (skippedCount > 0) {
        text += `${skippedCount} PAID record(s) were skipped — use Force Fix to override.`;
        setMessage({ type: 'warning', text });
      } else {
        setMessage({ type: correctedCount > 0 ? 'success' : 'warning', text });
      }
      await fetchAll();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Correction failed';
      setMessage({ type: 'error', text: typeof errMsg === 'string' ? errMsg : 'Correction failed' });
    } finally {
      setCorrecting(false);
    }
  };

  const handleEditSalary = (emp) => {
    setEditingSalary(emp.id);
    setSalaryForm({
      basicSalary: emp.basicSalary || '',
      allowances: emp.allowances || '',
      deductions: emp.deductions || ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSaveSalary = async () => {
    if (!salaryForm.basicSalary || parseFloat(salaryForm.basicSalary) <= 0) {
      setMessage({ type: 'error', text: 'Basic salary must be greater than zero.' });
      return;
    }
    setSavingSalary(true);
    try {
      await employeeAPI.updateSalary(editingSalary, {
        basicSalary: parseFloat(salaryForm.basicSalary),
        allowances: parseFloat(salaryForm.allowances) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0
      });
      setMessage({ type: 'success', text: 'Salary configuration saved successfully! You can now process payroll for this employee.' });
      setEditingSalary(null);
      await fetchAll();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save salary configuration';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSavingSalary(false);
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const unconfiguredEmployees = employees.filter(e => !e.basicSalary || e.basicSalary === 0);
  const configuredEmployees = employees.filter(e => e.basicSalary && e.basicSalary > 0);

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Payroll Management" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>Payroll Management</h2>
              <p>Configure employee salaries and process monthly payroll</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={fetchAll}
              disabled={loading}
              id="refresh-payroll-btn"
              title="Refresh"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Alert messages */}
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : message.type === 'warning' ? '' : 'alert-error'}`}
              style={message.type === 'warning' ? {
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '1px solid #f59e0b',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '10px',
                padding: '14px 18px',
                color: '#92400e',
                marginBottom: '16px',
                fontSize: '14px'
              } : { marginBottom: '16px' }}
            >
              {message.text}
            </div>
          )}

          {/* Salary not configured warning banner */}
          {salaryConfigStatus && salaryConfigStatus.employeesWithoutSalary > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #f59e0b',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e' }}>
                <AlertTriangle size={20} />
                <div>
                  <strong>{salaryConfigStatus.employeesWithoutSalary} employee(s) have no salary configured.</strong>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px' }}>
                    Processing payroll without salary configuration will result in ₹0.00 values.
                    Configure salary first using the <strong>Salary Configuration</strong> tab.
                  </p>
                </div>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => setActiveTab('configure')}
                style={{ background: '#f59e0b', color: 'white', border: 'none', whiteSpace: 'nowrap' }}
              >
                <Settings size={14} />
                Configure Salaries
              </button>
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '24px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '0'
          }}>
            {[
              { id: 'process', label: 'Process Payroll', icon: Play },
              { id: 'configure', label: `Salary Configuration ${unconfiguredEmployees.length > 0 ? `(${unconfiguredEmployees.length} pending)` : '✓'}`, icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: activeTab === tab.id ? '#0f3460' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  marginBottom: '-2px',
                  borderBottom: activeTab === tab.id ? '2px solid #0f3460' : 'none'
                }}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* === PROCESS PAYROLL TAB === */}
          {activeTab === 'process' && (
            <>
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '8px' }}>Process Monthly Payroll</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                  Select month and year to calculate payroll for all active employees. Employees with existing payroll
                  records for the same month/year will have their records updated if salary was previously zero.
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ marginBottom: 0, minWidth: '160px' }}>
                    <label className="form-label">Month</label>
                    <select className="form-control" value={form.month}
                      onChange={e => setForm({ ...form, month: e.target.value })} id="payroll-month">
                      {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, minWidth: '120px' }}>
                    <label className="form-label">Year</label>
                    <select className="form-control" value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })} id="payroll-year">
                      {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    id="process-payroll-btn"
                    onClick={handleProcess}
                    disabled={processing}
                  >
                    {processing ? (
                      <><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Processing...</>
                    ) : (
                      <><Play size={18} /> Calculate Monthly Payroll</>
                    )}
                  </button>
                </div>

                {/* Info: employees with salary configured */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 14px', background: '#f0fdf4', borderRadius: '8px',
                    border: '1px solid #86efac', fontSize: '13px', color: '#15803d'
                  }}>
                    <CheckCircle size={14} />
                    <span><strong>{configuredEmployees.length}</strong> employees with salary configured</span>
                  </div>
                  {unconfiguredEmployees.length > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 14px', background: '#fffbeb', borderRadius: '8px',
                      border: '1px solid #fcd34d', fontSize: '13px', color: '#92400e'
                    }}>
                      <AlertTriangle size={14} />
                      <span><strong>{unconfiguredEmployees.length}</strong> employees missing salary config</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payroll Records Table */}
              <div className="table-container">
                <div className="table-header">
                  <h3>Payroll Records</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="badge badge-secondary">{payrolls.length} records</span>
                    {payrolls.some(p => !p.basicSalary || p.basicSalary === 0) && (
                      <button
                        className="btn btn-sm"
                        id="correct-all-btn"
                        onClick={() => {
                          // Find the most recent month/year that has zero records
                          const zeroRecords = payrolls.filter(p => !p.basicSalary || p.basicSalary === 0);
                          // Group by month/year and correct each group
                          const groups = {};
                          zeroRecords.forEach(p => {
                            const key = `${p.month}-${p.year}`;
                            if (!groups[key]) groups[key] = { month: p.month, year: p.year };
                          });
                          // Correct the first group (most common case: one month has zero records)
                          const firstGroup = Object.values(groups)[0];
                          if (firstGroup) handleCorrect(firstGroup.month, firstGroup.year, false);
                        }}
                        disabled={correcting}
                        style={{ background: '#f59e0b', color: 'white', border: 'none', fontSize: '12px' }}
                      >
                        {correcting
                          ? <><div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div> Correcting...</>
                          : <>⚠ Correct Zero Records</>}
                      </button>
                    )}
                  </div>
                </div>
                <div className="table-wrapper">
                  {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : payrolls.length === 0 ? (
                    <div className="empty-state">
                      <DollarSign size={48} />
                      <h4>No payroll records yet</h4>
                      <p>Process monthly payroll above to generate records</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Emp ID</th>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Month / Year</th>
                          <th>Basic Salary</th>
                          <th>Allowances</th>
                          <th>Deductions</th>
                          <th>Net Salary</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...payrolls]
                          .sort((a, b) => {
                            if (b.year !== a.year) return b.year - a.year;
                            return b.month - a.month;
                          })
                          .map(p => {
                            const isZero = !p.basicSalary || p.basicSalary === 0;
                            return (
                              <tr key={p.id} style={isZero ? { background: '#fffbeb' } : {}}>
                                <td style={{ fontWeight: 700, color: '#0f3460' }}>{p.employeeId}</td>
                                <td style={{ fontWeight: 600 }}>{p.employeeName}</td>
                                <td style={{ color: '#64748b' }}>{p.departmentName || '—'}</td>
                                <td>{MONTHS[p.month]} {p.year}</td>
                                <td>
                                  {isZero
                                    ? <span style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Not set</span>
                                    : fmt(p.basicSalary)}
                                </td>
                                <td style={{ color: '#10b981' }}>{isZero ? '—' : `+${fmt(p.allowances)}`}</td>
                                <td style={{ color: '#ef4444' }}>{isZero ? '—' : `-${fmt(p.deductions)}`}</td>
                                <td style={{ fontWeight: 700, color: isZero ? '#f59e0b' : '#0f3460' }}>
                                  {isZero ? '₹0.00 ⚠' : fmt(p.netSalary)}
                                </td>
                                <td>
                                  <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-info'}`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td>
                                  {isZero ? (
                                    <button
                                      className="btn btn-sm"
                                      id={`fix-payroll-${p.id}`}
                                      onClick={() => handleCorrect(
                                        p.month, p.year,
                                        p.status === 'PAID' // forcePaid automatically set for PAID records
                                      )}
                                      disabled={correcting}
                                      title={p.status === 'PAID'
                                        ? 'Force-correct this PAID record with current salary values'
                                        : 'Correct this record with current salary values'}
                                      style={{
                                        background: p.status === 'PAID' ? '#dc2626' : '#f59e0b',
                                        color: 'white', border: 'none', fontSize: '11px',
                                        padding: '4px 8px'
                                      }}
                                    >
                                      {p.status === 'PAID' ? '⚠ Force Fix' : '⚠ Fix'}
                                    </button>
                                  ) : (
                                    <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Correct</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {payrolls.some(p => !p.basicSalary || p.basicSalary === 0) && (
                <div style={{
                  marginTop: '12px', padding: '12px 16px',
                  background: '#fffbeb', border: '1px solid #fcd34d',
                  borderRadius: '8px', fontSize: '13px', color: '#92400e',
                  display: 'flex', gap: '8px', alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>
                    Records marked ⚠ were processed with ₹0 salary. Go to the <strong>Salary Configuration</strong> tab, configure the employee's salary, then re-process payroll for the same month — the system will automatically update zero-value records.
                  </span>
                </div>
              )}
            </>
          )}

          {/* === SALARY CONFIGURATION TAB === */}
          {activeTab === 'configure' && (
            <>
              {/* Salary Edit Modal */}
              {editingSalary && (
                <div className="modal-overlay" onClick={() => setEditingSalary(null)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Configure Salary</h3>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditingSalary(null)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="modal-body">
                      {(() => {
                        const emp = employees.find(e => e.id === editingSalary);
                        return emp ? (
                          <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 700, color: '#0f3460' }}>{emp.name}</div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{emp.employeeId} · {emp.designation} · {emp.departmentName || 'No Department'}</div>
                          </div>
                        ) : null;
                      })()}
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Basic Salary (₹) *</label>
                          <input
                            type="number"
                            className="form-control"
                            id="salary-basic"
                            placeholder="e.g. 50000"
                            min="1"
                            value={salaryForm.basicSalary}
                            onChange={e => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                          />
                          <small style={{ color: '#64748b', fontSize: '12px' }}>Required. Must be greater than zero.</small>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Allowances (₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="salary-allowances"
                            placeholder="e.g. 10000"
                            min="0"
                            value={salaryForm.allowances}
                            onChange={e => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                          />
                          <small style={{ color: '#64748b', fontSize: '12px' }}>HRA, transport, etc.</small>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Deductions (₹)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="salary-deductions"
                            placeholder="e.g. 5000"
                            min="0"
                            value={salaryForm.deductions}
                            onChange={e => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                          />
                          <small style={{ color: '#64748b', fontSize: '12px' }}>PF, tax, insurance, etc.</small>
                        </div>
                      </div>
                      {/* Preview */}
                      {salaryForm.basicSalary > 0 && (
                        <div style={{
                          padding: '12px', background: '#f0fdf4', border: '1px solid #86efac',
                          borderRadius: '8px', marginTop: '8px'
                        }}>
                          <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, marginBottom: '6px' }}>
                            Preview Calculation:
                          </div>
                          <div style={{ fontSize: '13px', color: '#374151', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <span>Gross = {fmt((parseFloat(salaryForm.basicSalary) || 0) + (parseFloat(salaryForm.allowances) || 0))}</span>
                            <span style={{ fontWeight: 700, color: '#0f3460' }}>
                              Net = {fmt(
                                (parseFloat(salaryForm.basicSalary) || 0) +
                                (parseFloat(salaryForm.allowances) || 0) -
                                (parseFloat(salaryForm.deductions) || 0)
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-ghost" onClick={() => setEditingSalary(null)}>Cancel</button>
                      <button
                        className="btn btn-primary"
                        id="save-salary-btn"
                        onClick={handleSaveSalary}
                        disabled={savingSalary}
                      >
                        {savingSalary ? 'Saving...' : <><Save size={14} /> Save Salary</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '6px' }}>Configure Employee Salaries</h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  Set basic salary, allowances, and deductions for each employee before processing payroll.
                  Net Salary = Basic Salary + Allowances − Deductions.
                </p>
              </div>

              {/* Unconfigured employees */}
              {unconfiguredEmployees.length > 0 && (
                <div className="table-container" style={{ marginBottom: '20px' }}>
                  <div className="table-header" style={{ background: '#fffbeb' }}>
                    <h3 style={{ color: '#92400e' }}>
                      <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      Salary Not Configured ({unconfiguredEmployees.length})
                    </h3>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Emp ID</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Designation</th>
                          <th>Basic Salary</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unconfiguredEmployees.map(emp => (
                          <tr key={emp.id} style={{ background: '#fffbeb' }}>
                            <td style={{ fontWeight: 700, color: '#92400e' }}>{emp.employeeId}</td>
                            <td style={{ fontWeight: 600 }}>{emp.name}</td>
                            <td>{emp.departmentName || '—'}</td>
                            <td>{emp.designation || '—'}</td>
                            <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>⚠ Not configured</span></td>
                            <td>
                              <button
                                className="btn btn-warning btn-sm"
                                id={`configure-salary-${emp.id}`}
                                onClick={() => handleEditSalary(emp)}
                              >
                                <Settings size={13} />
                                Configure
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Configured employees */}
              <div className="table-container">
                <div className="table-header">
                  <h3>
                    <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', color: '#10b981' }} />
                    Salary Configured ({configuredEmployees.length})
                  </h3>
                </div>
                <div className="table-wrapper">
                  {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : configuredEmployees.length === 0 ? (
                    <div className="empty-state">
                      <Users size={48} />
                      <h4>No employees with salary configured</h4>
                      <p>Configure salary for employees above before processing payroll</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Emp ID</th>
                          <th>Name</th>
                          <th>Department</th>
                          <th>Basic Salary</th>
                          <th>Allowances</th>
                          <th>Deductions</th>
                          <th>Net Salary</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {configuredEmployees.map(emp => (
                          <tr key={emp.id}>
                            <td style={{ fontWeight: 700, color: '#0f3460' }}>{emp.employeeId}</td>
                            <td style={{ fontWeight: 600 }}>{emp.name}</td>
                            <td style={{ color: '#64748b' }}>{emp.departmentName || '—'}</td>
                            <td>{fmt(emp.basicSalary)}</td>
                            <td style={{ color: '#10b981' }}>+{fmt(emp.allowances)}</td>
                            <td style={{ color: '#ef4444' }}>-{fmt(emp.deductions)}</td>
                            <td style={{ fontWeight: 700, color: '#0f3460' }}>
                              {fmt((emp.basicSalary || 0) + (emp.allowances || 0) - (emp.deductions || 0))}
                            </td>
                            <td>
                              <button
                                className="btn btn-outline btn-sm"
                                id={`edit-salary-${emp.id}`}
                                onClick={() => handleEditSalary(emp)}
                              >
                                <Settings size={13} />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayroll;
