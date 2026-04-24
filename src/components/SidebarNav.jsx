import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiHome,
  FiImage,
  FiFileText,
  FiUser,
  FiSettings,
  FiBookOpen,
  FiUsers,
  FiMessageSquare,
  FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

const items = [
  { to: '/dashboard', label: 'Visão geral', icon: FiGrid },
  { to: '/conteudo/home', label: 'Home', icon: FiHome, permission: 'home.read' },
  { to: '/conteudo/nossa-historia', label: 'Nossa história', icon: FiBookOpen, permission: 'home.read' },
  { to: '/conteudo/noticias', label: 'Notícias', icon: FiFileText, permission: 'news.read' },
  { to: '/midia', label: 'Mídia', icon: FiImage, permission: 'media.read' },
  { to: '/ouvidoria/reclamacoes', label: 'Ouvidoria', icon: FiMessageSquare, permission: 'complaints.read' },
  { to: '/solicitacoes', label: 'Solicitações', icon: FiCreditCard, permission: 'payment_requests.read' },
  { to: '/usuarios', label: 'Usuários', icon: FiUsers, permission: 'users.read' },
  { to: '/perfil', label: 'Perfil', icon: FiUser },
  { to: '/configuracoes', label: 'Configurações', icon: FiSettings, permission: 'settings.read' }
];

function SidebarNav({ onNavigate }) {
  const { user } = useAuth();
  const visibleItems = items.filter((item) => hasPermission(user, item.permission));

  return (
    <nav className="sidebar-nav">
      {visibleItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default SidebarNav;
