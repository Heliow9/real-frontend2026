import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiImage,
  FiMessageCircle,
  FiSettings,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { fetchAdminNews, fetchHomeContent, fetchMedia } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

function unwrapResponse(response, fallback) {
  if (!response) return fallback;
  if (Array.isArray(response)) return response;
  if (response.items) return response.items;
  if (response.data?.items) return response.data.items;
  if (response.data?.data) return response.data.data;
  if (response.data) return response.data;
  return response;
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function getShortcutIcon(label) {
  switch (label) {
    case 'Editar Home':
      return <FiHome />;
    case 'Notícias':
      return <FiFileText />;
    case 'Mídia':
      return <FiImage />;
    case 'Ouvidoria':
      return <FiMessageCircle />;
    case 'Solicitações':
      return <FiBarChart2 />;
    case 'Usuários':
      return <FiUsers />;
    case 'Configurações':
      return <FiSettings />;
    default:
      return <FiCheckCircle />;
  }
}

function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    news: 0,
    media: 0,
    services: 0,
    configuredSections: 0,
  });
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const permissions = useMemo(() => ({
    canReadNews: hasPermission(user, 'news.read'),
    canReadHome: hasPermission(user, 'home.read'),
    canReadMedia: hasPermission(user, 'media.read'),
    canReadComplaints: hasPermission(user, 'complaints.read'),
    canReadUsers: hasPermission(user, 'users.read'),
    canReadSettings: hasPermission(user, 'settings.read'),
    canReadPaymentRequests:
      hasPermission(user, 'paymentRequests.read') ||
      hasPermission(user, 'payment-requests.read'),
  }), [user]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [newsResponse, homeResponse, mediaResponse] = await Promise.all([
          permissions.canReadNews ? fetchAdminNews().catch(() => []) : Promise.resolve([]),
          permissions.canReadHome ? fetchHomeContent().catch(() => ({})) : Promise.resolve({}),
          permissions.canReadMedia ? fetchMedia().catch(() => []) : Promise.resolve([]),
        ]);

        if (!mounted) return;

        const newsItems = unwrapResponse(newsResponse, []);
        const mediaItems = unwrapResponse(mediaResponse, []);
        const home = unwrapResponse(homeResponse, {}) || {};

        const services = home.serviceCards || home.services || home.homeServices || home.cards || [];

        const configuredSections = [
          home.heroTitle,
          home.heroSubtitle,
          home.aboutTitle,
          home.servicesTitle,
          home.careersTitle,
          home.portfolioTitle,
          home.finalCtaTitle,
          home.contactTitle,
        ].filter(Boolean).length;

        setRecentNews(Array.isArray(newsItems) ? newsItems.slice(0, 5) : []);
        setStats({
          news: countArray(newsItems),
          media: countArray(mediaItems),
          services: countArray(services),
          configuredSections,
        });
      } catch (err) {
        if (mounted) setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [permissions.canReadNews, permissions.canReadHome, permissions.canReadMedia]);

  const shortcuts = [
    {
      label: 'Editar Home',
      description: 'Atualize banners, textos e seções do site.',
      to: '/conteudo/home',
      permission: 'home.read',
    },
    {
      label: 'Notícias',
      description: 'Gerencie publicações e novidades.',
      to: '/conteudo/noticias',
      permission: 'news.read',
    },
    {
      label: 'Mídia',
      description: 'Organize imagens e arquivos.',
      to: '/midia',
      permission: 'media.read',
    },
    {
      label: 'Ouvidoria',
      description: 'Acompanhe manifestações e tratativas.',
      to: '/ouvidoria/reclamacoes',
      permission: 'complaints.read',
    },
    {
      label: 'Solicitações',
      description: 'Emita e reimprima solicitações de pagamento.',
      to: '/solicitacoes',
      permission: 'paymentRequests.read',
      fallbackPermission: 'payment-requests.read',
    },
    {
      label: 'Usuários',
      description: 'Controle acessos e permissões.',
      to: '/usuarios',
      permission: 'users.read',
    },
    {
      label: 'Configurações',
      description: 'Ajuste integrações e preferências.',
      to: '/configuracoes',
      permission: 'settings.read',
    },
  ].filter(
    (item) =>
      hasPermission(user, item.permission) ||
      (item.fallbackPermission && hasPermission(user, item.fallbackPermission))
  );

  return (
    <div className="page-stack dashboard-home-pro">
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] || 'Usuário'}`}
        description="Visão geral inicial do painel conforme as permissões do seu perfil."
      />

      <section className="home-hero-card">
        <div>
          <span className="home-eyebrow">Painel administrativo</span>
          <h2>Resumo operacional</h2>
          <p>
            Acompanhe os principais módulos liberados para seu perfil e acesse rapidamente as áreas mais usadas.
          </p>
        </div>

        <div className="home-hero-badge">
          <FiShield />
          <div>
            <strong>{user?.roles?.join(', ') || 'Perfil ativo'}</strong>
            <span>Autenticação JWT</span>
          </div>
        </div>
      </section>

      <div className="stats-grid home-stats-clean">
        {permissions.canReadNews ? <StatCard label="Notícias" value={stats.news} hint="Itens cadastrados" /> : null}
        {permissions.canReadMedia ? <StatCard label="Mídia" value={stats.media} hint="Arquivos cadastrados" /> : null}
        {permissions.canReadHome ? <StatCard label="Serviços da home" value={stats.services} hint="Cards gerenciáveis" /> : null}
        {permissions.canReadHome ? <StatCard label="Seções prontas" value={stats.configuredSections} hint="Blocos configurados" /> : null}
        {!permissions.canReadNews && !permissions.canReadMedia && !permissions.canReadHome ? (
          <StatCard label="Perfil" value={user?.roles?.join(', ') || 'Ativo'} hint="Acesso limitado" />
        ) : null}
      </div>

      <section className="home-dashboard-grid">
        <article className="panel-card home-status-card">
          <div className="home-card-title">
            <div>
              <span>Status</span>
              <h3>Status do ambiente</h3>
            </div>
            <FiCheckCircle />
          </div>

          <div className="status-list">
            <div>
              <span>API</span>
              <strong>{process.env.REACT_APP_API_URL || 'https://real-backend-2026.onrender.com'}</strong>
            </div>
            <div>
              <span>Autenticação</span>
              <strong>JWT</strong>
            </div>
            <div>
              <span>Perfis</span>
              <strong>{user?.roles?.join(', ') || 'N/D'}</strong>
            </div>
          </div>
        </article>

        <article className="panel-card home-shortcuts-card">
          <div className="home-card-title">
            <div>
              <span>Acesso rápido</span>
              <h3>Atalhos liberados</h3>
            </div>
            <FiArrowRight />
          </div>

          {shortcuts.length ? (
            <div className="shortcuts-grid-pro">
              {shortcuts.map((item) => (
                <Link key={item.to} className="shortcut-card-pro" to={item.to}>
                  <div className="shortcut-icon-pro">{getShortcutIcon(item.label)}</div>
                  <div className="shortcut-content-pro">
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                  <FiArrowRight className="shortcut-arrow-pro" />
                </Link>
              ))}
            </div>
          ) : (
            <p>Seu perfil está ativo, mas não possui módulos administrativos liberados.</p>
          )}
        </article>
      </section>

      {permissions.canReadNews ? (
        <section className="panel-card home-news-card">
          <div className="home-card-title">
            <div>
              <span>Conteúdo</span>
              <h3>Últimas notícias cadastradas</h3>
            </div>
          </div>

          {loading ? <p>Carregando...</p> : null}
          {error ? <div className="alert error">{error}</div> : null}
          {!loading && !recentNews.length ? <p>Nenhuma notícia cadastrada ainda.</p> : null}

          <div className="list-stack">
            {recentNews.map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.excerpt || 'Sem resumo cadastrado.'}</p>
                </div>
                <span className={`badge ${item.status === 'PUBLISHED' ? 'success' : 'muted'}`}>
                  {item.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default DashboardHomePage;