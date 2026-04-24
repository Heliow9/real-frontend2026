import { FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

function Topbar({ onOpenMenu }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <button className="icon-button mobile-only" onClick={onOpenMenu} type="button" aria-label="Abrir menu">
        <FiMenu size={20} />
      </button>

      <div>
        <p className="eyebrow">Painel administrativo</p>
        <h1 className="topbar-title">RealEnergy Dashboard</h1>
      </div>

      <div className="topbar-user">
        <div>
          <strong>{user?.name || 'Administrador'}</strong>
          <span>{user?.email || 'Sem e-mail'}</span>
        </div>
        <button className="icon-button danger" onClick={logout} type="button" aria-label="Sair">
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
