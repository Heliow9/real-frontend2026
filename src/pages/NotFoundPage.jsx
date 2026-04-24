import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="screen-center">
      <div className="panel-card not-found-card">
        <h2>Página não encontrada</h2>
        <p>O caminho informado não existe neste dashboard.</p>
        <Link className="primary-button inline-flex" to="/dashboard">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
