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
  FiBriefcase
} from 'react-icons/fi';

const items = [
  { to: '/dashboard', label: 'Visão geral', icon: FiGrid },
  { to: '/conteudo/home', label: 'Home', icon: FiHome },
  { to: '/conteudo/nossa-historia', label: 'Nossa história', icon: FiBookOpen },
  { to: '/conteudo/noticias', label: 'Notícias', icon: FiFileText },
  { to: '/midia', label: 'Mídia', icon: FiImage },
  { to: '/ouvidoria/reclamacoes', label: 'Ouvidoria', icon: FiMessageSquare },
  {
    to: '/rh/curriculos',
    label: 'RH Currículos',
    icon: FiBriefcase,
    roles: ['admin-full', 'super_admin', 'rh'],
    permissions: ['careers.read', 'careers.manage']
  },
  { to: '/usuarios', label: 'Usuários', icon: FiUsers },
  { to: '/perfil', label: 'Perfil', icon: FiUser },
  { to: '/configuracoes', label: 'Configurações', icon: FiSettings }
];

function SidebarNav({ onNavigate }) {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('realenergy_user') || 'null');
    } catch {
      return null;
    }
  })();

  const canSeeItem = (item) => {
    if (!item.roles?.length && !item.permissions?.length) return true;

    const roles = storedUser?.roles || [];
    const permissions = storedUser?.permissions || [];

    return item.roles?.some((role) => roles.includes(role)) || item.permissions?.some((permission) => permissions.includes(permission));
  };

  return (
    <nav className="sidebar-nav">
      {items.filter(canSeeItem).map((item) => {
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
