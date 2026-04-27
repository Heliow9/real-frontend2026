import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFileText, FiPlus, FiPrinter, FiSearch, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import {
  createPaymentRequest,
  createPaymentRequestsBulk,
  downloadPaymentRequestsPdf,
  downloadPaymentRequestsXlsx,
  fetchPaymentRequests,
  searchPaymentSuppliers,
  searchCostCenters,
  fetchPaymentRequestJobs
} from '../services/dashboardService';

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
  notes: ''
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
  const [costCenterSuggestions, setCostCenterSuggestions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const activeBulkRow = useMemo(
    () => bulkRows[activeBulkIndex] || bulkRows[0] || createBulkItem(),
    [bulkRows, activeBulkIndex]
  );

  const isAnyFileActionLoading = !!actionLoading;

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [requestsResponse, jobsResponse] = await Promise.all([
        fetchPaymentRequests({ search, from, to }),
        fetchPaymentRequestJobs({ status: 'PENDENTE' }).catch(() => ({ items: [] }))
      ]);
      setItems(requestsResponse.items || []);
      setJobs(jobsResponse.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar as solicitações.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateBulk(index, field, value) {
    setBulkRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  }

  async function handleSupplierInput(value, index = null) {
    if (index === null) updateForm('payeeName', value);
    else updateBulk(index, 'payeeName', value);

    if (value.trim().length < 2) return setSupplierSuggestions([]);

    try {
      const response = await searchPaymentSuppliers(value);
      setSupplierSuggestions((response.items || []).map((item) => ({ ...item, targetIndex: index })));
    } catch (err) {
      setSupplierSuggestions([]);
    }
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

    if (supplier.targetIndex === null || supplier.targetIndex === undefined) {
      setForm((prev) => ({ ...prev, ...patch }));
    } else {
      setBulkRows((prev) =>
        prev.map((row, index) => (index === supplier.targetIndex ? { ...row, ...patch } : row))
      );
    }

    setSupplierSuggestions([]);
  }

  async function handleCostCenterInput(value, index = null) {
    if (index === null) updateForm('costCenter', value);
    else updateBulk(index, 'costCenter', value);

    if (value.trim().length < 2) return setCostCenterSuggestions([]);

    try {
      const response = await searchCostCenters(value);
      setCostCenterSuggestions((response.items || []).map((item) => ({ ...item, targetIndex: index })));
    } catch {
      setCostCenterSuggestions([]);
    }
  }

  function applyCostCenter(costCenter) {
    const value = costCenter.displayName || `${costCenter.code} - ${costCenter.name}`;

    if (costCenter.targetIndex === null || costCenter.targetIndex === undefined) {
      updateForm('costCenter', value);
    } else {
      updateBulk(costCenter.targetIndex, 'costCenter', value);
    }

    setCostCenterSuggestions([]);
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

  async function submit(e) {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'single') {
        await createPaymentRequest(form);
        setForm(emptyItem);
        setMessage('Solicitação enviada para a fila. Ela será processada automaticamente em instantes.');
      } else {
        const validRows = bulkRows.filter((row) => row.payeeName && row.description && row.amount);

        if (!validRows.length) {
          throw new Error('Adicione pelo menos uma solicitação válida ao lote.');
        }

        await createPaymentRequestsBulk(validRows.map(({ _key, ...row }) => row));
        setBulkRows([createBulkItem()]);
        setActiveBulkIndex(0);
        setMessage(`${validRows.length} solicitações enviadas para a fila. Elas serão processadas automaticamente em instantes.`);
      }

      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Não foi possível emitir a solicitação.');
    } finally {
      setSaving(false);
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
          placeholder="Nome / Razao Social"
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

      <label className="suggestion-wrap">
        Centro de custo
        <input
          value={data.costCenter}
          onChange={(e) => handleCostCenterInput(e.target.value, index)}
          placeholder="Ex: 624 - Uruará Novo"
        />

        {costCenterSuggestions.some((s) => s.targetIndex === index) && (
          <div className="suggestion-list">
            {costCenterSuggestions
              .filter((s) => s.targetIndex === index)
              .map((s) => (
                <button type="button" key={s.id} onClick={() => applyCostCenter(s)}>
                  {s.displayName}
                  <small>Centro de custo cadastrado</small>
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
    </div>
  );

  return (
    <div>
      <PageHeader title="Solicitações" subtitle="Emissão, reimpressão e relatório de solicitações de pagamento." />

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
        {jobs.length > 0 && <div className="alert success">Há {jobs.length} item(ns) aguardando processamento na fila.</div>}

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
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Carregando...</td>
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

                    <td className="actions-cell">
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