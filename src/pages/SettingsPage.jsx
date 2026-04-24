import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { fetchSystemSettings, updateSystemSettings } from '../services/dashboardService';

const emptyRecipient = { email: '', name: '', department: '', isActive: true };

function SettingsPage() {
  const [form, setForm] = useState({
    smtpHost: '',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
    imapHost: '',
    imapPort: 995,
    imapSecure: true,
    imapUser: '',
    imapPassword: '',
    defaultSenderName: 'RealEnergy',
    defaultSenderEmail: '',
    complaintEmailSubject: '',
    trackingEnabled: true,
    dashboardUrl: 'http://localhost:3000',
    siteUrl: 'http://localhost:3000',
    activationReminderEnabled: true,
    activationReminderHour: 10,
    notificationEmails: [emptyRecipient]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchSystemSettings();
        setForm({
          ...response.data,
          smtpPassword: '',
          imapPassword: '',
          notificationEmails: response.data.notificationEmails?.length ? response.data.notificationEmails : [emptyRecipient]
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Não foi possível carregar as configurações.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleRecipientChange = (index, key, value) => {
    setForm((current) => ({
      ...current,
      notificationEmails: current.notificationEmails.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addRecipient = () => {
    setForm((current) => ({
      ...current,
      notificationEmails: [...current.notificationEmails, emptyRecipient]
    }));
  };

  const removeRecipient = (index) => {
    setForm((current) => ({
      ...current,
      notificationEmails: current.notificationEmails.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setError('');

    try {
      setSaving(true);
      const payload = {
        ...form,
        notificationEmails: form.notificationEmails.filter((item) => item.email)
      };
      const response = await updateSystemSettings(payload);
      setForm({
        ...response.data,
        smtpPassword: '',
        imapPassword: '',
        notificationEmails: response.data.notificationEmails?.length ? response.data.notificationEmails : [emptyRecipient]
      });
      setFeedback('Configurações atualizadas com sucesso.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Configurações do dashboard"
        description="Defina o servidor de e-mail, os destinatários das manifestações e parâmetros institucionais do painel."
      />

      {error ? <div className="alert error">{error}</div> : null}
      {feedback ? <div className="alert success">{feedback}</div> : null}

      {loading ? (
        <div className="panel-card">Carregando configurações...</div>
      ) : (
        <form className="page-stack" onSubmit={handleSubmit}>
          <article className="panel-card form-stack">
            <h3>Servidor de envio e recebimento</h3>
            <div className="input-grid">
              <div>
                <label>SMTP Host</label>
                <input value={form.smtpHost || ''} onChange={(event) => setForm({ ...form, smtpHost: event.target.value })} placeholder="smtps.uhserver.com" />
              </div>
              <div>
                <label>SMTP Porta</label>
                <input type="number" value={form.smtpPort || ''} onChange={(event) => setForm({ ...form, smtpPort: Number(event.target.value) })} />
              </div>
              <div>
                <label>Usuário SMTP</label>
                <input value={form.smtpUser || ''} onChange={(event) => setForm({ ...form, smtpUser: event.target.value })} placeholder="noreply@realenergy.com.br" />
              </div>
              <div>
                <label>Senha SMTP</label>
                <input type="password" value={form.smtpPassword || ''} onChange={(event) => setForm({ ...form, smtpPassword: event.target.value })} placeholder="Preencha apenas para alterar" />
              </div>
              <div>
                <label>POP/IMAP Host</label>
                <input value={form.imapHost || ''} onChange={(event) => setForm({ ...form, imapHost: event.target.value })} placeholder="pop3.uhserver.com" />
              </div>
              <div>
                <label>POP/IMAP Porta</label>
                <input type="number" value={form.imapPort || ''} onChange={(event) => setForm({ ...form, imapPort: Number(event.target.value) })} />
              </div>
              <div>
                <label>Usuário POP/IMAP</label>
                <input value={form.imapUser || ''} onChange={(event) => setForm({ ...form, imapUser: event.target.value })} />
              </div>
              <div>
                <label>Senha POP/IMAP</label>
                <input type="password" value={form.imapPassword || ''} onChange={(event) => setForm({ ...form, imapPassword: event.target.value })} placeholder="Preencha apenas para alterar" />
              </div>
            </div>

            <div className="checkbox-row wrap-start">
              <label className="inline-option">
                <input type="checkbox" checked={Boolean(form.smtpSecure)} onChange={(event) => setForm({ ...form, smtpSecure: event.target.checked })} />
                <span>SMTP com SSL/TLS</span>
              </label>
              <label className="inline-option">
                <input type="checkbox" checked={Boolean(form.imapSecure)} onChange={(event) => setForm({ ...form, imapSecure: event.target.checked })} />
                <span>POP/IMAP com SSL/TLS</span>
              </label>
            </div>
          </article>

          <article className="panel-card form-stack">
            <h3>Envio automático das reclamações e denúncias</h3>
            <div className="input-grid">
              <div>
                <label>Nome do remetente</label>
                <input value={form.defaultSenderName || ''} onChange={(event) => setForm({ ...form, defaultSenderName: event.target.value })} />
              </div>
              <div>
                <label>E-mail remetente</label>
                <input type="email" value={form.defaultSenderEmail || ''} onChange={(event) => setForm({ ...form, defaultSenderEmail: event.target.value })} />
              </div>
            </div>
            <div>
              <label>Assunto padrão</label>
              <input value={form.complaintEmailSubject || ''} onChange={(event) => setForm({ ...form, complaintEmailSubject: event.target.value })} />
            </div>
          </article>


          <article className="panel-card form-stack">
            <h3>Acompanhamento e ativação de usuários</h3>
            <div className="input-grid">
              <div>
                <label>URL do dashboard</label>
                <input value={form.dashboardUrl || ''} onChange={(event) => setForm({ ...form, dashboardUrl: event.target.value })} placeholder="https://dashboard.realenergy.com.br" />
              </div>
              <div>
                <label>URL do site</label>
                <input value={form.siteUrl || ''} onChange={(event) => setForm({ ...form, siteUrl: event.target.value })} placeholder="https://www.realenergy.com.br" />
              </div>
              <div>
                <label>Hora do lembrete diário</label>
                <input type="number" min="0" max="23" value={form.activationReminderHour ?? 10} onChange={(event) => setForm({ ...form, activationReminderHour: Number(event.target.value) })} />
              </div>
            </div>
            <div className="checkbox-row wrap-start">
              <label className="inline-option">
                <input type="checkbox" checked={Boolean(form.trackingEnabled)} onChange={(event) => setForm({ ...form, trackingEnabled: event.target.checked })} />
                <span>Permitir acompanhamento público por protocolo</span>
              </label>
              <label className="inline-option">
                <input type="checkbox" checked={Boolean(form.activationReminderEnabled)} onChange={(event) => setForm({ ...form, activationReminderEnabled: event.target.checked })} />
                <span>Enviar lembrete diário para contas pendentes</span>
              </label>
            </div>
          </article>

          <article className="panel-card form-stack">
            <div className="list-row with-action">
              <div>
                <h3>E-mails que receberão as manifestações</h3>
                <p>Cada reclamação, sugestão, elogio ou denúncia do site será enviada também para estes destinatários.</p>
              </div>
              <button className="ghost-button" type="button" onClick={addRecipient}>
                Adicionar e-mail
              </button>
            </div>

            <div className="list-editor-grid">
              {form.notificationEmails.map((item, index) => (
                <div key={`${item.email}-${index}`} className="list-editor-card">
                  <div className="input-grid">
                    <div>
                      <label>Nome</label>
                      <input value={item.name || ''} onChange={(event) => handleRecipientChange(index, 'name', event.target.value)} />
                    </div>
                    <div>
                      <label>Departamento</label>
                      <input value={item.department || ''} onChange={(event) => handleRecipientChange(index, 'department', event.target.value)} placeholder="Ouvidoria, RH, Jurídico..." />
                    </div>
                  </div>
                  <div>
                    <label>E-mail</label>
                    <input type="email" value={item.email || ''} onChange={(event) => handleRecipientChange(index, 'email', event.target.value)} />
                  </div>
                  <div className="row-actions">
                    <label className="inline-option">
                      <input type="checkbox" checked={item.isActive ?? true} onChange={(event) => handleRecipientChange(index, 'isActive', event.target.checked)} />
                      <span>Ativo</span>
                    </label>
                    {form.notificationEmails.length > 1 ? (
                      <button className="ghost-button danger-text" type="button" onClick={() => removeRecipient(index)}>
                        Remover
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <button className="primary-button" disabled={saving} type="submit">
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </form>
      )}
    </div>
  );
}

export default SettingsPage;
