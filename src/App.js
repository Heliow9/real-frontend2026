import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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
        <Route path="conteudo/home" element={<HomeContentPage />} />
        <Route path="conteudo/nossa-historia" element={<AboutContentPage />} />
        <Route path="conteudo/noticias" element={<NewsPage />} />
        <Route path="midia" element={<MediaPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="ouvidoria/reclamacoes" element={<ComplaintsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
