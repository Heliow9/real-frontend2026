import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { createNews, deleteNews, fetchAdminNews } from '../services/dashboardService';

const initialForm = {
  title: '',
  excerpt: '',
  content: '',
  status: 'DRAFT',
  isFeatured: false,
  categoryId: '',
  coverMediaId: ''
};

function NewsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadNews() {
    setLoading(true);
    try {
      const response = await fetchAdminNews();
      setItems(response.data || []);
    } catch (err) {
      setError('Não foi possível carregar as notícias.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await createNews({
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        coverMediaId: form.coverMediaId ? Number(form.coverMediaId) : null
      });
      setForm(initialForm);
      setMessage('Notícia criada com sucesso.');
      await loadNews();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro ao criar notícia.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNews(id);
      await loadNews();
    } catch (err) {
      setError('Não foi possível remover a notícia.');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestão de notícias"
        description="CRUD inicial conectado ao backend. Nesta primeira versão já dá para cadastrar e listar notícias."
      />

      <section className="card-grid two-columns align-start">
        <form className="panel-card form-stack" onSubmit={handleSubmit}>
          <h3>Nova notícia</h3>
          <div>
            <label>Título</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label>Resumo</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} />
          </div>
          <div>
            <label>Conteúdo</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={8} required />
          </div>
          <div className="input-grid">
            <div>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
            <div>
              <label>ID da capa</label>
              <input name="coverMediaId" value={form.coverMediaId} onChange={handleChange} placeholder="Ex.: 1" />
            </div>
          </div>
          <label className="checkbox-row">
            <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={handleChange} />
            Destacar na home
          </label>
          {message ? <div className="alert success">{message}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? 'Salvando...' : 'Criar notícia'}
          </button>
        </form>

        <article className="panel-card">
          <h3>Notícias cadastradas</h3>
          {loading ? <p>Carregando...</p> : null}
          <div className="list-stack">
            {items.map((item) => (
              <div key={item.id} className="list-row with-action">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.excerpt || 'Sem resumo.'}</p>
                </div>
                <div className="row-actions">
                  <span className={`badge ${item.status === 'PUBLISHED' ? 'success' : 'muted'}`}>{item.status}</span>
                  <button className="ghost-button danger-text" type="button" onClick={() => handleDelete(item.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
            {!loading && !items.length ? <p>Nenhuma notícia encontrada.</p> : null}
          </div>
        </article>
      </section>
    </div>
  );
}

export default NewsPage;
