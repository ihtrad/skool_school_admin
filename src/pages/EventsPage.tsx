import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SchoolEvent, EventInput } from '@/lib/types';
import { Modal } from '@/components/Modal';

const emptyForm: EventInput = {
  title: '', description: '', event_date: new Date().toISOString().slice(0, 10),
  location: '', category: 'Academic', status: 'Upcoming',
};

const categories = ['Academic', 'Sports', 'Cultural', 'General'];

export function EventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from('events').select('*').order('event_date');
    if (error) setError(error.message); else setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.location ?? '').toLowerCase().includes(q));
  }, [events, search]);

  function openAdd() { setForm(emptyForm); setEditingId(null); setModalOpen(true); }
  function openEdit(e: SchoolEvent) {
    setForm({ title: e.title, description: e.description ?? '', event_date: e.event_date, location: e.location ?? '', category: e.category, status: e.status });
    setEditingId(e.id); setModalOpen(true);
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError(null);
    const { error } = editingId
      ? await supabase.from('events').update(form).eq('id', editingId)
      : await supabase.from('events').insert(form);
    if (error) setError(error.message); else { setModalOpen(false); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) setError(error.message); else await load();
  }

  return (
    <div className="page-view">
      <div className="view-head">
        <div>
          <h1><CalendarDays size={22} /> Events</h1>
          <p>{events.length} events scheduled</p>
        </div>
        <div className="view-actions">
          <div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." /></div>
          <button className="button button-primary" onClick={openAdd}><Plus size={15} /> Add Event</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? <div className="empty-state">Loading events…</div>
      : filtered.length === 0 ? <div className="empty-state panel">No events found.</div>
      : (
        <div className="event-grid">
          {filtered.map(e => (
            <article className="event-card" key={e.id}>
              <div className={`event-cat-tag ${e.category.toLowerCase()}`}>{e.category}</div>
              <h3>{e.title}</h3>
              {e.description && <p>{e.description}</p>}
              <div className="event-meta">
                <span><CalendarDays size={13} /> {new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {e.location && <span><MapPin size={13} /> {e.location}</span>}
                <span className={`status-tag ${e.status === 'Upcoming' ? 'blue' : 'gray'}`}>{e.status}</span>
              </div>
              <div className="row-actions event-actions">
                <button onClick={() => openEdit(e)} aria-label="Edit"><Pencil size={14} /> Edit</button>
                <button onClick={() => remove(e.id)} aria-label="Delete"><Trash2 size={14} /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editingId ? 'Edit Event' : 'Add Event'} onClose={() => setModalOpen(false)}
        footer={<>
          <button className="button button-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="button button-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>}>
        <div className="form-grid">
          <label className="field full"><span>Event Title *</span><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label className="field full"><span>Description</span><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label className="field"><span>Date</span><input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} /></label>
          <label className="field"><span>Location</span><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label>
          <label className="field"><span>Category</span>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="field"><span>Status</span>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Upcoming">Upcoming</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
