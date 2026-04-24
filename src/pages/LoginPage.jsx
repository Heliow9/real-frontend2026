import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiZap } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const redirectTo = data.user?.forcePasswordChange
        ? '/trocar-senha'
        : location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível fazer login. Confira suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page enterprise-login energy-login-page">
      <div className="energy-bg-layer energy-bg-one" />
      <div className="energy-bg-layer energy-bg-two" />
      <div className="energy-lines" />

      <div className="login-panel energy-login-panel">
        <section className="login-intro energy-login-intro">
          <span className="pill light-pill"><FiZap size={14} /> RealEnergy Dashboard</span>
          <h1>Operação centralizada com segurança e controle.</h1>
          <p>
            Acesse conteúdos, solicitações, usuários, mídia e ouvidoria em um painel rápido,
            responsivo e preparado para fluxos corporativos.
          </p>

          <div className="login-hints glass-hints">
            <div><strong>Segurança</strong><span>Ativação por e-mail, troca obrigatória e permissões por perfil.</span></div>
            <div><strong>Gestão</strong><span>Controle de módulos, solicitações, documentos e histórico de ações.</span></div>
          </div>
        </section>

        <form className="login-card modern-login-card energy-login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <span className="pill">Acesso restrito</span>
            <h2>Entrar no dashboard</h2>
            <p className="muted-text">Use seu e-mail corporativo e senha de acesso.</p>
          </div>

          <label className="field-with-icon" htmlFor="email">
            E-mail
            <span>
              <FiMail size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@realenergy.com.br"
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="field-with-icon" htmlFor="password">
            Senha
            <span className="password-inline-field">
              <FiLock size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </span>
          </label>

          {error ? <div className="alert error">{error}</div> : null}

          <button className="primary-button login-submit-button" disabled={loading} type="submit">
            {loading ? 'Validando acesso...' : 'Acessar dashboard'}
          </button>

          <Link className="ghost-link" to="/recuperar-senha">Esqueci minha senha</Link>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
