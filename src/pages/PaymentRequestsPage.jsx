import { useEffect, useMemo, useRef, useState } from 'react';
import { FiDownload, FiEdit2, FiFileText, FiPaperclip, FiPlus, FiPrinter, FiSearch, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import {
  createPaymentRequest,
  createPaymentRequestsBulk,
  updatePaymentRequest,
  deletePaymentRequest,
  downloadPaymentRequestsPdf,
  downloadPaymentRequestsXlsx,
  fetchPaymentRequests,
  fetchPaymentRequestQueueStatus,
  searchPaymentSuppliers,
  searchCostCenters
} from '../services/dashboardService';


const COST_CENTER_OPTIONS = [
  'Administrativo',
  'Adm',
  'Almoxarifado',
  'Comercial',
  'Compras',
  'Contabilidade',
  'Diretoria',
  'Financeiro',
  'Fiscal',
  'Jurídico',
  'Logística',
  'Manutenção',
  'Marketing',
  'Obra',
  'Operacional',
  'Produção',
  'Projetos',
  'RH',
  'Segurança do Trabalho',
  'Suprimentos',
  'TI'
];

const emptyItem = {
  managerName: '',
  department: '',
  payeeName: '',
  invoiceNumber: '',
  costCenter: '',
  description: '',
  dueDate: '',
  bank: '',
  agency: '',
  account: '',
  operation: '',
  documentNumber: '',
  amount: '',
  notes: '',
  invoiceAttachment: null,
  boletoAttachment: null
};

function money(value) {
  const n = Number(value || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function dateBR(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

function createBulkItem() {
  return { ...emptyItem, _key: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
}

function getActionKey(type, ids) {
  return `${type}:${ids.join(',')}`;
}

async function getBlobErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();

      try {
        const json = JSON.parse(text);
        return json.message || json.error || fallback;
      } catch {
        return text || fallback;
      }
    } catch {
      return fallback;
    }
  }

  return err?.response?.data?.message || err?.message || fallback;
}


function normalizeCostCenterItems(response) {
  if (Array.isArray(response)) return response;
  return response?.items || response?.data || [];
}

function getCostCenterLabel(item) {
  if (typeof item === 'string') return item;
  return item?.displayName || item?.name || item?.description || item?.code || '';
}
function PaymentRequestsPage() {
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState(emptyItem);
  const [bulkRows, setBulkRows] = useState([createBulkItem()]);
  const [activeBulkIndex, setActiveBulkIndex] = useState(0);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [costCenterSuggestionTarget, setCostCenterSuggestionTarget] = useState(null);
  const [costCenterSuggestions, setCostCenterSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyItem);
  const queuePollingRef = useRef(null);

  const activeBulkRow = useMemo(
    () => bulkRows[activeBulkIndex] || bulkRows[0] || createBulkItem(),
    [bulkRows, activeBulkIndex]
  );

  const availableCostCenters = useMemo(() => {
    const registeredCenters = items
      .map((item) => item.costCenter)
      .filter(Boolean);

    const fetchedCenters = costCenterSuggestions
      .map(getCostCenterLabel)
      .filter(Boolean);

    return Array.from(new Set([...fetchedCenters, ...registeredCenters, ...COST_CENTER_OPTIONS]))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [items, costCenterSuggestions]);

  const isAnyFileActionLoading = !!actionLoading;

  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true);
    if (!silent) setError('');

    try {
      const response = await fetchPaymentRequests({ search, from, to });
      setItems(response.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar as solicitações.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();

    return () => {
      if (queuePollingRef.current) clearInterval(queuePollingRef.current);
    };
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateFormAttachment(field, file) {
    setForm((prev) => ({ ...prev, [field]: file || null }));
  }

  function updateBulk(index, field, value) {
    setBulkRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  }

  function updateBulkAttachment(index, field, file) {
    setBulkRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: file || null } : row))
    );
  }

  async function handleSupplierInput(value, index = null) {
    if (index === 'edit') updateEditForm('payeeName', value);
    else if (index === null) updateForm('payeeName', value);
    else updateBulk(index, 'payeeName', value);

    if (value.trim().length < 2) return setSupplierSuggestions([]);

    try {
      const response = await searchPaymentSuppliers(value);
      setSupplierSuggestions((response.items || []).map((item) => ({ ...item, targetIndex: index })));
    } catch (err) {
      setSupplierSuggestions([]);
    }
  }

  async function handleCostCenterInput(value, index = null) {
    if (index === 'edit') updateEditForm('costCenter', value);
    else if (index === null) updateForm('costCenter', value);
    else updateBulk(index, 'costCenter', value);

    if (value.trim().length < 2) {
      setCostCenterSuggestionTarget(null);
      return setCostCenterSuggestions([]);
    }

    setCostCenterSuggestionTarget(index);

    try {
      const response = await searchCostCenters(value);
      setCostCenterSuggestions(
        normalizeCostCenterItems(response).map((item) => ({
          ...(typeof item === 'string' ? { name: item } : item),
          targetIndex: index
        }))
      );
    } catch (err) {
      setCostCenterSuggestions([]);
    }
  }

  function getCostCenterSuggestions(value, index = null) {
    const term = (value || '').trim().toLowerCase();

    if (!term) return [];

    const fetched = costCenterSuggestions
      .filter((item) => item.targetIndex === index)
      .map((item) => ({
        key: item.id || item.code || getCostCenterLabel(item),
        label: getCostCenterLabel(item),
        hint: item.code ? `Código ${item.code}` : 'Centro de custo cadastrado no banco'
      }))
      .filter((item) => item.label);

    const fallback = availableCostCenters
      .filter((option) => option.toLowerCase().includes(term))
      .map((option) => ({ key: option, label: option, hint: 'Sugestão local' }));

    const seen = new Set();
    return [...fetched, ...fallback]
      .filter((item) => {
        const key = item.label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }

  function applyCostCenter(option, index = null) {
    const value = typeof option === 'string' ? option : option.label;

    if (index === 'edit') updateEditForm('costCenter', value);
    else if (index === null) updateForm('costCenter', value);
    else updateBulk(index, 'costCenter', value);

    setCostCenterSuggestionTarget(null);
    setCostCenterSuggestions([]);
  }

  function applySupplier(supplier) {
    const patch = {
      payeeName: supplier.name || '',
      documentNumber: supplier.documentNumber || '',
      bank: supplier.bank || '',
      agency: supplier.agency || '',
      account: supplier.account || '',
      operation: supplier.operation || ''
    };

    if (supplier.targetIndex === 'edit') {
      setEditForm((prev) => ({ ...prev, ...patch }));
    } else if (supplier.targetIndex === null || supplier.targetIndex === undefined) {
      setForm((prev) => ({ ...prev, ...patch }));
    } else {
      setBulkRows((prev) =>
        prev.map((row, index) => (index === supplier.targetIndex ? { ...row, ...patch } : row))
      );
    }

    setSupplierSuggestions([]);
  }

  function addBulkRow() {
    setBulkRows((rows) => {
      const next = [...rows, createBulkItem()];
      setActiveBulkIndex(next.length - 1);
      return next;
    });
  }

  function removeBulkRow(indexToRemove) {
    setBulkRows((rows) => {
      const next = rows.filter((_, index) => index !== indexToRemove);
      const safeNext = next.length ? next : [createBulkItem()];

      setActiveBulkIndex((current) =>
        Math.min(current === indexToRemove ? Math.max(0, indexToRemove - 1) : current, safeNext.length - 1)
      );

      return safeNext;
    });
  }


  function stopQueuePolling() {
    if (queuePollingRef.current) {
      clearInterval(queuePollingRef.current);
      queuePollingRef.current = null;
    }
  }

  function startQueuePolling(jobId = null) {
    stopQueuePolling();

    let attempts = 0;
    const maxAttempts = 20;

    queuePollingRef.current = setInterval(async () => {
      attempts += 1;

      try {
        const status = await fetchPaymentRequestQueueStatus(jobId);
        const job = status.job;
        const queueTotal = status.queue?.total || 0;

        await load({ silent: true });

        if (job?.status === 'COMPLETED') {
          stopQueuePolling();
          setMessage('Solicitação processada e relatório atualizado.');
          return;
        }

        if (job?.status === 'ERROR') {
          stopQueuePolling();
          setError(job.error || 'A fila retornou erro ao processar a solicitação.');
          setMessage('');
          return;
        }

        if (!jobId && queueTotal === 0) {
          stopQueuePolling();
          setMessage('Fila processada e relatório atualizado.');
          return;
        }

        if (attempts >= maxAttempts) {
          stopQueuePolling();
          setMessage('A solicitação continua na fila. O relatório será atualizado ao filtrar/reabrir a tela.');
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          stopQueuePolling();
        }
      }
    }, 3000);
  }

  async function submit(e) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'single') {
        const response = await createPaymentRequest(form);
        setForm(emptyItem);
        setMessage(response.message || 'Solicitação enviada para a fila. Atualizando relatório automaticamente...');
        startQueuePolling(response.job?.id);
      } else {
        const validRows = bulkRows.filter((row) => row.payeeName && row.description && row.amount);

        if (!validRows.length) {
          throw new Error('Adicione pelo menos uma solicitação válida ao lote.');
        }

        const response = await createPaymentRequestsBulk(validRows.map(({ _key, ...row }) => row));
        setBulkRows([createBulkItem()]);
        setActiveBulkIndex(0);
        setMessage(response.message || `${validRows.length} solicitações enviadas para a fila. Atualizando relatório automaticamente...`);
        startQueuePolling(response.job?.id);
      }

      await load({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Não foi possível emitir a solicitação.');
    } finally {
      setSaving(false);
    }
  }


  function startEdit(item) {
    setEditing(item);
    setEditForm({
      ...emptyItem,
      managerName: item.managerName || '',
      department: item.department || '',
      payeeName: item.payeeName || '',
      invoiceNumber: item.invoiceNumber || '',
      costCenter: item.costCenter || '',
      description: item.description || '',
      dueDate: item.dueDate ? String(item.dueDate).slice(0, 10) : '',
      bank: item.bank || '',
      agency: item.agency || '',
      account: item.account || '',
      operation: item.operation || '',
      documentNumber: item.documentNumber || '',
      amount: item.amount || '',
      notes: item.notes || '',
      invoiceAttachment: null,
      boletoAttachment: null
    });
    setMode('single');
  }

  function updateEditForm(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateEditAttachment(field, file) {
    setEditForm((prev) => ({ ...prev, [field]: file || null }));
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editing || saving) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updatePaymentRequest(editing.id, editForm);
      setEditing(null);
      setEditForm(emptyItem);
      setMessage('SP atualizada com sucesso. Se NF ou boleto foram trocados, o arquivo antigo foi removido do servidor.');
      await load({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Não foi possível atualizar a SP.');
    } finally {
      setSaving(false);
    }
  }

  async function removePaymentRequest(item) {
    if (!window.confirm(`Excluir definitivamente a ${item.protocol}? NF e boleto vinculados também serão removidos do servidor.`)) return;
    setActionLoading(`delete:${item.id}`);
    setError('');
    setMessage('');
    try {
      await deletePaymentRequest(item.id);
      setSelectedIds((ids) => ids.filter((id) => id !== item.id));
      setMessage('SP excluída com sucesso e anexos removidos do servidor.');
      await load({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Não foi possível excluir a SP.');
    } finally {
      setActionLoading('');
    }
  }

  async function downloadPdf(ids) {
    const actionKey = getActionKey('pdf', ids);
    if (actionLoading) return;

    setActionLoading(actionKey);
    setError('');
    setMessage('Gerando PDF. Aguarde...');

    try {
      const blob = await downloadPaymentRequestsPdf(ids);

      if (!blob || blob.size === 0) {
        throw new Error('O backend retornou um PDF vazio.');
      }

      if (blob.type && !blob.type.includes('pdf')) {
        const text = await blob.text();
        throw new Error(text || 'O backend não retornou um PDF válido.');
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));

      const link = document.createElement('a');
      link.href = url;
      link.download = ids.length > 1 ? 'solicitacoes-pagamento.pdf' : `solicitacao-${ids[0]}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      setMessage('PDF gerado com sucesso.');
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      const message = await getBlobErrorMessage(err, 'Não foi possível baixar o PDF.');
      setError(message);
      setMessage('');
    } finally {
      setActionLoading('');
    }
  }

  async function downloadXlsx(ids) {
    const actionKey = getActionKey('xlsx', ids);
    if (actionLoading) return;

    setActionLoading(actionKey);
    setError('');
    setMessage('Gerando arquivo Excel. Aguarde...');

    try {
      const blob = await downloadPaymentRequestsXlsx(ids);

      if (!blob || blob.size === 0) {
        throw new Error('O backend retornou um arquivo vazio.');
      }

      const isZip = ids.length > 1;
      const type = isZip
        ? 'application/zip'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const url = URL.createObjectURL(new Blob([blob], { type }));

      const link = document.createElement('a');
      link.href = url;
      link.download = isZip ? 'solicitacoes-pagamento.zip' : `solicitacao-${ids[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
      setMessage('Arquivo Excel gerado com sucesso.');
    } catch (err) {
      console.error('Erro ao baixar Excel:', err);
      const message = await getBlobErrorMessage(err, 'Não foi possível baixar o arquivo Excel.');
      setError(message);
      setMessage('');
    } finally {
      setActionLoading('');
    }
  }

  async function printPdf(ids) {
    const actionKey = getActionKey('print', ids);
    if (actionLoading) return;

    setActionLoading(actionKey);
    setError('');
    setMessage('Preparando impressão. Aguarde...');

    try {
      const blob = await downloadPaymentRequestsPdf(ids);

      if (!blob || blob.size === 0) {
        throw new Error('O backend retornou um PDF vazio.');
      }

      if (blob.type && !blob.type.includes('pdf')) {
        const text = await blob.text();
        throw new Error(text || 'O backend não retornou um PDF válido.');
      }

      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const win = window.open(url, '_blank');

      if (!win) {
        setError('O navegador bloqueou a janela de impressão. Permita pop-ups para este site.');
        setMessage('');
        URL.revokeObjectURL(url);
        return;
      }

      setTimeout(() => {
        try {
          win.focus();
          win.print();
        } catch (printError) {
          console.error(printError);
        }
      }, 1200);

      setMessage('PDF preparado para impressão.');
    } catch (err) {
      console.error('Erro ao imprimir PDF:', err);
      const message = await getBlobErrorMessage(err, 'Não foi possível preparar a impressão.');
      setError(message);
      setMessage('');
    } finally {
      setActionLoading('');
    }
  }

  function actionLabel(type, ids, defaultLabel) {
    const actionKey = getActionKey(type, ids);
    if (actionLoading !== actionKey) return defaultLabel;

    if (type === 'pdf') return 'Gerando PDF...';
    if (type === 'xlsx') return 'Gerando Excel...';
    if (type === 'print') return 'Preparando...';

    return 'Aguarde...';
  }

  const renderFields = (data, onChange, index = null) => (
    <div className="payment-form-grid">
            <label className="suggestion-wrap">
        Solicito pagamento
        <input
          value={data.payeeName}
          onChange={(e) => handleSupplierInput(e.target.value, index)}
          placeholder="Nome do fornecedor"
          required
        />

        {supplierSuggestions.some((s) => s.targetIndex === index) && (
          <div className="suggestion-list">
            {supplierSuggestions
              .filter((s) => s.targetIndex === index)
              .map((s) => (
                <button type="button" key={s.id} onClick={() => applySupplier(s)}>
                  {s.name}
                  <small>{s.documentNumber}</small>
                </button>
              ))}
          </div>
        )}
      </label>
      <label>
        Gestor responsável
        <input value={data.managerName} onChange={(e) => onChange('managerName', e.target.value)} placeholder="Nome do gestor" />
      </label>

      <label>
        Setor
        <input value={data.department} onChange={(e) => onChange('department', e.target.value)} placeholder="Ex: TI" />
      </label>



      <label>
        NF
        <input value={data.invoiceNumber} onChange={(e) => onChange('invoiceNumber', e.target.value)} />
      </label>

      <label className="suggestion-wrap premium-autocomplete">
        Centro de custo
        <input
          value={data.costCenter}
          onFocus={() => {
            if ((data.costCenter || '').trim()) setCostCenterSuggestionTarget(index);
          }}
          onChange={(e) => handleCostCenterInput(e.target.value, index)}
          placeholder="Digite o centro de custo"
        />

        {costCenterSuggestionTarget === index && getCostCenterSuggestions(data.costCenter, index).length > 0 && (
          <div className="suggestion-list">
            {getCostCenterSuggestions(data.costCenter, index).map((option) => (
              <button type="button" key={option.key} onClick={() => applyCostCenter(option, index)}>
                <strong>{option.label}</strong>
                <small>{option.hint}</small>
              </button>
            ))}
          </div>
        )}
      </label>

      <label>
        Vencimento
        <input type="date" value={data.dueDate} onChange={(e) => onChange('dueDate', e.target.value)} />
      </label>

      <label>
        Banco
        <input value={data.bank} onChange={(e) => onChange('bank', e.target.value)} />
      </label>

      <label>
        Agência
        <input value={data.agency} onChange={(e) => onChange('agency', e.target.value)} />
      </label>

      <label>
        Conta
        <input value={data.account} onChange={(e) => onChange('account', e.target.value)} />
      </label>

      <label>
        OP
        <input value={data.operation} onChange={(e) => onChange('operation', e.target.value)} />
      </label>

      <label>
        CPF/CNPJ
        <input value={data.documentNumber} onChange={(e) => onChange('documentNumber', e.target.value)} />
      </label>

      <label>
        Valor
        <input value={data.amount} onChange={(e) => onChange('amount', e.target.value)} placeholder="3400,00" required />
      </label>

      <label className="wide">
        Referente a
        <textarea value={data.description} onChange={(e) => onChange('description', e.target.value)} required />
      </label>

      <label className="wide">
        Obs
        <textarea value={data.notes} onChange={(e) => onChange('notes', e.target.value)} />
      </label>

      <label>
        Anexar NF
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            if (index === 'edit') updateEditAttachment('invoiceAttachment', file);
            else if (index === null) updateFormAttachment('invoiceAttachment', file);
            else updateBulkAttachment(index, 'invoiceAttachment', file);
          }}
        />
        {data.invoiceAttachment ? <small><FiPaperclip /> {data.invoiceAttachment.name}</small> : null}
      </label>

      <label>
        Anexar boleto
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            if (index === 'edit') updateEditAttachment('boletoAttachment', file);
            else if (index === null) updateFormAttachment('boletoAttachment', file);
            else updateBulkAttachment(index, 'boletoAttachment', file);
          }}
        />
        {data.boletoAttachment ? <small><FiPaperclip /> {data.boletoAttachment.name}</small> : null}
      </label>
    </div>
  );

  return (
    <div>
      <PageHeader title="Solicitações" subtitle="Emissão, reimpressão e relatório de solicitações de pagamento." />


      {editing && (
        <form className="card-section payment-create" onSubmit={submitEdit} style={{ border: '1px solid #f59e0b' }}>
          <div className="section-title-row">
            <div>
              <h3><FiEdit2 /> Editando {editing.protocol}</h3>
              <p>Ao anexar nova NF ou novo boleto, o arquivo anterior será substituído e removido do servidor.</p>
            </div>
            <button type="button" className="ghost" onClick={() => setEditing(null)} disabled={saving}>Cancelar edição</button>
          </div>
          {renderFields(editForm, updateEditForm, 'edit')}
          <button className="primary-button" disabled={saving}>{saving ? 'Salvando edição...' : 'Salvar edição da SP'}</button>
        </form>
      )}

      <form className="card-section payment-create" onSubmit={submit}>
        <div className="section-title-row">
          <div>
            <h3>Nova solicitação de pagamento</h3>
            <p>Crie uma solicitação individual ou em lote, uma por página no PDF.</p>
          </div>

          <div className="segmented">
            <button type="button" className={mode === 'single' ? 'active' : ''} onClick={() => setMode('single')} disabled={saving}>
              Individual
            </button>
            <button type="button" className={mode === 'bulk' ? 'active' : ''} onClick={() => setMode('bulk')} disabled={saving}>
              Em lote
            </button>
          </div>
        </div>

        {mode === 'single' ? (
          renderFields(form, updateForm, null)
        ) : (
          <div className="bulk-tabs-layout">
            <aside className="bulk-tabs-sidebar">
              {bulkRows.map((row, index) => (
                <button
                  type="button"
                  key={row._key || index}
                  className={`bulk-tab-button ${activeBulkIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveBulkIndex(index)}
                  disabled={saving}
                >
                  <strong>SP {index + 1}</strong>
                  <span>{row.payeeName || 'Fornecedor não informado'}</span>
                </button>
              ))}

              <button type="button" className="bulk-add-tab" onClick={addBulkRow} disabled={saving}>
                <FiPlus /> Nova SP
              </button>
            </aside>

            <div className="bulk-tab-content">
              <div className="section-title-row">
                <div>
                  <strong>Solicitação {activeBulkIndex + 1}</strong>
                  <p>Preencha os dados desta SP e navegue pelas abas laterais.</p>
                </div>

                {bulkRows.length > 1 && (
                  <button type="button" className="ghost danger" onClick={() => removeBulkRow(activeBulkIndex)} disabled={saving}>
                    <FiTrash2 /> Remover esta SP
                  </button>
                )}
              </div>

              {renderFields(activeBulkRow, (field, value) => updateBulk(activeBulkIndex, field, value), activeBulkIndex)}
            </div>
          </div>
        )}

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <button className="primary-button" disabled={saving}>
          {saving ? 'Emitindo solicitação...' : 'Emitir solicitação'}
        </button>
      </form>

      <div className="card-section">
        <div className="section-title-row">
          <div>
            <h3>Relatório e reimpressão</h3>
            <p>Filtre as emissões diárias, baixe ou imprima individualmente ou em lote.</p>
          </div>
        </div>

        <div className="filters-row">
          <div className="search-box">
            <FiSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por protocolo, fornecedor, CPF/CNPJ ou NF"
              disabled={loading}
            />
          </div>

          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={loading} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={loading} />

          <button className="secondary-button" onClick={load} disabled={loading}>
            {loading ? 'Filtrando...' : 'Filtrar'}
          </button>
        </div>

        <div className="bulk-actions">
          <button disabled={!selectedIds.length || isAnyFileActionLoading} onClick={() => downloadPdf(selectedIds)}>
            <FiDownload /> {actionLabel('pdf', selectedIds, 'Baixar PDF')}
          </button>

          <button disabled={!selectedIds.length || isAnyFileActionLoading} onClick={() => downloadXlsx(selectedIds)}>
            <FiFileText /> {actionLabel('xlsx', selectedIds, 'Baixar Excel')}
          </button>

          <button disabled={!selectedIds.length || isAnyFileActionLoading} onClick={() => printPdf(selectedIds)}>
            <FiPrinter /> {actionLabel('print', selectedIds, 'Imprimir PDF')}
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Protocolo</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Emissão</th>
                <th>Anexos</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Carregando...</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        disabled={isAnyFileActionLoading}
                        onChange={(e) =>
                          setSelectedIds((ids) =>
                            e.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id)
                          )
                        }
                      />
                    </td>

                    <td>{item.protocol}</td>

                    <td>
                      {item.payeeName}
                      <small>{item.documentNumber}</small>
                    </td>

                    <td>{money(item.amount)}</td>
                    <td>{dateBR(item.dueDate)}</td>
                    <td>{dateBR(item.createdAt)}</td>

                    <td>
                      {item.invoiceAttachmentUrl || item.boletoAttachmentUrl ? (
                        <small>
                          {item.invoiceAttachmentUrl ? 'NF ' : ''}
                          {item.boletoAttachmentUrl ? 'Boleto' : ''}
                        </small>
                      ) : '-'}
                    </td>

                    <td className="actions-cell">
                      <button title="Editar SP" disabled={isAnyFileActionLoading} onClick={() => startEdit(item)}><FiEdit2 /></button>

                      <button title="Excluir SP" disabled={isAnyFileActionLoading} onClick={() => removePaymentRequest(item)}>{actionLoading === `delete:${item.id}` ? '...' : <FiTrash2 />}</button>

                      <button title="Baixar PDF" disabled={isAnyFileActionLoading} onClick={() => downloadPdf([item.id])}>
                        {actionLoading === getActionKey('pdf', [item.id]) ? '...' : <FiDownload />}
                      </button>

                      <button title="Baixar Excel" disabled={isAnyFileActionLoading} onClick={() => downloadXlsx([item.id])}>
                        {actionLoading === getActionKey('xlsx', [item.id]) ? '...' : <FiFileText />}
                      </button>

                      <button title="Imprimir PDF" disabled={isAnyFileActionLoading} onClick={() => printPdf([item.id])}>
                        {actionLoading === getActionKey('print', [item.id]) ? '...' : <FiPrinter />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




export default PaymentRequestsPage;