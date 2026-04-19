import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom'
import AuthenticationPage from './pages/AuthenticationPage';
import DashboardPage from './pages/DashboardPage';
import SessionDeviceSelectPage from './pages/SessionDeviceSelectPage';
import {  UserProvider } from './contexts/UserContext';
import {  PeerConnectionProvider } from './contexts/PeerConnectionContext';
import './App.css';

function App() {
  return (
    <UserProvider>
      <PeerConnectionProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<AuthenticationPage />} />
            <Route path='/device-select' element={<SessionDeviceSelectPage />} />
            <Route path='/dashboard' element={<DashboardPage />} />
          </Routes>
        </HashRouter>
      </PeerConnectionProvider>
    </UserProvider>
  );
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);