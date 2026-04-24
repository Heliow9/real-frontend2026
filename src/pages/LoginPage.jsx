import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const redirectTo = data.user?.forcePasswordChange ? '/trocar-senha' : location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível fazer login. Confira suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page enterprise-login">
      <div className="login-panel">
        <div className="login-intro">
          <span className="pill">RealEnergy Dashboard</span>
          <h1>Gestão segura, rápida e centralizada.</h1>
          <p>Acesse conteúdos, usuários, mídia e ouvidoria com controle de permissões, trilha de auditoria e notificações automáticas.</p>
          <div className="login-hints">
            <div><strong>Segurança</strong><span>JWT, primeiro acesso e troca obrigatória de senha</span></div>
            <div><strong>Ouvidoria</strong><span>Protocolos, status, anexos e linha do tempo</span></div>
          </div>
        </div>

        <form className="login-card modern-login-card" onSubmit={handleSubmit}>
          <div className="login-card-header"><span className="pill">Acesso restrito</span><h2>Entrar no painel</h2></div>
          <div><label htmlFor="email">E-mail</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@realenergy.com.br" required /></div>
          <div><label htmlFor="password">Senha</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" required /></div>
          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-button" disabled={loading} type="submit">{loading ? 'Entrando...' : 'Acessar dashboard'}</button>
          <Link className="ghost-link" to="/recuperar-senha">Esqueci minha senha</Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
