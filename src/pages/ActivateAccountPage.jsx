import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { activateAccountRequest } from '../services/authService';
import { persistSession } from '../utils/storage';

function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function ActivateAccountPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || params.token || '', [searchParams, params.token]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const score = passwordScore(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) return setError('Link inválido ou sem token de ativação. Solicite um novo convite ao administrador.');
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.');
    if (password !== confirmPassword) return setError('As senhas não conferem.');

    try {
      setLoading(true);
      const response = await activateAccountRequest({ token, password });
      persistSession(response.data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível ativar sua conta. O link pode estar expirado ou já ter sido usado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page enterprise-login auth-page">
      <div className="login-panel compact-panel auth-shell">
        <div className="login-intro auth-hero">
          <span className="pill">Primeiro acesso</span>
          <h1>Ativar conta</h1>
          <p>Defina sua senha para acessar o dashboard da RealEnergy com segurança.</p>
          <div className="login-hints">
            <div><strong>Convite validado por token</strong><span>O link recebido por e-mail libera a criação da senha.</span></div>
            <div><strong>Próximo passo</strong><span>Após ativar, você será levado direto ao painel.</span></div>
          </div>
        </div>

        <form className="login-card modern-login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <span className="pill">Senha de acesso</span>
            <h2>Criar senha</h2>
          </div>

          {!token ? (
            <div className="alert error">Link sem token de ativação. Verifique o e-mail recebido ou peça um novo convite.</div>
          ) : null}

          <div>
            <label>Nova senha</label>
            <div className="password-field">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua nova senha" required />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            <div className="password-meter" aria-label="Força da senha"><span style={{ width: `${Math.max(score, 1) * 20}%` }} /></div>
            <small className="muted-text">Use letras, números e símbolos para uma senha mais forte.</small>
          </div>

          <div>
            <label>Confirmar senha</label>
            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita sua nova senha" required />
          </div>

          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-button" disabled={loading || !token} type="submit">{loading ? 'Ativando...' : 'Ativar conta'}</button>
          <Link to="/login" className="ghost-link">Voltar para login</Link>
        </form>
      </div>
    </div>
  );
}

export default ActivateAccountPage;
