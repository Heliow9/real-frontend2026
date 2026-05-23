import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import CpfCnpj from '@react-br-forms/cpf-cnpj-mask';
import TelefoneBrasileiroInput from 'react-telefone-brasileiro';
import { NumericFormat } from 'react-number-format';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUploadCloud,
    FiFileText,
    FiCheckCircle,
    FiAlertCircle,
    FiBriefcase,
    FiMapPin
} from 'react-icons/fi';

function TrabalheForm() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [nivel, setNivel] = useState('');
    const [cpf, setCpf] = useState('');
    const [telephone, setTelephone] = useState('');
    const [nasc, setNasc] = useState('');
    const [estado, setEstado] = useState('');
    const [cidade, setCidade] = useState('');
    const [pretencao, setPretention] = useState('');
    const [file, setFile] = useState(null);
    const [observation, setObservation] = useState('');
    const [progress, setProgress] = useState(0);
    const [messageError, setError] = useState('');
    const [resultTrue, setResultTrue] = useState('');
    const [checked, setCheked] = useState(false);
    const [isPCD, setIsPCD] = useState(false);
    const [isAprendiz, setIsAprendiz] = useState(false);
    const [tipoDeficiencia, setTipoDeficiencia] = useState('');
    const [detalhesDeficiencia, setDetalhesDeficiencia] = useState('');
    const [necessidadesEspecificas, setNecessidadesEspecificas] = useState('');
    const [funcao, setFuncao] = useState('');
    const [areaFiltro, setAreaFiltro] = useState('');
    const [filePreviewUrl, setFilePreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({});

    const vagas = useMemo(
        () => [
            { value: 'ajudante-eletricicista', label: 'Ajudante Eletricista', area: 'Operacional' },
            { value: 'ajudante-eletromecan', label: 'Ajudante Eletromecan', area: 'Operacional' },
            { value: 'ajudante-encanador', label: 'Ajudante Encanador', area: 'Operacional' },
            { value: 'ajudante-serralheiro', label: 'Ajudante de Serralheiro', area: 'Operacional' },
            { value: 'ajudante-soldador', label: 'Ajudante de Soldador', area: 'Operacional' },
            { value: 'almoxarife', label: 'Almoxarife', area: 'Administrativo' },
            { value: 'apontador', label: 'Apontador', area: 'Administrativo' },
            { value: 'armador', label: 'Armador', area: 'Operacional' },
            { value: 'assistente-engenharia', label: 'Assistente Engenharia', area: 'Engenharia' },
            { value: 'aux-eletricista', label: 'AUX Eletricista', area: 'Operacional' },
            { value: 'auxiliar-de-montagem', label: 'Auxiliar de Montagem', area: 'Operacional' },
            { value: 'auxiliar-de-pintor', label: 'Auxiliar de Pintor', area: 'Operacional' },
            { value: 'auxiliar-licitacao', label: 'Auxiliar Licitação', area: 'Administrativo' },
            { value: 'bombeiro-civil', label: 'Bombeiro Civil', area: 'Segurança' },
            { value: 'cabista', label: 'Cabista', area: 'Operacional' },
            { value: 'cadista', label: 'Cadista', area: 'Engenharia' },
            { value: 'calceteiro', label: 'Calceteiro', area: 'Operacional' },
            { value: 'carpinteiro', label: 'Carpinteiro', area: 'Operacional' },
            { value: 'comprador', label: 'Comprador', area: 'Administrativo' },
            { value: 'elet-forca-controle', label: 'ELET Força Controle', area: 'Operacional' },
            { value: 'elet-montador', label: 'ELET Montador', area: 'Operacional' },
            { value: 'eletricista', label: 'Eletricista', area: 'Operacional' },
            { value: 'eletricista-montador', label: 'Eletricista Montador', area: 'Operacional' },
            { value: 'eletrotecnico', label: 'Eletrotécnico', area: 'Técnico' },
            { value: 'eng-eletricista', label: 'ENG Eletricista', area: 'Engenharia' },
            { value: 'eng-seg-trab', label: 'ENG de SEG do TRAB', area: 'Engenharia' },
            { value: 'esteticista', label: 'Esteticista', area: 'Outros' },
            { value: 'ferreiro', label: 'Ferreiro', area: 'Operacional' },
            { value: 'fiscal', label: 'Fiscal', area: 'Administrativo' },
            { value: 'marceneiro', label: 'Marceneiro', area: 'Operacional' },
            { value: 'mecanico', label: 'Mecânico', area: 'Técnico' },
            { value: 'montador', label: 'Montador', area: 'Operacional' },
            { value: 'motorista', label: 'Motorista', area: 'Operacional' },
            { value: 'motorista-eletricista', label: 'Motorista Eletricista', area: 'Operacional' },
            { value: 'ope-retroescavadeira', label: 'OPE de Retroescavadeira', area: 'Operacional' },
            { value: 'operador-bombas', label: 'Operador de Bombas', area: 'Operacional' },
            { value: 'operador-munk', label: 'Operador de Munk', area: 'Operacional' },
            { value: 'pedreiro', label: 'Pedreiro', area: 'Operacional' },
            { value: 'pintor', label: 'Pintor', area: 'Operacional' },
            { value: 'podador', label: 'Podador', area: 'Operacional' },
            { value: 'serralheiro', label: 'Serralheiro', area: 'Operacional' },
            { value: 'servente', label: 'Servente', area: 'Operacional' },
            { value: 'soldador', label: 'Soldador', area: 'Operacional' },
            { value: 'tecnico-eltromecanico', label: 'Técnico Eletromecânico', area: 'Técnico' },
            { value: 'tecnico-mecanico', label: 'Técnico Mecânico', area: 'Técnico' },
            { value: 'tecnico-saneamento', label: 'Técnico Saneamento', area: 'Técnico' },
            { value: 'topografo', label: 'Topógrafo', area: 'Técnico' }
        ],
        []
    );

    const vagasFiltradas = useMemo(() => {
        if (!areaFiltro) return vagas;
        return vagas.filter((vaga) => vaga.area === areaFiltro);
    }, [areaFiltro, vagas]);

    useEffect(() => {
        if (!file) {
            setFilePreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setFilePreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    function handlerTimeout(state, count) {
        setTimeout(() => {
            state('');
        }, count);
    }

    function normalizeDigits(value = '') {
        return String(value).replace(/\D/g, '');
    }

    function getFileSizeMB(selectedFile) {
        if (!selectedFile) return 0;
        return selectedFile.size / (1024 * 1024);
    }

    const validation = {
        nome: nome.trim().length >= 3,
        email: /\S+@\S+\.\S+/.test(email),
        nivel: !!nivel,
        cpf: normalizeDigits(cpf).length === 11,
        telephone: normalizeDigits(telephone).length >= 10,
        nasc: !!nasc,
        funcao: !!funcao,
        estado: !!estado,
        cidade: cidade.trim().length >= 2,
        file: !!file && file.type === 'application/pdf' && getFileSizeMB(file) <= 5,
        checked: checked,
        tipoDeficiencia: !isPCD || !!tipoDeficiencia
    };

    function getFieldState(fieldName) {
        if (!touched[fieldName]) return {};
        const isValid = validation[fieldName];
        return {
            border: `1px solid ${isValid ? 'rgba(25, 135, 84, 0.45)' : 'rgba(220, 53, 69, 0.45)'}`,
            boxShadow: isValid
                ? '0 0 0 0.2rem rgba(25, 135, 84, 0.08)'
                : '0 0 0 0.2rem rgba(220, 53, 69, 0.08)'
        };
    }

    function markTouched(fieldName) {
        setTouched((prev) => ({ ...prev, [fieldName]: true }));
    }

    function validateBeforeSubmit() {
        const allTouched = {
            nome: true,
            email: true,
            nivel: true,
            cpf: true,
            telephone: true,
            nasc: true,
            funcao: true,
            estado: true,
            cidade: true,
            file: true,
            checked: true,
            tipoDeficiencia: true
        };
        setTouched((prev) => ({ ...prev, ...allTouched }));

        if (!validation.nome) return 'Por gentileza, informe seu nome completo.';
        if (!validation.email) return 'Por gentileza, informe um e-mail válido.';
        if (!validation.nivel) return 'Selecione um nível de escolaridade válido.';
        if (!validation.cpf) return 'O CPF precisa conter 11 dígitos válidos.';
        if (!validation.telephone) return 'Informe um telefone válido para contato.';
        if (!validation.nasc) return 'Selecione a data de nascimento.';
        if (!validation.funcao) return 'Selecione uma função desejada.';
        if (!validation.estado) return 'Selecione um estado.';
        if (!validation.cidade) return 'Informe a cidade.';
        if (!validation.file) {
            if (!file) return 'Selecione um currículo em PDF.';
            if (file?.type !== 'application/pdf') return 'O currículo deve estar em formato PDF.';
            if (getFileSizeMB(file) > 5) return 'O arquivo deve ter no máximo 5MB.';
            return 'Selecione um arquivo válido.';
        }
        if (isPCD && !validation.tipoDeficiencia) return 'Selecione o tipo de deficiência.';
        if (!validation.checked) return 'Você precisa concordar com os termos e a política de privacidade.';
        return '';
    }

    function resetForm() {
        setNome('');
        setEmail('');
        setNivel('');
        setCpf('');
        setTelephone('');
        setNasc('');
        setEstado('');
        setCidade('');
        setPretention('');
        setFile(null);
        setObservation('');
        setProgress(0);
        setCheked(false);
        setIsPCD(false);
        setIsAprendiz(false);
        setTipoDeficiencia('');
        setDetalhesDeficiencia('');
        setNecessidadesEspecificas('');
        setFuncao('');
        setAreaFiltro('');
        setTouched({});
    }

    async function HandlerSendFormTrabalhe(e) {
        e.preventDefault();
        setError('');
        setResultTrue('');

        const validationError = validateBeforeSubmit();
        if (validationError) {
            setError(validationError);
            handlerTimeout(setError, 6000);
            return;
        }

        setIsSubmitting(true);
        setProgress(0);

        try {
            const formData = new FormData();

            formData.append('curriculum', file);
            formData.append('nome', nome);
            formData.append('email', email);
            formData.append('nivel', nivel);
            formData.append('cpf', cpf);
            formData.append('telephone', telephone);
            formData.append('nasc', nasc);
            formData.append('estado', estado);
            formData.append('cidade', cidade);
            formData.append('pretencao', pretencao);
            formData.append('observation', observation);
            formData.append('isPCD', String(isPCD));
            formData.append('isAprendiz', String(isAprendiz));
            formData.append('tipoDeficiencia', tipoDeficiencia);
            formData.append('detalhesDeficiencia', detalhesDeficiencia);
            formData.append('necessidadesEspecificas', necessidadesEspecificas);
            formData.append('funcao', funcao);
            formData.append('areaFiltro', areaFiltro);
            formData.append('source', 'site');

            const apiBaseUrl =
                process.env.REACT_APP_API_URL ||
                process.env.REACT_APP_API_BASE_URL ||
                'https://api-realenergy.duckdns.org/api';

            await axios.post(`${apiBaseUrl}/public/careers/applications`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (event) => {
                    if (!event.total) return;
                    const uploadProgress = Math.round((event.loaded * 100) / event.total);
                    setProgress(uploadProgress);
                }
            });

            setProgress(100);
            setResultTrue('Currículo enviado com sucesso!');
            setIsSubmitting(false);
            resetForm();
            handlerTimeout(setResultTrue, 6000);
        } catch (error) {
            console.error(error);

            const apiMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Ocorreu um erro ao enviar o currículo. Tente novamente.';

            setError(apiMessage);
            setProgress(0);
            setIsSubmitting(false);
            handlerTimeout(setError, 8000);
        }
    }

    const inputBaseStyle = {
        borderRadius: '14px',
        minHeight: '52px',
        background: '#ffffff',
        border: '1px solid rgba(13, 46, 99, 0.10)',
        padding: '12px 14px',
        color: '#10213a',
        transition: 'all 0.25s ease'
    };

    const labelStyle = {
        fontWeight: 700,
        fontSize: '0.94rem',
        color: '#0d2e63',
        marginBottom: '10px',
        display: 'block'
    };

    const cardStyle = {
        background: '#ffffff',
        borderRadius: '24px',
        padding: '26px',
        boxShadow: '0 18px 48px rgba(15, 23, 42, 0.07)',
        border: '1px solid rgba(13, 46, 99, 0.06)'
    };

    return (
        <section style={{ padding: '20px 0 40px' }} id="form5-1v">
            <div className="container">
                <div style={{ maxWidth: '980px', margin: '0 auto 38px', textAlign: 'center' }}>
                    <div
                        style={{
                            display: 'inline-block',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            letterSpacing: '1.4px',
                            textTransform: 'uppercase',
                            color: '#b7832f',
                            marginBottom: '14px'
                        }}
                    >
                        Banco de talentos
                    </div>

                    <h2
                        style={{
                            fontSize: 'clamp(2rem, 3vw, 3.1rem)',
                            fontWeight: 800,
                            color: '#0d2e63',
                            lineHeight: 1.12,
                            marginBottom: '16px'
                        }}
                    >
                        Cadastre seu currículo com mais clareza, segurança e praticidade.
                    </h2>

                    <p
                        style={{
                            color: '#607089',
                            lineHeight: 1.9,
                            fontSize: '1.03rem',
                            maxWidth: '760px',
                            margin: '0 auto'
                        }}
                    >
                        Preencha suas informações profissionais e envie seu currículo em PDF. A equipe da RealEnergy
                        poderá considerar seu perfil para oportunidades atuais e futuras, de acordo com a área de atuação e demanda da empresa.
                    </p>
                </div>

                <form onSubmit={HandlerSendFormTrabalhe}>
                    <div className="row g-4 align-items-start">
                        <div className="col-lg-8">
                            <div style={cardStyle}>
                                <div className="row g-4">
                                    <div className="col-12">
                                        <div
                                            style={{
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                color: '#0d2e63',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            Dados pessoais
                                        </div>
                                        <div style={{ color: '#607089', lineHeight: 1.7 }}>
                                            Informações básicas para identificação e contato.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Nome completo</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            onBlur={() => markTouched('nome')}
                                            placeholder="Digite seu nome completo"
                                            style={{ ...inputBaseStyle, ...getFieldState('nome') }}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>E-mail</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onBlur={() => markTouched('email')}
                                            placeholder="Digite seu e-mail"
                                            style={{ ...inputBaseStyle, ...getFieldState('email') }}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>CPF</label>
                                        <CpfCnpj
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            onBlur={() => markTouched('cpf')}
                                            className="form-control"
                                            maxLength="14"
                                            style={{ ...inputBaseStyle, ...getFieldState('cpf') }}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Telefone para contato</label>
                                        <TelefoneBrasileiroInput
                                            value={telephone}
                                            onChange={(e) => setTelephone(e.target.value)}
                                            onBlur={() => markTouched('telephone')}
                                            temDDD
                                            separaNono
                                            className="form-control"
                                            style={{ ...inputBaseStyle, ...getFieldState('telephone') }}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Data de nascimento</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={nasc}
                                            onChange={(e) => setNasc(e.target.value)}
                                            onBlur={() => markTouched('nasc')}
                                            style={{ ...inputBaseStyle, ...getFieldState('nasc') }}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Escolaridade</label>
                                        <select
                                            className="form-select"
                                            value={nivel}
                                            onChange={(e) => setNivel(e.target.value)}
                                            onBlur={() => markTouched('nivel')}
                                            style={{ ...inputBaseStyle, ...getFieldState('nivel') }}
                                        >
                                            <option value="">Selecione o nível de escolaridade</option>
                                            <option value="Ensino Fundamental">Ensino Fundamental</option>
                                            <option value="Ensino Médio">Ensino Médio</option>
                                            <option value="Nível Técnico">Nível Técnico</option>
                                            <option value="Ensino Superior">Ensino Superior</option>
                                        </select>
                                    </div>

                                    <div className="col-12" style={{ marginTop: '8px' }}>
                                        <div
                                            style={{
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                color: '#0d2e63',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            Perfil profissional
                                        </div>
                                        <div style={{ color: '#607089', lineHeight: 1.7 }}>
                                            Selecione a área de interesse e a função desejada.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Área de interesse</label>
                                        <div style={{ position: 'relative' }}>
                                            <FiBriefcase
                                                size={18}
                                                style={{
                                                    position: 'absolute',
                                                    left: '14px',
                                                    top: '17px',
                                                    color: '#68809f',
                                                    zIndex: 2
                                                }}
                                            />
                                            <select
                                                className="form-select"
                                                value={areaFiltro}
                                                onChange={(e) => {
                                                    setAreaFiltro(e.target.value);
                                                    setFuncao('');
                                                }}
                                                style={{ ...inputBaseStyle, paddingLeft: '42px' }}
                                            >
                                                <option value="">Todas as áreas</option>
                                                <option value="Administrativo">Administrativo</option>
                                                <option value="Engenharia">Engenharia</option>
                                                <option value="Operacional">Operacional</option>
                                                <option value="Segurança">Segurança</option>
                                                <option value="Técnico">Técnico</option>
                                                <option value="Outros">Outros</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Função desejada</label>
                                        <select
                                            className="form-select"
                                            value={funcao}
                                            onChange={(e) => setFuncao(e.target.value)}
                                            onBlur={() => markTouched('funcao')}
                                            style={{ ...inputBaseStyle, ...getFieldState('funcao') }}
                                        >
                                            <option value="">Selecione uma função</option>
                                            {vagasFiltradas.map((vaga) => (
                                                <option key={vaga.value} value={vaga.label}>
                                                    {vaga.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Pretensão salarial</label>
                                        <NumericFormat
                                            prefix="R$ "
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            className="form-control"
                                            value={pretencao}
                                            onChange={(e) => setPretention(e.target.value)}
                                            placeholder="Informe sua pretensão salarial"
                                            style={inputBaseStyle}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Estado</label>
                                        <div style={{ position: 'relative' }}>
                                            <FiMapPin
                                                size={18}
                                                style={{
                                                    position: 'absolute',
                                                    left: '14px',
                                                    top: '17px',
                                                    color: '#68809f',
                                                    zIndex: 2
                                                }}
                                            />
                                            <select
                                                className="form-select"
                                                value={estado}
                                                onChange={(e) => setEstado(e.target.value)}
                                                onBlur={() => markTouched('estado')}
                                                style={{
                                                    ...inputBaseStyle,
                                                    ...getFieldState('estado'),
                                                    paddingLeft: '42px'
                                                }}
                                            >
                                                <option value="">Selecione um estado</option>
                                                <option value="Acre">Acre</option>
                                                <option value="Alagoas">Alagoas</option>
                                                <option value="Amapá">Amapá</option>
                                                <option value="Amazonas">Amazonas</option>
                                                <option value="Bahia">Bahia</option>
                                                <option value="Ceará">Ceará</option>
                                                <option value="Distrito Federal">Distrito Federal</option>
                                                <option value="Espírito Santo">Espírito Santo</option>
                                                <option value="Goiás">Goiás</option>
                                                <option value="Maranhão">Maranhão</option>
                                                <option value="Mato Grosso">Mato Grosso</option>
                                                <option value="Mato Grosso do Sul">Mato Grosso do Sul</option>
                                                <option value="Minas Gerais">Minas Gerais</option>
                                                <option value="Pará">Pará</option>
                                                <option value="Paraíba">Paraíba</option>
                                                <option value="Paraná">Paraná</option>
                                                <option value="Pernambuco">Pernambuco</option>
                                                <option value="Piauí">Piauí</option>
                                                <option value="Rio de Janeiro">Rio de Janeiro</option>
                                                <option value="Rio Grande do Norte">Rio Grande do Norte</option>
                                                <option value="Rio Grande do Sul">Rio Grande do Sul</option>
                                                <option value="Rondônia">Rondônia</option>
                                                <option value="Roraima">Roraima</option>
                                                <option value="Santa Catarina">Santa Catarina</option>
                                                <option value="São Paulo">São Paulo</option>
                                                <option value="Sergipe">Sergipe</option>
                                                <option value="Tocantins">Tocantins</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label style={labelStyle}>Cidade</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={cidade}
                                            onChange={(e) => setCidade(e.target.value)}
                                            onBlur={() => markTouched('cidade')}
                                            placeholder="Digite sua cidade"
                                            style={{ ...inputBaseStyle, ...getFieldState('cidade') }}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label style={{ ...labelStyle, marginBottom: '14px' }}>
                                            Modalidade de candidatura
                                        </label>

                                        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                                            <label
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    color: '#4f617a',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isPCD}
                                                    onChange={(e) => setIsPCD(e.target.checked)}
                                                    disabled={isAprendiz}
                                                />
                                                Sou pessoa com deficiência (PCD)
                                            </label>

                                            <label
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    color: '#4f617a',
                                                    fontWeight: 600
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isAprendiz}
                                                    onChange={(e) => setIsAprendiz(e.target.checked)}
                                                    disabled={isPCD}
                                                />
                                                Sou aprendiz
                                            </label>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isPCD && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="col-12"
                                            >
                                                <div
                                                    style={{
                                                        background: '#f8fbff',
                                                        border: '1px solid rgba(13, 79, 179, 0.08)',
                                                        borderRadius: '18px',
                                                        padding: '18px'
                                                    }}
                                                >
                                                    <div className="row g-3">
                                                        <div className="col-md-4">
                                                            <label style={labelStyle}>Tipo de deficiência</label>
                                                            <select
                                                                value={tipoDeficiencia}
                                                                onChange={(e) => setTipoDeficiencia(e.target.value)}
                                                                onBlur={() => markTouched('tipoDeficiencia')}
                                                                className="form-select"
                                                                style={{
                                                                    ...inputBaseStyle,
                                                                    ...getFieldState('tipoDeficiencia')
                                                                }}
                                                            >
                                                                <option value="">Selecione</option>
                                                                <option value="Física">Física</option>
                                                                <option value="Auditiva">Auditiva</option>
                                                                <option value="Visual">Visual</option>
                                                                <option value="Intelectual">Intelectual</option>
                                                                <option value="Múltipla">Múltipla</option>
                                                                <option value="Outra">Outra</option>
                                                            </select>
                                                        </div>

                                                        <div className="col-md-4">
                                                            <label style={labelStyle}>Detalhes da deficiência</label>
                                                            <input
                                                                className="form-control"
                                                                placeholder="Descreva, se desejar"
                                                                value={detalhesDeficiencia}
                                                                onChange={(e) => setDetalhesDeficiencia(e.target.value)}
                                                                type="text"
                                                                style={inputBaseStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-4">
                                                            <label style={labelStyle}>Necessidades específicas</label>
                                                            <input
                                                                className="form-control"
                                                                placeholder="Ex.: acessibilidade"
                                                                value={necessidadesEspecificas}
                                                                onChange={(e) => setNecessidadesEspecificas(e.target.value)}
                                                                type="text"
                                                                style={inputBaseStyle}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="col-12">
                                        <label style={labelStyle}>Resumo profissional</label>
                                        <textarea
                                            name="textarea"
                                            placeholder="Descreva um pouco da sua experiência profissional, áreas em que atuou e principais conhecimentos."
                                            className="form-control"
                                            value={observation}
                                            onChange={(e) => setObservation(e.target.value)}
                                            style={{
                                                ...inputBaseStyle,
                                                minHeight: '140px',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div style={{ ...cardStyle, marginBottom: '24px' }}>
                                <div
                                    style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 800,
                                        color: '#0d2e63',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Anexo do currículo
                                </div>
                                <div style={{ color: '#607089', lineHeight: 1.7, marginBottom: '18px' }}>
                                    Envie seu currículo em formato PDF com até 5MB.
                                </div>

                                <label
                                    htmlFor="curriculo-upload"
                                    style={{
                                        display: 'block',
                                        border: `1px dashed ${touched.file && !validation.file ? 'rgba(220, 53, 69, 0.45)' : 'rgba(13, 79, 179, 0.22)'}`,
                                        background: '#f8fbff',
                                        borderRadius: '20px',
                                        padding: '26px 18px',
                                        textAlign: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FiUploadCloud size={34} color="#0d4fb3" />
                                    <div
                                        style={{
                                            marginTop: '12px',
                                            fontWeight: 800,
                                            color: '#0d2e63'
                                        }}
                                    >
                                        Clique para anexar o currículo
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '8px',
                                            color: '#607089',
                                            lineHeight: 1.7,
                                            fontSize: '0.94rem'
                                        }}
                                    >
                                        Formato PDF • tamanho máximo de 5MB
                                    </div>
                                </label>

                                <input
                                    id="curriculo-upload"
                                    type="file"
                                    accept="application/pdf"
                                    name="filepdf"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        markTouched('file');
                                        setFile(e.target.files?.[0] || null);
                                    }}
                                />

                                <AnimatePresence>
                                    {file && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 16 }}
                                            transition={{ duration: 0.25 }}
                                            style={{
                                                marginTop: '18px',
                                                borderRadius: '18px',
                                                border: '1px solid rgba(13, 46, 99, 0.06)',
                                                background: '#ffffff',
                                                padding: '16px'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '12px'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '14px',
                                                        background: 'linear-gradient(135deg, #edf3ff, #f7efe1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#0d2e63',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <FiFileText size={20} />
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            fontWeight: 700,
                                                            color: '#0d2e63',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {file.name}
                                                    </div>
                                                    <div style={{ color: '#607089', fontSize: '0.9rem' }}>
                                                        {getFileSizeMB(file).toFixed(2)} MB
                                                    </div>
                                                </div>
                                            </div>

                                            {filePreviewUrl && (
                                                <div
                                                    style={{
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        border: '1px solid rgba(13, 46, 99, 0.08)',
                                                        background: '#f7f9fc'
                                                    }}
                                                >
                                                    <iframe
                                                        title="Pré-visualização do currículo"
                                                        src={`${filePreviewUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                                        style={{
                                                            width: '100%',
                                                            height: '260px',
                                                            border: 'none',
                                                            display: 'block',
                                                            background: '#ffffff'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div style={{ ...cardStyle, marginBottom: '24px' }}>
                                <div
                                    style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 800,
                                        color: '#0d2e63',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Acompanhamento do envio
                                </div>

                                <div
                                    style={{
                                        background: '#eef3fb',
                                        borderRadius: '999px',
                                        height: '12px',
                                        overflow: 'hidden',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.35 }}
                                        style={{
                                            height: '100%',
                                            borderRadius: '999px',
                                            background: 'linear-gradient(135deg, #0d4fb3, #3b82f6)',
                                            boxShadow: '0 8px 20px rgba(13, 79, 179, 0.22)'
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        color: '#607089',
                                        fontSize: '0.92rem'
                                    }}
                                >
                                    <span>Status do envio</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                            </div>

                            <div style={cardStyle}>
                                <div
                                    style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 800,
                                        color: '#0d2e63',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Confirmações
                                </div>

                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {[
                                        { label: 'Nome completo', valid: validation.nome },
                                        { label: 'E-mail', valid: validation.email },
                                        { label: 'CPF', valid: validation.cpf },
                                        { label: 'Telefone', valid: validation.telephone },
                                        { label: 'Função desejada', valid: validation.funcao },
                                        { label: 'Currículo em PDF', valid: validation.file }
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                color: item.valid ? '#198754' : '#607089',
                                                fontWeight: 600
                                            }}
                                        >
                                            {item.valid ? (
                                                <FiCheckCircle size={18} />
                                            ) : (
                                                <FiAlertCircle size={18} />
                                            )}
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        marginTop: '18px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid rgba(13, 46, 99, 0.08)'
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            color: '#4f617a',
                                            lineHeight: 1.7,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                setCheked(!checked);
                                                markTouched('checked');
                                            }}
                                            style={{ marginTop: '5px' }}
                                        />
                                        <span>
                                            Eu concordo com os termos de serviço e com a{' '}
                                            <a
                                                style={{
                                                    color: '#0d4fb3',
                                                    textDecoration: 'none',
                                                    fontWeight: 700
                                                }}
                                                href="/etica#content6-1n"
                                            >
                                                Política de Privacidade
                                            </a>
                                            .
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: '28px',
                            background: '#ffffff',
                            borderRadius: '24px',
                            padding: '24px',
                            boxShadow: '0 18px 48px rgba(15, 23, 42, 0.07)',
                            border: '1px solid rgba(13, 46, 99, 0.06)'
                        }}
                    >
                        <div className="row align-items-center g-3">
                            <div className="col-lg-8">
                                <div
                                    style={{
                                        fontSize: '1.05rem',
                                        fontWeight: 800,
                                        color: '#0d2e63',
                                        marginBottom: '6px'
                                    }}
                                >
                                    Finalizar candidatura
                                </div>
                                <div style={{ color: '#607089', lineHeight: 1.8 }}>
                                    Revise suas informações e clique abaixo para enviar seu currículo para o banco de talentos da RealEnergy.
                                </div>
                            </div>

                            <div className="col-lg-4 text-lg-end">
                                <motion.button
                                    type="submit"
                                    whileHover={{ y: -2, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        maxWidth: '320px',
                                        minHeight: '56px',
                                        border: 'none',
                                        borderRadius: '14px',
                                        background: isSubmitting
                                            ? 'linear-gradient(135deg, #86a8dc, #5e8dd6)'
                                            : 'linear-gradient(135deg, #0d4fb3, #0a3d91)',
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        boxShadow: '0 18px 36px rgba(13, 79, 179, 0.22)',
                                        transition: 'all 0.25s ease'
                                    }}
                                >
                                    {isSubmitting ? 'Enviando currículo...' : 'Enviar currículo'}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {messageError && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.22 }}
                                style={{
                                    marginTop: '22px',
                                    borderRadius: '18px',
                                    padding: '16px 18px',
                                    background: '#fff5f5',
                                    border: '1px solid rgba(220, 53, 69, 0.15)',
                                    color: '#b02a37',
                                    fontWeight: 600
                                }}
                            >
                                {messageError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {resultTrue && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.22 }}
                                style={{
                                    marginTop: '22px',
                                    borderRadius: '18px',
                                    padding: '16px 18px',
                                    background: '#f3fff7',
                                    border: '1px solid rgba(25, 135, 84, 0.15)',
                                    color: '#146c43',
                                    fontWeight: 600
                                }}
                            >
                                {resultTrue}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </section>
    );
}

export default TrabalheForm;