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
  FiCreditCard,
  FiClock,
  FiBriefcase,
  FiArchive,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

const sections = [
  {
    title: 'Operação',
    items: [
      { to: '/dashboard', label: 'Visão geral', icon: FiGrid },
      { to: '/solicitacoes', label: 'Solicitações', icon: FiCreditCard, permission: 'payment_requests.read' },
      { to: '/solicitacoes/programadas', label: 'SPs programadas', icon: FiClock, permission: 'payment_requests.read' },
      { to: '/configuracoes/centros-de-custo', label: 'Centros de custo', icon: FiArchive, permission: 'settings.read' },
      { to: '/rh/curriculos', label: 'RH Currículos', icon: FiBriefcase, permission: 'careers.read' },
      { to: '/ouvidoria/reclamacoes', label: 'Ouvidoria', icon: FiMessageSquare, permission: 'complaints.read' },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      { to: '/conteudo/home', label: 'Home', icon: FiHome, permission: 'home.read' },
      { to: '/conteudo/nossa-historia', label: 'Nossa história', icon: FiBookOpen, permission: 'home.read' },
      { to: '/conteudo/noticias', label: 'Notícias', icon: FiFileText, permission: 'news.read' },
      { to: '/midia', label: 'Mídia', icon: FiImage, permission: 'media.read' },
    ],
  },
  {
    title: 'Administração',
    items: [
      { to: '/usuarios', label: 'Usuários', icon: FiUsers, permission: 'users.read' },
      { to: '/perfil', label: 'Perfil', icon: FiUser },
      { to: '/configuracoes', label: 'Configurações', icon: FiSettings, permission: 'settings.read' },
    ],
  },
];

function SidebarNav({ onNavigate }) {
  const { user } = useAuth();

  return (
    <nav className="sidebar-nav premium-sidebar-nav">
      {sections.map((section) => {
        const visibleItems = section.items.filter((item) => hasPermission(user, item.permission));
        if (!visibleItems.length) return null;

        return (
          <div className="sidebar-section" key={section.title}>
            <span className="sidebar-section-title">{section.title}</span>
            {visibleItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onNavigate}
                >
                  <span className="sidebar-link-icon"><Icon size={18} /></span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export default SidebarNav;
