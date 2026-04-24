import { useEffect, useMemo, useState } from 'react';
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

function escapeHtml(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function amountBR(value) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    const n = Number(normalized);
    if (!Number.isNaN(n)) return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value;
  }
  return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function paymentDocumentHtml(item) {
  const description = escapeHtml((item.description || item.notes || '').toUpperCase()).replace(/\n/g, '<br />');
  const manager = escapeHtml((item.managerName || '').toUpperCase());
  const emitted = dateBR(item.createdAt || new Date());

  return `
    <section class="payment-a4-page">
      <div class="payment-document">
        <header class="payment-doc-header">
          <div class="header-shape header-gray"></div>
          <div class="header-shape header-blue"></div>
          <div class="header-shape header-orange"></div>
          <div class="logo-realenergy">
            <div class="logo-real">REAL</div>
            <div class="logo-energy">ENERGY</div>
          </div>
          <h1>SOLICITAÇÃO DE PAGAMENTO</h1>
        </header>

        <div class="doc-row row-payee">
          <div class="doc-label">SOLICITO PAGAMENTO:</div>
          <div class="doc-value">${escapeHtml((item.payeeName || '').toUpperCase())}</div>
          <div class="doc-nf" rowspan="2"><strong>NF:</strong><br />${escapeHtml((item.invoiceNumber || '').toUpperCase())}</div>
        </div>
        <div class="doc-row row-cost">
          <div class="doc-label">CENTRO DE CUSTO:</div>
          <div class="doc-value">${escapeHtml((item.costCenter || '').toUpperCase())}</div>
        </div>
        <div class="doc-row row-manager">
          <div class="doc-label">GESTOR RESPONSÁVEL:</div>
          <div class="doc-value manager-value">${manager}</div>
          <div class="doc-label setor-label">SETOR:</div>
          <div class="doc-value setor-value">${escapeHtml((item.department || '').toUpperCase())}</div>
        </div>

        <main class="doc-body">
          <section class="obs-box">
            <div class="obs-title">OBS:</div>
            <div class="obs-content">${description}</div>
          </section>

          <aside class="bank-box">
            <div class="bank-row"><div>BANCO:</div><span>${escapeHtml((item.bank || '').toUpperCase())}</span></div>
            <div class="bank-row"><div>AGÊNCIA:</div><span>${escapeHtml((item.agency || '').toUpperCase())}</span></div>
            <div class="bank-row"><div>CONTA:</div><span>${escapeHtml((item.account || '').toUpperCase())}</span></div>
            <div class="bank-row"><div>OP:</div><span>${escapeHtml((item.operation || '').toUpperCase())}</span></div>
            <div class="bank-row"><div>CPF/CNPJ:</div><span>${escapeHtml((item.documentNumber || '').toUpperCase())}</span></div>
            <div class="value-row"><div>VALOR:</div><strong>R$</strong><span>${amountBR(item.amount)}</span></div>
          </aside>
        </main>

        <footer class="signature-area">
          <div class="govbr-simulated">
            <div class="gov-logo"><span class="gov-blue">gov</span><span class="gov-yellow">.</span><span class="gov-green">br</span></div>
            <div class="gov-text">
              <span>Documento assinado digitalmente</span>
              <strong>${manager || 'GESTOR RESPONSÁVEL'}</strong>
              <span>Data: ${emitted} 09:56:36-0300</span>
              <span>Verifique em https://validar.iti.gov.br</span>
            </div>
          </div>
          <div class="signatures">
            <div><span></span><strong>GESTOR RESPONSÁVEL</strong></div>
            <div><span></span><strong>DIRETOR</strong></div>
          </div>
        </footer>
      </div>
    </section>`;
}

