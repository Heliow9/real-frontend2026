import { useEffect, useMemo, useState } from 'react';
import { FiInfo, FiPause, FiPlay, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  createPaymentRequestSchedule,
  deletePaymentRequestSchedule,
  fetchPaymentRequestSchedules,
  updatePaymentRequestSchedule
} from '../services/dashboardService';

const ONBOARDING_KEY = 'payment-schedules-onboarding-seen';

const emptyForm = {
  name: '',
  frequency: 'MENSAL',
  startDate: '',
  dayOfMonth: '',
  managerEmail: '',
  managerName: '',
  department: '',
  payeeName: '',
  invoiceNumber: '',
  costCenter: '',
  description: '',
  bank: '',
  agency: '',
  account: '',
  operation: '',
  documentNumber: '',
  amount: '',
  notes: ''
};

const frequencyLabels = {
  DIARIA: 'Diária',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral'
};

const scheduleTabs = [
  { key: 'ATIVAS', label: 'Ativas', statuses: ['ATIVA', 'PAUSADA'] },
  { key: 'CANCELADAS', label: 'Canceladas', statuses: ['CANCELADA'] }
];

const onboardingItems = [
  {
    title: 'Nome da programação',
    text: 'Identificação interna para você reconhecer rapidamente essa SP recorrente, como “Aluguel matriz”.'
  },
  {
    title: 'Frequência',
    text: 'Define de quanto em quanto tempo a SP será gerada: diária, semanal, quinzenal, mensal ou trimestral.'
  },
  {
    title: 'Primeira execução',
    text: 'Data inicial da automação. A partir dela, o sistema calcula as próximas execuções sempre às 06:00.'
  },
  {
    title: 'Dia do mês',
    text: 'Aparece somente para mensal e trimestral. Define o dia fixo do mês em que a SP será gerada.'
  },
  {
    title: 'E-mail para avisos',
    text: 'Recebe o aviso 2 dias antes e também o PDF da SP no dia da execução.'
  },
  {
    title: 'Dados da SP',
    text: 'Fornecedor, valor, banco, centro de custo e descrição serão usados para gerar a solicitação automaticamente.'
  }
];

