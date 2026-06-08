import { useMemo, useState } from 'react';
import { FiArrowRight, FiLogOut, FiMenu, FiSearch, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

const quickLinks = [
  { to: '/dashboard', label: 'Visão geral', keywords: 'home painel inicio dashboard' },
  { to: '/solicitacoes', label: 'Solicitações', keywords: 'sp solicitacao pagamento boleto fornecedor nf centro custo', permission: 'payment_requests.read' },
  { to: '/solicitacoes/programadas', label: 'SPs programadas', keywords: 'recorrente mensal automática agendada', permission: 'payment_requests.read' },
  { to: '/rh/curriculos', label: 'RH Currículos', keywords: 'candidatos curriculos recrutamento', permission: 'careers.read' },
  { to: '/ouvidoria/reclamacoes', label: 'Ouvidoria', keywords: 'reclamacoes atendimento chamados', permission: 'complaints.read' },
  { to: '/conteudo/home', label: 'Conteúdo Home', keywords: 'site banners cards estatisticas', permission: 'home.read' },
  { to: '/conteudo/nossa-historia', label: 'Nossa história', keywords: 'about historia timeline valores', permission: 'home.read' },
  { to: '/conteudo/noticias', label: 'Notícias', keywords: 'blog posts novidades', permission: 'news.read' },
  { to: '/midia', label: 'Mídia', keywords: 'upload imagens arquivos galeria', permission: 'media.read' },
  { to: '/usuarios', label: 'Usuários', keywords: 'permissoes administradores acesso', permission: 'users.read' },
  { to: '/configuracoes/centros-de-custo', label: 'Centros de custo', keywords: 'ct centro custo administrativo ti financeiro obra', permission: 'settings.read' },
  { to: '/perfil', label: 'Perfil', keywords: 'conta dados senha' },
  { to: '/configuracoes', label: 'Configurações', keywords: 'sistema ajustes preferencias', permission: 'settings.read' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function Topbar({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const firstName = user?.name?.split(' ')[0] || 'Administrador';
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    return quickLinks
      .filter((item) => hasPermission(user, item.permission))
      .filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [query, user]);

  function goTo(item) {
    setQuery('');
    navigate(item.to);
  }

  function submit(e) {
    e.preventDefault();
    if (results[0]) goTo(results[0]);
  }

  return (
    <header className="topbar premium-topbar">
      <button className="icon-button mobile-only" onClick={onOpenMenu} type="button" aria-label="Abrir menu">
        <FiMenu size={20} />
      </button>

      <div className="topbar-heading">
        <p className="eyebrow">{today}</p>
        <h1 className="topbar-title">{getGreeting()}, {firstName}</h1>
      </div>

      <div className="topbar-actions">
        <form className="topbar-search functional-search" onSubmit={submit} role="search">
          <FiSearch size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar módulos, SPs, usuários..."
            aria-label="Buscar no dashboard"
          />

          {query.trim() && (
            <div className="quick-search-panel">
              {results.length ? results.map((item) => (
                <button type="button" key={item.to} onClick={() => goTo(item)}>
                  <span>{item.label}</span>
                  <FiArrowRight size={15} />
                </button>
              )) : (
                <div className="quick-search-empty">Nenhum módulo encontrado.</div>
              )}
            </div>
          )}
        </form>

        <div className="topbar-user premium-user-card">
          <span className="user-avatar"><FiShield size={16} /></span>
          <div>
            <strong>{user?.name || 'Administrador'}</strong>
            <span>{user?.email || 'Sem e-mail'}</span>
          </div>
          <button className="icon-button danger" onClick={logout} type="button" aria-label="Sair">
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
