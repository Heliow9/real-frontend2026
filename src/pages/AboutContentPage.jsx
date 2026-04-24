import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import {
  fetchAboutContent,
  fetchMedia,
  updateAboutContent,
  updateAboutHighlights,
  updateAboutTimeline,
  updateAboutValues
} from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
  { key: 'hero', label: 'Hero' },
  { key: 'highlights', label: 'Destaques' },
  { key: 'story', label: 'Nossa história' },
  { key: 'timeline', label: 'Linha do tempo' },
  { key: 'structure', label: 'Estrutura técnica' },
  { key: 'values', label: 'Missão, visão e valores' },
  { key: 'final', label: 'Bloco final' }
];

const createHighlight = () => ({ title: '', text: '', sortOrder: 0, isActive: true });
const createTimelineItem = () => ({ title: '', text: '', sortOrder: 0, isActive: true });
const createValueCard = () => ({ title: '', text: '', sortOrder: 0, isActive: true });

function MediaSelect({ label, value, options, name, onChange, disabled = false }) {
  return (
    <div>
      {label ? <label>{label}</label> : null}
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

function AboutContentPage() {
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

  const [form, setForm] = useState({
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    heroBackgroundMediaId: '',
    heroCardBadge: '',
    heroCardTitle: '',
    heroCardText: '',
    highlightsTag: '',
    storyTag: '',
    storyTitle: '',
    storyTextOne: '',
    storyTextTwo: '',
    storyTextThree: '',
    storyTextFour: '',
    storyPrimaryImageMediaId: '',
    storySecondaryImageMediaId: '',
    timelineTag: '',
    timelineTitle: '',
    timelineText: '',
    structureTag: '',
    structureTitle: '',
    structureTextOne: '',
    structureTextTwo: '',
    structureImageMediaId: '',
    valuesTag: '',
    valuesTitle: '',
    valuesText: '',
    finalTag: '',
    finalTitle: '',
    finalText: '',
    finalBackgroundMediaId: ''
  });

  const [highlights, setHighlights] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [valueCards, setValueCards] = useState([]);

  useEffect(() => {
    async function loadPage() {
      try {
        const [aboutResponse, mediaResponse] = await Promise.all([
          fetchAboutContent(),
          fetchMedia()
        ]);

        const about = aboutResponse.data || {};
        const media = mediaResponse.data || [];

        setMediaOptions(media.filter((item) => item.resourceType === 'image'));

        setForm({
          heroBadge: about.heroBadge || '',
          heroTitle: about.heroTitle || '',
          heroSubtitle: about.heroSubtitle || '',
          heroBackgroundMediaId: about.heroBackgroundMediaId || '',
          heroCardBadge: about.heroCardBadge || '',
          heroCardTitle: about.heroCardTitle || '',
          heroCardText: about.heroCardText || '',
          highlightsTag: about.highlightsTag || '',
          storyTag: about.storyTag || '',
          storyTitle: about.storyTitle || '',
          storyTextOne: about.storyTextOne || '',
          storyTextTwo: about.storyTextTwo || '',
          storyTextThree: about.storyTextThree || '',
          storyTextFour: about.storyTextFour || '',
          storyPrimaryImageMediaId: about.storyPrimaryImageMediaId || '',
          storySecondaryImageMediaId: about.storySecondaryImageMediaId || '',
          timelineTag: about.timelineTag || '',
          timelineTitle: about.timelineTitle || '',
          timelineText: about.timelineText || '',
          structureTag: about.structureTag || '',
          structureTitle: about.structureTitle || '',
          structureTextOne: about.structureTextOne || '',
          structureTextTwo: about.structureTextTwo || '',
          structureImageMediaId: about.structureImageMediaId || '',
          valuesTag: about.valuesTag || '',
          valuesTitle: about.valuesTitle || '',
          valuesText: about.valuesText || '',
          finalTag: about.finalTag || '',
          finalTitle: about.finalTitle || '',
          finalText: about.finalText || '',
          finalBackgroundMediaId: about.finalBackgroundMediaId || ''
        });

        setHighlights(about.highlights || []);
        setTimelineItems(about.timelineItems || []);
        setValueCards(about.valueCards || []);
      } catch (err) {
        setError('Não foi possível carregar a página Nossa História.');
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  const tabTitle = useMemo(
    () => tabs.find((tab) => tab.key === activeTab)?.label || 'Nossa História',
    [activeTab]
  );

  const normalizeNullableNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateListState = (setter, index, field, value) => {
    setter((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
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

  const saveMain = () =>
    withSaving(
      'main',
      async () => {
        await updateAboutContent({
          ...form,
          heroBackgroundMediaId: normalizeNullableNumber(form.heroBackgroundMediaId),
          storyPrimaryImageMediaId: normalizeNullableNumber(form.storyPrimaryImageMediaId),
          storySecondaryImageMediaId: normalizeNullableNumber(form.storySecondaryImageMediaId),
          structureImageMediaId: normalizeNullableNumber(form.structureImageMediaId),
          finalBackgroundMediaId: normalizeNullableNumber(form.finalBackgroundMediaId)
        });
      },
      'Página Nossa História salva com sucesso.'
    );

  const saveHighlights = () =>
    withSaving(
      'highlights',
      () => updateAboutHighlights(highlights.map((item, index) => ({ ...item, sortOrder: index + 1 }))),
      'Destaques salvos com sucesso.'
    );

  const saveTimeline = () =>
    withSaving(
      'timeline',
      () => updateAboutTimeline(timelineItems.map((item, index) => ({ ...item, sortOrder: index + 1 }))),
      'Linha do tempo salva com sucesso.'
    );

  const saveValues = () =>
    withSaving(
      'values',
      () => updateAboutValues(valueCards.map((item, index) => ({ ...item, sortOrder: index + 1 }))),
      'Missão, visão e valores salvos com sucesso.'
    );

  if (loading) {
    return (
      <div className="screen-center">
        <div className="loading-card">Carregando página Nossa História...</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestão da página Nossa História"
        description={`Editor completo da página institucional. Aba ativa: ${tabTitle}.`}
        action={
          <span className={`badge ${canEdit ? 'success' : 'muted'}`}>
            {canEdit ? 'Perfil apto a editar' : 'Somente leitura'}
          </span>
        }
      />

      {!canEdit ? (
        <div className="alert error">
          A edição desta página foi reservada ao perfil <strong>admin-full</strong>.
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

      {(activeTab === 'hero' || activeTab === 'story' || activeTab === 'structure' || activeTab === 'final') ? (
        <section className="panel-card form-stack">
          {activeTab === 'hero' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Selo superior</label>
                  <input name="heroBadge" value={form.heroBadge} onChange={handleChange} disabled={!canEdit} />
                </div>
                <MediaSelect
                  label="Imagem de fundo do hero"
                  name="heroBackgroundMediaId"
                  value={form.heroBackgroundMediaId}
                  options={mediaOptions}
                  onChange={handleChange}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label>Título do hero</label>
                <input name="heroTitle" value={form.heroTitle} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Subtítulo do hero</label>
                <textarea rows={5} name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div className="input-grid">
                <div>
                  <label>Badge do card flutuante</label>
                  <input name="heroCardBadge" value={form.heroCardBadge} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título do card flutuante</label>
                  <input name="heroCardTitle" value={form.heroCardTitle} onChange={handleChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto do card flutuante</label>
                <textarea rows={4} name="heroCardText" value={form.heroCardText} onChange={handleChange} disabled={!canEdit} />
              </div>
            </>
          ) : null}

          {activeTab === 'story' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Tag da seção</label>
                  <input name="storyTag" value={form.storyTag} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título da seção</label>
                  <input name="storyTitle" value={form.storyTitle} onChange={handleChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto 1</label>
                <textarea rows={4} name="storyTextOne" value={form.storyTextOne} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Texto 2</label>
                <textarea rows={4} name="storyTextTwo" value={form.storyTextTwo} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Texto 3</label>
                <textarea rows={4} name="storyTextThree" value={form.storyTextThree} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Texto 4</label>
                <textarea rows={4} name="storyTextFour" value={form.storyTextFour} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div className="input-grid">
                <MediaSelect
                  label="Imagem principal"
                  name="storyPrimaryImageMediaId"
                  value={form.storyPrimaryImageMediaId}
                  options={mediaOptions}
                  onChange={handleChange}
                  disabled={!canEdit}
                />
                <MediaSelect
                  label="Imagem secundária"
                  name="storySecondaryImageMediaId"
                  value={form.storySecondaryImageMediaId}
                  options={mediaOptions}
                  onChange={handleChange}
                  disabled={!canEdit}
                />
              </div>
            </>
          ) : null}

          {activeTab === 'structure' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Tag da seção</label>
                  <input name="structureTag" value={form.structureTag} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div>
                  <label>Título da seção</label>
                  <input name="structureTitle" value={form.structureTitle} onChange={handleChange} disabled={!canEdit} />
                </div>
              </div>

              <div>
                <label>Texto 1</label>
                <textarea rows={4} name="structureTextOne" value={form.structureTextOne} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Texto 2</label>
                <textarea rows={4} name="structureTextTwo" value={form.structureTextTwo} onChange={handleChange} disabled={!canEdit} />
              </div>

              <MediaSelect
                label="Imagem da seção"
                name="structureImageMediaId"
                value={form.structureImageMediaId}
                options={mediaOptions}
                onChange={handleChange}
                disabled={!canEdit}
              />
            </>
          ) : null}

          {activeTab === 'final' ? (
            <>
              <div className="input-grid">
                <div>
                  <label>Tag do bloco final</label>
                  <input name="finalTag" value={form.finalTag} onChange={handleChange} disabled={!canEdit} />
                </div>
                <MediaSelect
                  label="Imagem de fundo"
                  name="finalBackgroundMediaId"
                  value={form.finalBackgroundMediaId}
                  options={mediaOptions}
                  onChange={handleChange}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label>Título do bloco final</label>
                <input name="finalTitle" value={form.finalTitle} onChange={handleChange} disabled={!canEdit} />
              </div>

              <div>
                <label>Texto do bloco final</label>
                <textarea rows={5} name="finalText" value={form.finalText} onChange={handleChange} disabled={!canEdit} />
              </div>
            </>
          ) : null}

          <div>
            <button className="primary-button" type="button" onClick={saveMain} disabled={!canEdit || saving.main}>
              {saving.main ? 'Salvando...' : 'Salvar seção'}
            </button>
          </div>
        </section>
      ) : null}

      {activeTab === 'highlights' ? (
        <>
          <section className="panel-card form-stack">
            <div>
              <label>Tag da seção de destaques</label>
              <input name="highlightsTag" value={form.highlightsTag} onChange={handleChange} disabled={!canEdit} />
            </div>

            <div>
              <button className="primary-button" type="button" onClick={saveMain} disabled={!canEdit || saving.main}>
                {saving.main ? 'Salvando...' : 'Salvar cabeçalho da seção'}
              </button>
            </div>
          </section>

          <ListSection
            title="Cards de destaque"
            description="Blocos logo abaixo do hero."
            items={highlights}
            onAdd={() => setHighlights((current) => [...current, createHighlight()])}
            onRemove={(index) => setHighlights((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={saveHighlights}
            saving={saving.highlights}
            renderFields={(item, index) => (
              <>
                <div>
                  <label>Título</label>
                  <input
                    value={item.title || ''}
                    onChange={(event) => updateListState(setHighlights, index, 'title', event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label>Texto</label>
                  <textarea
                    rows={4}
                    value={item.text || ''}
                    onChange={(event) => updateListState(setHighlights, index, 'text', event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </>
            )}
          />
        </>
      ) : null}

      {activeTab === 'timeline' ? (
        <>
          <section className="panel-card form-stack">
            <div className="input-grid">
              <div>
                <label>Tag da seção</label>
                <input name="timelineTag" value={form.timelineTag} onChange={handleChange} disabled={!canEdit} />
              </div>
              <div>
                <label>Título da seção</label>
                <input name="timelineTitle" value={form.timelineTitle} onChange={handleChange} disabled={!canEdit} />
              </div>
            </div>

            <div>
              <label>Texto de apoio</label>
              <textarea rows={4} name="timelineText" value={form.timelineText} onChange={handleChange} disabled={!canEdit} />
            </div>

            <div>
              <button className="primary-button" type="button" onClick={saveMain} disabled={!canEdit || saving.main}>
                {saving.main ? 'Salvando...' : 'Salvar cabeçalho da seção'}
              </button>
            </div>
          </section>

          <ListSection
            title="Linha do tempo"
            description="Marcos cronológicos da empresa."
            items={timelineItems}
            onAdd={() => setTimelineItems((current) => [...current, createTimelineItem()])}
            onRemove={(index) => setTimelineItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={saveTimeline}
            saving={saving.timeline}
            renderFields={(item, index) => (
              <>
                <div>
                  <label>Título / marco</label>
                  <input
                    value={item.title || ''}
                    onChange={(event) => updateListState(setTimelineItems, index, 'title', event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label>Texto</label>
                  <textarea
                    rows={4}
                    value={item.text || ''}
                    onChange={(event) => updateListState(setTimelineItems, index, 'text', event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </>
            )}
          />
        </>
      ) : null}

      {activeTab === 'values' ? (
        <>
          <section className="panel-card form-stack">
            <div className="input-grid">
              <div>
                <label>Tag da seção</label>
                <input name="valuesTag" value={form.valuesTag} onChange={handleChange} disabled={!canEdit} />
              </div>
              <div>
                <label>Título da seção</label>
                <input name="valuesTitle" value={form.valuesTitle} onChange={handleChange} disabled={!canEdit} />
              </div>
            </div>

            <div>
              <label>Texto de apoio</label>
              <textarea rows={4} name="valuesText" value={form.valuesText} onChange={handleChange} disabled={!canEdit} />
            </div>

            <div>
              <button className="primary-button" type="button" onClick={saveMain} disabled={!canEdit || saving.main}>
                {saving.main ? 'Salvando...' : 'Salvar cabeçalho da seção'}
              </button>
            </div>
          </section>

          <ListSection
            title="Missão, visão e valores"
            description="Cards institucionais."
            items={valueCards}
            onAdd={() => setValueCards((current) => [...current, createValueCard()])}
            onRemove={(index) => setValueCards((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            disabled={!canEdit}
            saveAction={saveValues}
            saving={saving.values}
            renderFields={(item, index) => (
              <>
                <div>
                  <label>Título</label>
                  <input
                    value={item.title || ''}
                    onChange={(event) => updateListState(setValueCards, index, 'title', event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label>Texto</label>
                  <textarea
                    rows={5}
                    value={item.text || ''}
                    onChange={(event) => updateListState(setValueCards, index, 'text', event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </>
            )}
          />
        </>
      ) : null}
    </div>
  );
}

export default AboutContentPage;