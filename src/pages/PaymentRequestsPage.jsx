import { useEffect, useState } from 'react';
import { FiDownload, FiFileText, FiPlus, FiPrinter, FiSearch, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import {
  createPaymentRequest,
  createPaymentRequestsBulk,
  downloadPaymentRequestsPdf,
  downloadPaymentRequestsXlsx,
  fetchPaymentRequests,
  searchPaymentSuppliers
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
  const [bulkRows, setBulkRows] = useState([{ ...emptyItem }]);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  async function load() {
    setLoading(true);
    try {
      const response = await fetchPaymentRequests({ search, from, to });
      setItems(response.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível carregar as solicitações.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateBulk(index, field, value) {
    setBulkRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  }

  async function handleSupplierInput(value, index = null) {
    if (index === null) updateForm('payeeName', value);
    else updateBulk(index, 'payeeName', value);

    if (value.trim().length < 2) return setSupplierSuggestions([]);
    const response = await searchPaymentSuppliers(value);
    setSupplierSuggestions((response.items || []).map((item) => ({ ...item, targetIndex: index })));
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
    if (supplier.targetIndex === null || supplier.targetIndex === undefined) setForm((prev) => ({ ...prev, ...patch }));
    else setBulkRows((prev) => prev.map((row, index) => index === supplier.targetIndex ? { ...row, ...patch } : row));
    setSupplierSuggestions([]);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'single') {
        await createPaymentRequest(form);
        setForm(emptyItem);
        setMessage('Solicitação emitida com sucesso.');
      } else {
        const validRows = bulkRows.filter((row) => row.payeeName && row.description && row.amount);
        await createPaymentRequestsBulk(validRows);
        setBulkRows([{ ...emptyItem }]);
        setMessage(`${validRows.length} solicitações emitidas com sucesso.`);
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível emitir a solicitação.');
    } finally {
      setSaving(false);
    }
  }

async function downloadPdf(ids) {
  try {
    const blob = await downloadPaymentRequestsPdf(ids);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download =
      ids.length > 1
        ? 'solicitacoes-pagamento.pdf'
        : `solicitacao-${ids[0]}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
    alert('Não foi possível baixar o PDF.');
  }
}

  async function downloadXlsx(ids) {
    const blob = await downloadPaymentRequestsXlsx(ids);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ids.length > 1 ? 'solicitacoes-pagamento.zip' : `solicitacao-${ids[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

async function printPdf(ids) {
  try {
    const blob = await downloadPaymentRequestsPdf(ids);
    const url = URL.createObjectURL(blob);

    const win = window.open(url, '_blank');

    if (!win) {
      alert('Permita pop-ups para imprimir.');
      return;
    }

    setTimeout(() => {
      win.print();
    }, 1000);
  } catch (err) {
    console.error(err);
    alert('Erro ao imprimir PDF.');
  }
}

  const renderFields = (data, onChange, index = null) => (
    <div className="payment-form-grid">
      <label>Gestor responsável<input value={data.managerName} onChange={(e) => onChange('managerName', e.target.value)} placeholder="Nome do gestor" /></label>
      <label>Setor<input value={data.department} onChange={(e) => onChange('department', e.target.value)} placeholder="Ex: TI" /></label>
      <label className="suggestion-wrap">Solicito pagamento<input value={data.payeeName} onChange={(e) => handleSupplierInput(e.target.value, index)} placeholder="CPF/CNPJ ou nome do fornecedor" required />
        {supplierSuggestions.some((s) => s.targetIndex === index) && <div className="suggestion-list">{supplierSuggestions.filter((s) => s.targetIndex === index).map((s) => <button type="button" key={s.id} onClick={() => applySupplier(s)}>{s.name}<small>{s.documentNumber}</small></button>)}</div>}
      </label>
      <label>NF<input value={data.invoiceNumber} onChange={(e) => onChange('invoiceNumber', e.target.value)} /></label>
      <label>Centro de custo<input value={data.costCenter} onChange={(e) => onChange('costCenter', e.target.value)} placeholder="Administrativo" /></label>
      <label>Vencimento<input type="date" value={data.dueDate} onChange={(e) => onChange('dueDate', e.target.value)} /></label>
      <label>Banco<input value={data.bank} onChange={(e) => onChange('bank', e.target.value)} /></label>
      <label>Agência<input value={data.agency} onChange={(e) => onChange('agency', e.target.value)} /></label>
      <label>Conta<input value={data.account} onChange={(e) => onChange('account', e.target.value)} /></label>
      <label>OP<input value={data.operation} onChange={(e) => onChange('operation', e.target.value)} /></label>
      <label>CPF/CNPJ<input value={data.documentNumber} onChange={(e) => onChange('documentNumber', e.target.value)} /></label>
      <label>Valor<input value={data.amount} onChange={(e) => onChange('amount', e.target.value)} placeholder="3400,00" required /></label>
      <label className="wide">Referente a<textarea value={data.description} onChange={(e) => onChange('description', e.target.value)} required /></label>
      <label className="wide">Obs<textarea value={data.notes} onChange={(e) => onChange('notes', e.target.value)} /></label>
    </div>
  );

  return (
    <div>
      <PageHeader title="Solicitações" subtitle="Emissão, reimpressão e relatório de solicitações de pagamento." />

      <form className="card-section payment-create" onSubmit={submit}>
        <div className="section-title-row">
          <div><h3>Nova solicitação de pagamento</h3><p>Crie uma solicitação individual ou em lote, uma por página no PDF.</p></div>
          <div className="segmented"><button type="button" className={mode === 'single' ? 'active' : ''} onClick={() => setMode('single')}>Individual</button><button type="button" className={mode === 'bulk' ? 'active' : ''} onClick={() => setMode('bulk')}>Em lote</button></div>
        </div>
        {mode === 'single' ? renderFields(form, updateForm, null) : (
          <div className="bulk-stack">
            {bulkRows.map((row, index) => <div key={index} className="bulk-card"><div className="section-title-row"><strong>Solicitação {index + 1}</strong>{bulkRows.length > 1 && <button type="button" className="ghost danger" onClick={() => setBulkRows((rows) => rows.filter((_, i) => i !== index))}><FiTrash2 /> Remover</button>}</div>{renderFields(row, (field, value) => updateBulk(index, field, value), index)}</div>)}
            <button type="button" className="secondary-button" onClick={() => setBulkRows((rows) => [...rows, { ...emptyItem }])}><FiPlus /> Adicionar solicitação ao lote</button>
          </div>
        )}
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        <button className="primary-button" disabled={saving}>{saving ? 'Emitindo...' : 'Emitir solicitação'}</button>
      </form>

      <div className="card-section">
        <div className="section-title-row"><div><h3>Relatório e reimpressão</h3><p>Filtre as emissões diárias, baixe ou imprima individualmente ou em lote.</p></div></div>
        <div className="filters-row">
          <div className="search-box"><FiSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por protocolo, fornecedor, CPF/CNPJ ou NF" /></div>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <button className="secondary-button" onClick={load}>Filtrar</button>
        </div>
        <div className="bulk-actions"><button disabled={!selectedIds.length} onClick={() => downloadPdf(selectedIds)}><FiDownload /> Baixar PDF</button><button disabled={!selectedIds.length} onClick={() => downloadXlsx(selectedIds)}><FiFileText /> Baixar Excel</button><button disabled={!selectedIds.length} onClick={() => printPdf(selectedIds)}><FiPrinter /> Imprimir PDF</button></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th></th><th>Protocolo</th><th>Fornecedor</th><th>Valor</th><th>Vencimento</th><th>Emissão</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Carregando...</td></tr> : items.map((item) => <tr key={item.id}><td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id))} /></td><td>{item.protocol}</td><td>{item.payeeName}<small>{item.documentNumber}</small></td><td>{money(item.amount)}</td><td>{dateBR(item.dueDate)}</td><td>{dateBR(item.createdAt)}</td><td className="actions-cell"><button onClick={() => downloadPdf([item.id])}><FiDownload /></button><button title="Baixar Excel" onClick={() => downloadXlsx([item.id])}><FiFileText /></button><button title="Imprimir PDF" onClick={() => printPdf([item.id])}><FiPrinter /></button></td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}

export default PaymentRequestsPage;
