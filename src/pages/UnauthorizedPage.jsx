import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

function UnauthorizedPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Acesso não autorizado"
        description="Seu perfil não possui permissão para acessar esta área do dashboard."
      />

      <article className="panel-card form-stack">
        <div className="alert error">
          Esta página não está liberada para o seu nível de acesso.
        </div>
        <p>
          Caso precise acessar esta funcionalidade, solicite a liberação para um administrador do sistema.
        </p>
        <div className="row-actions">
          <Link className="primary-button" to="/dashboard">Voltar para visão geral</Link>
        </div>
      </article>
    </div>
  );
}

export default UnauthorizedPage;
