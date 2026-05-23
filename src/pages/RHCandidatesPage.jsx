import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiEye, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { fetchCandidateById, fetchCandidates } from '../services/dashboardService';

const initialFilters = {
  search: '',
  nome: '',
  cidade: '',
  estado: '',
  cargo: '',
  status: '',
  page: 1,
  limit: 20
};

const statusLabels = {
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  BANCO_TALENTOS: 'Banco de talentos'
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

function formatFileSize(bytes) {
  if (!bytes) return 'PDF';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function onlyFilledFilters(filters) {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) acc[key] = value;
    return acc;
  }, {});
}

function RHCandidatesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [data, setData] = useState({
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    summary: { total: 0, byState: [], byStatus: [] }
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchCandidates(onlyFilledFilters(nextFilters));
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar os currículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
  }, [filters.page, filters.limit]);

  const totalRecebidos = data.summary?.total || data.pagination?.total || 0;

  const topStates = useMemo(() => {
    return [...(data.summary?.byState || [])]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [data.summary?.byState]);

  const recebidosStatus = useMemo(() => {
    return data.summary?.byStatus?.find((item) => item.status === 'RECEBIDO')?.total || 0;
  }, [data.summary?.byStatus]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextFilters = { ...draftFilters, page: 1 };
    setFilters(nextFilters);
    load(nextFilters);
  };

  const handleClear = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    load(initialFilters);
  };

  const handlePageChange = (direction) => {
    const currentPage = data.pagination?.page || filters.page || 1;
    const totalPages = data.pagination?.pages || 1;
    const nextPage = direction === 'next'
      ? Math.min(currentPage + 1, totalPages)
      : Math.max(currentPage - 1, 1);

    setFilters((current) => ({ ...current, page: nextPage }));
    setDraftFilters((current) => ({ ...current, page: nextPage }));
  };

  const handleOpenDetails = async (candidate) => {
    try {
      setModalLoading(true);
      setError('');
      const response = await fetchCandidateById(candidate.id);
      setSelected(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível abrir os detalhes do candidato.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="RH • Banco de currículos"
        description="Consulte candidatos enviados pelo site, aplique filtros por nome, cidade, estado e cargo desejado, visualize detalhes e baixe currículos em PDF."
      />

      <div className="stats-grid three-columns">
        <div className="stat-card">
          <span className="stat-label">Total de candidatos</span>
          <h3 className="stat-value">{totalRecebidos}</h3>
          <span className="stat-hint">Currículos cadastrados</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Recebidos</span>
          <h3 className="stat-value">{recebidosStatus}</h3>
          <span className="stat-hint">Aguardando análise do RH</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Estados com mais envios</span>
          <h3 className="stat-value small-stat-value">
            {topStates.length ? topStates.map((item) => `${item.estado}: ${item.total}`).join(' • ') : '-'}
          </h3>
          <span className="stat-hint">Ranking dos cadastros</span>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel-card form-stack">
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="input-grid three-columns">
            <div>
              <label>Busca geral</label>
              <input
                placeholder="Nome, e-mail, CPF, telefone, cidade..."
                value={draftFilters.search}
                onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
              />
            </div>

            <div>
              <label>Nome</label>
              <input
                placeholder="Ex.: Maria Silva"
                value={draftFilters.nome}
                onChange={(event) => setDraftFilters((current) => ({ ...current, nome: event.target.value }))}
              />
            </div>

            <div>
              <label>Cargo desejado</label>
              <input
                placeholder="Ex.: Eletricista"
                value={draftFilters.cargo}
                onChange={(event) => setDraftFilters((current) => ({ ...current, cargo: event.target.value }))}
              />
            </div>

            <div>
              <label>Cidade</label>
              <input
                placeholder="Ex.: Recife"
                value={draftFilters.cidade}
                onChange={(event) => setDraftFilters((current) => ({ ...current, cidade: event.target.value }))}
              />
            </div>

            <div>
              <label>Estado</label>
              <input
                placeholder="Ex.: PE"
                maxLength={2}
                value={draftFilters.estado}
                onChange={(event) => setDraftFilters((current) => ({ ...current, estado: event.target.value.toUpperCase() }))}
              />
            </div>

            <div>
              <label>Status</label>
              <select
                value={draftFilters.status}
                onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="">Todos</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row-actions wrap-start">
            <button className="primary-button inline-flex" type="submit" disabled={loading}>
              <FiSearch size={16} />
              {loading ? 'Filtrando...' : 'Aplicar filtros'}
            </button>

            <button className="ghost-button inline-flex" type="button" onClick={handleClear}>
              <FiX size={16} />
              Limpar
            </button>

            <button className="ghost-button inline-flex" type="button" onClick={() => load(filters)} disabled={loading}>
              <FiRefreshCw size={16} />
              Atualizar
            </button>
          </div>
        </form>
      </article>

      <article className="panel-card">
        <div className="list-row with-action">
          <div>
            <h3>Lista de candidatos</h3>
            <p>
              {data.pagination?.total || 0} resultado(s) encontrado(s). Página {data.pagination?.page || 1} de {data.pagination?.pages || 1}.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="muted-block">Carregando currículos...</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Cidade/UF</th>
                  <th>Cargo desejado</th>
                  <th>PCD</th>
                  <th>Status</th>
                  <th>Recebido em</th>
                  <th>Currículo</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {data.items.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <strong>{candidate.nome || '-'}</strong>
                      <small className="table-subtitle">{candidate.email || candidate.telephone || '-'}</small>
                    </td>
                    <td>{candidate.cidade || '-'}{candidate.estado ? `/${candidate.estado}` : ''}</td>
                    <td>{candidate.funcao || candidate.cargo || candidate.areaFiltro || '-'}</td>
                    <td>{candidate.isPCD ? 'Sim' : 'Não'}</td>
                    <td><span className="badge muted">{statusLabels[candidate.status] || candidate.status || '-'}</span></td>
                    <td>{formatDate(candidate.createdAt)}</td>
                    <td>
                      {candidate.curriculumUrl ? (
                        <a className="ghost-button inline-flex table-action" href={candidate.curriculumUrl} target="_blank" rel="noreferrer">
                          <FiDownload size={16} />
                          Baixar
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      <button className="ghost-button inline-flex table-action" type="button" onClick={() => handleOpenDetails(candidate)}>
                        <FiEye size={16} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}

                {!data.items.length ? (
                  <tr>
                    <td colSpan="8">
                      <div className="muted-block">Nenhum currículo encontrado para os filtros selecionados.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-row">
          <button
            className="ghost-button"
            type="button"
            onClick={() => handlePageChange('prev')}
            disabled={(data.pagination?.page || 1) <= 1 || loading}
          >
            Anterior
          </button>

          <span>
            Página {data.pagination?.page || 1} de {data.pagination?.pages || 1}
          </span>

          <button
            className="ghost-button"
            type="button"
            onClick={() => handlePageChange('next')}
            disabled={(data.pagination?.page || 1) >= (data.pagination?.pages || 1) || loading}
          >
            Próxima
          </button>
        </div>
      </article>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card wide-modal" onClick={(event) => event.stopPropagation()}>
            {modalLoading ? (
              <div className="muted-block">Carregando detalhes...</div>
            ) : (
              <div className="page-stack">
                <div className="list-row with-action">
                  <div>
                    <h3>{selected.nome || 'Candidato'}</h3>
                    <p>{selected.funcao || selected.cargo || 'Cargo não informado'} • {selected.cidade || '-'}{selected.estado ? `/${selected.estado}` : ''}</p>
                  </div>
                  <button className="ghost-button" type="button" onClick={() => setSelected(null)}>Fechar</button>
                </div>

                <div className="input-grid three-columns readonly-grid">
                  <div><label>E-mail</label><strong>{selected.email || '-'}</strong></div>
                  <div><label>Telefone</label><strong>{selected.telephone || '-'}</strong></div>
                  <div><label>CPF</label><strong>{selected.cpf || '-'}</strong></div>
                  <div><label>Nascimento</label><strong>{selected.nasc || '-'}</strong></div>
                  <div><label>Escolaridade</label><strong>{selected.nivel || '-'}</strong></div>
                  <div><label>Pretensão</label><strong>{selected.pretencao || '-'}</strong></div>
                  <div><label>Área</label><strong>{selected.areaFiltro || '-'}</strong></div>
                  <div><label>Aprendiz</label><strong>{selected.isAprendiz ? 'Sim' : 'Não'}</strong></div>
                  <div><label>PCD</label><strong>{selected.isPCD ? 'Sim' : 'Não'}</strong></div>
                </div>

                {selected.isPCD ? (
                  <article className="panel-card soft-card">
                    <h4>Informações PCD</h4>
                    <p><strong>Tipo:</strong> {selected.tipoDeficiencia || '-'}</p>
                    <p><strong>Detalhes:</strong> {selected.detalhesDeficiencia || '-'}</p>
                    <p><strong>Necessidades específicas:</strong> {selected.necessidadesEspecificas || '-'}</p>
                  </article>
                ) : null}

                <article className="panel-card soft-card">
                  <h4>Observações</h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selected.observation || 'Nenhuma observação informada.'}</p>
                </article>

                <article className="panel-card soft-card form-stack">
                  <h4>Currículo</h4>
                  {selected.curriculumUrl ? (
                    <a className="attachment-card" href={selected.curriculumUrl} target="_blank" rel="noreferrer">
                      <strong>{selected.curriculumOriginalName || 'curriculo.pdf'}</strong>
                      <span>{formatFileSize(selected.curriculumBytes)} • abrir/baixar PDF</span>
                    </a>
                  ) : (
                    <div className="muted-block">Nenhum currículo disponível.</div>
                  )}
                </article>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RHCandidatesPage;
