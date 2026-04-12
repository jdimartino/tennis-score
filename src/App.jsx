import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Configuracion from './pages/Configuracion';
import ConfigurarJornada from './pages/ConfigurarJornada';
import Jornada from './pages/Jornada';
import Marcador from './pages/Marcador';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Configuracion />} />
        <Route path="/configurar-jornada" element={<ConfigurarJornada />} />
        <Route path="/jornada" element={<Jornada />} />
        <Route path="/marcador" element={<Marcador />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