function printHtml(items) {
  const pages = items.map(paymentDocumentHtml).join('');
  const win = window.open('', '_blank');
  win.document.write(`<!doctype html><html><head><title>Solicitações</title><style>
    *{box-sizing:border-box} html,body{margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif}.payment-a4-page{width:210mm;height:297mm;background:#fff;page-break-after:always;break-after:page;position:relative;padding:8mm 0 0 0}.payment-document{position:relative;width:180mm;height:132mm;margin:0 auto;border:0.55mm solid #111;background:#fff;overflow:hidden}.payment-doc-header{position:relative;height:32mm;border-bottom:0.55mm solid #111}.header-shape{position:absolute;top:0;height:15.5mm}.header-gray{left:0;width:72mm;background:#777;clip-path:polygon(0 0,70% 0,100% 100%,23% 100%)}.header-blue{right:0;width:128mm;background:#244ea3;clip-path:polygon(0 0,100% 0,100% 72%,18% 72%)}.header-orange{right:0;top:14mm;width:107mm;height:3.4mm;background:#ef7425;clip-path:polygon(0 0,100% 0,100% 100%,6% 100%)}.logo-realenergy{position:absolute;left:18mm;top:10mm;text-align:center;color:#25147b;font-weight:900;line-height:.72}.logo-real{font-size:14mm;letter-spacing:.8mm}.logo-energy{font-size:7.3mm;letter-spacing:1.5mm}.payment-doc-header h1{position:absolute;right:23mm;top:16.5mm;margin:0;font-size:7mm;font-style:italic;font-weight:900}.doc-row{display:flex;height:7mm;border-bottom:0.55mm solid #111;font-size:3.75mm;line-height:7mm}.doc-label{width:37.5mm;border-right:0.55mm solid #111;text-align:center;font-weight:900}.doc-value{flex:1;padding:0 1.2mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.doc-nf{width:29mm;border-left:0.55mm solid #111;padding:0 1mm;line-height:5mm;font-size:3.7mm;font-weight:400}.row-payee .doc-nf{height:14mm;margin-bottom:-7mm;z-index:2;background:#fff}.row-cost{width:151mm}.row-manager .doc-label{width:37.5mm}.row-manager .manager-value{width:58mm;flex:none;border-right:0.55mm solid #111}.row-manager .setor-label{width:18mm}.row-manager .setor-value{text-align:center}.doc-body{display:flex;gap:3.5mm;padding-top:4mm}.obs-box{width:111mm;margin-left:0;border-top:0.55mm solid #111;border-right:0.55mm solid #111;border-bottom:0.55mm solid #111;height:56mm}.obs-title{height:7mm;border-bottom:0.55mm solid #111;width:25mm;text-align:center;font-size:3.8mm;font-weight:900;line-height:7mm}.obs-content{height:49mm;padding:.8mm;font-size:3.9mm;line-height:1.45;text-transform:uppercase;overflow:hidden}.bank-box{width:65mm}.bank-row{height:13mm;border:0.55mm solid #111;border-bottom:0;display:flex;font-size:3.8mm}.bank-row div{width:16mm;border-right:0.55mm solid #111;display:flex;align-items:center;justify-content:center;font-weight:900}.bank-row span{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 1mm}.bank-row:nth-child(5){border-bottom:0.55mm solid #111}.value-row{height:13.5mm;border:0.55mm solid #111;margin-top:4mm;display:flex;align-items:center;font-size:3.9mm}.value-row div{width:16mm;height:100%;border-right:0.55mm solid #111;display:flex;align-items:center;justify-content:center;font-weight:900}.value-row strong{width:8mm;padding-left:2mm}.value-row span{flex:1;text-align:right;padding-right:2mm;font-weight:900}.signature-area{position:absolute;left:0;right:0;bottom:11mm;height:42mm}.govbr-simulated{position:absolute;left:25mm;top:3mm;display:flex;align-items:center;gap:3mm}.gov-logo{font-size:8mm;font-weight:900;letter-spacing:-.7mm}.gov-blue{color:#1b73ba}.gov-yellow{color:#f4b400}.gov-green{color:#188038}.gov-text{font-size:1.8mm;line-height:1.35;display:flex;flex-direction:column}.signatures{position:absolute;left:17mm;right:17mm;bottom:0;display:flex;justify-content:space-between;text-align:center}.signatures div{width:47mm}.signatures span{display:block;border-top:0.35mm solid #111;height:2mm}.signatures strong{font-size:3.4mm}@page{size:A4;margin:0}@media print{body{margin:0}.payment-a4-page{page-break-after:always;break-after:page}}
  </style></head><body>${pages}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 450);
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

  const selectedItems = useMemo(() => items.filter((item) => selectedIds.includes(item.id)), [items, selectedIds]);

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

  async function downloadBlob(ids, type = 'pdf') {
    setError('');
    try {
      const blob = type === 'xlsx'
        ? await downloadPaymentRequestsXlsx(ids)
        : await downloadPaymentRequestsPdf(ids);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = type === 'xlsx' ? 'xlsx' : 'pdf';
      a.download = ids.length > 1 ? 'solicitacoes-pagamento.' + ext : 'solicitacao-' + ids[0] + '.' + ext;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || (type === 'pdf' ? 'Não foi possível gerar o PDF. Baixe o Excel do modelo e exporte para PDF pelo Excel.' : 'Não foi possível baixar o Excel.'));
    }
  }

  async function printPdf(ids) {
    setError('');
    try {
      const blob = await downloadPaymentRequestsPdf(ids);
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        setError('O navegador bloqueou a janela de impressão. Permita pop-ups para imprimir.');
        return;
      }
      setTimeout(() => { try { win.print(); } catch (e) {} }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível abrir o PDF para impressão.');
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
        <div className="bulk-actions"><button disabled={!selectedIds.length} onClick={() => downloadBlob(selectedIds, 'pdf')}><FiDownload /> Baixar PDF</button><button disabled={!selectedIds.length} onClick={() => downloadBlob(selectedIds, 'xlsx')}><FiFileText /> Baixar Excel modelo</button><button disabled={!selectedIds.length} onClick={() => printPdf(selectedIds)}><FiPrinter /> Imprimir PDF</button></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th></th><th>Protocolo</th><th>Fornecedor</th><th>Valor</th><th>Vencimento</th><th>Emissão</th><th>Ações</th></tr></thead><tbody>{loading ? <tr><td colSpan="7">Carregando...</td></tr> : items.map((item) => <tr key={item.id}><td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id))} /></td><td>{item.protocol}</td><td>{item.payeeName}<small>{item.documentNumber}</small></td><td>{money(item.amount)}</td><td>{dateBR(item.dueDate)}</td><td>{dateBR(item.createdAt)}</td><td className="actions-cell"><button title="Baixar PDF" onClick={() => downloadBlob([item.id], 'pdf')}><FiDownload /></button><button title="Baixar Excel modelo" onClick={() => downloadBlob([item.id], 'xlsx')}><FiFileText /></button><button title="Imprimir PDF" onClick={() => printPdf([item.id])}><FiPrinter /></button></td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
}

export default PaymentRequestsPage;
