import { useState } from 'react';
import {
  Bell, CalendarDays, ChevronDown, FileBarChart, FileText, GraduationCap,
  LayoutDashboard, Menu, MessageSquare, Search, Settings, ShieldCheck,
  UserCheck, Users, ClipboardCheck, Award, X, BookOpen,
} from 'lucide-react';
import { DashboardPage } from '@/pages/DashboardPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { TeachersPage } from '@/pages/TeachersPage';
import { EventsPage } from '@/pages/EventsPage';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Students', icon: Users },
  { label: 'Teachers', icon: UserCheck },
  { label: 'Attendance', icon: ClipboardCheck },
  { label: 'Credits', icon: Award },
  { label: 'Events', icon: CalendarDays },
  { label: 'Academics', icon: GraduationCap },
  { label: 'Exams', icon: FileText },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Communication', icon: MessageSquare },
  { label: 'Approvals', icon: ShieldCheck, badge: '8' },
  { label: 'Settings', icon: Settings },
];

const implementedPages = ['Dashboard', 'Students', 'Teachers', 'Events'];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

  function navigate(page: string) {
    setActiveNav(page);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark" aria-label="SKOOL logo" />
          <div className="brand-copy"><strong>Sunrise International School</strong><span>Excellence in Education</span></div>
        </div>
        <nav className="main-nav">
          {navItems.map(({ label, icon: Icon, badge }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => navigate(label)}>
              <Icon size={17} /><span>{label}</span>
              {badge && <b>{badge}</b>}
              {!implementedPages.includes(label) && <span className="soon-tag">Soon</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-year"><span>Academic Year</span><strong>2024 - 2025</strong><ChevronDown size={15} /></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={19} /></button>
          <div className="mobile-brand"><div className="brand-mark" aria-label="SKOOL logo" /><strong>SKOOL</strong><span>Sunrise International School</span></div>
          <div className="topbar-actions">
            <div className="year-select"><span>Academic Year</span><strong>2024 - 2025</strong><ChevronDown size={14} /></div>
            <div className="search-box"><Search size={16} /><input aria-label="Search" placeholder="Search anything..." /><kbd>⌘ K</kbd></div>
            <button className="notification-button"><Bell size={18} /><i>3</i></button>
            <div className="profile"><img src="https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&h=120&w=120" alt="Admin User" className="avatar-img" /><div><strong>Admin User</strong><span>School Admin</span></div><ChevronDown size={14} /></div>
          </div>
        </header>

        {activeNav === 'Dashboard' && <DashboardPage onNavigate={navigate} />}
        {activeNav === 'Students' && <StudentsPage />}
        {activeNav === 'Teachers' && <TeachersPage />}
        {activeNav === 'Events' && <EventsPage />}
        {!implementedPages.includes(activeNav) && (
          <div className="page-content"><div className="coming-soon">
            <BookOpen size={40} />
            <h1>{activeNav}</h1>
            <p>This section is coming soon. The Dashboard, Students, Teachers, and Events pages are fully working right now.</p>
            <button className="button button-primary" onClick={() => navigate('Dashboard')}>Back to Dashboard</button>
          </div></div>
        )}
      </main>

      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={1} /></button>}
    </div>
  );
}

export default App;
