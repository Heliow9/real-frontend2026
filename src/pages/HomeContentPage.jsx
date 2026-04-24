import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import {
  fetchHomeContent,
  fetchMedia,
  updateHomeAboutCards,
  updateHomeContent,
  updateHomeDifferentials,
  updateHomePortfolioItems,
  updateHomeServiceCards,
  updateHomeStats
} from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
  { key: 'hero', label: 'Hero' },
  { key: 'stats', label: 'Números' },
  { key: 'differentials', label: 'Diferenciais' },
  { key: 'about', label: 'Sobre' },
  { key: 'services', label: 'Áreas de atuação' },
  { key: 'careers', label: 'Trabalhe conosco' },
  { key: 'portfolio', label: 'Portfólio' },
  { key: 'finalCta', label: 'CTA final' }
];

const createStat = () => ({ value: '', label: '', sortOrder: 0, isActive: true });
const createDifferential = () => ({ title: '', text: '', iconName: '', sortOrder: 0, isActive: true });
const createAboutCard = () => ({ title: '', text: '', sortOrder: 0, isActive: true });
const createServiceCard = () => ({ title: '', description: '', imageMediaId: '', link: '/about', sortOrder: 0, isActive: true });
const createPortfolioItem = () => ({ title: '', imageMediaId: '', sortOrder: 0, isActive: true });

function MediaSelect({ label, value, options, name, onChange, disabled = false }) {
  return (
    <div>
      <label>{label}</label>
      <select name={name} value={value ?? ''} onChange={onChange} disabled={disabled}>
        <option value="">Selecione uma mídia</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            #{item.id} · {item.originalName}
          </option>
        ))}
      </select>
    </div>
  );
}

function ListSection({
  title,
  description,
  items,
  onAdd,
  onRemove,
  renderFields,
  disabled,
  saveAction,
  saving
}) {
  return (
    <section className="panel-card form-stack">
      <div className="page-header compact">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <button className="ghost-button" type="button" onClick={onAdd} disabled={disabled}>
          Adicionar item
        </button>
      </div>

      <div className="list-editor-grid">
        {items.map((item, index) => (
          <article className="list-editor-card" key={item.id || `${title}-${index}`}>
            <div className="list-editor-header">
              <strong>Item {index + 1}</strong>
              <button
                className="ghost-button danger-text"
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
              >
                Remover
              </button>
            </div>
            {renderFields(item, index)}
          </article>
        ))}
        {!items.length ? <p className="muted-block">Nenhum item cadastrado ainda.</p> : null}
      </div>

      <div>
        <button className="primary-button" type="button" onClick={saveAction} disabled={disabled || saving}>
          {saving ? 'Salvando...' : 'Salvar seção'}
        </button>
      </div>
    </section>
  );
}

