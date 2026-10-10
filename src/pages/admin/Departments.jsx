import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopNav from '../../components/common/TopNav';
import { departmentAPI } from '../../services/api';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchDepts = () => {
    departmentAPI.getAll()
      .then(res => setDepartments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setMessage({ type: 'error', text: 'Department name is required' }); return; }
    setSaving(true);
    try {
      if (editingId) {
        await departmentAPI.update(editingId, form);
        setMessage({ type: 'success', text: 'Department updated successfully!' });
      } else {
        await departmentAPI.create(form);
        setMessage({ type: 'success', text: 'Department created successfully!' });
      }
      setForm({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      fetchDepts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save department' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '' });
    setEditingId(dept.id);
    setShowForm(true);
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentAPI.delete(id);
      setMessage({ type: 'success', text: 'Department deleted' });
      fetchDepts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete department' });
    }
  };

  return (
    <div className="app-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopNav title="Departments" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Departments</h2><p>Manage company departments</p></div>
            <button className="btn btn-primary" id="add-dept-btn"
              onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '' }); setMessage({ type: '', text: '' }); }}>
              {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Department</>}
            </button>
          </div>

          {message.text && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>{message.text}</div>}

          {showForm && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>{editingId ? 'Edit Department' : 'New Department'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department Name *</label>
                    <input type="text" id="dept-name" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input type="text" id="dept-description" className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Department description" />
                  </div>
                </div>
                <button type="submit" id="save-dept-btn" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : <><Check size={16} /> {editingId ? 'Update Department' : 'Create Department'}</>}
                </button>
              </form>
            </div>
          )}

          <div className="table-container">
            <div className="table-header">
              <h3>All Departments</h3>
              <span className="badge badge-secondary">{departments.length} departments</span>
            </div>
            <div className="table-wrapper">
              {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
              ) : departments.length === 0 ? (
                <div className="empty-state"><Building2 size={48} /><h4>No departments yet</h4></div>
              ) : (
                <table>
                  <thead>
                    <tr><th>#</th><th>Department Name</th><th>Description</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {departments.map((dept, i) => (
                      <tr key={dept.id}>
                        <td style={{ color: '#64748b' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{dept.name}</td>
                        <td style={{ color: '#64748b' }}>{dept.description || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline btn-sm" id={`edit-dept-${dept.id}`} onClick={() => handleEdit(dept)}>
                              <Edit2 size={13} /> Edit
                            </button>
                            <button className="btn btn-danger btn-sm" id={`delete-dept-${dept.id}`} onClick={() => handleDelete(dept.id)}>
                              <Trash2 size={13} /> Delete
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

export default AdminDepartments;
