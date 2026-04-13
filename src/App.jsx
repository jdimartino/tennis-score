import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Configuracion from './pages/Configuracion';
import ConfigurarJornada from './pages/ConfigurarJornada';
import Jornada from './pages/Jornada';
import Marcador from './pages/Marcador';
import Historial from './pages/Historial';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nueva-jornada" element={<Configuracion />} />
        <Route path="/configurar-jornada" element={<ConfigurarJornada />} />
        <Route path="/jornada/:id" element={<Jornada />} />
        <Route path="/marcador" element={<Marcador />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
