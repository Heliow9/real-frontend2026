import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { fetchAdminNews, fetchHomeContent, fetchMedia } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ news: 0, media: 0, services: 0, configuredSections: 0 });
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [newsResponse, homeResponse, mediaResponse] = await Promise.all([
          fetchAdminNews(),
          fetchHomeContent(),
          fetchMedia()
        ]);

        const newsItems = newsResponse.data || [];
        const mediaItems = mediaResponse.data || [];
        const home = homeResponse.data || {};

        const configuredSections = [
          home.heroTitle,
          home.aboutTitle,
          home.servicesTitle,
          home.careersTitle,
          home.portfolioTitle,
          home.finalCtaTitle
        ].filter(Boolean).length;

        setRecentNews(newsItems.slice(0, 5));
        setStats({
          news: newsItems.length,
          media: mediaItems.length,
          services: home.serviceCards?.length || 0,
          configuredSections
        });
      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard. Verifique se a API está online.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] || 'Administrador'}`}
        description="Visão geral inicial do painel administrativo conectado ao seu backend."
      />

      <div className="stats-grid">
        <StatCard label="Notícias" value={stats.news} hint="Itens cadastrados" />
        <StatCard label="Mídia" value={stats.media} hint="Arquivos cadastrados" />
        <StatCard label="Serviços da home" value={stats.services} hint="Cards gerenciáveis" />
        <StatCard label="Seções prontas" value={stats.configuredSections} hint="Blocos configurados" />
      </div>

      <section className="card-grid two-columns">
        <article className="panel-card">
          <h3>Status do ambiente</h3>
          <div className="status-list">
            <div><span>API</span><strong>{process.env.REACT_APP_API_URL || 'http://localhost:3333'}</strong></div>
            <div><span>Autenticação</span><strong>JWT</strong></div>
            <div><span>Perfis</span><strong>{user?.roles?.join(', ') || 'N/D'}</strong></div>
          </div>
        </article>

        <article className="panel-card">
          <h3>Papéis sugeridos</h3>
          <ul className="check-list">
            <li>admin-full — gestão completa da home e conteúdo</li>
            <li>marketing — notícias, mídia e leitura da home</li>
            <li>editor-home — foco apenas na home</li>
            <li>compliance, rh, suprimentos, ouvidoria e auditor</li>
          </ul>
        </article>
      </section>

      <section className="panel-card">
        <h3>Últimas notícias cadastradas</h3>
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
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardHomePage;