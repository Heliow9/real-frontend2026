import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <PageHeader
        title="Perfil do usuário"
        description="Resumo da sessão autenticada no backend."
      />

      <article className="panel-card form-stack">
        <div className="profile-item"><span>Nome</span><strong>{user?.name || '-'}</strong></div>
        <div className="profile-item"><span>E-mail</span><strong>{user?.email || '-'}</strong></div>
        <div className="profile-item"><span>Perfis</span><strong>{user?.roles?.join(', ') || '-'}</strong></div>
        <div className="profile-item"><span>Permissões</span><strong>{user?.permissions?.join(', ') || '-'}</strong></div>
      </article>
    </div>
  );
}

export default ProfilePage;
