import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import SidebarNav from '../components/SidebarNav';
import Topbar from '../components/Topbar';

function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">R</span>
          <div>
            <strong>RealEnergy</strong>
            <span>Admin</span>
          </div>
        </div>
        <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
      </aside>

      {isMenuOpen ? <button className="sidebar-overlay" onClick={() => setIsMenuOpen(false)} type="button" /> : null}

      <main className="dashboard-main">
        <Topbar onOpenMenu={() => setIsMenuOpen(true)} />
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
