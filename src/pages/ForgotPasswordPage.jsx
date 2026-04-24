import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../services/authService';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    setError('');

    try {
      setLoading(true);
      await forgotPasswordRequest({ email: email.trim() });
      setFeedback('Se o e-mail estiver cadastrado, enviaremos uma senha temporária. Ao entrar, será obrigatório trocar a senha.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível solicitar a recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page enterprise-login auth-page">
      <div className="login-panel compact-panel auth-shell">
        <div className="login-intro auth-hero">
          <span className="pill">Recuperação</span>
          <h1>Recuperar senha</h1>
          <p>Informe seu e-mail de cadastro para receber uma senha temporária de acesso.</p>
          <div className="login-hints">
            <div><strong>Senha temporária</strong><span>Ela será enviada por e-mail e exigirá troca no próximo login.</span></div>
            <div><strong>Segurança</strong><span>O acesso continua protegido pelo fluxo de troca obrigatória.</span></div>
          </div>
        </div>

        <form className="login-card modern-login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <span className="pill">Reset de senha</span>
            <h2>Solicitar acesso</h2>
          </div>
          <div>
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@realenergy.com.br" required />
          </div>
          {error ? <div className="alert error">{error}</div> : null}
          {feedback ? <div className="alert success">{feedback}</div> : null}
          <button className="primary-button" disabled={loading} type="submit">{loading ? 'Enviando...' : 'Enviar senha temporária'}</button>
          <Link to="/login" className="ghost-link">Voltar para login</Link>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
