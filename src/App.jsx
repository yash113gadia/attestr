import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { useIsMobile } from './hooks/useMediaQuery';

// Desktop
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import ExplorerPage from './pages/ExplorerPage';
import ActivityPage from './pages/ActivityPage';
import ApiDocsPage from './pages/ApiDocsPage';
import DemoPage from './pages/DemoPage';

// Mobile
import MobileLayout from './components/mobile/MobileLayout';
import MobileLanding from './pages/mobile/MobileLanding';
import MobileRegister from './pages/mobile/MobileRegister';
import MobileVerify from './pages/mobile/MobileVerify';
import MobileExplorer from './pages/mobile/MobileExplorer';
import MobileActivity from './pages/mobile/MobileActivity';

function AppRoutes() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Routes>
        <Route path="/" element={<MobileLanding />} />
        <Route element={<MobileLayout />}>
          <Route path="/register" element={<MobileRegister />} />
          <Route path="/verify" element={<MobileVerify />} />
          <Route path="/explorer" element={<MobileExplorer />} />
          <Route path="/activity" element={<MobileActivity />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route element={<Layout />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/docs" element={<ApiDocsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
