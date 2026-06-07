import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import EmergencyBanner from './components/layout/EmergencyBanner.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Volunteers from './pages/Volunteers.jsx';
import Deployments from './pages/Deployments.jsx';
import ProfileDrawer from './components/volunteers/ProfileDrawer.jsx';
import MockDeviceSimulator from './components/dashboard/MockDeviceSimulator.jsx';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#F9FAFB',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(16px)',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F9FAFB',
            },
          },
        }}
      />
      <EmergencyBanner />
      <MockDeviceSimulator />
      <ProfileDrawer />
      <div className="flex min-h-screen bg-bg-dark">
        <Sidebar />
        <div className="flex-1 ml-16">
          <TopBar />
          <main className="pt-16 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/deployments" element={<Deployments />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
