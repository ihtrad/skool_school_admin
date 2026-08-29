import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Teacher, TeacherInput } from '@/lib/types';
import { Modal } from '@/components/Modal';

const emptyForm: TeacherInput = {
  name: '', subject: '', email: '', phone: '', experience_years: 0, status: 'Active',
};

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from('teachers').select('*').order('name');
    if (error) setError(error.message); else setTeachers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return teachers.filter(t =>
      t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || (t.email ?? '').toLowerCase().includes(q)
    );
  }, [teachers, search]);

  function openAdd() { setForm(emptyForm); setEditingId(null); setModalOpen(true); }
  function openEdit(t: Teacher) {
    setForm({ name: t.name, subject: t.subject, email: t.email ?? '', phone: t.phone ?? '', experience_years: t.experience_years, status: t.status });
    setEditingId(t.id); setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.subject.trim()) { setError('Name and subject are required'); return; }
    setSaving(true); setError(null);
    const payload = { ...form, experience_years: Number(form.experience_years) || 0 };
    const { error } = editingId
      ? await supabase.from('teachers').update(payload).eq('id', editingId)
      : await supabase.from('teachers').insert(payload);
    if (error) setError(error.message); else { setModalOpen(false); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('Delete this teacher?')) return;
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) setError(error.message); else await load();
  }

  return (
    <div className="page-view">
      <div className="view-head">
        <div>
          <h1><UserCheck size={22} /> Teachers</h1>
          <p>{teachers.length} teachers on staff</p>
        </div>
        <div className="view-actions">
          <div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, subject..." /></div>
          <button className="button button-primary" onClick={openAdd}><Plus size={15} /> Add Teacher</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        {loading ? <div className="empty-state">Loading teachers…</div>
        : filtered.length === 0 ? <div className="empty-state">No teachers found.</div>
        : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Subject</th><th>Email</th><th>Phone</th><th>Experience</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td><span className="avatar-sm">{t.name.split(' ').map(n => n[0]).slice(0,2).join('')}</span> {t.name}</td>
                    <td><span className="subject-tag">{t.subject}</span></td>
                    <td>{t.email || '—'}</td>
                    <td>{t.phone || '—'}</td>
                    <td>{t.experience_years} yrs</td>
                    <td><span className={`status-tag ${t.status === 'Active' ? 'green' : 'red'}`}>{t.status}</span></td>
                    <td><div className="row-actions">
                      <button onClick={() => openEdit(t)} aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => remove(t.id)} aria-label="Delete"><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editingId ? 'Edit Teacher' : 'Add Teacher'} onClose={() => setModalOpen(false)}
        footer={<>
          <button className="button button-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="button button-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>}>
        <div className="form-grid">
          <label className="field"><span>Full Name *</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field"><span>Subject *</span><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></label>
          <label className="field"><span>Email</span><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label className="field"><span>Phone</span><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="field"><span>Experience (years)</span><input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: Number(e.target.value) })} /></label>
          <label className="field"><span>Status</span>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
