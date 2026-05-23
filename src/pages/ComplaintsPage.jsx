import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { fetchComplaints, fetchComplaintById, updateComplaintStatus } from '../services/dashboardService';

const statusOptions = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'EM_TRIAGEM', label: 'Em triagem' },
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'AGUARDANDO_RETORNO', label: 'Aguardando retorno' },
  { value: 'ENCAMINHADA', label: 'Encaminhada' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'ARQUIVADA', label: 'Arquivada' }
];

const categoryOptions = [
  { value: 'RECLAMACAO', label: 'Reclamação' },
  { value: 'DENUNCIA', label: 'Denúncia' },
  { value: 'SUGESTAO', label: 'Sugestão' },
  { value: 'ELOGIO', label: 'Elogio' }
];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

function ComplaintsPage() {
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [data, setData] = useState({ items: [], summary: { byStatus: [], byCategory: [], total: 0 } });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'EM_TRIAGEM',
    title: '',
    description: '',
    publicResponse: true,
    notifyReporter: true,
    notifyInternal: true
  });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchComplaints(filters);
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar as manifestações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    
  }, [filters.status, filters.category]);

  const totalOpen = useMemo(() => data.summary.byStatus.find((item) => item.key === 'ABERTA')?.total || 0, [data.summary.byStatus]);
  const totalInProgress = useMemo(() => data.summary.byStatus.filter((item) => ['EM_TRIAGEM', 'EM_ANALISE', 'AGUARDANDO_RETORNO', 'ENCAMINHADA'].includes(item.key)).reduce((sum, item) => sum + item.total, 0), [data.summary.byStatus]);

  const handleOpen = async (item) => {
    try {
      setModalLoading(true);
      const response = await fetchComplaintById(item.id);
      setSelected(response.data);
      setStatusForm({ status: response.data.status, title: '', description: '', publicResponse: true, notifyReporter: true, notifyInternal: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível abrir a manifestação.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!selected) return;
    try {
      setError('');
      const response = await updateComplaintStatus(selected.id, statusForm);
      setSelected(response.data);
      setFeedback('Status registrado, histórico atualizado e notificações disparadas quando aplicável.');
      await load();
      setStatusForm((current) => ({ ...current, title: '', description: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível atualizar o status.');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Ouvidoria e manifestações" description="Gerencie reclamações, denúncias, sugestões e elogios com linha do tempo, resposta pública, anexos e notificações automáticas." />

      <div className="stats-grid three-columns">
        <div className="stat-card"><span className="stat-label">Total</span><h3 className="stat-value">{data.summary.total || 0}</h3><span className="stat-hint">Recebidas pelo site</span></div>
        <div className="stat-card"><span className="stat-label">Abertas</span><h3 className="stat-value">{totalOpen}</h3><span className="stat-hint">Aguardando triagem</span></div>
        <div className="stat-card"><span className="stat-label">Em tratativa</span><h3 className="stat-value">{totalInProgress}</h3><span className="stat-hint">Fluxo em andamento</span></div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {feedback ? <div className="alert success">{feedback}</div> : null}

      <article className="panel-card form-stack">
        <div className="input-grid three-columns">
          <div><label>Buscar</label><input placeholder="Protocolo, ocorrência, nome, e-mail..." value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /></div>
          <div><label>Status</label><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Todos</option>{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
          <div><label>Categoria</label><select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}><option value="">Todas</option>{categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></div>
        </div>
        <div className="row-actions"><button className="ghost-button" type="button" onClick={load}>Aplicar filtros</button></div>
      </article>

      <article className="panel-card">
        {loading ? <div className="muted-block">Carregando manifestações...</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Protocolo</th><th>Categoria</th><th>Ocorrência</th><th>Manifestante</th><th>Anexos</th><th>Status</th><th>Data</th><th /></tr></thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.protocol}</strong></td>
                    <td>{item.categoryLabel}</td>
                    <td>{item.occurrenceType}</td>
                    <td>{item.identified ? item.reporterName || item.reporterEmail : 'Anônimo'}</td>
                    <td>{item.attachments?.length || 0}</td>
                    <td><span className="badge muted">{item.statusLabel}</span></td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td><button className="ghost-button" type="button" onClick={() => handleOpen(item)}>Ver detalhes</button></td>
                  </tr>
                ))}
                {!data.items.length ? <tr><td colSpan="8"><div className="muted-block">Nenhuma manifestação encontrada.</div></td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card wide-modal" onClick={(event) => event.stopPropagation()}>
            {modalLoading ? <div className="muted-block">Carregando...</div> : (
              <div className="page-stack">
                <div className="list-row with-action">
                  <div><h3>{selected.categoryLabel} • {selected.protocol}</h3><p>{selected.occurrenceType} • {selected.statusLabel}</p></div>
                  <button className="ghost-button" type="button" onClick={() => setSelected(null)}>Fechar</button>
                </div>

                <div className="input-grid three-columns readonly-grid">
                  <div><label>Manifestante</label><strong>{selected.identified ? selected.reporterName || 'Identificado' : 'Anônimo'}</strong></div>
                  <div><label>E-mail</label><strong>{selected.reporterEmail || 'Não informado'}</strong></div>
                  <div><label>Recebida em</label><strong>{formatDate(selected.createdAt)}</strong></div>
                  <div><label>Relação / origem</label><strong>{selected.accusedRelation || 'Não informado'}</strong></div>
                  <div><label>Nome citado</label><strong>{selected.accusedName || 'Não informado'}</strong></div>
                  <div><label>Último avanço</label><strong>{formatDate(selected.lastStatusAt)}</strong></div>
                </div>

                <article className="panel-card soft-card"><h4>Relato completo</h4><p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p></article>

                <article className="panel-card soft-card form-stack">
                  <h4>Anexos</h4>
                  {selected.attachments?.length ? (
                    <div className="attachment-grid">
                      {selected.attachments.map((file) => <a key={file.id} className="attachment-card" href={file.secureUrl} target="_blank" rel="noreferrer"><strong>{file.originalName}</strong><span>{file.resourceType} • {Math.round((file.bytes || 0) / 1024)} KB</span></a>)}
                    </div>
                  ) : <div className="muted-block">Nenhum anexo enviado.</div>}
                </article>

                <article className="panel-card soft-card form-stack">
                  <h4>Linha do tempo</h4>
                  <div className="timeline-list">
                    {selected.history.map((history) => (
                      <div key={`${history.status}-${history.createdAt}`} className="timeline-item">
                        <span className="timeline-dot" />
                        <div><strong>{history.title}</strong><p>{history.description || 'Sem descrição.'}</p><small>{history.statusLabel} • {formatDate(history.createdAt)} {history.publicResponse ? '• visível no acompanhamento' : ''}</small></div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel-card form-stack">
                  <h4>Registrar avanço do protocolo</h4>
                  <form className="form-stack" onSubmit={handleStatusUpdate}>
                    <div className="input-grid">
                      <div><label>Novo status</label><select value={statusForm.status} onChange={(event) => setStatusForm({ ...statusForm, status: event.target.value })}>{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
                      <div><label>Título da atualização</label><input value={statusForm.title} onChange={(event) => setStatusForm({ ...statusForm, title: event.target.value })} placeholder="Ex.: Encaminhado ao setor responsável" required /></div>
                    </div>
                    <div><label>Descrição / resposta</label><textarea value={statusForm.description} onChange={(event) => setStatusForm({ ...statusForm, description: event.target.value })} rows={4} placeholder="Descreva a ação tomada ou a resposta que poderá aparecer ao usuário." /></div>
                    <div className="checkbox-row wrap-start">
                      <label className="inline-option"><input type="checkbox" checked={statusForm.publicResponse} onChange={(event) => setStatusForm({ ...statusForm, publicResponse: event.target.checked })} /><span>Mostrar no acompanhamento público</span></label>
                      <label className="inline-option"><input type="checkbox" checked={statusForm.notifyReporter} onChange={(event) => setStatusForm({ ...statusForm, notifyReporter: event.target.checked })} /><span>Notificar manifestante por e-mail</span></label>
                      <label className="inline-option"><input type="checkbox" checked={statusForm.notifyInternal} onChange={(event) => setStatusForm({ ...statusForm, notifyInternal: event.target.checked })} /><span>Notificar e-mails internos</span></label>
                    </div>
                    <button className="primary-button" type="submit">Registrar avanço</button>
                  </form>
                </article>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ComplaintsPage;