function dateTimeBR(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function statusClass(status) {
  if (status === 'ATIVA') return 'success';
  if (status === 'CANCELADA') return 'danger';
  return 'muted';
}

function PaymentSchedulesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('ATIVAS');

  const defaultEmail = useMemo(() => user?.email || '', [user]);
  const shouldShowDayOfMonth = form.frequency === 'MENSAL' || form.frequency === 'TRIMESTRAL';

  const tabCounts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        if (item.status === 'CANCELADA') acc.CANCELADAS += 1;
        else acc.ATIVAS += 1;
        return acc;
      },
      { ATIVAS: 0, CANCELADAS: 0 }
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    const selectedTab = scheduleTabs.find((tab) => tab.key === activeTab) || scheduleTabs[0];
    return items.filter((item) => selectedTab.statuses.includes(item.status));
  }, [items, activeTab]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetchPaymentRequestSchedules();
      setItems(response.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar as programações.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      managerEmail: prev.managerEmail || defaultEmail,
      managerName: prev.managerName || user?.name || ''
    }));
  }, [defaultEmail, user]);

  useEffect(() => {
    load();

    const onboardingSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingSeen) {
      setShowOnboarding(true);
    }
  }, []);

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'frequency' && value !== 'MENSAL' && value !== 'TRIMESTRAL') {
        next.dayOfMonth = '';
      }

      if (field === 'dayOfMonth') {
        const numeric = Number(value);
        if (value && (numeric < 1 || numeric > 30)) return prev;
      }

      return next;
    });
  }

  function closeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        managerEmail: form.managerEmail || defaultEmail,
        dayOfMonth: shouldShowDayOfMonth && form.dayOfMonth ? Number(form.dayOfMonth) : undefined
      };

      await createPaymentRequestSchedule(payload);
      setForm({ ...emptyForm, managerEmail: defaultEmail, managerName: user?.name || '', frequency: 'MENSAL' });
      setMessage('Programação criada com sucesso.');
      setActiveTab('ATIVAS');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Não foi possível salvar a programação.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item) {
    if (item.status === 'CANCELADA') return;

    const next = item.status === 'ATIVA' ? 'PAUSADA' : 'ATIVA';
    await updatePaymentRequestSchedule(item.id, { status: next });
    await load();
  }

  async function remove(item) {
    if (item.status === 'CANCELADA') return;
    if (!window.confirm(`Cancelar a programação "${item.name}"?`)) return;

    await deletePaymentRequestSchedule(item.id);
    setMessage('Programação cancelada com sucesso.');
    await load();
  }

  return (
    <div>
      <PageHeader title="Solicitações programadas" subtitle="Gere SPs automaticamente e envie avisos por e-mail às 06:00." />

      {showOnboarding && (
        <div className="card-section" style={{ border: '1px solid #bfdbfe', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
          <div className="section-title-row">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiInfo /> Como funcionam as SPs programadas?</h3>
              <p>Esse guia aparece só no primeiro acesso. Você também pode pular agora.</p>
            </div>

            <button type="button" className="ghost" onClick={closeOnboarding} title="Pular tutorial">
              <FiX /> Pular tutorial
            </button>
          </div>

          <div className="payment-form-grid" style={{ marginTop: 14 }}>
            {onboardingItems.map((item) => (
              <div key={item.title} style={{ padding: 14, border: '1px solid #dbeafe', borderRadius: 14, background: '#fff' }}>
                <strong>{item.title}</strong>
                <p style={{ margin: '6px 0 0', color: '#475569', lineHeight: 1.45 }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="primary-button" onClick={closeOnboarding}>Entendi, continuar</button>
          </div>
        </div>
      )}

      <div className="card-section">
        <div className="section-title-row">
          <div>
            <h3>Programações</h3>
            <p>O sistema envia aviso 2 dias antes e gera a SP no dia da execução com PDF em anexo.</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <div className="segmented" style={{ marginBottom: 16 }}>
          {scheduleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tabCounts[tab.key] || 0})
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Frequência</th>
                <th>Próxima execução</th>
                <th>Próximo aviso</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Carregando...</td></tr>
              ) : filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}<small>{item.payeeName}</small></td>
                    <td>{frequencyLabels[item.frequency] || item.frequency}</td>
                    <td>{item.status === 'CANCELADA' ? '-' : dateTimeBR(item.nextRunAt)}</td>
                    <td>{item.status === 'CANCELADA' ? '-' : dateTimeBR(item.nextReminderAt)}</td>
                    <td>{item.managerEmail}</td>
                    <td><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span></td>
                    <td className="actions-cell">
                      {item.status !== 'CANCELADA' ? (
                        <>
                          <button title={item.status === 'ATIVA' ? 'Pausar' : 'Ativar'} onClick={() => toggleStatus(item)}>
                            {item.status === 'ATIVA' ? <FiPause /> : <FiPlay />}
                          </button>
                          <button title="Cancelar" onClick={() => remove(item)}><FiTrash2 /></button>
                        </>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: 12 }}>Sem ações</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    {activeTab === 'CANCELADAS'
                      ? 'Nenhuma programação cancelada.'
                      : 'Nenhuma programação ativa ou pausada cadastrada.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form className="card-section payment-create" onSubmit={submit}>
        <div className="section-title-row">
          <div>
            <h3><FiPlus /> Nova programação</h3>
            <p>Preencha os dados da SP recorrente. O horário é fixo: 06:00 da manhã.</p>
          </div>

          <button type="button" className="secondary-button" onClick={() => setShowOnboarding(true)}>
            <FiInfo /> Ver guia
          </button>
        </div>

        <div className="payment-form-grid">
          <label>Nome da programação<input value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Ex: Aluguel matriz" /></label>
          <label>Frequência<select value={form.frequency} onChange={(e) => update('frequency', e.target.value)}><option value="DIARIA">Diária</option><option value="SEMANAL">Semanal</option><option value="QUINZENAL">Quinzenal</option><option value="MENSAL">Mensal</option><option value="TRIMESTRAL">Trimestral</option></select></label>
          <label>Primeira execução<input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} /></label>
          {shouldShowDayOfMonth && (
            <label>Dia do mês<input type="number" min="1" max="30" value={form.dayOfMonth} onChange={(e) => update('dayOfMonth', e.target.value)} placeholder="Ex: 10 ou de 1 a 30" /></label>
          )}
          <label>E-mail para avisos<input type="email" value={form.managerEmail} onChange={(e) => update('managerEmail', e.target.value)} placeholder={defaultEmail} /></label>
          <label>Gestor<input value={form.managerName} onChange={(e) => update('managerName', e.target.value)} /></label>
          <label>Setor<input value={form.department} onChange={(e) => update('department', e.target.value)} /></label>
          <label>Fornecedor<input value={form.payeeName} onChange={(e) => update('payeeName', e.target.value)} required /></label>
          <label>NF<input value={form.invoiceNumber} onChange={(e) => update('invoiceNumber', e.target.value)} /></label>
          <label>Centro de custo<input value={form.costCenter} onChange={(e) => update('costCenter', e.target.value)} /></label>
          <label>Valor<input value={form.amount} onChange={(e) => update('amount', e.target.value)} required placeholder="3400,00" /></label>
          <label>CPF/CNPJ<input value={form.documentNumber} onChange={(e) => update('documentNumber', e.target.value)} /></label>
          <label>Banco<input value={form.bank} onChange={(e) => update('bank', e.target.value)} /></label>
          <label>Agência<input value={form.agency} onChange={(e) => update('agency', e.target.value)} /></label>
          <label>Conta<input value={form.account} onChange={(e) => update('account', e.target.value)} /></label>
          <label>OP<input value={form.operation} onChange={(e) => update('operation', e.target.value)} /></label>
          <label className="wide">Referente a<textarea value={form.description} onChange={(e) => update('description', e.target.value)} required /></label>
          <label className="wide">Observações<textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} /></label>
        </div>

        <button className="primary-button" disabled={saving}><FiSave /> {saving ? 'Salvando...' : 'Salvar programação'}</button>
      </form>
    </div>
  );
}

export default PaymentSchedulesPage;
