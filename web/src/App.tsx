import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SteuerProvider } from './store/SteuerContext';
import { DatenProvider } from './store/DatenContext';
import UebersichtPage from './pages/UebersichtPage';
import JahrDetailPage from './pages/JahrDetailPage';
import BankenPage from './pages/BankenPage';
import RechnerPage from './pages/RechnerPage';
import ErgebnisPage from './pages/ErgebnisPage';

export default function App() {
  return (
    <DatenProvider>
      <SteuerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UebersichtPage />} />
            <Route path="/jahr/:jahr" element={<JahrDetailPage />} />
            <Route path="/banken" element={<BankenPage />} />
            <Route path="/rechner" element={<RechnerPage />} />
            <Route path="/ergebnis" element={<ErgebnisPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SteuerProvider>
    </DatenProvider>
  );
}
