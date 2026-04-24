import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RequirePermission from './components/RequirePermission';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHomePage from './pages/DashboardHomePage';
import HomeContentPage from './pages/HomeContentPage';
import AboutContentPage from './pages/AboutContentPage';
import LoginPage from './pages/LoginPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import MediaPage from './pages/MediaPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import ComplaintsPage from './pages/ComplaintsPage';
import PaymentRequestsPage from './pages/PaymentRequestsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/entrar" element={<Navigate to="/login" replace />} />

      <Route path="/ativar-conta" element={<ActivateAccountPage />} />
      <Route path="/ativar-conta/:token" element={<ActivateAccountPage />} />
      <Route path="/activate-account" element={<ActivateAccountPage />} />
      <Route path="/activate-account/:token" element={<ActivateAccountPage />} />
      <Route path="/primeiro-acesso" element={<ActivateAccountPage />} />

      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/esqueci-senha" element={<Navigate to="/recuperar-senha" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/recuperar-senha" replace />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHomePage />} />
        <Route path="trocar-senha" element={<ChangePasswordPage />} />
        <Route path="alterar-senha" element={<Navigate to="/trocar-senha" replace />} />
        <Route path="sem-acesso" element={<UnauthorizedPage />} />
        <Route path="conteudo/home" element={<RequirePermission permission="home.read"><HomeContentPage /></RequirePermission>} />
        <Route path="conteudo/nossa-historia" element={<RequirePermission permission="home.read"><AboutContentPage /></RequirePermission>} />
        <Route path="conteudo/noticias" element={<RequirePermission permission="news.read"><NewsPage /></RequirePermission>} />
        <Route path="midia" element={<RequirePermission permission="media.read"><MediaPage /></RequirePermission>} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="usuarios" element={<RequirePermission permission="users.read"><UsersPage /></RequirePermission>} />
        <Route path="ouvidoria/reclamacoes" element={<RequirePermission permission="complaints.read"><ComplaintsPage /></RequirePermission>} />
        <Route path="solicitacoes" element={<RequirePermission permission="payment_requests.read"><PaymentRequestsPage /></RequirePermission>} />
        <Route path="configuracoes" element={<RequirePermission permission="settings.read"><SettingsPage /></RequirePermission>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
