import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { deleteMediaItem, fetchMedia, uploadMedia } from '../services/dashboardService';

function MediaPage() {
  const [items, setItems] = useState([]);
  const [folder, setFolder] = useState('realenergy');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadMedia() {
    setLoading(true);
    try {
      const response = await fetchMedia();
      setItems(response.data || []);
    } catch (err) {
      setError('Não foi possível carregar a biblioteca de mídia.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', folder);
      await uploadMedia(formData);
      setSelectedFile(null);
      setMessage('Arquivo enviado com sucesso.');
      await loadMedia();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erro no upload. Confira Cloudinary e backend.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMediaItem(id);
      await loadMedia();
    } catch (err) {
      setError('Não foi possível remover o arquivo.');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Biblioteca de mídia"
        description="Upload direto para o backend, que envia o arquivo ao Cloudinary e salva o metadado no MySQL."
      />

      <section className="card-grid two-columns align-start">
        <form className="panel-card form-stack" onSubmit={handleUpload}>
          <h3>Novo arquivo</h3>
          <div>
            <label>Pasta</label>
            <input value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="realenergy/home" />
          </div>
          <div>
            <label>Arquivo</label>
            <input type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
          </div>
          {message ? <div className="alert success">{message}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-button" disabled={uploading} type="submit">
            {uploading ? 'Enviando...' : 'Enviar arquivo'}
          </button>
        </form>

        <article className="panel-card">
          <h3>Arquivos enviados</h3>
          {loading ? <p>Carregando...</p> : null}
          <div className="media-grid">
            {items.map((item) => (
              <div className="media-card" key={item.id}>
                <div className="media-preview">
                  {item.resourceType === 'image' ? (
                    <img src={item.secureUrl} alt={item.originalName} />
                  ) : (
                    <div className="file-placeholder">PDF/RAW</div>
                  )}
                </div>
                <strong>{item.originalName}</strong>
                <span>{item.folder}</span>
                <div className="row-actions">
                  <a className="ghost-button" href={item.secureUrl} target="_blank" rel="noreferrer">
                    Ver
                  </a>
                  <button className="ghost-button danger-text" type="button" onClick={() => handleDelete(item.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!loading && !items.length ? <p>Nenhum arquivo encontrado.</p> : null}
        </article>
      </section>
    </div>
  );
}

export default MediaPage;
