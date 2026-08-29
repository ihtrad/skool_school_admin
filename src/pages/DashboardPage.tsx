import { useEffect, useState } from 'react';
import {
  Activity, Award, BarChart3, CalendarDays, ChevronRight, Clock3, Download, FileText,
  Filter, GraduationCap, MoreHorizontal, Sparkles, Star, TrendingUp, UserCheck, Users,
  Zap, MessageSquare, Bell, ShieldCheck, AlarmClock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SchoolEvent, Student } from '@/lib/types';

type Tone = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan';

function IconBadge({ icon: Icon, tone = 'purple', small = false }: { icon: typeof Users; tone?: Tone; small?: boolean }) {
  return <span className={`icon-badge ${tone} ${small ? 'small' : ''}`}><Icon size={small ? 14 : 20} strokeWidth={2.2} /></span>;
}

export function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, events: 0, totalCredits: 0, activeStudents: 0 });
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, t, e, sc] = await Promise.all([
        supabase.from('students').select('id, credits, status, name, grade, section, created_at'),
        supabase.from('teachers').select('id, status'),
        supabase.from('events').select('*').order('event_date').limit(4),
        supabase.from('students').select('*').order('created_at', { ascending: false }).limit(4),
      ]);
      const students = s.data ?? [];
      setCounts({
        students: students.length,
        teachers: t.data?.length ?? 0,
        events: e.data?.length ?? 0,
        totalCredits: students.reduce((sum, st) => sum + (st.credits ?? 0), 0),
        activeStudents: students.filter(st => st.status === 'Active').length,
      });
      setUpcomingEvents(e.data ?? []);
      setRecentStudents(sc.data ?? []);
      setLoading(false);
    })();
  }, []);

  const stats: { label: string; value: string; icon: typeof Users; tone: Tone; page?: string }[] = [
    { label: 'Total Students', value: String(counts.students), icon: Users, tone: 'purple', page: 'Students' },
    { label: 'Total Teachers', value: String(counts.teachers), icon: UserCheck, tone: 'blue', page: 'Teachers' },
    { label: 'Active Students', value: String(counts.activeStudents), icon: Activity, tone: 'green' },
    { label: 'Attendance Rate', value: '92.6%', icon: GraduationCap, tone: 'orange' },
    { label: 'Total Credits Earned', value: counts.totalCredits.toLocaleString(), icon: Award, tone: 'pink', page: 'Students' },
    { label: 'Active Events', value: String(counts.events), icon: CalendarDays, tone: 'cyan', page: 'Events' },
    { label: 'Scholarship Eligible', value: '236', icon: GraduationCap, tone: 'purple' },
    { label: 'Gold Crown Candidates', value: '32', icon: Award, tone: 'orange' },
  ];

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div><h1>Welcome back, Admin! <span>👋</span></h1><p>Here's a live overview of your school's performance.</p></div>
        <div className="welcome-actions"><button className="button button-primary"><Download size={15} /> Export Dashboard PDF</button><button className="button button-outline"><Filter size={15} /> Dashboard Filters</button></div>
      </section>

      {loading ? <div className="empty-state panel">Loading dashboard data…</div> : (
        <>
          <section className="stats-grid">
            {stats.map(({ label, value, icon: Icon, tone, page }) => (
              <article className={`stat-card ${tone}`} key={label} onClick={() => page && onNavigate(page)} style={{ cursor: page ? 'pointer' : 'default' }}>
                <div className="stat-top"><IconBadge icon={Icon} tone={tone} /><span>{label}</span></div>
                <strong className="stat-value">{value}</strong>
                <div className="stat-change"><TrendingUp size={13} /> <b>Live</b><span>from database</span></div>
              </article>
            ))}
          </section>

          <section className="panel performance-panel">
            <div className="panel-heading"><div><IconBadge icon={GraduationCap} small /><h2>Academic Performance</h2></div><button className="panel-menu"><MoreHorizontal size={18} /></button></div>
            <div className="performance-grid">
              <div className="pass-score"><span className="eyebrow">School Pass Percentage</span><strong>94.2%</strong><small><TrendingUp size={12} /> 3.6% from last year</small>
                <div className="line-chart">
                  <div className="y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
                  <svg viewBox="0 0 310 150" role="img" aria-label="Pass percentage trend">
                    <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".25" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
                    <path d="M22 110 C50 60, 65 62, 90 58 S132 72, 153 54 S208 40, 235 25 S269 25, 295 15 L295 140 L22 140Z" fill="url(#area)" />
                    <path d="M22 110 C50 60, 65 62, 90 58 S132 72, 153 54 S208 40, 235 25 S269 25, 295 15" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
                    {[[22,110],[50,60],[90,58],[153,54],[208,40],[235,25],[295,15]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#fff" stroke="#8b5cf6" strokeWidth="3" />)}
                  </svg>
                  <div className="x-labels"><span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span></div>
                </div>
              </div>
              <div className="subject-list"><span className="eyebrow">Subject-wise Average</span>
                {[['English','88%','purple'],['Mathematics','91%','blue'],['Science','93%','green'],['Social Studies','87%','orange'],['Computer','95%','cyan']].map(([subject, value, tone]) => (
                  <div className="subject-row" key={subject}><span>{subject}</span><div className={`progress ${tone}`}><i style={{ width: value }} /></div><b>{value}</b></div>
                ))}
              </div>
              <div className="class-chart"><span className="eyebrow">Class-wise Average</span>
                <div className="bar-chart"><div className="bar-y"><span>100%</span><span>50%</span><span>0%</span></div>
                  <div className="bars">{[['6','89%','purple'],['7','91%','blue'],['8','92%','green'],['9','93%','orange'],['10','90%','pink'],['11','94%','cyan'],['12','95%','purple']].map(([grade, value, tone]) => (
                    <div className="bar-wrap" key={grade}><b>{value}</b><i className={tone} style={{ height: value }} /><span>{grade}</span></div>
                  ))}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel activity-panel">
            <div className="panel-heading"><div><IconBadge icon={Sparkles} small tone="purple" /><h2>Activity Summary</h2></div></div>
            <div className="activity-grid">
              {[['Sports Participation','534 Students','green',Award],['Talent Participation','412 Students','orange',Star],['Event Participation','678 Students','blue',CalendarDays],['Community Posts','245 Posts','purple',MessageSquare]].map(([title, count, tone, icon]) => (
                <div className="activity-item" key={title as string}><IconBadge icon={icon as typeof Users} tone={tone as Tone} /><div><strong>{title as string}</strong><span>{count as string}</span><div className={`mini-progress ${tone}`}><i style={{ width: title === 'Event Participation' ? '84%' : title === 'Community Posts' ? '64%' : title === 'Sports Participation' ? '78%' : '68%' }} /></div></div></div>
              ))}
            </div>
          </section>

          <section className="lower-grid">
            <div className="panel list-panel">
              <div className="panel-heading"><div><IconBadge icon={Clock3} small tone="purple" /><h2>Recent Students</h2></div><button className="text-link" onClick={() => onNavigate('Students')}>View All</button></div>
              <div className="activity-list">
                {recentStudents.length === 0 ? <div className="empty-state">No students yet.</div> : recentStudents.map(s => (
                  <div className="list-row" key={s.id}>
                    <span className="avatar-sm">{s.name.split(' ').map(n => n[0]).slice(0,2).join('')}</span>
                    <div><strong>{s.name}</strong><span>Grade {s.grade}-{s.section}</span></div>
                    <time>{new Date(s.created_at).toLocaleDateString()}</time>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel quick-panel">
              <div className="panel-heading"><div><IconBadge icon={Zap} small tone="purple" /><h2>Quick Actions</h2></div></div>
              <div className="quick-grid">
                {[['Add Student','Students',UserCheck,'purple'],['Add Teacher','Teachers',Users,'blue'],['View Events','Events',CalendarDays,'green'],['Approvals','Approvals',ShieldCheck,'orange'],['Reports','Reports',FileText,'pink']].map(([label, page, icon, tone]) => (
                  <button className="quick-action" key={label as string} onClick={() => onNavigate(page as string)}>
                    <IconBadge icon={icon as typeof Users} tone={tone as Tone} /><span>{label as string}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel schedule-panel">
              <div className="panel-heading"><div><IconBadge icon={CalendarDays} small tone="purple" /><h2>Upcoming Events</h2></div><button className="text-link" onClick={() => onNavigate('Events')}>View Calendar</button></div>
              <div className="schedule-list">
                {upcomingEvents.length === 0 ? <div className="empty-state">No events scheduled.</div> : upcomingEvents.map(e => (
                  <div className="schedule-row" key={e.id}>
                    <IconBadge icon={CalendarDays} tone="blue" small />
                    <div><strong>{e.title}</strong><span>{e.location ?? 'TBD'}</span></div>
                    <em>{new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</em>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel notifications-panel">
            <div className="panel-heading"><div><IconBadge icon={Bell} small tone="purple" /><h2>Notifications Panel</h2></div><button className="text-link">View All</button></div>
            <div className="notification-grid">
              {[['Pending Approvals','8 new approvals pending','8','pink',ShieldCheck],['Attendance Alerts','12 students with low attendance','12','orange',AlarmClock],['Fee Alerts','15 pending fee payments','15','pink',Award],['Event Registrations','5 new event registrations','5','blue',CalendarDays]].map(([title, desc, count, tone, icon]) => (
                <div className={`notification-card ${tone}`} key={title as string}>
                  <IconBadge icon={icon as typeof Users} tone={tone === 'orange' ? 'orange' : tone === 'blue' ? 'blue' : 'pink'} />
                  <div><strong>{title as string}</strong><span>{desc as string}</span></div>
                  <b>{count as string}</b><button>View Details</button>
                </div>
              ))}
            </div>
          </section>

          <section className="shortcut-row">
            {[['Real-Time Dashboard','Live updates enabled',Activity,'green'],['Export Dashboard PDF','Download current view',FileText,'purple'],['Dashboard Filters','Filter by class, section, date',Filter,'blue'],['Academic Year Comparison','Compare performance',BarChart3,'orange']].map(([title, desc, icon, tone]) => (
              <button key={title as string}><IconBadge icon={icon as typeof Users} tone={tone as Tone} /><strong>{title as string}</strong><span>{desc as string}</span><ChevronRight size={14} /></button>
            ))}
          </section>
          <footer><span>© 2025 Sunrise International School</span><div><a>Privacy Policy</a><a>Terms of Use</a><a>Help Center</a></div></footer>
        </>
      )}
    </div>
  );
}
