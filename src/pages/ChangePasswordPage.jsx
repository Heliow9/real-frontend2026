import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { changePasswordRequest } from '../services/authService';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, reloadUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) return setError('A nova senha precisa ter pelo menos 6 caracteres.');
    if (newPassword !== confirmPassword) return setError('As senhas não conferem.');

    try {
      setLoading(true);
      await changePasswordRequest({ currentPassword, newPassword });
      await reloadUser();
      setSuccess('Senha atualizada com sucesso. Redirecionando...');
      setTimeout(() => navigate('/dashboard', { replace: true }), 700);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível trocar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack force-password-page">
      <div className="panel-card form-stack narrow-card password-update-card">
        <span className="pill">Segurança</span>
        <h1>{user?.forcePasswordChange ? 'Troca de senha obrigatória' : 'Alterar senha'}</h1>
        <p className="muted-text">
          {user?.forcePasswordChange
            ? 'Sua conta exige uma nova senha antes de continuar usando o dashboard.'
            : 'Atualize sua senha de acesso ao dashboard.'}
        </p>

        <form className="form-stack" onSubmit={handleSubmit}>
          {!user?.forcePasswordChange ? (
            <div>
              <label>Senha atual</label>
              <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          ) : null}

          <div>
            <label>Nova senha</label>
            <div className="password-field">
              <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </div>

          <div>
            <label>Confirmar nova senha</label>
            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          {error ? <div className="alert error">{error}</div> : null}
          {success ? <div className="alert success">{success}</div> : null}
          <button className="primary-button" disabled={loading} type="submit">{loading ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
