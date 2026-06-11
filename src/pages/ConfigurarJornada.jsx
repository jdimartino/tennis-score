import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, BottomNav } from '../components/Layout';
import { getLeagueFormat } from '../hooks/useLocalTeams';
import { useJornadas } from '../hooks/useJornadas';

export default function ConfigurarJornada() {
  const location = useLocation();
  const navigate = useNavigate();
  const { myTeam, visitingTeam, date } = location.state || {};
  const { createJornada } = useJornadas();
  const [saving, setSaving] = useState(false);

  // Redirect back if accessed directly without state
  if (!myTeam) {
    navigate('/');
    return null;
  }

  const courtTemplate = getLeagueFormat(myTeam.league);

  const [myPlayers, setMyPlayers] = useState(() =>
    Object.fromEntries(courtTemplate.map(c => [c.id, c.type === 'doubles' ? ['', ''] : ['']]))
  );

  const updatePlayer = (courtId, index, value) => {
    setMyPlayers(prev => ({
      ...prev,
      [courtId]: prev[courtId].map((p, i) => i === index ? value : p),
    }));
  };

  const handleStart = async () => {
    setSaving(true);
    const courts = courtTemplate.map(c => ({
      ...c,
      myPlayers: myPlayers[c.id].map(n => n.trim()),
      theirPlayers: [],
      winner: null,
      matchState: null,
    }));
    const jornada = { myTeam, visitingTeam, date, courts };
    const id = await createJornada(jornada);
    navigate('/jornada/' + id);
  };

  const hasAnyName = courtTemplate.some(c =>
    myPlayers[c.id].some(n => n.trim().length > 0)
  );

  return (
    <div className="min-h-screen bg-background pb-32 font-sans text-on-surface">
      <Header />

      <main className="px-6 flex flex-col gap-4 -mt-2">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="lexend text-2xl font-black text-white">Armar Equipos</h2>
            <p className="text-on-surface-variant text-xs mt-1">
              {myTeam.name} <span className="text-on-surface-variant/50">vs</span> {visitingTeam}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:text-white p-2 rounded-full bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        {/* League badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl w-fit ${myTeam.league === 'cta' ? 'bg-secondary/10' : 'bg-primary/10'}`}>
          <span className={`lexend text-xs font-bold ${myTeam.league === 'cta' ? 'text-secondary' : 'text-primary'}`}>
            {myTeam.league === 'cta' ? 'Liga CTA · 4 Dobles + 1 Singles' : 'Liga TOL · 5 Dobles'}
          </span>
        </div>

        {/* Court cards */}
        <div className="flex flex-col gap-3">
          {courtTemplate.map(court => (
            <CourtCard
              key={court.id}
              court={court}
              players={myPlayers[court.id]}
              onUpdatePlayer={(index, value) => updatePlayer(court.id, index, value)}
            />
          ))}
        </div>

        {/* Start button */}
        <div className="mt-4 mb-12">
          <button
            onClick={handleStart}
            disabled={saving}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container lexend font-black text-xl py-5 rounded-2xl shadow-[0_10px_30px_rgba(63,255,139,0.3)] hover:shadow-[0_15px_40px_rgba(63,255,139,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-60"
          >
            {saving ? 'GUARDANDO...' : 'INICIAR JORNADA'}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </button>
          {!hasAnyName && (
            <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mt-3 opacity-60">
              Puedes ingresar los nombres ahora o durante la jornada
            </p>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function CourtCard({ court, players, onUpdatePlayer }) {
  const isDoubles = court.type === 'doubles';

  return (
    <div className="bg-surface-container-high rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDoubles ? 'bg-team/15' : 'bg-secondary/15'}`}>
          <span className={`material-symbols-outlined text-lg ${isDoubles ? 'text-team' : 'text-secondary'}`}>
            {isDoubles ? 'group' : 'person'}
          </span>
        </div>
        <div>
          <span className="lexend font-bold text-sm text-on-surface">{court.label}</span>
          <span className={`block text-[10px] uppercase tracking-wider font-bold ${isDoubles ? 'text-team/60' : 'text-secondary/60'}`}>
            {isDoubles ? 'Dobles' : 'Singles'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {players.map((name, idx) => (
          <div key={idx} className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xs lexend">
              {isDoubles ? (idx === 0 ? 'J1' : 'J2') : 'J'}
            </span>
            <input
              type="text"
              className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-8 pr-4 text-on-surface text-sm lexend focus:ring-2 focus:ring-primary outline-none placeholder-on-surface-variant/30"
              placeholder={isDoubles ? `Jugador ${idx + 1}` : 'Nombre del jugador'}
              value={name}
              onChange={(e) => onUpdatePlayer(idx, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
