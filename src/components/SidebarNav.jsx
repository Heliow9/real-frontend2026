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
  FiMessageSquare
} from 'react-icons/fi';

const items = [
  { to: '/dashboard', label: 'Visão geral', icon: FiGrid },
  { to: '/conteudo/home', label: 'Home', icon: FiHome },
  { to: '/conteudo/nossa-historia', label: 'Nossa história', icon: FiBookOpen },
  { to: '/conteudo/noticias', label: 'Notícias', icon: FiFileText },
  { to: '/midia', label: 'Mídia', icon: FiImage },
  { to: '/ouvidoria/reclamacoes', label: 'Ouvidoria', icon: FiMessageSquare },
  { to: '/usuarios', label: 'Usuários', icon: FiUsers },
  { to: '/perfil', label: 'Perfil', icon: FiUser },
  { to: '/configuracoes', label: 'Configurações', icon: FiSettings }
];

function SidebarNav({ onNavigate }) {
  return (
    <nav className="sidebar-nav">
      {items.map((item) => {
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