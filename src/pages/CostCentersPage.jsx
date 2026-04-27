import { useEffect, useState } from 'react';
import { FiPlus, FiRefreshCw, FiSave, FiSearch, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import {
  createCostCenter,
  deleteCostCenter,
  searchCostCenters,
  updateCostCenter
} from '../services/dashboardService';

const emptyForm = { code: '', name: '', isActive: true };

function CostCentersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const response = await searchCostCenters(search, includeInactive);
      setItems(response.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar os centros de custo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item) {
    setEditing(item);
    setForm({ code: item.code || '', name: item.name || '', isActive: Boolean(item.isActive) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(e) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editing) {
        await updateCostCenter(editing.id, form);
        setMessage('Centro de custo atualizado com sucesso.');
      } else {
        await createCostCenter(form);
        setMessage('Centro de custo cadastrado com sucesso.');
      }

      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível salvar o centro de custo.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Desativar o centro de custo "${item.displayName}"?`)) return;

    setError('');
    setMessage('');

    try {
      await deleteCostCenter(item.id);
      setMessage('Centro de custo desativado com sucesso.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível desativar o centro de custo.');
    }
  }

  return (
    <div>
      <PageHeader
        title="Centros de custo"
        subtitle="Cadastre, edite e pesquise os centros de custo usados nas SPs."
      />

      <form className="card-section payment-create" onSubmit={submit}>
        <div className="section-title-row">
          <div>
            <h3><FiPlus /> {editing ? 'Editar centro de custo' : 'Novo centro de custo'}</h3>
            <p>O campo será exibido nas SPs no formato “624 - Uruará Novo”.</p>
          </div>

          {editing && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cancelar edição
            </button>
          )}
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="payment-form-grid">
          <label>
            Número do CT
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, '') }))}
              placeholder="Ex: 624"
              required
            />
          </label>

          <label>
            Nome do centro de custo
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Uruará Novo"
              required
            />
          </label>

          <label className="inline-option" style={{ alignSelf: 'end', minHeight: 48 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            <span>Centro de custo ativo</span>
          </label>
        </div>

        <button className="primary-button" disabled={saving}>
          <FiSave /> {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar centro de custo'}
        </button>
      </form>

      <div className="card-section">
        <div className="section-title-row">
          <div>
            <h3>Lista de centros de custo</h3>
            <p>Busque pelo número, nome ou descrição completa.</p>
          </div>
        </div>

        <div className="filters-row">
          <div className="search-box">
            <FiSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por 624, Uruará ou 624 - Uruará Novo"
            />
          </div>

          <label className="inline-option">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            <span>Mostrar inativos</span>
          </label>

          <button className="secondary-button" type="button" onClick={load} disabled={loading}>
            <FiRefreshCw /> {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Centro de custo</th>
                <th>Número</th>
                <th>Nome</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="5">Carregando...</td></tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.displayName}</td>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td>
                      <span className={`status-pill ${item.isActive ? 'success' : 'muted'}`}>
                        {item.isActive ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button type="button" title="Editar" onClick={() => startEdit(item)}>
                        <FiSave />
                      </button>
                      {item.isActive && (
                        <button type="button" title="Desativar" onClick={() => remove(item)}>
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">Nenhum centro de custo encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CostCentersPage;
