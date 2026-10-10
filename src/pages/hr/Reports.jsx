import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import HRSidebar from '../../components/hr/HRSidebar';
import TopNav from '../../components/common/TopNav';
import { reportAPI } from '../../services/api';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const HRReports = () => {
  const [tab, setTab] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'monthly') res = await reportAPI.monthlyPayroll(form.month, form.year);
      else res = await reportAPI.departmentPayroll();
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
      <HRSidebar />
      <div className="main-content">
        <TopNav title="Generate Reports" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Generate Reports</h2><p>Create and export reports</p></div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button className={`btn ${tab === 'monthly' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setTab('monthly'); setReportData(null); }}>Monthly Report</button>
            <button className={`btn ${tab === 'department' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setTab('department'); setReportData(null); }}>Department-wise</button>
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
              <button className="btn btn-primary" onClick={fetchReport} disabled={loading} id="hr-generate-report-btn">
                {loading ? 'Generating...' : <><Search size={16} /> Generate</>}
              </button>
            </div>
          </div>

          {reportData && tab === 'monthly' && (
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>
                Monthly Payroll — {MONTHS[reportData.month]} {reportData.year}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {[['Employees', reportData.totalEmployees], ['Net Payroll', fmt(reportData.totalNetSalary)]].map(([label, value]) => (
                  <div key={label} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                    <p style={{ fontWeight: 800, color: '#0f3460', fontSize: '18px' }}>{value}</p>
                  </div>
                ))}
              </div>
              <table>
                <thead><tr><th>Emp ID</th><th>Name</th><th>Department</th><th>Basic</th><th>Net Salary</th></tr></thead>
                <tbody>
                  {reportData.details?.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{d.employeeId}</td>
                      <td>{d.employeeName}</td>
                      <td style={{ color: '#64748b' }}>{d.department}</td>
                      <td>{fmt(d.basicSalary)}</td>
                      <td style={{ fontWeight: 700, color: '#0f3460' }}>{fmt(d.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportData && tab === 'department' && (
            <div className="card">
              <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>Department-wise Report</h3>
              <table>
                <thead><tr><th>Department</th><th>Employees</th><th>Total Net Salary</th></tr></thead>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRReports;
