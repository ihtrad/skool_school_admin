import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Student, StudentInput } from '@/lib/types';
import { Modal } from '@/components/Modal';

const emptyForm: StudentInput = {
  name: '', grade: '6', section: 'A', roll_number: '', email: '',
  guardian_name: '', status: 'Active', credits: 0,
};

const grades = ['6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C'];

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error) setError(error.message); else setStudents(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.grade.includes(q) ||
      (s.email ?? '').toLowerCase().includes(q) ||
      (s.roll_number ?? '').toLowerCase().includes(q)
    );
  }, [students, search]);

  function openAdd() { setForm(emptyForm); setEditingId(null); setModalOpen(true); }
  function openEdit(s: Student) {
    setForm({ name: s.name, grade: s.grade, section: s.section, roll_number: s.roll_number ?? '',
      email: s.email ?? '', guardian_name: s.guardian_name ?? '', status: s.status, credits: s.credits });
    setEditingId(s.id); setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError(null);
    const payload = { ...form, credits: Number(form.credits) || 0 };
    const { error } = editingId
      ? await supabase.from('students').update(payload).eq('id', editingId)
      : await supabase.from('students').insert(payload);
    if (error) setError(error.message);
    else { setModalOpen(false); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('Delete this student?')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) setError(error.message); else await load();
  }

  return (
    <div className="page-view">
      <div className="view-head">
        <div>
          <h1><Users size={22} /> Students</h1>
          <p>{students.length} students enrolled</p>
        </div>
        <div className="view-actions">
          <div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, grade, roll no..." /></div>
          <button className="button button-primary" onClick={openAdd}><Plus size={15} /> Add Student</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        {loading ? (
          <div className="empty-state">Loading students…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No students found.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Grade</th><th>Section</th><th>Roll No</th><th>Email</th><th>Guardian</th><th>Credits</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><span className="avatar-sm">{s.name.split(' ').map(n => n[0]).slice(0,2).join('')}</span> {s.name}</td>
                    <td>Grade {s.grade}</td>
                    <td>{s.section}</td>
                    <td>{s.roll_number || '—'}</td>
                    <td>{s.email || '—'}</td>
                    <td>{s.guardian_name || '—'}</td>
                    <td><b className="credit-pill">{s.credits}</b></td>
                    <td><span className={`status-tag ${s.status === 'Active' ? 'green' : 'red'}`}>{s.status}</span></td>
                    <td><div className="row-actions">
                      <button onClick={() => openEdit(s)} aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => remove(s.id)} aria-label="Delete"><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editingId ? 'Edit Student' : 'Add Student'} onClose={() => setModalOpen(false)}
        footer={<>
          <button className="button button-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="button button-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>}>
        <div className="form-grid">
          <label className="field"><span>Full Name *</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field"><span>Grade</span>
            <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
              {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </label>
          <label className="field"><span>Section</span>
            <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="field"><span>Roll Number</span><input value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} /></label>
          <label className="field"><span>Email</span><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label className="field"><span>Guardian Name</span><input value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} /></label>
          <label className="field"><span>Credits</span><input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} /></label>
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
