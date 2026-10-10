import React, { useState } from 'react';
import { BarChart2, Search } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { reportAPI } from '../../services/api';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const AdminReports = () => {
  const [tab, setTab] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'monthly') {
        res = await reportAPI.monthlyPayroll(form.month, form.year);
      } else if (tab === 'department') {
        res = await reportAPI.departmentPayroll();
      } else if (tab === 'attendance') {
        res = await reportAPI.attendance();
      } else {
        res = await reportAPI.leaves();
      }
      setReportData(res.data);
    } catch {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Payroll Reports" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Reports</h2><p>Generate and view payroll reports</p></div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { key: 'monthly', label: 'Monthly Payroll' },
              { key: 'department', label: 'Department-wise' },
              { key: 'attendance', label: 'Attendance' },
              { key: 'leaves', label: 'Leaves' },
            ].map(t => (
              <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setTab(t.key); setReportData(null); }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {tab === 'monthly' && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Month</label>
                    <select className="form-control" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                      {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Year</label>
                    <select className="form-control" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                      {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </>
              )}
              <button className="btn btn-primary" onClick={fetchReport} disabled={loading} id="generate-report-btn">
                {loading ? 'Generating...' : <><Search size={16} /> Generate Report</>}
              </button>
            </div>
          </div>

          {reportData && (
            <div className="card">
              {tab === 'monthly' && (
                <>
                  <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>
                    Monthly Report — {MONTHS[reportData.month]} {reportData.year}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {[
                      ['Employees', reportData.totalEmployees],
                      ['Basic Total', fmt(reportData.totalBasicSalary)],
                      ['Allowances', fmt(reportData.totalAllowances)],
                      ['Deductions', fmt(reportData.totalDeductions)],
                      ['Net Payroll', fmt(reportData.totalNetSalary)],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                        <p style={{ fontWeight: 800, color: '#0f3460', fontSize: '16px' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <table>
                    <thead>
                      <tr><th>Emp ID</th><th>Name</th><th>Department</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net</th></tr>
                    </thead>
                    <tbody>
                      {reportData.details?.map((d, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{d.employeeId}</td>
                          <td style={{ fontWeight: 600 }}>{d.employeeName}</td>
                          <td style={{ color: '#64748b' }}>{d.department}</td>
                          <td>{fmt(d.basicSalary)}</td>
                          <td style={{ color: '#10b981' }}>{fmt(d.allowances)}</td>
                          <td style={{ color: '#ef4444' }}>{fmt(d.deductions)}</td>
                          <td style={{ fontWeight: 700, color: '#0f3460' }}>{fmt(d.netSalary)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {tab === 'department' && (
                <>
                  <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Department-wise Payroll Report</h3>
                  <table>
                    <thead>
                      <tr><th>Department</th><th>Employees</th><th>Total Net Salary</th></tr>
                    </thead>
                    <tbody>
                      {reportData.departments?.map((d, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{d.departmentName}</td>
                          <td>{d.employeeCount}</td>
                          <td style={{ fontWeight: 700, color: '#0f3460' }}>{fmt(d.totalNetSalary)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {tab === 'attendance' && (
                <>
                  <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Attendance Report</h3>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {[
                      ['Total Records', reportData.totalRecords],
                      ['Present', reportData.presentCount],
                      ['Absent', reportData.absentCount],
                      ['Today Present', reportData.todayPresent],
                    ].map(([label, value]) => (
                      <div key={label} style={{ padding: '12px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', minWidth: '120px' }}>
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                        <p style={{ fontWeight: 800, color: '#0f3460', fontSize: '20px' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <table>
                    <thead>
                      <tr><th>Emp ID</th><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {reportData.details?.slice(0, 50).map((d, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{d.employeeId}</td>
                          <td>{d.employeeName}</td>
                          <td>{d.date}</td>
                          <td>{d.checkIn || '—'}</td>
                          <td>{d.checkOut || '—'}</td>
                          <td>{d.workingHours ? `${d.workingHours}h` : '—'}</td>
                          <td><span className={`badge ${d.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>{d.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {tab === 'leaves' && (
                <>
                  <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Leave Report</h3>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {[['Total', reportData.total], ['Pending', reportData.pending], ['Approved', reportData.approved], ['Rejected', reportData.rejected]].map(([label, value]) => (
                      <div key={label} style={{ padding: '12px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', minWidth: '100px' }}>
                        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                        <p style={{ fontWeight: 800, color: '#0f3460', fontSize: '20px' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <table>
                    <thead>
                      <tr><th>Emp ID</th><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {reportData.details?.map((d, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{d.employeeId}</td>
                          <td>{d.employeeName}</td>
                          <td><span className="badge badge-info">{d.leaveType}</span></td>
                          <td>{d.fromDate}</td>
                          <td>{d.toDate}</td>
                          <td>{d.days}</td>
                          <td><span className={`badge ${d.status === 'APPROVED' ? 'badge-success' : d.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{d.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
