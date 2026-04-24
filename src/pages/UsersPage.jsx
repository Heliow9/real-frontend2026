import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { createAdminUser, fetchAdminUsers, updateAdminUser } from '../services/dashboardService';

const initialForm = {
  name: '',
  email: '',
  password: '',
  status: 'ACTIVE',
  roleNames: []
};

function UsersPage() {
  const [data, setData] = useState({ users: [], roles: [] });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const selectedUser = useMemo(
    () => data.users.find((item) => item.id === editingId) || null,
    [data.users, editingId]
  );

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminUsers();
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setForm({
      name: selectedUser.name,
      email: selectedUser.email,
      password: '',
      status: selectedUser.status,
      roleNames: selectedUser.roles || []
    });
  }, [selectedUser]);

  const toggleRole = (roleName) => {
    setForm((current) => ({
      ...current,
      roleNames: current.roleNames.includes(roleName)
        ? current.roleNames.filter((item) => item !== roleName)
        : [...current.roleNames, roleName]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setError('');

    if (!form.roleNames.length) {
      setError('Selecione pelo menos um perfil de acesso.');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateAdminUser(editingId, payload);
        setFeedback('Usuário atualizado com sucesso.');
      } else {
        await createAdminUser(form);
        setFeedback('Usuário criado com sucesso.');
      }

      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível salvar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Usuários e perfis"
        description="Cadastre administradores e defina o escopo de acesso de cada área do dashboard."
      />

      {error ? <div className="alert error">{error}</div> : null}
      {feedback ? <div className="alert success">{feedback}</div> : null}

      <div className="two-panel-grid">
        <article className="panel-card">
          <div className="list-row with-action">
            <div>
              <h3>{editingId ? 'Editar usuário' : 'Novo usuário'}</h3>
              <p>Perfis sugeridos: admin-full, marketing, rh, compras, ouvidoria.</p>
            </div>
            {editingId ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancelar edição
              </button>
            ) : null}
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="input-grid">
              <div>
                <label>Nome</label>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
              <div>
                <label>E-mail</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              </div>
              <div>
                <label>{editingId ? 'Nova senha' : 'Senha inicial'}</label>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editingId} />
              </div>
              <div>
                <label>Status</label>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label>Perfis de acesso</label>
              <div className="chips-grid">
                {data.roles.map((role) => (
                  <label key={role.id} className={`choice-chip ${form.roleNames.includes(role.name) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.roleNames.includes(role.name)}
                      onChange={() => toggleRole(role.name)}
                    />
                    <div>
                      <strong>{role.name}</strong>
                      <span>{role.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button className="primary-button" disabled={saving} type="submit">
              {saving ? 'Salvando...' : editingId ? 'Atualizar usuário' : 'Criar usuário'}
            </button>
          </form>
        </article>

        <article className="panel-card">
          <h3>Usuários cadastrados</h3>
          <p>Controle os acessos por setor e revise os perfis em uso no painel.</p>

          {loading ? (
            <div className="muted-block">Carregando usuários...</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfis</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="tag-list">
                          {user.roles.map((role) => (
                            <span className="badge muted" key={role}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${user.status === 'ACTIVE' ? 'success' : 'muted'}`}>
                          {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <button className="ghost-button" type="button" onClick={() => setEditingId(user.id)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

export default UsersPage;
