import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import SidebarNav from '../components/SidebarNav';
import Topbar from '../components/Topbar';

function DashboardLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell premium-shell">
      <div className="dashboard-orb dashboard-orb-one" />
      <div className="dashboard-orb dashboard-orb-two" />

      <aside className={`sidebar premium-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand premium-brand">
          <span className="brand-mark">R</span>
          <div>
            <strong>RealEnergy</strong>
            <span>Admin Center</span>
          </div>
          <button className="icon-button sidebar-close mobile-only" onClick={() => setIsMenuOpen(false)} type="button" aria-label="Fechar menu">
            <FiX size={18} />
          </button>
        </div>

        <SidebarNav onNavigate={() => setIsMenuOpen(false)} />

        <div className="sidebar-footer-card">
          <span>RealFRONT</span>
          <strong>Operação premium</strong>
          <small>Dashboard seguro, rápido e responsivo.</small>
        </div>
      </aside>

      {isMenuOpen ? <button className="sidebar-overlay" onClick={() => setIsMenuOpen(false)} type="button" aria-label="Fechar navegação" /> : null}

      <main className="dashboard-main premium-main">
        <Topbar onOpenMenu={() => setIsMenuOpen(true)} />
        <section className="dashboard-content premium-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
