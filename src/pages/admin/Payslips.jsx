import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { payslipAPI } from '../../services/api';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const AdminPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    payslipAPI.getAll()
      .then(res => setPayslips(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (payslip) => {
    setDownloading(payslip.id);
    try {
      const res = await payslipAPI.download(payslip.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payslip.employee?.employeeId}-${MONTHS[payslip.month]}-${payslip.year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Failed to download payslip' });
    } finally {
      setDownloading(null);
    }
  };

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Payslips" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Payslips</h2><p>View and download all employee payslips</p></div>
          </div>

          {message.text && <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>{message.text}</div>}

          <div className="table-container">
            <div className="table-header">
              <h3>All Payslips</h3>
              <span className="badge badge-secondary">{payslips.length} payslips</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : payslips.length === 0 ? (
                <div className="empty-state"><FileText size={48} /><h4>No payslips available</h4><p>Process payroll first to generate payslips</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Employee</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Basic</th>
                      <th>Allowances</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{p.employee?.employeeId}</td>
                        <td style={{ fontWeight: 600 }}>{p.employee?.user?.name}</td>
                        <td>{MONTHS[p.month]}</td>
                        <td>{p.year}</td>
                        <td>{fmt(p.basicSalary)}</td>
                        <td style={{ color: '#10b981' }}>+{fmt(p.allowances)}</td>
                        <td style={{ color: '#ef4444' }}>-{fmt(p.deductions)}</td>
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{fmt(p.netSalary)}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            id={`download-payslip-admin-${p.id}`}
                            onClick={() => handleDownload(p)}
                            disabled={downloading === p.id}
                          >
                            {downloading === p.id ? <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div> : <Download size={13} />}
                            {downloading === p.id ? 'Downloading...' : 'PDF'}
                          </button>
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

export default AdminPayslips;