function HomeContentPage() {
  const { user } = useAuth();

  const canEdit =
    user?.roles?.includes('admin-full') ||
    user?.roles?.includes('super_admin') ||
    user?.permissions?.includes('home.update');

  const [activeTab, setActiveTab] = useState('hero');
  const [mediaOptions, setMediaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [sectionForm, setSectionForm] = useState({
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    heroPrimaryButtonText: '',
    heroPrimaryButtonLink: '',
    heroSecondaryButtonText: '',
    heroSecondaryButtonLink: '',
    heroBackgroundMediaId: '',
    heroSideMediaId: '',
    heroFloatingBadge: '',
    heroFloatingTitle: '',
    heroFloatingText: '',
    differentialsTag: '',
    aboutTag: '',
    aboutTitle: '',
    aboutTextOne: '',
    aboutTextTwo: '',
    aboutPrimaryImageId: '',
    aboutSecondaryImageId: '',
    servicesTag: '',
    servicesTitle: '',
    servicesText: '',
    careersTag: '',
    careersTitle: '',
    careersText: '',
    careersButtonText: '',
    careersButtonLink: '',
    portfolioTag: '',
    portfolioTitle: '',
    portfolioText: '',
    finalCtaTag: '',
    finalCtaTitle: '',
    finalCtaText: '',
    finalCtaPrimaryButtonText: '',
    finalCtaPrimaryButtonLink: '',
    finalCtaSecondaryButtonText: '',
    finalCtaSecondaryButtonLink: '',
    finalCtaBackgroundMediaId: ''
  });

  const [stats, setStats] = useState([]);
  const [differentials, setDifferentials] = useState([]);
  const [aboutCards, setAboutCards] = useState([]);
  const [serviceCards, setServiceCards] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);

  useEffect(() => {
    async function loadPage() {
      try {
        const [homeResponse, mediaResponse] = await Promise.all([
          fetchHomeContent(),
          fetchMedia()
        ]);

        const home = homeResponse.data || {};
        const media = mediaResponse.data || [];

        setMediaOptions(media.filter((item) => item.resourceType === 'image'));

        setSectionForm({
          heroBadge: home.heroBadge || '',
          heroTitle: home.heroTitle || '',
          heroSubtitle: home.heroSubtitle || '',
          heroPrimaryButtonText: home.heroPrimaryButtonText || '',
          heroPrimaryButtonLink: home.heroPrimaryButtonLink || '',
          heroSecondaryButtonText: home.heroSecondaryButtonText || '',
          heroSecondaryButtonLink: home.heroSecondaryButtonLink || '',
          heroBackgroundMediaId: home.heroBackgroundMediaId || '',
          heroSideMediaId: home.heroSideMediaId || '',
          heroFloatingBadge: home.heroFloatingBadge || '',
          heroFloatingTitle: home.heroFloatingTitle || '',
          heroFloatingText: home.heroFloatingText || '',
          differentialsTag: home.differentialsTag || '',
          aboutTag: home.aboutTag || '',
          aboutTitle: home.aboutTitle || '',
          aboutTextOne: home.aboutTextOne || '',
          aboutTextTwo: home.aboutTextTwo || '',
          aboutPrimaryImageId: home.aboutPrimaryImageId || '',
          aboutSecondaryImageId: home.aboutSecondaryImageId || '',
          servicesTag: home.servicesTag || '',
          servicesTitle: home.servicesTitle || '',
          servicesText: home.servicesText || '',
          careersTag: home.careersTag || '',
          careersTitle: home.careersTitle || '',
          careersText: home.careersText || '',
          careersButtonText: home.careersButtonText || '',
          careersButtonLink: home.careersButtonLink || '',
          portfolioTag: home.portfolioTag || '',
          portfolioTitle: home.portfolioTitle || '',
          portfolioText: home.portfolioText || '',
          finalCtaTag: home.finalCtaTag || '',
          finalCtaTitle: home.finalCtaTitle || '',
          finalCtaText: home.finalCtaText || '',
          finalCtaPrimaryButtonText: home.finalCtaPrimaryButtonText || '',
          finalCtaPrimaryButtonLink: home.finalCtaPrimaryButtonLink || '',
          finalCtaSecondaryButtonText: home.finalCtaSecondaryButtonText || '',
          finalCtaSecondaryButtonLink: home.finalCtaSecondaryButtonLink || '',
          finalCtaBackgroundMediaId: home.finalCtaBackgroundMediaId || ''
        });

        setStats(home.stats || []);
        setDifferentials(home.differentials || []);
        setAboutCards(home.aboutCards || []);
        setServiceCards(home.serviceCards || []);
        setPortfolioItems(home.portfolioItems || []);
      } catch (err) {
        setError('Não foi possível carregar a home gerenciável.');
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  const tabTitle = useMemo(
    () => tabs.find((tab) => tab.key === activeTab)?.label || 'Home',
    [activeTab]
  );

  const handleSectionChange = (event) => {
    const { name, value } = event.target;
    setSectionForm((current) => ({ ...current, [name]: value }));
  };

  const normalizeNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value);
  };

  const withSaving = async (key, callback, successText) => {
    setSaving((current) => ({ ...current, [key]: true }));
    setMessage('');
    setError('');

    try {
      await callback();
      setMessage(successText);
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível salvar a seção.');
    } finally {
      setSaving((current) => ({ ...current, [key]: false }));
    }
  };

  const saveSection = () =>
    withSaving(
      'section',
      async () => {
        await updateHomeContent({
          ...sectionForm,
          heroBackgroundMediaId: normalizeNullableNumber(sectionForm.heroBackgroundMediaId),
          heroSideMediaId: normalizeNullableNumber(sectionForm.heroSideMediaId),
          aboutPrimaryImageId: normalizeNullableNumber(sectionForm.aboutPrimaryImageId),
          aboutSecondaryImageId: normalizeNullableNumber(sectionForm.aboutSecondaryImageId),
          finalCtaBackgroundMediaId: normalizeNullableNumber(sectionForm.finalCtaBackgroundMediaId)
        });
      },
      'Seção principal da home salva com sucesso.'
    );

  const saveStats = () =>
    withSaving(
      'stats',
      () => updateHomeStats(stats.map((item, index) => ({ ...item, sortOrder: index + 1 }))),
      'Números da home salvos com sucesso.'
    );

  const saveDifferentials = () =>
    withSaving(
      'differentials',
      () => updateHomeDifferentials(differentials.map((item, index) => ({ ...item, sortOrder: index + 1 }))),
      'Diferenciais salvos com sucesso.'
    );

  const saveAboutCards = () =>
    withSaving(
      'aboutCards',
      () => updateHomeAboutCards(aboutCards.map((item, index) => ({ ...item, sortOrder: index + 1 }))),
      'Cards da seção Sobre salvos com sucesso.'
    );

  const saveServiceCards = () =>
    withSaving(
      'serviceCards',
      () =>
        updateHomeServiceCards(
          serviceCards.map((item, index) => ({
            ...item,
            sortOrder: index + 1,
            imageMediaId: normalizeNullableNumber(item.imageMediaId)
          }))
        ),
      'Áreas de atuação salvas com sucesso.'
    );

  const savePortfolioItems = () =>
    withSaving(
      'portfolioItems',
      () =>
        updateHomePortfolioItems(
          portfolioItems.map((item, index) => ({
            ...item,
            sortOrder: index + 1,
            imageMediaId: normalizeNullableNumber(item.imageMediaId)
          }))
        ),
      'Portfólio salvo com sucesso.'
    );

  const updateListState = (setter, index, field, value) => {
    setter((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="screen-center">
        <div className="loading-card">Carregando home gerenciável...</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestão da home"
        description={`Editor completo da página inicial. Aba ativa: ${tabTitle}.`}
        action={
          <span className={`badge ${canEdit ? 'success' : 'muted'}`}>
            {canEdit ? 'Perfil apto a editar' : 'Somente leitura'}
          </span>
        }
      />

      {!canEdit ? (
        <div className="alert error">
          A edição completa da home foi reservada ao perfil <strong>admin-full</strong>.
        </div>
      ) : null}

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="tab-strip">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'hero' || activeTab === 'about' || activeTab === 'careers' || activeTab === 'finalCta') ? (
        <section className="panel-card form-stack">
          {activeTab === 'hero' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Selo superior</label>
                  <input name="heroBadge" value={sectionForm.heroBadge} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título principal</label>
                  <input name="heroTitle" value={sectionForm.heroTitle} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Subtítulo</label>
                <textarea name="heroSubtitle" rows={5} value={sectionForm.heroSubtitle} onChange={handleSectionChange} disabled={!canEdit} />
              </div>

              <div className="input-grid">
                <div>
                  <label>Botão principal</label>
                  <input name="heroPrimaryButtonText" value={sectionForm.heroPrimaryButtonText} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Link do botão principal</label>
                  <input name="heroPrimaryButtonLink" value={sectionForm.heroPrimaryButtonLink} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div className="input-grid">
                <div>
                  <label>Botão secundário</label>
                  <input name="heroSecondaryButtonText" value={sectionForm.heroSecondaryButtonText} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Link do botão secundário</label>
                  <input name="heroSecondaryButtonLink" value={sectionForm.heroSecondaryButtonLink} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div className="input-grid">
                <MediaSelect
                  label="Imagem de fundo do hero"
                  name="heroBackgroundMediaId"
                  value={sectionForm.heroBackgroundMediaId}
                  options={mediaOptions}
                  onChange={handleSectionChange}
                  disabled={!canEdit}
                />
                <MediaSelect
                  label="Imagem lateral do hero"
                  name="heroSideMediaId"
                  value={sectionForm.heroSideMediaId}
                  options={mediaOptions}
                  onChange={handleSectionChange}
                  disabled={!canEdit}
                />
              </div>

              <div className="input-grid">
                <div>
                  <label>Badge do card flutuante</label>
                  <input name="heroFloatingBadge" value={sectionForm.heroFloatingBadge} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título do card flutuante</label>
                  <input name="heroFloatingTitle" value={sectionForm.heroFloatingTitle} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto do card flutuante</label>
                <textarea name="heroFloatingText" rows={4} value={sectionForm.heroFloatingText} onChange={handleSectionChange} disabled={!canEdit} />
              </div>
            </>
          ) : null}

          {activeTab === 'about' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Tag da seção</label>
                  <input name="aboutTag" value={sectionForm.aboutTag} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título da seção</label>
                  <input name="aboutTitle" value={sectionForm.aboutTitle} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto principal</label>
                <textarea name="aboutTextOne" rows={5} value={sectionForm.aboutTextOne} onChange={handleSectionChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Texto complementar</label>
                <textarea name="aboutTextTwo" rows={5} value={sectionForm.aboutTextTwo} onChange={handleSectionChange} disabled={!canEdit} />
              </div>

              <div className="input-grid">
                <MediaSelect
                  label="Imagem principal"
                  name="aboutPrimaryImageId"
                  value={sectionForm.aboutPrimaryImageId}
                  options={mediaOptions}
                  onChange={handleSectionChange}
                  disabled={!canEdit}
                />
                <MediaSelect
                  label="Imagem secundária"
                  name="aboutSecondaryImageId"
                  value={sectionForm.aboutSecondaryImageId}
                  options={mediaOptions}
                  onChange={handleSectionChange}
                  disabled={!canEdit}
                />
              </div>
            </>
          ) : null}

          {activeTab === 'careers' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Tag da seção</label>
                  <input name="careersTag" value={sectionForm.careersTag} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título da seção</label>
                  <input name="careersTitle" value={sectionForm.careersTitle} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto da seção</label>
                <textarea name="careersText" rows={5} value={sectionForm.careersText} onChange={handleSectionChange} disabled={!canEdit} />
              </div>

              <div className="input-grid">
                <div>
                  <label>Texto do botão</label>
                  <input name="careersButtonText" value={sectionForm.careersButtonText} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Link do botão</label>
                  <input name="careersButtonLink" value={sectionForm.careersButtonLink} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>
            </>
          ) : null}

          {activeTab === 'finalCta' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Tag da seção</label>
                  <input name="finalCtaTag" value={sectionForm.finalCtaTag} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título do CTA final</label>
                  <input name="finalCtaTitle" value={sectionForm.finalCtaTitle} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto do CTA final</label>
                <textarea name="finalCtaText" rows={5} value={sectionForm.finalCtaText} onChange={handleSectionChange} disabled={!canEdit} />
              </div>

              <div className="input-grid">
                <div>
                  <label>Botão principal</label>
                  <input name="finalCtaPrimaryButtonText" value={sectionForm.finalCtaPrimaryButtonText} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Link do botão principal</label>
                  <input name="finalCtaPrimaryButtonLink" value={sectionForm.finalCtaPrimaryButtonLink} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <div className="input-grid">
                <div>
                  <label>Botão secundário</label>
                  <input name="finalCtaSecondaryButtonText" value={sectionForm.finalCtaSecondaryButtonText} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Link do botão secundário</label>
                  <input name="finalCtaSecondaryButtonLink" value={sectionForm.finalCtaSecondaryButtonLink} onChange={handleSectionChange} disabled={!canEdit} />
                </div>
              </div>

              <MediaSelect
                label="Imagem de fundo do CTA final"
                name="finalCtaBackgroundMediaId"
                value={sectionForm.finalCtaBackgroundMediaId}
                options={mediaOptions}
                onChange={handleSectionChange}
                disabled={!canEdit}
              />
            </>
          ) : null}

          <div>
            <button className="primary-button" type="button" onClick={saveSection} disabled={!canEdit || saving.section}>
              {saving.section ? 'Salvando...' : 'Salvar seção'}
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === 'stats' ? (
        <ListSection
          title="Números da home"
          description="Gerencie os números exibidos no hero."
          items={stats}
          onAdd={() => setStats((current) => [...current, createStat()])}
          onRemove={(index) => setStats((current) => current.filter((_, itemIndex) => itemIndex !== index))}
          disabled={!canEdit}
          saveAction={saveStats}
          saving={saving.stats}
          renderFields={(item, index) => (
            <div className="input-grid">
              <div>
                <label>Valor</label>
                <input value={item.value || ''} onChange={(event) => updateListState(setStats, index, 'value', event.target.value)} disabled={!canEdit} />
              </div>
              <div>
                <label>Legenda</label>
                <input value={item.label || ''} onChange={(event) => updateListState(setStats, index, 'label', event.target.value)} disabled={!canEdit} />
              </div>
            </div>
          )}
        />
      ) : null}

      {activeTab === 'differentials' ? (
        <>
          <section className="panel-card form-stack">
            <div>
              <label>Tag da seção de diferenciais</label>
              <input name="differentialsTag" value={sectionForm.differentialsTag} onChange={handleSectionChange} disabled={!canEdit} />
            </div>
            <div>
              <button className="primary-button" type="button" onClick={saveSection} disabled={!canEdit || saving.section}>
                {saving.section ? 'Salvando...' : 'Salvar cabeçalho da seção'}
              </button>
            </div>
          </section>

          <ListSection
            title="Diferenciais"
            description="Cards abaixo do hero."
            items={differentials}
            onAdd={() => setDifferentials((current) => [...current, createDifferential()])}
            onRemove={(index) => setDifferentials((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={saveDifferentials}
            saving={saving.differentials}
            renderFields={(item, index) => (
              <>
                <div className="input-grid">
                  <div>
                    <label>Título</label>
                    <input value={item.title || ''} onChange={(event) => updateListState(setDifferentials, index, 'title', event.target.value)} disabled={!canEdit} />
                  </div>
                  <div>
                    <label>Ícone sugerido</label>
                    <input value={item.iconName || ''} onChange={(event) => updateListState(setDifferentials, index, 'iconName', event.target.value)} disabled={!canEdit} />
                  </div>
                </div>

                <div>
                  <label>Texto</label>
                  <textarea rows={4} value={item.text || ''} onChange={(event) => updateListState(setDifferentials, index, 'text', event.target.value)} disabled={!canEdit} />
                </div>
              </>
            )}
          />
        </>
      ) : null}

      {activeTab === 'about' ? (
        <>
          <ListSection
            title="Cards da seção Sobre"
            description="Blocos auxiliares ao lado dos textos institucionais."
            items={aboutCards}
            onAdd={() => setAboutCards((current) => [...current, createAboutCard()])}
            onRemove={(index) => setAboutCards((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={saveAboutCards}
            saving={saving.aboutCards}
            renderFields={(item, index) => (
              <>
                <div>
                  <label>Título</label>
                  <input value={item.title || ''} onChange={(event) => updateListState(setAboutCards, index, 'title', event.target.value)} disabled={!canEdit} />
                </div>
                <div>
                  <label>Texto</label>
                  <textarea rows={4} value={item.text || ''} onChange={(event) => updateListState(setAboutCards, index, 'text', event.target.value)} disabled={!canEdit} />
                </div>
              </>
            )}
          />
        </>
      ) : null}

      {activeTab === 'services' ? (
        <>
          <section className="panel-card form-stack">
            <div className="input-grid">
              <div>
                <label>Tag da seção</label>
                <input name="servicesTag" value={sectionForm.servicesTag} onChange={handleSectionChange} disabled={!canEdit} />
              </div>
              <div>
                <label>Título da seção</label>
                <input name="servicesTitle" value={sectionForm.servicesTitle} onChange={handleSectionChange} disabled={!canEdit} />
              </div>
            </div>

            <div>
              <label>Texto de apoio</label>
              <textarea name="servicesText" rows={4} value={sectionForm.servicesText} onChange={handleSectionChange} disabled={!canEdit} />
            </div>

            <div>
              <button className="primary-button" type="button" onClick={saveSection} disabled={!canEdit || saving.section}>
                {saving.section ? 'Salvando...' : 'Salvar cabeçalho da seção'}
              </button>
            </div>
          </section>

          <ListSection
            title="Cards de áreas de atuação"
            description="Imagem, título, descrição e link de cada área."
            items={serviceCards}
            onAdd={() => setServiceCards((current) => [...current, createServiceCard()])}
            onRemove={(index) => setServiceCards((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={saveServiceCards}
            saving={saving.serviceCards}
            renderFields={(item, index) => (
              <>
                <div className="input-grid">
                  <div>
                    <label>Título</label>
                    <input value={item.title || ''} onChange={(event) => updateListState(setServiceCards, index, 'title', event.target.value)} disabled={!canEdit} />
                  </div>
                  <div>
                    <label>Link</label>
                    <input value={item.link || ''} onChange={(event) => updateListState(setServiceCards, index, 'link', event.target.value)} disabled={!canEdit} />
                  </div>
                </div>

                <MediaSelect
                  label="Imagem do card"
                  value={item.imageMediaId ?? ''}
                  options={mediaOptions}
                  onChange={(event) => updateListState(setServiceCards, index, 'imageMediaId', event.target.value)}
                  disabled={!canEdit}
                />

                <div>
                  <label>Descrição</label>
                  <textarea rows={4} value={item.description || ''} onChange={(event) => updateListState(setServiceCards, index, 'description', event.target.value)} disabled={!canEdit} />
                </div>
              </>
            )}
          />
        </>
      ) : null}

      {activeTab === 'portfolio' ? (
        <>
          <section className="panel-card form-stack">
            <div className="input-grid">
              <div>
                <label>Tag da seção</label>
                <input name="portfolioTag" value={sectionForm.portfolioTag} onChange={handleSectionChange} disabled={!canEdit} />
              </div>
              <div>
                <label>Título da seção</label>
                <input name="portfolioTitle" value={sectionForm.portfolioTitle} onChange={handleSectionChange} disabled={!canEdit} />
              </div>
            </div>

            <div>
              <label>Texto de apoio</label>
              <textarea name="portfolioText" rows={4} value={sectionForm.portfolioText} onChange={handleSectionChange} disabled={!canEdit} />
            </div>

            <div>
              <button className="primary-button" type="button" onClick={saveSection} disabled={!canEdit || saving.section}>
                {saving.section ? 'Salvando...' : 'Salvar cabeçalho da seção'}
              </button>
            </div>
          </section>

          <ListSection
            title="Itens do portfólio"
            description="Vínculo com imagens da biblioteca."
            items={portfolioItems}
            onAdd={() => setPortfolioItems((current) => [...current, createPortfolioItem()])}
            onRemove={(index) => setPortfolioItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={savePortfolioItems}
            saving={saving.portfolioItems}
            renderFields={(item, index) => (
              <>
                <div>
                  <label>Título</label>
                  <input value={item.title || ''} onChange={(event) => updateListState(setPortfolioItems, index, 'title', event.target.value)} disabled={!canEdit} />
                </div>

                <MediaSelect
                  label="Imagem"
                  value={item.imageMediaId ?? ''}
                  options={mediaOptions}
                  onChange={(event) => updateListState(setPortfolioItems, index, 'imageMediaId', event.target.value)}
                  disabled={!canEdit}
                />
              </>
            )}
          />
        </>
      ) : null}
    </div>
  );
}

export default HomeContentPage;