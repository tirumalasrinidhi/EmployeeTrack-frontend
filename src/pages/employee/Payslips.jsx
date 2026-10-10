import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import TopNav from '../../components/common/TopNav';
import { payslipAPI } from '../../services/api';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const EmployeePayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    payslipAPI.getMine()
      .then(res => setPayslips(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (payslip) => {
    setDownloading(payslip.id);
    try {
      const res = await payslipAPI.download(payslip.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${MONTHS[payslip.month]}-${payslip.year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Payslip downloaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to download payslip' });
    } finally {
      setDownloading(null);
    }
  };

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-content">
        <TopNav title="Payslips" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2>My Payslips</h2>
              <p>Download your monthly payslips</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          <div className="table-container">
            <div className="table-header">
              <h3>Payslip History</h3>
              <span className="badge badge-secondary">{payslips.length} payslips</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : payslips.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <h4>No payslips available</h4>
                  <p>Payslips will appear here after payroll is processed</p>
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
                      <th>Net Salary</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{MONTHS[p.month]}</td>
                        <td>{p.year}</td>
                        <td>{fmt(p.basicSalary)}</td>
                        <td style={{ color: '#10b981' }}>+{fmt(p.allowances)}</td>
                        <td style={{ color: '#ef4444' }}>-{fmt(p.deductions)}</td>
                        <td style={{ fontWeight: 700, color: '#0f3460' }}>{fmt(p.netSalary)}</td>
                        <td>
                          <div className="payslip-actions">
                            <button
                              className="btn btn-primary btn-sm"
                              id={`download-payslip-${p.id}`}
                              onClick={() => handleDownload(p)}
                              disabled={downloading === p.id}
                            >
                              {downloading === p.id ? (
                                <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
                              ) : (
                                <Download size={14} />
                              )}
                              {downloading === p.id ? 'Downloading...' : 'Download PDF'}
                            </button>
                          </div>
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

export default EmployeePayslips;
