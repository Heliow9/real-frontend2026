import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://real-backend-2026.onrender.com',
  timeout: 45000,
});

const translations = [
  ['Invalid credentials', 'E-mail ou senha inválidos. Confira os dados e tente novamente.'],
  ['Inactive user', 'Usuário inativo. Entre em contato com o administrador.'],
  ['Forbidden', 'Você não tem permissão para acessar esta área.'],
  ['Unauthorized', 'Sua sessão expirou. Faça login novamente.'],
  ['User not found', 'Usuário não encontrado.'],
  ['Token de ativação inválido ou expirado.', 'Token de ativação inválido ou expirado. Solicite um novo acesso.'],
  ['String must contain at least', 'Preencha os campos obrigatórios com a quantidade mínima de caracteres.'],
  ['Invalid enum value', 'Uma das opções selecionadas é inválida. Atualize a página e tente novamente.'],
  ['Network Error', 'Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em instantes.'],
  ['timeout', 'O servidor demorou para responder. Tente novamente.'],
];

function translateApiMessage(message, status) {
  const raw = String(message || '').trim();

  if (raw) {
    const found = translations.find(([key]) => raw.toLowerCase().includes(key.toLowerCase()));
    if (found) return found[1];

    if (/required/i.test(raw)) return 'Preencha todos os campos obrigatórios.';
    if (/email/i.test(raw) && /invalid/i.test(raw)) return 'Informe um e-mail válido.';
    if (/password/i.test(raw) && /min/i.test(raw)) return 'A senha deve ter pelo menos 6 caracteres.';
  }

  if (status === 400) return 'Confira os dados informados e tente novamente.';
  if (status === 401) return 'Sessão expirada ou credenciais inválidas.';
  if (status === 403) return 'Você não tem permissão para executar esta ação.';
  if (status === 404) return 'Registro não encontrado.';
  if (status === 409) return 'Esta ação não pode ser repetida ou já foi registrada.';
  if (status >= 500) return 'Erro interno no servidor. Tente novamente em instantes.';

  return raw || 'Não foi possível concluir a operação. Tente novamente.';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('realenergy_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const originalMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;

    const message = translateApiMessage(originalMessage, status);

    if (!error.response) {
      error.response = { data: { message }, status: 0 };
    } else {
      error.response.data = {
        ...(error.response.data || {}),
        message,
      };
    }

    return Promise.reject(error);
  }
);

export default api;
